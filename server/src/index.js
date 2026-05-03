import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { errorHandler } from "./middleware/error.js";

const app = express();
const PORT = parseInt(process.env.PORT || "7002", 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.use("/", healthRouter);
app.use("/auth", authRouter);

// 未匹配
app.use((req, res) => res.status(404).json({ error: "not_found", path: req.path }));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[ex-api] listening on http://localhost:${PORT}`);
  console.log(`[ex-api] cors origin: ${CORS_ORIGIN}`);
});
