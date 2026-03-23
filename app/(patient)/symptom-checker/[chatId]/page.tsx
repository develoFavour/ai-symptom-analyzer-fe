"use client";

import SymptomChatInterface from "@/components/patient/SymptomChatInterface";
import { useParams } from "next/navigation";

export default function SymptomCheckerSession() {
    const params = useParams();
    const chatId = params?.chatId as string;

    // Optional Check if invalid
    if (!chatId) {
        return <div className="p-8 text-white/50 text-center">Invalid session ID.</div>;
    }

    return (
        <div className="-mx-8 -mt-8 -mb-8 h-[calc(100vh-5rem)] flex flex-col bg-[#050505]">
            <SymptomChatInterface chatId={chatId} />
        </div>
    );
}
