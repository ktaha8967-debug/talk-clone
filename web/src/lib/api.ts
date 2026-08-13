const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage?.getItem === "function";
}

function getAuthToken(): string | null {
  if (isBrowser()) {
    return localStorage.getItem("token");
  }
  return null;
}

async function request(path: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers as Record<string, string>,
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  
  if (res.status === 401) {
    const isAuthEndpoint = path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register");
    if (!isAuthEndpoint && isBrowser()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const error = await res.json().catch(() => ({ detail: "Unauthorized" }));
    throw new Error(error.detail || "Unauthorized");
  }

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || error.error || "Request failed");
  }
  return res.json();
}

async function uploadRequest(path: string, formData: FormData) {
  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (res.status === 401) {
    const isAuthEndpoint = path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register");
    if (!isAuthEndpoint && isBrowser()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const error = await res.json().catch(() => ({ detail: "Unauthorized" }));
    throw new Error(error.detail || "Unauthorized");
  }
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || error.error || "Request failed");
  }
  return res.json();
}

export function getUser(): { username?: string; email?: string; tier?: string; monthly_usage?: number; usage_limit?: number; is_admin?: boolean } | null {
  if (!isBrowser()) return null;
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

export const api = {
  // Auth
  login: async (email: string, password: string) =>
    request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: async (username: string, email: string, password: string) =>
    request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),
  getMe: async () => request("/api/auth/me"),

  // Upload
  uploadAudio: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return uploadRequest("/api/upload", formData);
  },

  // Clone
  cloneVoice: async (file: File, name: string, language: string = "auto") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("language", language);
    return uploadRequest("/api/clone", formData);
  },

  // Generate (CosyVoice)
  generateSpeech: async (data: {
    script: string;
    voice_id?: number;
    speed?: number;
    pitch?: number;
    temperature?: number;
    emotion?: string;
    output_format?: string;
  }) => request("/api/generate", { method: "POST", body: JSON.stringify(data) }),

  // Bark TTS
  getBarkVoices: async (language?: string, gender?: string) => {
    const params = new URLSearchParams();
    if (language) params.set("language", language);
    if (gender) params.set("gender", gender);
    return request(`/api/bark/voices?${params}`);
  },
  getBarkStyles: async () => request("/api/bark/styles"),
  generateBarkSpeech: async (data: {
    script: string;
    voice_preset?: string;
    style?: string;
    temperature?: number;
    output_format?: string;
  }) => request("/api/bark/generate", { method: "POST", body: JSON.stringify(data) }),

  // Coqui TTS
  getCoquiModels: async () => request("/api/coqui/models"),
  getCoquiLanguages: async () => request("/api/coqui/languages"),
  generateCoquiSpeech: async (data: {
    script: string;
    model_name?: string;
    language?: string;
    speed?: number;
    temperature?: number;
    output_format?: string;
  }) => request("/api/coqui/generate", { method: "POST", body: JSON.stringify(data) }),
  cloneCoquiVoice: async (script: string, language: string, referenceAudio: File) => {
    const formData = new FormData();
    formData.append("script", script);
    formData.append("language", language);
    formData.append("reference_audio", referenceAudio);
    return uploadRequest("/api/coqui/clone", formData);
  },

  // GPT-SoVITS
  getGPTSoVITSPresets: async () => request("/api/gpt-sovits/presets"),
  getGPTSoVITSLanguages: async () => request("/api/gpt-sovits/languages"),
  generateGPTSoVITSSpeech: async (data: {
    script: string;
    language?: string;
    preset?: string;
    output_format?: string;
  }) => request("/api/gpt-sovits/generate", { method: "POST", body: JSON.stringify(data) }),
  cloneGPTSoVITSVoice: async (script: string, referenceText: string, language: string, preset: string, referenceAudio: File) => {
    const formData = new FormData();
    formData.append("script", script);
    formData.append("reference_text", referenceText);
    formData.append("language", language);
    formData.append("preset", preset);
    formData.append("reference_audio", referenceAudio);
    return uploadRequest("/api/gpt-sovits/clone", formData);
  },

  // Transcribe
  transcribeAudio: async (file: File, language: string = "auto") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("language", language);
    return uploadRequest("/api/transcribe", formData);
  },

  // Voices
  getVoices: (favorite?: boolean, search?: string) => {
    const params = new URLSearchParams();
    if (favorite) params.set("favorite", "true");
    if (search) params.set("search", search);
    return request(`/api/voices?${params}`);
  },
  updateVoice: (id: number, data: { name?: string; is_favorite?: boolean }) =>
    request(`/api/voices/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteVoice: (id: number) =>
    request(`/api/voices/${id}`, { method: "DELETE" }),

  // History
  getHistory: (page: number = 1, limit: number = 20) =>
    request(`/api/history?page=${page}&limit=${limit}`),
  deleteHistory: (id: number) =>
    request(`/api/history/${id}`, { method: "DELETE" }),

  // Tasks
  getTaskStatus: (taskId: string) => request(`/api/tasks/${taskId}`),

  // Audio URLs
  getAudioUrl: (path: string) => `${API_BASE}/${path}`,

  // Video Generation
  generateVideo: (data: { script: string; language?: string; voice?: string; orientation?: string; resolution?: string }) =>
    request("/api/video/generate", { method: "POST", body: JSON.stringify(data) }),
  getVideoStatus: (taskId: string) => request(`/api/video/status/${taskId}`),
  downloadVideo: (taskId: string) => `${API_BASE}/api/video/download/${taskId}?token=${getAuthToken()}`,
  listVideos: () => request("/api/video/list"),
  deleteVideo: (taskId: string) => request(`/api/video/${taskId}`, { method: "DELETE" }),

  // Admin
  getAdminStats: () => request("/api/admin/stats"),
  getAdminUsers: (page: number = 1, search?: string, tier?: string, status?: string) => {
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (search) params.set("search", search);
    if (tier) params.set("tier", tier);
    if (status) params.set("status", status);
    return request(`/api/admin/users?${params}`);
  },
  adminUpdateUser: (userId: number, data: { tier?: string; is_active?: boolean; is_admin?: boolean; usage_limit?: number; monthly_usage?: number }) =>
    request(`/api/admin/users/${userId}`, { method: "PUT", body: JSON.stringify(data) }),
  adminCreateUser: (data: { username: string; email: string; password: string; tier?: string }) =>
    request("/api/admin/users", { method: "POST", body: JSON.stringify(data) }),
  adminDeleteUser: (userId: number) =>
    request(`/api/admin/users/${userId}`, { method: "DELETE" }),
  adminSuspendUser: (userId: number) =>
    request(`/api/admin/users/${userId}/suspend`, { method: "POST" }),
  adminActivateUser: (userId: number) =>
    request(`/api/admin/users/${userId}/activate`, { method: "POST" }),
  adminResetUsage: (userId: number) =>
    request(`/api/admin/users/${userId}/reset-usage`, { method: "POST" }),
  adminToggleAdmin: (userId: number) =>
    request(`/api/admin/users/${userId}/toggle-admin`, { method: "POST" }),
};
