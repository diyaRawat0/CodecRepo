import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { ensureData } from "./utils/jsonStore.js";
import { notFound, errorHandler } from "./middleware/errors.js";
await ensureData();
const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "100kb" }));
app.use(morgan("dev"));
app.get("/api/health", (req, res) =>
  res.json({ success: true, data: { status: "ok" } }),
);
app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);
export default app;
