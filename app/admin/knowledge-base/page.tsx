"use client";

import { useCallback, useEffect, useState } from "react";
import {
    Plus,
    Search,
    Loader2,
    BookOpen,
    Trash2,
    Edit3,
    Globe,
    Bookmark,
    Clock,
    CheckCircle2,
    X,
    AlertTriangle,
    FileUp,
    ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/common/ConfirmModal";

interface KnowledgeEntry {
    id: string;
    title: string;
    source: string;
    category: string;
    description: string;
    tags: string;
    is_epidemic_alert: boolean;
    region: string;
    urgency_score: number;
    created_at: string;
    author?: { name: string };
}

interface PaginatedResponse<T> {
    items: T[];
    total_items: number;
    total_pages: number;
    page: number;
    limit: number;
}

interface EntryFormData {
    title: string;
    source: string;
    category: string;
    content: string;
    tags: string;
    is_epidemic_alert: boolean;
    region: string;
    urgency_score: number;
}

interface EntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    formData: EntryFormData;
    setFormData: React.Dispatch<React.SetStateAction<EntryFormData>>;
    isSubmitting: boolean;
    isEditing: boolean;
    sources: string[];
}

const defaultFormData: EntryFormData = {
    title: "",
    source: "WHO",
    category: "general",
    content: "",
    tags: "",
    is_epidemic_alert: false,
    region: "Global",
    urgency_score: 0,
};

