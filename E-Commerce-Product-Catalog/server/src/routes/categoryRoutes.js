import { Router } from "express";
import * as controller from "../controllers/categoryController.js";
import { asyncHandler } from "../middleware/errors.js";
export const categoryRoutes = Router();
categoryRoutes.get("/", controller.list);
categoryRoutes.get("/:id", controller.detail);
categoryRoutes.post("/", asyncHandler(controller.create));
categoryRoutes.put("/:id", asyncHandler(controller.update));
categoryRoutes.delete("/:id", asyncHandler(controller.remove));
