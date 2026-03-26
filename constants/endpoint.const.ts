const API_BASE = ""; // Cleaned up to use relative paths since axios has baseURL

export const ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: `/auth/login`,
        REGISTER: `/auth/register`,
        LOGOUT: `/auth/logout`,
        REFRESH: `/auth/refresh`,
        DOCTOR_SETUP: `/auth/doctor/setup`,
        FORGOT_PASSWORD: `/auth/forgot-password`,
        RESET_PASSWORD: `/auth/reset-password`,
        VERIFY_EMAIL: `/auth/verify-email`,
        ME: `/auth/me`,
    },

    // Symptoms & Diagnosis
    SYMPTOM: {
        ANALYZE: `/symptoms/analyze`,
        SESSION_HISTORY: `/symptoms/sessions`,
        SESSION_DETAIL: (sessionId: string) =>
            `/symptoms/sessions/${sessionId}`,
        FEEDBACK: (sessionId: string) =>
            `/symptoms/sessions/${sessionId}/feedback`,
    },

    // Consultation (Patient side)
    CONSULTATION: {
        CREATE: `/consultations`,
        LIST_MINE: `/consultations/my`,
        DETAIL: (id: string) => `/consultations/${id}`,
    },

    // Doctor
    DOCTOR: {
        CONSULTATION_QUEUE: `/doctor/consultations`,
        CONSULTATION_DETAIL: (id: string) =>
            `/doctor/consultations/${id}`,
        CONSULTATION_REPLY: (id: string) =>
            `/doctor/consultations/${id}/reply`,
        FLAGGED_CASES: `/doctor/flagged-cases`,
        FLAGGED_CASE_DETAIL: (id: string) =>
            `/doctor/flagged-cases/${id}`,
        REVIEW_CASE: (id: string) =>
            `/doctor/flagged-cases/${id}/review`,
        KNOWLEDGE_BASE_SUBMIT: `/doctor/knowledge-base`,
        TRENDS: `/doctor/trends`,
        PROFILE: `/doctor/profile`,
    },

    // Admin
    ADMIN: {
        // Users
        USERS: `/admin/users`,
        USER_DETAIL: (id: string) => `/admin/users/${id}`,
        USER_SUSPEND: (id: string) => `/admin/users/${id}/suspend`,

        // Doctors
        DOCTORS: `/admin/doctors`,
        DOCTOR_DETAIL: (id: string) => `/admin/doctors/${id}`,
        DOCTOR_INVITE: `/admin/doctors/invite`,
        DOCTOR_REVOKE: (id: string) => `/admin/doctors/${id}/revoke`,

        // Knowledge Base
        KNOWLEDGE_BASE: `/admin/knowledge-base`,
        KNOWLEDGE_BASE_UPLOAD: `/admin/knowledge-base/upload`,
        KNOWLEDGE_APPROVE: (id: string) =>
            `/admin/knowledge-base/${id}/approve`,
        KNOWLEDGE_REJECT: (id: string) =>
            `/admin/knowledge-base/${id}/reject`,

        // Reports & Settings
        REPORTS: `/admin/reports`,
        SETTINGS: `/admin/settings`,
        API_USAGE: `/admin/api-usage`,
    },

    // Notifications
    NOTIFICATION: {
        LIST: `/notifications`,
        MARK_READ: (id: string) => `/notifications/${id}/read`,
        MARK_ALL_READ: `/notifications/read-all`,
        UNREAD_COUNT: `/notifications/unread-count`,
    },
} as const;
