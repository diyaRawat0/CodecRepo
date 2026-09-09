import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:4000/api" });
const cleanParams = (params) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== "" && value !== null && value !== undefined,
    ),
  );
export const productsApi = (params = {}) =>
  api
    .get("/products", { params: cleanParams(params) })
    .then((r) => r.data.data);
export const searchApi = (params = {}) =>
  api
    .get("/products/search", { params: cleanParams(params) })
    .then((r) => r.data.data);
export const categoriesApi = () =>
  api.get("/categories").then((r) => r.data.data);
export const productApi = (id) =>
  api.get(`/products/${id}`).then((r) => r.data.data);
export const statsApi = () =>
  api.get("/products/meta/stats").then((r) => r.data.data);
export const brandsApi = () =>
  api.get("/products/meta/brands").then((r) => r.data.data);
export const deleteProductApi = (id) => api.delete(`/products/${id}`);
export default api;
