import { Router } from "express";
import QRCode from "qrcode";
import crypto from "node:crypto";
import { db } from "@workspace/db";
import { adminSettingsTable, adminAuditLogTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { ADMIN_PASSWORD, signAdminToken, requireAdminAuth } from "../middlewares/auth";
import jwt from "jsonwebtoken";
import { sendAdminLockoutAlert } from "../lib/mailer";
import { logger } from "../lib/logger";

const router = Router();

const JWT_SECRET = process.env.SESSION_SECRET as string;

// ── Brute-force / lockout protection ─────────────────────────────────────────
const MAX_ATTEMPTS = Number(process.env.ADMIN_LOGIN_MAX_ATTEMPTS ?? "5");
const WINDOW_MS = Number(process.env.ADMIN_LOGIN_WINDOW_MINUTES ?? "15") * 60 * 1000;
const LOCKOUT_MS = Number(process.env.ADMIN_LOGIN_LOCKOUT_MINUTES ?? "15") * 60 * 1000;
const LOCKOUT_MINUTES = Math.round(LOCKOUT_MS / 60_000);

interface LoginAttemptRecord {
  count: number;
  windowStart: number;
  lockedUntil: number | null;
  alertSent: boolean;
}

const loginAttempts = new Map<string, LoginAttemptRecord>();

function getClientIp(req: import("express").Request): string {
  return req.ip ?? "unknown";
}

function getUserAgent(req: import("express").Request): string {
  return req.headers["user-agent"] ?? "unknown";
}

function checkLockout(ip: string): { locked: boolean; retryAfterSecs?: number } {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { locked: false };

  if (record.lockedUntil !== null) {
    if (now < record.lockedUntil) {
      return { locked: true, retryAfterSecs: Math.ceil((record.lockedUntil - now) / 1000) };
    }
    loginAttempts.delete(ip);
    return { locked: false };
  }

  return { locked: false };
}

function recordFailedAttempt(ip: string): { justLocked: boolean } {
  const now = Date.now();
  let record = loginAttempts.get(ip);

  if (!record || now - record.windowStart > WINDOW_MS) {
    record = { count: 1, windowStart: now, lockedUntil: null, alertSent: false };
    loginAttempts.set(ip, record);
    return { justLocked: false };
  }

  record.count += 1;

  if (record.count >= MAX_ATTEMPTS && record.lockedUntil === null) {
    record.lockedUntil = now + LOCKOUT_MS;
    return { justLocked: true };
  }

  return { justLocked: false };
}

function resetAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

// ── Audit log helper ──────────────────────────────────────────────────────────
async function writeAuditLog(
  ip: string,
  userAgent: string,
  outcome: "password_ok" | "password_preauth" | "password_failed" | "locked" | "totp_ok" | "totp_failed",
  totpVerified = false,
): Promise<void> {
  try {
    await db.insert(adminAuditLogTable).values({ ip, userAgent, outcome, totpVerified });
  } catch (err) {
    logger.error({ err }, "Failed to write admin audit log");
  }
}

const TOTP_ISSUER = "VaideVan Admin";
const TOTP_ACCOUNT = "admin@vaidevan.com";
const TOTP_KEY = "admin_totp_secret";
const BACKUP_CODES_KEY = "admin_backup_codes";

// ── Backup recovery codes ─────────────────────────────────────────────────────
function generateBackupCodes(count = 10): string[] {
  return Array.from({ length: count }, () => {
    const a = crypto.randomBytes(4).toString("hex").toUpperCase();
    const b = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `${a}-${b}`;
  });
}

function hashBackupCode(code: string): string {
  return crypto.createHash("sha256").update(code.toUpperCase().replace(/\s/g, "")).digest("hex");
}

async function getBackupCodeHashes(): Promise<string[]> {
  const [row] = await db
    .select({ value: adminSettingsTable.value })
    .from(adminSettingsTable)
    .where(eq(adminSettingsTable.key, BACKUP_CODES_KEY))
    .limit(1);
  if (!row) return [];
  try { return JSON.parse(row.value) as string[]; } catch { return []; }
}

async function saveBackupCodeHashes(hashes: string[]): Promise<void> {
  const value = JSON.stringify(hashes);
  await db
    .insert(adminSettingsTable)
    .values({ key: BACKUP_CODES_KEY, value })
    .onConflictDoUpdate({ target: adminSettingsTable.key, set: { value, updatedAt: new Date() } });
}

async function consumeBackupCode(inputCode: string): Promise<boolean> {
  const normalized = inputCode.toUpperCase().replace(/\s/g, "");
  const incomingHash = hashBackupCode(normalized);

  return db.transaction(async (tx) => {
    const [row] = await tx
      .select({ value: adminSettingsTable.value })
      .from(adminSettingsTable)
      .where(eq(adminSettingsTable.key, BACKUP_CODES_KEY))
      .for("update")
      .limit(1);

    if (!row) return false;

    let hashes: string[];
    try { hashes = JSON.parse(row.value) as string[]; } catch { return false; }

    const idx = hashes.indexOf(incomingHash);
    if (idx === -1) return false;

    const remaining = hashes.filter((_, i) => i !== idx);
    const value = JSON.stringify(remaining);
    await tx
      .update(adminSettingsTable)
      .set({ value, updatedAt: new Date() })
      .where(eq(adminSettingsTable.key, BACKUP_CODES_KEY));

    return true;
  });
}

// ── TOTP (RFC 6238) implemented with Node built-ins ──────────────────────────
const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Decode(input: string): Buffer {
  const str = input.toUpperCase().replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  for (const c of str) {
    const idx = BASE32_CHARS.indexOf(c);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      output.push((value >> bits) & 0xff);
    }
  }
  return Buffer.from(output);
}

