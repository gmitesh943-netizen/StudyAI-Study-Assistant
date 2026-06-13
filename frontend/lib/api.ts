import { API_URL } from "./utils";

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  } catch {
    throw new Error(
      "Server સાથે connect થઈ શક્યું નહીં. start-dev.ps1 ચલાવો અથવા backend start કરો."
    );
  }

  // Auto-logout on 401: clear stale/expired token and redirect to sign-in
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("studyai_token");
      // Only redirect if on protected routes (dashboard)
      const path = window.location.pathname;
      if (path.startsWith("/dashboard")) {
        window.location.href = "/sign-in?reason=session_expired";
        // Return a pending promise so the caller never resolves
        await new Promise(() => {});
      }
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    const detail = err.detail;
    const message = typeof detail === "string"
      ? detail
      : Array.isArray(detail)
        ? detail.map((e: { msg?: string }) => e.msg).filter(Boolean).join(", ")
        : "Request failed";
    throw new Error(message || "Request failed");
  }
  return res.json();
}

export const api = {
  login: (email: string, password: string) =>
    fetchAPI<TokenData>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, username: string, password: string) =>
    fetchAPI<UserData>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    }),

  me: (token: string) =>
    fetchAPI<UserData>("/api/auth/me", {}, token),

  chat: (message: string, subject: string, history: ChatMessage[] = [], token?: string) =>
    fetchAPI<{ response: string; tokens_used?: number; token_limit?: number; cooldown_until?: string | null }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify({ message, subject, history }),
    }, token),

  summarizePDF: (text: string, token?: string) =>
    fetchAPI<{ summary: string; key_points: string[]; questions: string[] }>(
      "/api/ai/pdf-summary",
      { method: "POST", body: JSON.stringify({ text }) },
      token
    ),

  generateQuiz: (topic: string, count: number, token?: string) =>
    fetchAPI<{ questions: QuizQuestion[] }>(
      "/api/ai/quiz",
      { method: "POST", body: JSON.stringify({ topic, count }) },
      token
    ),

  generateFlashcards: (topic: string, count: number, token?: string) =>
    fetchAPI<{ cards: Flashcard[] }>(
      "/api/ai/flashcards",
      { method: "POST", body: JSON.stringify({ topic, count }) },
      token
    ),

  generateNotes: (topic: string, subject: string, token?: string) =>
    fetchAPI<{ content: string }>(
      "/api/ai/notes",
      { method: "POST", body: JSON.stringify({ topic, subject }) },
      token
    ),

  generatePlan: (subjects: string[], hours: number, token?: string) =>
    fetchAPI<{ schedule: StudyBlock[] }>(
      "/api/ai/study-plan",
      { method: "POST", body: JSON.stringify({ subjects, hours_per_day: hours }) },
      token
    ),

  getDashboard: (token?: string) =>
    fetchAPI<DashboardData>("/api/dashboard", {}, token),

  getAnalytics: (token?: string) =>
    fetchAPI<AnalyticsData>("/api/admin/analytics", {}, token),

  // New comprehensive admin dashboard
  getAdminDashboard: (token?: string) =>
    fetchAPI<AdminDashboardData>("/api/admin/dashboard", {}, token),

  // User management
  getAdminUsers: (token?: string) =>
    fetchAPI<UsersListData>("/api/admin/users", {}, token),

  banUser: (userId: number, token?: string) =>
    fetchAPI<{ success: boolean; message: string }>(
      `/api/admin/users/${userId}/ban`,
      { method: "POST" },
      token
    ),

  unbanUser: (userId: number, token?: string) =>
    fetchAPI<{ success: boolean; message: string }>(
      `/api/admin/users/${userId}/unban`,
      { method: "POST" },
      token
    ),

  updateUserSubscription: (userId: number, tier: string, token?: string) =>
    fetchAPI<{ success: boolean; message: string }>(
      `/api/admin/users/${userId}/subscription`,
      { method: "PUT", body: JSON.stringify({ tier }) },
      token
    ),

  resetUserTokens: (userId: number, token?: string) =>
    fetchAPI<{ success: boolean; message: string }>(
      `/api/admin/users/${userId}/reset-tokens`,
      { method: "POST" },
      token
    ),

  deleteUser: (userId: number, token?: string) =>
    fetchAPI<{ success: boolean; message: string }>(
      `/api/admin/users/${userId}`,
      { method: "DELETE" },
      token
    ),

  trackUsage: (event: UsageTrackEvent, token?: string) =>
    fetchAPI<{ success: boolean }>(
      "/api/analytics/track",
      { method: "POST", body: JSON.stringify(event) },
      token
    ),

  // Course APIs
  getCourses: (skip?: number, limit?: number, category?: string, token?: string) => {
    const params = new URLSearchParams();
    if (skip !== undefined) params.append("skip", skip.toString());
    if (limit !== undefined) params.append("limit", limit.toString());
    if (category) params.append("category", category);
    return fetchAPI<CoursesListData>(
      `/api/courses?${params.toString()}`,
      {},
      token
    );
  },

  getCourse: (courseId: number, token?: string) =>
    fetchAPI<CourseData>(`/api/courses/${courseId}`, {}, token),

  createCourse: (course: { name: string; description?: string; category?: string; resources?: GoogleResource[] }, token?: string) =>
    fetchAPI<CourseData>(
      "/api/courses",
      {
        method: "POST",
        body: JSON.stringify(course),
      },
      token
    ),

  updateCourse: (courseId: number, course: Partial<{ name: string; description?: string; category?: string; resources?: GoogleResource[] }>, token?: string) =>
    fetchAPI<CourseData>(
      `/api/courses/${courseId}`,
      {
        method: "PUT",
        body: JSON.stringify(course),
      },
      token
    ),

  deleteCourse: (courseId: number, token?: string) =>
    fetchAPI<void>(
      `/api/courses/${courseId}`,
      { method: "DELETE" },
      token
    ),

  generateCourse: (topic: string, token?: string) =>
    fetchAPI<CourseData>(
      "/api/courses/generate",
      {
        method: "POST",
        body: JSON.stringify({ topic }),
      },
      token
    ),

  checkout: (tier: string, paymentMethod: string, cardNumber?: string, cvv?: string, token?: string) =>
    fetchAPI<{ success: boolean; message: string; tier: string; token_limit: number }>(
      "/api/payment/checkout",
      {
        method: "POST",
        body: JSON.stringify({ tier, payment_method: paymentMethod, card_number: cardNumber, cvv }),
      },
      token
    ),

  recharge: (tokens: number, amount: number, paymentMethod: string, token?: string) =>
    fetchAPI<{ success: boolean; message: string; tokens_used: number; token_limit: number }>(
      "/api/payment/recharge",
      {
        method: "POST",
        body: JSON.stringify({ tokens, amount, payment_method: paymentMethod }),
      },
      token
    ),

  getRevenueSummary: (token?: string) =>
    fetchAPI<RevenueSummaryData>("/api/payment/revenue", {}, token),
};


