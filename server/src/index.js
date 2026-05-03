import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { authRouter } from "./routes/auth.js";
import { healthRouter } from "./routes/health.js";
import { tenantsRouter } from "./routes/tenants.js";
import { usersRouter } from "./routes/users.js";
import { eventsRouter } from "./routes/events.js";
import { vendorsRouter, publicVendorsRouter } from "./routes/vendors.js";
import { noticesRouter } from "./routes/notices.js";
import { formsRouter } from "./routes/forms.js";
import { equipmentRouter } from "./routes/equipment.js";
import { decoratorsRouter, publicDecoratorsRouter } from "./routes/decorators.js";
import { settingsRouter } from "./routes/settings.js";
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

// 公開 token endpoints（無 JWT 也能呼叫）
app.use("/public", publicVendorsRouter);
app.use("/public", publicDecoratorsRouter);

// 認證後 endpoints
app.use("/tenants", tenantsRouter);
app.use("/users", usersRouter);
app.use("/events", eventsRouter);
app.use("/vendors", vendorsRouter);
app.use("/notices", noticesRouter);
app.use("/forms", formsRouter);
app.use("/equipment", equipmentRouter);
app.use("/decorators", decoratorsRouter);
app.use("/settings", settingsRouter);

// 未匹配
app.use((req, res) => res.status(404).json({ error: "not_found", path: req.path }));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[ex-api] listening on http://localhost:${PORT}`);
  console.log(`[ex-api] cors origin: ${CORS_ORIGIN}`);
});