function base32Encode(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += BASE32_CHARS[(value >> bits) & 31];
    }
  }
  if (bits > 0) output += BASE32_CHARS[(value << (5 - bits)) & 31];
  return output;
}

function computeTotp(secret: string, counter: number): string {
  const key = base32Decode(secret);
  const buf = Buffer.allocUnsafe(8);
  buf.writeBigInt64BE(BigInt(counter));
  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return code.toString().padStart(6, "0");
}

function verifyTotp(secret: string, token: string): boolean {
  const counter = Math.floor(Date.now() / 1000 / 30);
  for (const drift of [-1, 0, 1]) {
    if (computeTotp(secret, counter + drift) === token) return true;
  }
  return false;
}

function generateSecret(): string {
  return base32Encode(crypto.randomBytes(20));
}

function buildKeyUri(secret: string): string {
  const enc = encodeURIComponent;
  return `otpauth://totp/${enc(TOTP_ISSUER)}:${enc(TOTP_ACCOUNT)}?secret=${secret}&issuer=${enc(TOTP_ISSUER)}&algorithm=SHA1&digits=6&period=30`;
}

// ── Encryption helpers (AES-256-GCM) ─────────────────────────────────────────
function getEncKey(): Buffer {
  return crypto.createHash("sha256").update(JWT_SECRET).digest();
}

function encrypt(plaintext: string): string {
  const key = getEncKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("hex"), tag.toString("hex"), enc.toString("hex")].join(":");
}

