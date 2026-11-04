// Single entry point for the Django API layer.
//
//   import { useAuth, AuthProvider, publicityApi } from "@/lib/api";
//
export * from "./types";
export { apiFetch, ApiError, tokenStore, API_URL } from "./client";
export { login, register, getMe, logout, isAuthenticated } from "./auth";
export {
  galleryApi,
  publicityApi,
  committeeApi,
  programsApi,
  contactApi,
  usersApi,
  settingsApi,
  felicitationApi,
  leaderMessageApi,
  programPagesApi,
  testimonialsApi,
  pageHeroApi,
  examApi,
} from "./resources";
export { AuthProvider, useAuth } from "./AuthContext";
export { uploadImage, isUploadConfigured, optimizeImage } from "./upload";
