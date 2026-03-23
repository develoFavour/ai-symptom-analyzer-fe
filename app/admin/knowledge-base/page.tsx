"use client";

import { useEffect, useState } from "react";
import {
    Plus, Search, Loader2, BookOpen, AlertCircle,
    MoreVertical, Trash2, Edit3, Filter, ShieldCheck,
    Globe, Bookmark, Clock, CheckCircle2, X, AlertTriangle,
    FileUp, ChevronRight
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

export default function AdminKnowledgeBase() {
    const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<Omit<PaginatedResponse<any>, 'items'>>({
        total_items: 0,
        total_pages: 0,
        page: 1,
        limit: 20
    });

    // Modal States
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingEntry, setEditingEntry] = useState<KnowledgeEntry | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        source: "WHO",
        category: "general",
        content: "",
        tags: "",
        is_epidemic_alert: false,
        region: "Global",
        urgency_score: 0
    });

    const [confirmDelete, setConfirmDelete] = useState<{ isOpen: boolean; id: string } | null>(null);

    const fetchEntries = async () => {
        setIsLoading(true);
        const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: "12",
            search: searchQuery,
            category: activeCategory === "all" || activeCategory === "alerts" ? "" : activeCategory,
            is_epidemic_alert: activeCategory === "alerts" ? "true" : ""
        });

        const res = await api.get<PaginatedResponse<KnowledgeEntry>>(`/api/v1/admin/knowledge/entries?${params.toString()}`);
        if (res.success && res.data) {
            setEntries(res.data.items);
            setPagination({
                total_items: res.data.total_items,
                total_pages: res.data.total_pages,
                page: res.data.page,
                limit: res.data.limit
            });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEntries();
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [currentPage, activeCategory, searchQuery]);

    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, searchQuery]);

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
                urgency_score: entry.urgency_score
            });
        } else {
            setEditingEntry(null);
            setFormData({
                title: "",
                source: "WHO",
                category: "general",
                content: "",
                tags: "",
                is_epidemic_alert: false,
                region: "Global",
                urgency_score: 0
            });
        }
        setIsEntryModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const endpoint = editingEntry
            ? `/api/v1/admin/knowledge/entries/${editingEntry.id}`
            : "/api/v1/admin/knowledge/entries";

        const method = editingEntry ? "put" : "post";
        // @ts-ignore
        const res = await api[method](endpoint, formData);

        setIsSubmitting(false);
        if (res.success) {
            toast.success(editingEntry ? "Clinical entry updated" : "Medical knowledge indexed");
            setIsEntryModalOpen(false);
            fetchEntries();
        } else {
            toast.error(res.error || "Operation failed");
        }
    };

    const handleDelete = async (id: string) => {
        const res = await api.del(`/api/v1/admin/knowledge/entries/${id}`);
        if (res.success) {
            toast.success("Entry removed from registry");
            setConfirmDelete(null);
            fetchEntries();
        } else {
            toast.error(res.error || "Deletion failed");
        }
    };

    const filteredEntries = entries; // Already filtered server-side

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
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 lg:px-0">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Clinical Knowledge Base</h1>
                    <p className="text-white/40 mt-1 text-lg font-medium">Authoritative medical intelligence repository.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-white text-black px-8 py-3.5 rounded-2xl font-black flex items-center gap-2 hover:bg-white/90 transition-all shadow-xl shadow-white/5 uppercase text-xs"
                    >
                        <Plus className="h-4 w-4" />
                        New Medical Entry
                    </button>
                    <button className="bg-white/5 border border-white/10 text-white/40 h-12 w-12 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all">
                        <FileUp className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="space-y-6 px-4 lg:px-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-2">
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "pb-4 px-2 text-sm font-black uppercase tracking-[0.2em] relative transition-all whitespace-nowrap flex items-center gap-2",
                                    activeCategory === cat.id ? "text-white" : "text-white/20 hover:text-white/40"
                                )}
                            >
                                {cat.icon && <cat.icon className={cn("h-4 w-4", activeCategory === cat.id ? "text-red-500" : "text-white/20")} />}
                                {cat.label}
                                {activeCategory === cat.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-full animate-in slide-in-from-bottom-2 duration-300" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-white transition-colors" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Query medical records..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-3 text-white text-sm focus:outline-none focus:border-white/30 transition-all font-bold"
                        />
                    </div>
                </div>
            </div>

            {/* Entry Grid */}
            <div className="grid gap-6 px-4 lg:px-0">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-6 text-white/20">
                        <Loader2 className="h-12 w-12 animate-spin" />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">Syncing Clinical Intelligence...</p>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="bg-white/5 border border-white/5 rounded-[3rem] p-32 text-center border-dashed">
                        <BookOpen className="h-20 w-20 mx-auto mb-8 text-white/5" />
                        <h3 className="text-2xl font-black text-white/40 italic uppercase tracking-tighter">Repository Empty</h3>
                        <p className="text-white/20 text-md mt-2 font-medium">Start contributing verified clinical guidelines to the engine.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {entries.map(entry => (
                                <div key={entry.id} className="bg-[#0c0c0c] border border-white/5 rounded-[2.5rem] p-8 space-y-6 hover:bg-white/[0.03] hover:border-white/10 transition-all group relative overflow-hidden">
                                    {entry.is_epidemic_alert && (
                                        <div className="absolute top-0 right-0 h-32 w-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                                    )}

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5 flex items-center gap-2",
                                                entry.is_epidemic_alert ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-white/5 text-white/40"
                                            )}>
                                                {entry.is_epidemic_alert ? <AlertTriangle className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                                                {entry.source}
                                            </span>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenModal(entry)} className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"><Edit3 className="h-4 w-4" /></button>
                                                <button onClick={() => setConfirmDelete({ isOpen: true, id: entry.id })} className="h-8 w-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/40 hover:text-red-500 transition-all"><Trash2 className="h-4 w-4" /></button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-white tracking-tight line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors uppercase italic">{entry.title}</h3>
                                            <p className="text-sm text-white/40 line-clamp-3 leading-relaxed font-medium">{entry.description}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] text-white/20 font-black uppercase tracking-[0.15em]">
                                            <Clock className="h-3.5 w-3.5" />
                                            {format(new Date(entry.created_at), "MMM d, yyyy")}
                                        </div>
                                        <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">{entry.category.replace("_", " ")}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        {pagination.total_pages > 1 && (
                            <div className="flex items-center justify-center gap-4 py-8 border-t border-white/5">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    className="h-10 px-6 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-30 disabled:hover:text-white/40 transition-all flex items-center gap-2 group"
                                >
                                    <ChevronRight className="h-4 w-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                                    Previous
                                </button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
                                        .filter(p => p === 1 || p === pagination.total_pages || Math.abs(p - currentPage) <= 1)
                                        .map((p, index, array) => (
                                            <div key={p} className="flex items-center gap-2">
                                                {index > 0 && array[index - 1] !== p - 1 && (
                                                    <span className="text-white/20 text-xs font-black">...</span>
                                                )}
                                                <button
                                                    onClick={() => setCurrentPage(p)}
                                                    className={cn(
                                                        "h-10 w-10 rounded-xl text-[10px] font-black uppercase transition-all",
                                                        currentPage === p 
                                                            ? "bg-white text-black" 
                                                            : "bg-white/5 text-white/20 hover:text-white border border-white/5"
                                                    )}
                                                >
                                                    {p}
                                                </button>
                                            </div>
                                        ))
                                    }
                                </div>

                                <button 
                                    disabled={currentPage === pagination.total_pages}
                                    onClick={() => setCurrentPage(prev => Math.min(pagination.total_pages, prev + 1))}
                                    className="h-10 px-6 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white disabled:opacity-30 disabled:hover:text-white/40 transition-all flex items-center gap-2 group"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Entry Form Modal */}
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

            {/* Confirmation Modal */}
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

// ── Entry Form Modal ─────────────────────────────────────────────────────────

function EntryModal({ isOpen, onClose, onSubmit, formData, setFormData, isSubmitting, isEditing, sources }: any) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 selection:bg-white selection:text-black">
            <form onSubmit={onSubmit} className="bg-[#050505] border border-white/10 rounded-[4rem] p-12 w-full max-w-4xl shadow-2xl space-y-12 relative overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="absolute -top-40 -right-40 h-[30rem] w-[30rem] bg-blue-500/5 rounded-full blur-[100px]" />

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-3xl bg-white/5 flex items-center justify-center border border-white/10">
                            {isEditing ? <Edit3 className="h-8 w-8 text-blue-400" /> : <Plus className="h-8 w-8 text-white" />}
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{isEditing ? "Revise Intelligence" : "Index Clinical Data"}</h2>
                            <p className="text-white/40 text-sm font-medium mt-1 tracking-tight italic">Strengthening the Evidence-Based AI Baseline.</p>
                        </div>
                    </div>
                    <button type="button" onClick={onClose} className="h-12 w-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/20 transition-all">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-10 relative z-10">
                    {/* Left Column */}
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2 flex items-center gap-2 italic">
                                <Bookmark className="h-3 w-3" /> Clinical Observation Title
                            </label>
                            <input
                                required
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g., Lassa Fever Symptom Spectrum"
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 text-white text-md focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-bold placeholder:text-white/10"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2 italic">Data Source</label>
                                <select
                                    value={formData.source}
                                    onChange={e => setFormData({ ...formData, source: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white text-sm focus:outline-none focus:border-white/30 transition-all font-bold appearance-none cursor-pointer"
                                >
                                    {sources.map((s: string) => <option key={s} value={s}
                                        className="bg-black/5"
                                    >{s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2 italic">Categorization</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white text-sm focus:outline-none focus:border-white/30 transition-all font-bold appearance-none cursor-pointer"
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
                            <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2 italic">Taxonomy (Tags)</label>
                            <input
                                value={formData.tags}
                                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                placeholder="fever, viral, nigeria, outbreak"
                                className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-5 text-white text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-bold placeholder:text-white/10"
                            />
                        </div>

                        <div className={cn(
                            "p-6 rounded-[2rem] border transition-all space-y-4",
                            formData.is_epidemic_alert ? "bg-red-500/5 border-red-500/20" : "bg-white/[0.02] border-white/5"
                        )}>
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className={cn("h-4 w-4", formData.is_epidemic_alert ? "text-red-500 animate-pulse" : "text-white/20")} />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Epidemiological Alert</span>
                                    </div>
                                    <p className="text-[10px] text-white/30 font-medium">Prioritize this entry for real-time localized surveillance.</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={formData.is_epidemic_alert} onChange={e => setFormData({ ...formData, is_epidemic_alert: e.target.checked })} />
                                    <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white/20 after:border-white/20 after:border after:rounded-full after:h-5 after:w-6 after:transition-all peer-checked:bg-red-500 peer-checked:after:bg-white"></div>
                                </label>
                            </div>

                            {formData.is_epidemic_alert && (
                                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[9.5px] font-bold text-white/20 uppercase tracking-widest ml-1 italic">Target Region</label>
                                        <input value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9.5px] font-bold text-white/20 uppercase tracking-widest ml-1 italic">Urgency Scale</label>
                                        <input type="number" min="0" max="10" value={formData.urgency_score} onChange={e => setFormData({ ...formData, urgency_score: parseInt(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-xs font-bold" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2 flex items-center gap-2 italic">
                            <FileUp className="h-3 w-3" /> Full Clinical Literature Content
                        </label>
                        <textarea
                            required
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            placeholder="Detail the symptom patterns, epidemiological context, and recommended clinical next steps according to source protocols..."
                            className="w-full h-[410px] bg-white/5 border border-white/10 rounded-[2.5rem] p-10 text-white text-md focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-bold placeholder:text-white/10 resize-none leading-relaxed"
                        />
                    </div>
                </div>

                <div className="flex gap-4 relative z-10">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 h-20 bg-white text-black font-black text-xl rounded-[2.5rem] hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-white/5 uppercase tracking-tighter italic"
                    >
                        {isSubmitting ? <Loader2 className="h-8 w-8 animate-spin" /> : <><CheckCircle2 className="h-7 w-7" /> {isEditing ? "Commit Intelligence Revision" : "Deploy Medical Intelligence"}</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
