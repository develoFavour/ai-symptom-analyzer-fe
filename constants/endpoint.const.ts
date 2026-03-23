const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: `${API_BASE}/auth/login`,
        REGISTER: `${API_BASE}/auth/register`,
        LOGOUT: `${API_BASE}/auth/logout`,
        REFRESH: `${API_BASE}/auth/refresh`,
        DOCTOR_SETUP: `${API_BASE}/auth/doctor/setup`,
        FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
        RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
        VERIFY_EMAIL: `${API_BASE}/auth/verify-email`,
        ME: `${API_BASE}/auth/me`,
    },

    // Symptoms & Diagnosis
    SYMPTOM: {
        ANALYZE: `${API_BASE}/symptoms/analyze`,
        SESSION_HISTORY: `${API_BASE}/symptoms/sessions`,
        SESSION_DETAIL: (sessionId: string) =>
            `${API_BASE}/symptoms/sessions/${sessionId}`,
        FEEDBACK: (sessionId: string) =>
            `${API_BASE}/symptoms/sessions/${sessionId}/feedback`,
    },

    // Consultation (Patient side)
    CONSULTATION: {
        CREATE: `${API_BASE}/consultations`,
        LIST_MINE: `${API_BASE}/consultations/my`,
        DETAIL: (id: string) => `${API_BASE}/consultations/${id}`,
    },

    // Doctor
    DOCTOR: {
        CONSULTATION_QUEUE: `${API_BASE}/doctor/consultations`,
        CONSULTATION_DETAIL: (id: string) =>
            `${API_BASE}/doctor/consultations/${id}`,
        CONSULTATION_REPLY: (id: string) =>
            `${API_BASE}/doctor/consultations/${id}/reply`,
        FLAGGED_CASES: `${API_BASE}/doctor/flagged-cases`,
        FLAGGED_CASE_DETAIL: (id: string) =>
            `${API_BASE}/doctor/flagged-cases/${id}`,
        REVIEW_CASE: (id: string) =>
            `${API_BASE}/doctor/flagged-cases/${id}/review`,
        KNOWLEDGE_BASE_SUBMIT: `${API_BASE}/doctor/knowledge-base`,
        TRENDS: `${API_BASE}/doctor/trends`,
        PROFILE: `${API_BASE}/doctor/profile`,
    },

    // Admin
    ADMIN: {
        // Users
        USERS: `${API_BASE}/admin/users`,
        USER_DETAIL: (id: string) => `${API_BASE}/admin/users/${id}`,
        USER_SUSPEND: (id: string) => `${API_BASE}/admin/users/${id}/suspend`,

        // Doctors
        DOCTORS: `${API_BASE}/admin/doctors`,
        DOCTOR_DETAIL: (id: string) => `${API_BASE}/admin/doctors/${id}`,
        DOCTOR_INVITE: `${API_BASE}/admin/doctors/invite`,
        DOCTOR_REVOKE: (id: string) => `${API_BASE}/admin/doctors/${id}/revoke`,

        // Knowledge Base
        KNOWLEDGE_BASE: `${API_BASE}/admin/knowledge-base`,
        KNOWLEDGE_BASE_UPLOAD: `${API_BASE}/admin/knowledge-base/upload`,
        KNOWLEDGE_APPROVE: (id: string) =>
            `${API_BASE}/admin/knowledge-base/${id}/approve`,
        KNOWLEDGE_REJECT: (id: string) =>
            `${API_BASE}/admin/knowledge-base/${id}/reject`,

        // Reports & Settings
        REPORTS: `${API_BASE}/admin/reports`,
        SETTINGS: `${API_BASE}/admin/settings`,
        API_USAGE: `${API_BASE}/admin/api-usage`,
    },

    // Notifications
    NOTIFICATION: {
        LIST: `${API_BASE}/notifications`,
        MARK_READ: (id: string) => `${API_BASE}/notifications/${id}/read`,
        MARK_ALL_READ: `${API_BASE}/notifications/read-all`,
        UNREAD_COUNT: `${API_BASE}/notifications/unread-count`,
    },
} as const;
