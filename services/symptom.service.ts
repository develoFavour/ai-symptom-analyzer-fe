import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/endpoint.const";

export interface AnalyzePayload {
    symptoms: string;
    duration?: string;
    severity?: string;
}

export interface FeedbackPayload {
    helpful: boolean;
    note?: string;
}

export const symptomService = {
    analyze: (payload: AnalyzePayload) =>
        api.post(ENDPOINTS.SYMPTOM.ANALYZE, payload),

    getSessionHistory: () =>
        api.get(ENDPOINTS.SYMPTOM.SESSION_HISTORY),

    getSessionDetail: (sessionId: string) =>
        api.get(ENDPOINTS.SYMPTOM.SESSION_DETAIL(sessionId)),

    submitFeedback: (sessionId: string, payload: FeedbackPayload) =>
        api.post(ENDPOINTS.SYMPTOM.FEEDBACK(sessionId), payload),
};