function decrypt(ciphertext: string): string {
  const key = getEncKey();
  const [ivHex, tagHex, encHex] = ciphertext.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const enc = Buffer.from(encHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(enc).toString("utf8") + decipher.final("utf8");
}

async function getTotpSecret(): Promise<string | null> {
  const [row] = await db
    .select({ value: adminSettingsTable.value })
    .from(adminSettingsTable)
    .where(eq(adminSettingsTable.key, TOTP_KEY))
    .limit(1);
  if (!row) return null;
  return decrypt(row.value);
}

function signPreAuthToken(): string {
  return jwt.sign({ preAdmin: true }, JWT_SECRET, { expiresIn: "5m" });
}

// ── Routes ────────────────────────────────────────────────────────────────────

router.get("/admin/auth/2fa/status", requireAdminAuth, async (_req, res) => {
  const secret = await getTotpSecret();
  res.json({ configured: secret !== null });
});

router.post("/admin/auth/login", async (req, res) => {
  const ip = getClientIp(req);
  const ua = getUserAgent(req);

  const lockStatus = checkLockout(ip);
  if (lockStatus.locked) {
    await writeAuditLog(ip, ua, "locked");
    res.set("Retry-After", String(lockStatus.retryAfterSecs));
    res.status(429).json({
      error: `Conta bloqueada temporariamente. Tente novamente em ${Math.ceil((lockStatus.retryAfterSecs ?? 900) / 60)} minuto(s).`,
      retryAfterSecs: lockStatus.retryAfterSecs,
    });
    return;
  }

  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) {
    const { justLocked } = recordFailedAttempt(ip);
    const record = loginAttempts.get(ip);

    await writeAuditLog(ip, ua, "password_failed");

    if (justLocked && record && !record.alertSent) {
      record.alertSent = true;
      logger.warn({ ip }, "Admin login locked out after too many failed attempts");
      sendAdminLockoutAlert({ ip, maxAttempts: MAX_ATTEMPTS, lockoutMinutes: LOCKOUT_MINUTES }).catch(() => {});
    } else if (record) {
      const remaining = MAX_ATTEMPTS - record.count;
      if (remaining > 0) {
        res.status(401).json({
          error: `Senha de administrador incorreta. ${remaining} tentativa(s) restante(s) antes do bloqueio.`,
        });
        return;
      }
    }

    if (justLocked) {
      const newLockStatus = checkLockout(ip);
      res.set("Retry-After", String(newLockStatus.retryAfterSecs ?? 900));
      res.status(429).json({
        error: `Muitas tentativas incorretas. Acesso bloqueado por ${LOCKOUT_MINUTES} minuto(s).`,
        retryAfterSecs: newLockStatus.retryAfterSecs ?? 900,
      });
      return;
    }

    res.status(401).json({ error: "Senha de administrador incorreta." });
    return;
  }

  resetAttempts(ip);

  const secret = await getTotpSecret();
  if (!secret) {
    await writeAuditLog(ip, ua, "password_ok", false);
    logger.info({ ip }, "Admin login successful (no 2FA)");
    const token = signAdminToken();
    res.json({ token, role: "admin" });
    return;
  }

  await writeAuditLog(ip, ua, "password_preauth", false);
  const preAuthToken = signPreAuthToken();
  res.json({ requireTotp: true, preAuthToken });
});

router.post("/admin/auth/2fa/verify", async (req, res) => {
  const ip = getClientIp(req);
  const ua = getUserAgent(req);
  const { preAuthToken, totpCode } = req.body;
  if (!preAuthToken || !totpCode) {
    res.status(400).json({ error: "Token e código são obrigatórios." });
    return;
  }

  let payload: { preAdmin?: boolean };
  try {
    payload = jwt.verify(preAuthToken, JWT_SECRET) as { preAdmin?: boolean };
  } catch {
    res.status(401).json({ error: "Token expirado ou inválido. Faça login novamente." });
    return;
  }

  if (!payload.preAdmin) {
    res.status(401).json({ error: "Token inválido." });
    return;
  }

  const secret = await getTotpSecret();
  if (!secret) {
    res.status(409).json({ error: "2FA não configurado." });
    return;
  }

  if (verifyTotp(secret, totpCode)) {
    await writeAuditLog(ip, ua, "totp_ok", true);
    logger.info({ ip }, "Admin login successful (2FA passed)");
    const token = signAdminToken();
    res.json({ token, role: "admin" });
    return;
  }

  const usedBackup = await consumeBackupCode(totpCode);
  if (usedBackup) {
    await writeAuditLog(ip, ua, "totp_ok", true);
    logger.info({ ip }, "Admin logged in using a backup recovery code");
    const token = signAdminToken();
    res.json({ token, role: "admin", usedBackupCode: true });
    return;
  }

  await writeAuditLog(ip, ua, "totp_failed", false);
  logger.warn({ ip }, "Admin 2FA verification failed");
  res.status(401).json({ error: "Código inválido. Tente novamente ou use um código de recuperação." });
});

router.get("/admin/auth/verify", requireAdminAuth, (_req, res) => {
  res.json({ ok: true, role: "admin" });
});

// ── Lockout management ────────────────────────────────────────────────────────

