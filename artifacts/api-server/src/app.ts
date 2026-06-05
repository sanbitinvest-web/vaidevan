import path from "node:path";
import { existsSync } from "node:fs";
import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const isProd = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

app.use(cors({
  origin: [
    "https://vaidevan.com",
    "https://www.vaidevan.com",
    "https://teste.vaidevan.com",
    /\.replit\.app$/,
    /\.replit\.dev$/,
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
  ],
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── API routes ──────────────────────────────────────────
app.use("/api", router);

// ── Servir frontend React em produção ───────────────────
if (isProd) {
  const frontendDir = path.join(__dirname, "public");
  if (existsSync(frontendDir)) {
    app.use(
      "/assets",
      express.static(path.join(frontendDir, "assets"), { maxAge: "1y", immutable: true }),
    );
    app.use(express.static(frontendDir, { maxAge: "1d", index: false }));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(frontendDir, "index.html"));
    });
  } else {
    logger.warn("Frontend build não encontrado em dist/public — apenas API disponível");
  }
}

export default app;
