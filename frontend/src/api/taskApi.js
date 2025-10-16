// src/api/taskApi.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5003/api",
});

// attach JWT token automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) config.headers.Authorization = `Bearer ${user.token}`;
  return config;
});

export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);

// export const getTasks = (filters) => API.get("/tasks", { params: filters });
export const getTasks = async (filters) => {
  const res = await API.get("/tasks", { params: filters });
  return res.data; // <-- this should be the array of tasks
};
// export const createTask = (task) => API.post("/tasks", task);
export const createTask = async (task) => {
  const res = await API.post("/tasks", task);
  return res.data; // <-- only the task object
};

export const updateTask = (id, task) => API.put(`/tasks/${id}`, task);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const reorderTasks = (orderedIds) =>
  API.post("/tasks/reorder", { orderedIds });
