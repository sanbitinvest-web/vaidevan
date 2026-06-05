import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Muitas requisições. Aguarde 15 minutos e tente novamente." },
  keyGenerator: (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]) ?? req.ip ?? "unknown";
    return ipKeyGenerator(ip);
  },
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Limite de tentativas de pagamento atingido. Tente em 1 hora." },
  keyGenerator: (req) => {
    const forwarded = req.headers["x-forwarded-for"];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]) ?? req.ip ?? "unknown";
    return ipKeyGenerator(ip);
  },
});