function getActiveLockouts(): { ip: string; count: number; lockedUntil: string; retryAfterSecs: number }[] {
  const now = Date.now();
  const active: { ip: string; count: number; lockedUntil: string; retryAfterSecs: number }[] = [];
  for (const [ip, record] of loginAttempts.entries()) {
    if (record.lockedUntil !== null && now < record.lockedUntil) {
      active.push({
        ip,
        count: record.count,
        lockedUntil: new Date(record.lockedUntil).toISOString(),
        retryAfterSecs: Math.ceil((record.lockedUntil - now) / 1000),
      });
    } else if (record.lockedUntil !== null && now >= record.lockedUntil) {
      loginAttempts.delete(ip);
    }
  }
  return active;
}

router.get("/admin/auth/lockout", requireAdminAuth, (req, res) => {
  const entries = getActiveLockouts();
  req.log.info({ count: entries.length }, "Admin listed locked IPs");
  res.json({ locked: entries });
});

router.delete("/admin/auth/lockout/:ip", requireAdminAuth, (req, res) => {
  const ip = decodeURIComponent(String(req.params.ip));
  const record = loginAttempts.get(ip);

  if (!record || record.lockedUntil === null || Date.now() >= record.lockedUntil) {
    res.status(404).json({ error: "IP não está bloqueado." });
    return;
  }

  loginAttempts.delete(ip);
  req.log.warn({ ip }, "Admin manually unblocked locked IP");
  res.json({ ok: true, message: `IP ${ip} desbloqueado com sucesso.`, locked: getActiveLockouts() });
});

router.get("/admin/auth/2fa/setup", requireAdminAuth, async (_req, res) => {
  const secret = generateSecret();
  const otpauthUrl = buildKeyUri(secret);
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
  res.json({ secret, otpauthUrl, qrCodeDataUrl });
});

router.post("/admin/auth/2fa/enable", requireAdminAuth, async (req, res) => {
  const { secret, totpCode } = req.body;
  if (!secret || !totpCode) {
    res.status(400).json({ error: "Segredo e código são obrigatórios." });
    return;
  }

  if (!verifyTotp(secret, totpCode)) {
    res.status(401).json({ error: "Código inválido. Escaneie novamente e tente." });
    return;
  }

  const encrypted = encrypt(secret);
  await db
    .insert(adminSettingsTable)
    .values({ key: TOTP_KEY, value: encrypted })
    .onConflictDoUpdate({ target: adminSettingsTable.key, set: { value: encrypted, updatedAt: new Date() } });

  const plainCodes = generateBackupCodes(10);
  const hashes = plainCodes.map(hashBackupCode);
  await saveBackupCodeHashes(hashes);

  res.json({ ok: true, message: "2FA ativado com sucesso.", backupCodes: plainCodes });
});

router.post("/admin/auth/2fa/disable", requireAdminAuth, async (req, res) => {
  const { totpCode, password } = req.body;
  if (!totpCode) {
    res.status(400).json({ error: "Código TOTP obrigatório para desativar 2FA." });
    return;
  }
  if (!password) {
    res.status(400).json({ error: "Senha do administrador obrigatória para desativar 2FA." });
    return;
  }

  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Senha incorreta." });
    return;
  }

  const secret = await getTotpSecret();
  if (!secret) {
    res.status(409).json({ error: "2FA não está configurado." });
    return;
  }

  if (!verifyTotp(secret, totpCode)) {
    res.status(401).json({ error: "Código TOTP inválido." });
    return;
  }

  await db.delete(adminSettingsTable).where(eq(adminSettingsTable.key, TOTP_KEY));
  await db.delete(adminSettingsTable).where(eq(adminSettingsTable.key, BACKUP_CODES_KEY));
  res.json({ ok: true, message: "2FA desativado." });
});

// ── Audit log read endpoint ───────────────────────────────────────────────────
router.get("/admin/auth/audit-log", requireAdminAuth, async (_req, res) => {
  const entries = await db
    .select()
    .from(adminAuditLogTable)
    .orderBy(desc(adminAuditLogTable.createdAt))
    .limit(100);
  res.json(entries);
});

export default router;
