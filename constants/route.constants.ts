export const ROUTES = {
  // Public
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_EMAIL: "/verify-email",
  VERIFY: "/verify",

  // Patient
  PATIENT: {
    DASHBOARD: "/dashboard",
    SYMPTOM_CHECKER: "/symptom-checker",
    HISTORY: "/history",
    HISTORY_DETAIL: (sessionId: string) => `/history/${sessionId}`,
    CONSULTATION: "/consultation",
    CONSULTATION_REQUEST: "/consultation/request",
    CONSULTATION_DETAIL: (id: string) => `/consultation/${id}`,
    NOTIFICATIONS: "/notifications",
    PROFILE: "/profile",
  },

  // Doctor
  DOCTOR: {
    DASHBOARD: "/doctor/dashboard",
    CONSULTATIONS: "/doctor/consultations",
    CONSULTATION_DETAIL: (id: string) => `/doctor/consultations/${id}`,
    FLAGGED_CASES: "/doctor/flagged-cases",
    FLAGGED_CASE_DETAIL: (id: string) => `/doctor/flagged-cases/${id}`,
    KNOWLEDGE_BASE: "/doctor/knowledge-base",
    TRENDS: "/doctor/trends",
    NOTIFICATIONS: "/doctor/notifications",
    PROFILE: "/doctor/profile",
  },

  // Admin
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    USER_DETAIL: (id: string) => `/admin/users/${id}`,
    DOCTORS: "/admin/doctors",
    DOCTOR_DETAIL: (id: string) => `/admin/doctors/${id}`,
    KNOWLEDGE_BASE: "/admin/knowledge-base",
    DATASET_UPLOAD: "/admin/knowledge-base/upload",
    REPORTS: "/admin/reports",
    SETTINGS: "/admin/settings",
    NOTIFICATIONS: "/admin/notifications",
  },
} as const;