export interface TokenData {
  access_token: string;
  token_type: string;
}

export interface UserData {
  id: number;
  email: string;
  username: string;
  is_admin: boolean;
  subscription_tier: string;
  tokens_used: number;
  token_limit: number;
  cooldown_until: string | null;
  is_banned: boolean;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Flashcard {
  id: number;
  front: string;
  back: string;
  subject: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StudyBlock {
  time: string;
  subject: string;
  task: string;
  duration: string;
}

export interface UsageTrackEvent {
  path: string;
  feature: string;
  event_type: "view" | "heartbeat" | "leave";
  duration_seconds?: number;
}

export interface DashboardData {
  stats: {
    study_hours: number;
    quizzes_completed: number;
    flashcards_reviewed: number;
    notes_created: number;
    page_views: number;
    active_minutes: number;
  };
  progress: { subject: string; value: number }[];
  recent_activity: { action: string; time: string; subject: string }[];
}

export interface UserActivityDetail {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  last_active: string | null;
  active_minutes: number;
  features_used: string[];
  total_chats: number;
  total_quizzes: number;
}

export interface AnalyticsData {
  total_users: number;
  active_users: number;
  total_chats: number;
  total_quizzes: number;
  total_views: number;
  total_active_minutes: number;
  feature_usage: FeatureUsageItem[];
  users_activity: UserActivityDetail[];
}

export interface FeatureUsageItem {
  feature: string;
  views: number;
  active_minutes: number;
}

export interface TransactionResponseData {
  id: number;
  user_id: number;
  username: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  transaction_type: string;
  details: string | null;
  created_at: string;
}

export interface RevenueSummaryData {
  total_revenue: number;
  stripe_revenue: number;
  razorpay_revenue: number;
  transaction_count: number;
  recharge_count: number;
  subscription_count: number;
  recent_transactions: TransactionResponseData[];
}


export interface AdminDashboardData {
  total_users: number;
  active_users: number;
  free_users: number;
  pro_users: number;
  ultra_users: number;
  banned_users: number;
  total_chats: number;
  total_quizzes: number;
  total_active_minutes: number;
  feature_usage: FeatureUsageItem[];
  daily_activity: { date: string; events: number; users: number }[];
  users_activity: UserActivityDetail[];
}

export interface UserManagementItem {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  is_banned: boolean;
  subscription_tier: string;
  tokens_used: number;
  token_limit: number;
  cooldown_until: string | null;
  created_at: string;
  last_active: string | null;
  active_minutes: number;
  total_chats: number;
  total_quizzes: number;
}

export interface UsersListData {
  users: UserManagementItem[];
  total: number;
  free_count: number;
  pro_count: number;
  ultra_count: number;
  banned_count: number;
}

export interface GoogleResource {
  title: string;
  url: string;
  type: string;
}

export interface CourseData {
  id: number;
  name: string;
  description?: string;
  category?: string;
  resources?: GoogleResource[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CoursesListData {
  courses: CourseData[];
  total: number;
}
