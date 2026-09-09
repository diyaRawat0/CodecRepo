import * as service from "../services/service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
export const controller = (collection) => ({
  list: asyncHandler(async (req, res) =>
    res.json({
      success: true,
      data:
        collection === "students"
          ? await service.listStudents(req.query)
          : await service.list(collection),
    }),
  ),
  get: asyncHandler(async (req, res) =>
    res.json({
      success: true,
      data: await service.get(collection, req.params.id),
    }),
  ),
  create: asyncHandler(async (req, res) =>
    res
      .status(201)
      .json({ success: true, data: await service.save(collection, req.body) }),
  ),
  update: asyncHandler(async (req, res) =>
    res.json({
      success: true,
      data: await service.save(collection, req.body, req.params.id),
    }),
  ),
  remove: asyncHandler(async (req, res) => {
    await service.remove(collection, req.params.id);
    res.json({ success: true, data: null });
  }),
});
