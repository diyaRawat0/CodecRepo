import express from "express";
import cors from "cors";
import { productRoutes } from "./routes/productRoutes.js";
import { categoryRoutes } from "./routes/categoryRoutes.js";
import { notFound, errorHandler } from "./middleware/errors.js";
export const app = express();
app.use(cors());
app.use(express.json({ limit: "100kb" }));
app.get("/api/health", (req, res) =>
  res.json({ success: true, data: { status: "ok" } }),
);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use(notFound);
app.use(errorHandler);