export default function AdminKnowledgeBase() {
    const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<Omit<PaginatedResponse<KnowledgeEntry>, "items">>({
        total_items: 0,
        total_pages: 0,
        page: 1,
        limit: 20,
    });
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);
    const [formData, setFormData] = useState<EntryFormData>(defaultFormData);
    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string } | null>(null);

    const fetchEntries = useCallback(async () => {
        setIsLoading(true);
        const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: "12",
            search: searchQuery,
            category: activeCategory === "all" || activeCategory === "alerts" ? "" : activeCategory,
            is_epidemic_alert: activeCategory === "alerts" ? "true" : "",
        });

        const res = await api.get<PaginatedResponse<KnowledgeEntry>>(`/admin/knowledge/entries?${params.toString()}`);
        if (res.success && res.data) {
            setEntries(res.data.items);
            setPagination({
                total_items: res.data.total_items,
                total_pages: res.data.total_pages,
                page: res.data.page,
                limit: res.data.limit,
            });
        }
        setIsLoading(false);
    }, [activeCategory, currentPage, searchQuery]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            void fetchEntries();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [fetchEntries]);

    const handleOpenModal = (entry?: KnowledgeEntry) => {
        if (entry) {
            setEditingEntry(entry);
            setFormData({
                title: entry.title,
                source: entry.source,
                category: entry.category,
                content: entry.description,
                tags: entry.tags,
                is_epidemic_alert: entry.is_epidemic_alert,
                region: entry.region,
                urgency_score: entry.urgency_score,
            });
        } else {
            setEditingEntry(null);
            setFormData(defaultFormData);
        }
        setIsEntryModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const endpoint = editingEntry ? `/admin/knowledge/entries/${editingEntry.id}` : "/admin/knowledge/entries";
        const res = editingEntry ? await api.put(endpoint, formData) : await api.post(endpoint, formData);

        setIsSubmitting(false);
        if (res.success) {
            toast.success(editingEntry ? "Clinical entry updated" : "Medical knowledge indexed");
            setIsEntryModalOpen(false);
            void fetchEntries();
        } else {
            toast.error(res.error || "Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        const res = await api.del(`/admin/knowledge/entries/${id}`);
        if (res.success) {
            toast.success("Entry removed from registry");
            setConfirmDelete(null);
            void fetchEntries();
        } else {
            toast.error(res.error || "Deletion failed");
        }
    };

    const sources = ["WHO", "Mayo Clinic", "NCDC", "SymCat", "CDC", "International Protocol"];
    const categories = [
        { id: "all", label: "All Literature" },
        { id: "alerts", label: "Epidemic Alerts", icon: AlertTriangle },
        { id: "infectious_diseases", label: "Infectious" },
        { id: "chronic_conditions", label: "Chronic" },
        { id: "emergency_protocol", label: "Emergency" },
        { id: "pediatrics", label: "Pediatrics" },
    ];

    return (
        <div className="mx-auto max-w-7xl space-y-10 pb-20 text-[#163332]">
            <div className="flex flex-col justify-between gap-6 px-4 md:flex-row md:items-end lg:px-0">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-[#163332]">Clinical Knowledge Base</h1>
                    <p className="mt-1 text-lg font-medium text-[#698782]">Authoritative medical intelligence repository.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 rounded-2xl bg-[#2c756e] px-8 py-3.5 text-xs font-black uppercase text-white shadow-[0_14px_30px_rgba(44,117,110,0.18)] transition-all hover:bg-[#245f5a]"
                    >
                        <Plus className="h-4 w-4" />
                        New Medical Entry
                    </button>
                    <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#d7ebe6] bg-white text-[#698782] shadow-[0_10px_24px_rgba(19,51,50,0.05)] transition-all hover:bg-[#f7fbfa] hover:text-[#163332]">
                        <FileUp className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <div className="space-y-6 px-4 lg:px-0">
                <div className="flex flex-col justify-between gap-6 border-b border-[#e7f1ef] pb-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setCurrentPage(1);
                                }}
                                className={cn(
                                    "relative flex items-center gap-2 whitespace-nowrap px-2 pb-4 text-sm font-black uppercase tracking-[0.2em] transition-all",
                                    activeCategory === cat.id ? "text-[#163332]" : "text-[#8aa39e] hover:text-[#4f6d68]",
                                )}
                            >
                                {cat.icon && <cat.icon className={cn("h-4 w-4", activeCategory === cat.id ? "text-red-500" : "text-[#9bb3ae]")} />}
                                {cat.label}
                                {activeCategory === cat.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-[#2c756e] animate-in slide-in-from-bottom-2 duration-300" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="group relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9bb3ae] transition-colors group-focus-within:text-[#2c756e]" />
                        <input
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Query medical records..."
                            className="w-full rounded-2xl border border-[#d7ebe6] bg-white py-3 pl-12 pr-6 text-sm font-bold text-[#163332] shadow-[0_10px_24px_rgba(19,51,50,0.04)] transition-all placeholder:text-[#9bb3ae] focus:border-[#9dcfc6] focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                        />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 px-4 lg:px-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-6 py-32 text-[#8aa39e]">
                        <Loader2 className="h-12 w-12 animate-spin text-[#2c756e]" />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">Syncing Clinical Intelligence...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="rounded-[3rem] border border-dashed border-[#d7ebe6] bg-white p-32 text-center shadow-[0_18px_40px_rgba(19,51,50,0.04)]">
                        <BookOpen className="mx-auto mb-8 h-20 w-20 text-[#c4d7d3]" />
                        <h3 className="text-2xl font-black tracking-tight text-[#4f6d68]">Repository Empty</h3>
                        <p className="mt-2 text-md font-medium text-[#8aa39e]">Start contributing verified clinical guidelines to the engine.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {entries.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="group relative space-y-6 overflow-hidden rounded-[2.5rem] border border-[#dcece8] bg-white p-8 shadow-[0_14px_32px_rgba(19,51,50,0.05)] transition-all hover:border-[#bfded7] hover:bg-[#fcfffe]"
                                >
                                    {entry.is_epidemic_alert && (
                                        <div className="absolute -mr-16 -mt-16 h-32 w-32 rounded-full bg-red-100 blur-3xl top-0 right-0" />
                                    )}

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={cn(
                                                    "flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                                                    entry.is_epidemic_alert ? "border-red-200 bg-red-50 text-red-600" : "border-[#d7ebe6] bg-[#f4fbf9] text-[#698782]",
                                                )}
                                            >
                                                {entry.is_epidemic_alert ? <AlertTriangle className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                                                {entry.source}
                                            </span>
                                            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                <button
                                                    onClick={() => handleOpenModal(entry)}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d7ebe6] bg-white text-[#698782] transition-all hover:bg-[#f4fbf9] hover:text-[#163332]"
                                                >
                                                    <Edit3 className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete({ isOpen: true, id: entry.id })}
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#d7ebe6] bg-white text-[#698782] transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="line-clamp-2 text-xl font-bold leading-tight tracking-tight text-[#163332] transition-colors group-hover:text-[#2c756e]">
                                                {entry.title}
                                            </h3>
                                            <p className="line-clamp-3 text-sm font-medium leading-relaxed text-[#698782]">{entry.description}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-[#e7f1ef] pt-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#8aa39e]">
                                            <Clock className="h-3.5 w-3.5" />
                                            {format(new Date(entry.created_at), "MMM d, yyyy")}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#698782]">{entry.category.replace("_", " ")}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {pagination.total_pages > 1 && (
                            <div className="flex items-center justify-center gap-4 border-t border-[#e7f1ef] py-8">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    className="group flex h-10 items-center gap-2 rounded-xl border border-[#d7ebe6] bg-white px-6 text-[10px] font-black uppercase tracking-widest text-[#698782] transition-all hover:text-[#163332] disabled:opacity-30 disabled:hover:text-[#698782]"
                                >
                                    <ChevronRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-1" />
                                    Previous
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                                        .filter((p) => p === 1 || p === pagination.total_pages || Math.abs(p - currentPage) <= 1)
                                        .map((p, index, array) => (
                                            <div key={p} className="flex items-center gap-2">
                                                {index > 0 && array[index - 1] !== p - 1 && <span className="text-xs font-black text-[#8aa39e]">...</span>}
                                                <button
                                                    onClick={() => setCurrentPage(p)}
                                                    className={cn(
                                                        "h-10 w-10 rounded-xl border text-[10px] font-black uppercase transition-all",
                                                        currentPage === p
                                                            ? "border-[#2c756e] bg-[#2c756e] text-white"
                                                            : "border-[#d7ebe6] bg-white text-[#8aa39e] hover:text-[#163332]",
                                                    )}
                                                >
                                                    {p}
                                                </button>
                                            </div>
                                        ))}
                                </div>

                                <button
                                    disabled={currentPage === pagination.total_pages}
                                    onClick={() => setCurrentPage((prev) => Math.min(pagination.total_pages, prev + 1))}
                                    className="group flex h-10 items-center gap-2 rounded-xl border border-[#d7ebe6] bg-white px-6 text-[10px] font-black uppercase tracking-widest text-[#698782] transition-all hover:text-[#163332] disabled:opacity-30 disabled:hover:text-[#698782]"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <EntryModal
                isOpen={isEntryModalOpen}
                onClose={() => setIsEntryModalOpen(false)}
                onSubmit={handleSubmit}
                formData={formData}
                setFormData={setFormData}
                isSubmitting={isSubmitting}
                isEditing={!!editingEntry}
                sources={sources}
            />

            <ConfirmModal
                isOpen={!!confirmDelete?.isOpen}
                onClose={() => setConfirmDelete(null)}
                onConfirm={() => confirmDelete && handleDelete(confirmDelete.id)}
                title="Decommission Intelligence?"
                description="This will permanently purge this verified clinical entry from the platform's cognitive reasoning baseline."
                confirmText="Purge Medical Record"
            />
        </div>
    );
}

function EntryModal({ isOpen, onClose, onSubmit, formData, setFormData, isSubmitting, isEditing, sources }: EntryModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(17,33,32,0.35)] p-6 backdrop-blur-sm">
            <form
                onSubmit={onSubmit}
                className="relative w-full max-w-4xl space-y-12 overflow-hidden rounded-[3rem] border border-[#dcece8] bg-white p-12 shadow-[0_24px_60px_rgba(19,51,50,0.18)] animate-in fade-in zoom-in duration-300"
            >
                <div className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-[#eef8f5] blur-[100px]" />

                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#d7ebe6] bg-[#f4fbf9]">
                            {isEditing ? <Edit3 className="h-8 w-8 text-[#2c756e]" /> : <Plus className="h-8 w-8 text-[#2c756e]" />}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight text-[#163332]">
                                {isEditing ? "Revise Intelligence" : "Index Clinical Data"}
                            </h2>
                            <p className="mt-1 text-sm font-medium tracking-tight text-[#698782]">Strengthening the evidence-based AI baseline.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f4fbf9] text-[#698782] transition-all hover:bg-[#e9f5f2] hover:text-[#163332]"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="relative z-10 grid gap-10 md:grid-cols-2">
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8aa39e]">
                                <Bookmark className="h-3 w-3" /> Clinical Observation Title
                            </label>
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Lassa Fever Symptom Spectrum"
                                className="w-full rounded-[1.5rem] border border-[#d7ebe6] bg-[#f9fcfb] px-8 py-5 text-md font-bold text-[#163332] transition-all placeholder:text-[#b7cbc7] focus:border-[#9dcfc6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8aa39e]">Data Source</label>
                                <select
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    className="w-full cursor-pointer appearance-none rounded-[1.5rem] border border-[#d7ebe6] bg-[#f9fcfb] px-6 py-5 text-sm font-bold text-[#163332] transition-all focus:border-[#9dcfc6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                                >
                                    {sources.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8aa39e]">Categorization</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full cursor-pointer appearance-none rounded-[1.5rem] border border-[#d7ebe6] bg-[#f9fcfb] px-6 py-5 text-sm font-bold text-[#163332] transition-all focus:border-[#9dcfc6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                                >
                                    <option value="general">General Medicine</option>
                                    <option value="infectious_diseases">Infectious Diseases</option>
                                    <option value="chronic_conditions">Chronic Conditions</option>
                                    <option value="emergency_protocol">Emergency Protocol</option>
                                    <option value="pediatrics">Pediatrics</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8aa39e]">Taxonomy (Tags)</label>
                            <input
                                value={formData.tags}
                                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="fever, viral, nigeria, outbreak"
                                className="w-full rounded-[1.5rem] border border-[#d7ebe6] bg-[#f9fcfb] px-8 py-5 text-sm font-bold text-[#163332] transition-all placeholder:text-[#b7cbc7] focus:border-[#9dcfc6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                            />
                        </div>

                        <div
                            className={cn(
                                "space-y-4 rounded-[2rem] border p-6 transition-all",
                                formData.is_epidemic_alert ? "border-red-200 bg-red-50" : "border-[#dcece8] bg-[#f7fbfa]",
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className={cn("h-4 w-4", formData.is_epidemic_alert ? "text-red-500" : "text-[#9bb3ae]")} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#163332]">Epidemiological Alert</span>
                                    </div>
                                    <p className="text-[10px] font-medium text-[#698782]">Prioritize this entry for real-time localized surveillance.</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={formData.is_epidemic_alert}
                                        onChange={(e) => setFormData({ ...formData, is_epidemic_alert: e.target.checked })}
                                    />
                                    <div className="h-7 w-14 rounded-full bg-[#d7ebe6] peer-focus:outline-none peer-checked:bg-red-500 after:absolute after:left-[4px] after:top-[4px] after:h-5 after:w-6 after:rounded-full after:border after:border-[#c6d9d4] after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white" />
                                </label>
                            </div>

                            {formData.is_epidemic_alert && (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-1.5">
                                        <label className="ml-1 text-[9.5px] font-bold uppercase tracking-widest text-[#8aa39e]">Target Region</label>
                                        <input
                                            value={formData.region}
                                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                            className="w-full rounded-xl border border-[#d7ebe6] bg-white px-4 py-3 text-xs font-bold text-[#163332]"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="ml-1 text-[9.5px] font-bold uppercase tracking-widest text-[#8aa39e]">Urgency Scale</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={formData.urgency_score}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    urgency_score: Number.parseInt(e.target.value || "0", 10),
                                                })
                                            }
                                            className="w-full rounded-xl border border-[#d7ebe6] bg-white px-4 py-3 text-xs font-bold text-[#163332]"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="ml-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#8aa39e]">
                            <FileUp className="h-3 w-3" /> Full Clinical Literature Content
                        </label>
                        <textarea
                            required
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Detail the symptom patterns, epidemiological context, and recommended clinical next steps according to source protocols..."
                            className="h-[410px] w-full resize-none rounded-[2.5rem] border border-[#d7ebe6] bg-[#f9fcfb] p-10 text-md font-bold leading-relaxed text-[#163332] transition-all placeholder:text-[#b7cbc7] focus:border-[#9dcfc6] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                        />
                    </div>
                </div>

                <div className="relative z-10 flex gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex h-20 flex-1 items-center justify-center gap-4 rounded-[2.5rem] bg-[#2c756e] text-xl font-black text-white shadow-[0_18px_36px_rgba(44,117,110,0.18)] transition-all active:scale-95 hover:bg-[#245f5a] disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-8 w-8 animate-spin" />
                        ) : (
                            <>
                                <CheckCircle2 className="h-7 w-7" />
                                {isEditing ? "Commit Intelligence Revision" : "Deploy Medical Intelligence"}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
