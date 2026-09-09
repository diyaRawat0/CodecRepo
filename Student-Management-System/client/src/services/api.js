import axios from "axios";
const api = axios.create({ baseURL: "/api" });
const resource = (name) => ({
  list: (params) => api.get(`/${name}`, { params }).then((r) => r.data.data),
  get: (id) => api.get(`/${name}/${id}`).then((r) => r.data.data),
  create: (data) => api.post(`/${name}`, data).then((r) => r.data.data),
  update: (id, data) =>
    api.put(`/${name}/${id}`, data).then((r) => r.data.data),
  remove: (id) => api.delete(`/${name}/${id}`).then((r) => r.data),
});
export const services = {
  students: resource("students"),
  departments: resource("departments"),
  courses: resource("courses"),
  enrollments: resource("enrollments"),
};
export const messageOf = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";
