"use client";

import { useEffect, useState } from "react";
import {
    Search, Loader2, BookOpen,
    ShieldCheck, Globe, Clock,
    AlertTriangle, ChevronRight, Info
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useCallback } from "react";

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
}

interface PaginatedResponse<T> {
    items: T[];
    total_items: number;
    total_pages: number;
    page: number;
    limit: number;
}

export default function DoctorKnowledgeBase() {
    const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<Omit<PaginatedResponse<KnowledgeEntry>, "items">>({
        total_items: 0,
        total_pages: 0,
        page: 1,
        limit: 20
    });

    const fetchEntries = useCallback(async () => {
        setIsLoading(true);
        const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: "12", // 3 columns * 4 rows
            search: searchQuery,
            category: activeCategory === "all" || activeCategory === "alerts" ? "" : activeCategory,
            is_epidemic_alert: activeCategory === "alerts" ? "true" : ""
        });

        const res = await api.get<PaginatedResponse<KnowledgeEntry>>(`/doctor/knowledge/entries?${params.toString()}`);
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
    }, [activeCategory, currentPage, searchQuery]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchEntries();
        }, 300); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [fetchEntries]);

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
            {/* Header */}
            <div className="flex flex-col justify-between gap-6 px-4 md:flex-row md:items-end lg:px-0">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight text-[#163332]">Clinical Library</h1>
                    <p className="mt-1 text-lg font-medium text-[#698782]">Verified medical protocols and diagnostic guidelines.</p>
                </div>

                <div className="hidden items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-3 lg:flex">
                    <ShieldCheck className="h-5 w-5 text-emerald-700" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Certified Intelligence Source</span>
                </div>
            </div>

            {/* Toolbar */}
            <div className="space-y-6 px-4 lg:px-0">
                <div className="flex flex-col justify-between gap-6 border-b border-[#e7f1ef] pb-4 md:flex-row md:items-center">
                    <div className="flex items-center gap-8 overflow-x-auto no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setCurrentPage(1);
                                }}
                                className={cn(
                                    "pb-4 px-2 text-sm font-black uppercase tracking-[0.2em] relative transition-all whitespace-nowrap flex items-center gap-2",
                                    activeCategory === cat.id ? "text-[#163332]" : "text-[#8aa39e] hover:text-[#4f6d68]"
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

                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9bb3ae] transition-colors group-focus-within:text-[#2c756e]" />
                        <input
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search clinical protocols..."
                            className="w-full rounded-2xl border border-[#d7ebe6] bg-white py-3 pl-12 pr-6 text-sm font-bold text-[#163332] placeholder:text-[#9bb3ae] shadow-[0_10px_24px_rgba(19,51,50,0.04)] transition-all focus:border-[#9dcfc6] focus:outline-none focus:ring-4 focus:ring-[#dff2ed]"
                        />
                    </div>
                </div>
            </div>

            {/* View Switching Logic */}
            {selectedEntry ? (
                <div className="px-4 lg:px-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button
                        onClick={() => setSelectedEntry(null)}
                        className="group mb-8 flex items-center gap-2 text-[#698782] transition-colors hover:text-[#163332]"
                    >
                        <ChevronRight className="h-4 w-4 rotate-180" />
                        <span className="text-xs font-black uppercase tracking-widest">Back to Library</span>
                    </button>

                    <div className="relative overflow-hidden rounded-[3rem] border border-[#dcece8] bg-white p-8 lg:p-16 space-y-10 shadow-[0_18px_40px_rgba(19,51,50,0.06)]">
                        <div className="pointer-events-none absolute right-0 top-0 p-16 opacity-[0.04]">
                            <BookOpen className="h-64 w-64 text-[#163332]" />
                        </div>

                        <div className="relative z-10 space-y-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <span className={cn(
                                    "flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest",
                                    selectedEntry.is_epidemic_alert ? "border-red-200 bg-red-50 text-red-600" : "border-[#d7ebe6] bg-[#f4fbf9] text-[#698782]"
                                )}>
                                    {selectedEntry.is_epidemic_alert ? <AlertTriangle className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                                    Source: {selectedEntry.source}
                                </span>
                                <span className="rounded-full border border-[#d7ebe6] bg-[#f4fbf9] px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#698782]">
                                    Category: {selectedEntry.category.replace("_", " ")}
                                </span>
                            </div>

                            <h2 className="max-w-4xl text-4xl font-black uppercase leading-tight tracking-tight text-[#163332] lg:text-6xl">
                                {selectedEntry.title}
                            </h2>
                        </div>

                        <div className="relative z-10 grid gap-12 lg:grid-cols-4">
                            <div className="lg:col-span-3 space-y-8">
                                <div className="max-w-none">
                                    <div className="whitespace-pre-wrap rounded-[2.5rem] border border-[#e7f1ef] bg-[#f7fbfa] p-8 text-lg font-medium leading-[2] text-[#4f6d68] lg:p-12">
                                        {selectedEntry.description}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-6 rounded-[2rem] border border-[#dcece8] bg-white p-8 shadow-[0_14px_32px_rgba(19,51,50,0.05)]">
                                    <div className="flex items-center gap-3 text-[#698782]">
                                        <Info className="h-5 w-5" />
                                        <h4 className="text-xs font-black uppercase tracking-widest">Metadata</h4>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#8aa39e]">Last Indexed</p>
                                            <p className="text-sm font-bold text-[#163332]">{format(new Date(selectedEntry.created_at), "MMMM d, yyyy")}</p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#8aa39e]">Clinical Tags</p>
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {selectedEntry.tags.split(",").map(tag => (
                                                    <span key={tag} className="rounded-md border border-[#d7ebe6] bg-[#f4fbf9] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#698782]">{tag.trim()}</span>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedEntry.is_epidemic_alert && (
                                            <div>
                                                <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-red-400">Active Monitoring</p>
                                                <p className="text-sm font-bold text-red-600">Region: {selectedEntry.region}</p>
                                                <p className="mt-1 text-[10px] font-medium uppercase tracking-tight text-red-500">Urgency Score: {selectedEntry.urgency_score}/10</p>
                                            </div>
                                        )}
                                    </div>
                                </div>


                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Entry Grid */
                <div className="grid gap-6 px-4 lg:px-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center gap-6 py-32 text-[#8aa39e]">
                            <Loader2 className="h-12 w-12 animate-spin text-[#2c756e]" />
                            <p className="text-xs font-black uppercase tracking-[0.3em]">Accessing Medical Archives...</p>
                        </div>
                    ) : entries.length === 0 ? (
                        <div className="rounded-[3rem] border border-dashed border-[#d7ebe6] bg-white p-32 text-center shadow-[0_18px_40px_rgba(19,51,50,0.04)]">
                            <BookOpen className="mx-auto mb-8 h-20 w-20 text-[#c4d7d3]" />
                            <h3 className="text-2xl font-black uppercase tracking-tight text-[#4f6d68]">No Matches Found</h3>
                            <p className="mt-2 text-md font-medium text-[#8aa39e]">Adjust your filters or broaden your search criteria.</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {entries.map(entry => (
                                    <div
                                        key={entry.id}
                                        onClick={() => setSelectedEntry(entry)}
                                        className="group relative cursor-pointer space-y-6 overflow-hidden rounded-[2.5rem] border border-[#dcece8] bg-white p-8 shadow-[0_14px_32px_rgba(19,51,50,0.05)] transition-all hover:border-[#bfded7] hover:bg-[#fcfffe]"
                                    >
                                        {entry.is_epidemic_alert && (
                                            <div className="absolute -mr-16 -mt-16 h-32 w-32 rounded-full bg-red-100 blur-3xl top-0 right-0" />
                                        )}

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className={cn(
                                                    "flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest",
                                                    entry.is_epidemic_alert ? "border-red-200 bg-red-50 text-red-600" : "border-[#d7ebe6] bg-[#f4fbf9] text-[#698782]"
                                                )}>
                                                    {entry.is_epidemic_alert ? <AlertTriangle className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                                                    {entry.source}
                                                </span>
                                                <ChevronRight className="h-4 w-4 text-[#b7cbc7] transition-all group-hover:translate-x-1 group-hover:text-[#163332]" />
                                            </div>

                                            <div className="space-y-2">
                                                <h3 className="line-clamp-2 text-xl font-bold leading-tight tracking-tight text-[#163332] transition-colors group-hover:text-[#2c756e]">{entry.title}</h3>
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

                            {/* Pagination Controls */}
                            {pagination.total_pages > 1 && (
                                <div className="flex items-center justify-center gap-4 border-t border-[#e7f1ef] py-8">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        className="group flex h-10 items-center gap-2 rounded-xl border border-[#d7ebe6] bg-white px-6 text-[10px] font-black uppercase tracking-widest text-[#698782] transition-all hover:text-[#163332] disabled:opacity-30 disabled:hover:text-[#698782]"
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
                                                        <span className="text-xs font-black text-[#8aa39e]">...</span>
                                                    )}
                                                    <button
                                                        onClick={() => setCurrentPage(p)}
                                                        className={cn(
                                                            "h-10 w-10 rounded-xl border text-[10px] font-black uppercase transition-all",
                                                            currentPage === p
                                                                ? "border-[#2c756e] bg-[#2c756e] text-white"
                                                                : "border-[#d7ebe6] bg-white text-[#8aa39e] hover:text-[#163332]"
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
                                        className="group flex h-10 items-center gap-2 rounded-xl border border-[#d7ebe6] bg-white px-6 text-[10px] font-black uppercase tracking-widest text-[#698782] transition-all hover:text-[#163332] disabled:opacity-30 disabled:hover:text-[#698782]"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
