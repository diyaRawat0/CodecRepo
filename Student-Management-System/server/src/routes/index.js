import { Router } from "express";
import { controller } from "../controllers/crudController.js";
const router = Router();
for (const [path, collection] of [
  ["students", "students"],
  ["departments", "departments"],
  ["courses", "courses"],
  ["enrollments", "enrollments"],
]) {
  const c = controller(collection);
  router.get(`/${path}`, c.list);
  router.get(`/${path}/:id`, c.get);
  router.post(`/${path}`, c.create);
  router.put(`/${path}/:id`, c.update);
  router.delete(`/${path}/:id`, c.remove);
}
export default router;
