import { api } from "@/lib/api";
import { ENDPOINTS } from "@/constants/endpoint.const";

export interface CreateConsultationPayload {
    symptoms: string;
    patient_note?: string;
    urgency: "routine" | "soon" | "urgent";
    session_id?: string;
}

export const consultationService = {
    // Patient
    create: (payload: CreateConsultationPayload) =>
        api.post(ENDPOINTS.CONSULTATION.CREATE, payload),

    listMine: () =>
        api.get(ENDPOINTS.CONSULTATION.LIST_MINE),

    getDetail: (id: string) =>
        api.get(ENDPOINTS.CONSULTATION.DETAIL(id)),

    // Doctor
    getQueue: () =>
        api.get(ENDPOINTS.DOCTOR.CONSULTATION_QUEUE),

    getDoctorDetail: (id: string) =>
        api.get(ENDPOINTS.DOCTOR.CONSULTATION_DETAIL(id)),

    reply: (id: string, payload: { reply_text: string; recommendation?: string }) =>
        api.post(ENDPOINTS.DOCTOR.CONSULTATION_REPLY(id), payload),
};
