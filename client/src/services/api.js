// api.js — Centralized API Service for Backend Communication
import axios from "axios";

// ===============================
// ⚙️  Axios Instance Configuration
// ===============================
const baseURL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

const api = axios.create({
  baseURL: `${baseURL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // 15s timeout for slow networks
  withCredentials: false, // set true only if backend uses cookies
});

// ===============================
// 🔑 Request Interceptor (Attach Token)
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// ⚠️ Response Interceptor (Global Error Handling)
// ===============================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (!response) {
      console.error("Network error or server unreachable.");
      alert("Network error — please check your internet connection.");
    }

    // Unauthorized
    if (response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Generic API errors
    if (response?.status >= 400) {
      console.error(`API Error [${response.status}]:`, response.data?.message);
    }

    return Promise.reject(error);
  }
);

// ===============================
// 📮 Post Service
// ===============================
export const postService = {
  async getAllPosts(page = 1, limit = 10, category) {
    const query = new URLSearchParams({ page, limit });
    if (category) query.append("category", category);

    const { data } = await api.get(`/posts?${query.toString()}`);
    return data;
  },

  async getPost(idOrSlug) {
    const { data } = await api.get(`/posts/${idOrSlug}`);
    return data;
  },

  async createPost(postData) {
    const { data } = await api.post("/posts", postData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async updatePost(id, postData) {
    const { data } = await api.put(`/posts/${id}`, postData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async deletePost(id) {
    const { data } = await api.delete(`/posts/${id}`);
    return data;
  },

  async addComment(postId, commentData) {
    const { data } = await api.post(`/posts/${postId}/comments`, commentData);
    return data;
  },

  async searchPosts(query) {
    const { data } = await api.get(`/posts/search?q=${encodeURIComponent(query)}`);
    return data;
  },
};

// ===============================
// 🗂 Category Service
// ===============================
export const categoryService = {
  async getAllCategories() {
    const { data } = await api.get("/categories");
    return data;
  },

  async createCategory(categoryData) {
    const { data } = await api.post("/categories", categoryData);
    return data;
  },
};

// ===============================
// 👤 Auth Service
// ===============================
export const authService = {
  async register(userData) {
    const { data } = await api.post("/auth/register", userData);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  },

  async login(credentials) {
    const { data } = await api.post("/auth/login", credentials);
    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }
    return data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

export default api;
