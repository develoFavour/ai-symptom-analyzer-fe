"use client";

import SymptomChatInterface from "@/components/patient/SymptomChatInterface";
import { useParams } from "next/navigation";

export default function SymptomCheckerSession() {
    const params = useParams();
    const chatId = params?.chatId as string;

    // Optional Check if invalid
    if (!chatId) {
        return <div className="p-8 text-center text-[#698782]">Invalid session ID.</div>;
    }

    return (
        <div className="-mx-8 -mt-8 -mb-8 flex h-[calc(100vh-5rem)] flex-col bg-[#f7fbfa]">
            <SymptomChatInterface chatId={chatId} />
        </div>
    );
}
