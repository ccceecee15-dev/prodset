import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  FileText, Plus, Trash2, Search, Clock, ArrowLeft,
  ChevronRight, AlertTriangle, Check, Inbox, User, Truck,
} from "lucide-react";
import {
  loadDrafts, deleteDraft, deleteAllDrafts, setResumedDraftId,
  type StoredDraft,
} from "./draftStorage";

const CATEGORY_COLORS: Record<string, string> = {
  TECH:         "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  ALCOHOL:      "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "FRESH FOOD": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  FASHION:      "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
};

function StepPips({ completed, total }: { completed: number[]; total: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full",
            completed.includes(i + 1)
              ? completed.length >= total ? "bg-emerald-400" : "bg-amber-400"
              : "bg-slate-100 dark:bg-slate-700"
          )}
        />
      ))}
    </div>
  );
}

export default function ProductSetupDrafts() {
  const [, navigate] = useLocation();
  const [drafts, setDrafts] = useState<StoredDraft[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    setDrafts(loadDrafts());
  }, []);

  const filtered = useMemo(() => {
    if (!search) return drafts;
    const q = search.toLowerCase();
    return drafts.filter(d =>
      d.label.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.buyer.toLowerCase().includes(q) ||
      d.vendor.toLowerCase().includes(q)
    );
  }, [drafts, search]);

  const handleResume = (draft: StoredDraft) => {
    setResumedDraftId(draft.id);
    navigate("/product-setup");
  };

  const handleDelete = (id: string) => {
    deleteDraft(id);
    setDrafts(loadDrafts());
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach(id => deleteDraft(id));
    setDrafts(loadDrafts());
    setSelectedIds(new Set());
  };

  const handleClearAll = () => {
    deleteAllDrafts();
    setDrafts([]);
    setSelectedIds(new Set());
    setConfirmClearAll(false);
  };

  const toggleRow = (id: string) => {
    setSelectedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const allSelected = filtered.length > 0 && selectedIds.size === filtered.length;
  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map(d => d.id)));
  };

  return (
    <MainLayout>
      <div className="space-y-4 animate-in fade-in duration-500">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2"
                onClick={() => navigate("/product-setup")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Draft Management
              </h1>
            </div>
            <p className="text-sm text-slate-500">
              Resume saved product drafts or clean up incomplete setups
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                onClick={handleDeleteSelected}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete {selectedIds.size} selected
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/product-setup")}
            >
              <Plus className="h-4 w-4" /> New Product
            </Button>
          </div>
        </div>

        {/* ── Table card ── */}
        <Card className="rounded-xl shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <CardTitle className="text-sm font-bold">Saved Drafts</CardTitle>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {drafts.filter(d => d.completedSteps >= d.totalSteps).length} ready to submit
                  &nbsp;·&nbsp;
                  {drafts.filter(d => d.completedSteps < d.totalSteps).length} in progress
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search drafts…"
                  className="pl-8 h-8 text-xs w-[220px]"
                />
              </div>
              {/* Total badge */}
              <Badge variant="secondary" className="text-[10px] font-bold">
                {filtered.length} {search ? "found" : "total"}
              </Badge>
              {/* Clear all */}
              {drafts.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-slate-400 hover:text-red-500 gap-1.5 h-8"
                  onClick={() => setConfirmClearAll(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear all
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    {/* Checkbox */}
                    <TableHead className="w-10 pl-4 pr-2">
                      <button
                        onClick={toggleAll}
                        className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                          allSelected
                            ? "bg-primary border-primary"
                            : "border-slate-300 dark:border-slate-600"
                        )}
                      >
                        {allSelected && <Check size={9} className="text-white" />}
                      </button>
                    </TableHead>
                    <TableHead className="text-[10px] uppercase font-bold px-4">Product</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold px-4">Category</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold px-4">Buyer</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold px-4">Vendor</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold px-4">Progress</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold px-4">Status</TableHead>
                    <TableHead className="text-[10px] uppercase font-bold px-4">Saved</TableHead>
                    <TableHead className="w-24 text-[10px] uppercase font-bold px-4">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-20">
                        <div className="flex flex-col items-center justify-center text-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <Inbox size={22} className="text-slate-300 dark:text-slate-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {search ? "No drafts match your search" : "No drafts saved yet"}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {search
                                ? "Try different keywords"
                                : "Start a new product and hit Save Draft to store your progress"}
                            </p>
                          </div>
                          {!search && (
                            <Button size="sm" className="gap-1.5 mt-1" onClick={() => navigate("/product-setup")}>
                              <Plus size={13} /> Start New Product
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map(draft => {
                      const isComplete = draft.completedSteps >= draft.totalSteps;
                      const isSelected = selectedIds.has(draft.id);
                      const catCls = CATEGORY_COLORS[draft.category] ?? "bg-slate-100 text-slate-500";

                      return (
                        <TableRow
                          key={draft.id}
                          className={cn(
                            "group transition-colors",
                            isSelected && "bg-primary/5 dark:bg-primary/10"
                          )}
                        >
                          {/* Checkbox */}
                          <TableCell className="pl-4 pr-2 w-10">
                            <button
                              onClick={() => toggleRow(draft.id)}
                              className={cn(
                                "w-4 h-4 rounded border-2 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100",
                                isSelected && "opacity-100",
                                isSelected
                                  ? "bg-primary border-primary"
                                  : "border-slate-300 dark:border-slate-600"
                              )}
                            >
                              {isSelected && <Check size={9} className="text-white" />}
                            </button>
                          </TableCell>

                          {/* Product */}
                          <TableCell className="px-4 py-3.5 max-w-[240px]">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                              {draft.label || <span className="italic text-slate-400">Untitled Draft</span>}
                            </p>
                          </TableCell>

                          {/* Category */}
                          <TableCell className="px-4 py-3.5">
                            {draft.category ? (
                              <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full", catCls)}>
                                {draft.category}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </TableCell>

                          {/* Buyer */}
                          <TableCell className="px-4 py-3.5">
                            {draft.buyer ? (
                              <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                                <User size={10} className="text-slate-400 flex-shrink-0" />
                                {draft.buyer}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </TableCell>

                          {/* Vendor */}
                          <TableCell className="px-4 py-3.5">
                            {draft.vendor ? (
                              <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                                <Truck size={10} className="text-slate-400 flex-shrink-0" />
                                {draft.vendor}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </TableCell>

                          {/* Progress */}
                          <TableCell className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <StepPips completed={draft.completedStepNumbers} total={draft.totalSteps} />
                              <span className="text-[10px] text-slate-400 font-mono">
                                {draft.completedSteps}/{draft.totalSteps}
                              </span>
                            </div>
                          </TableCell>

                          {/* Status */}
                          <TableCell className="px-4 py-3.5">
                            <Badge className={cn(
                              "text-[9px] font-semibold border gap-1",
                              isComplete
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"
                            )}>
                              {isComplete
                                ? <><Check size={9} /> Ready</>
                                : <><AlertTriangle size={9} /> In Progress</>
                              }
                            </Badge>
                          </TableCell>

                          {/* Saved */}
                          <TableCell className="px-4 py-3.5">
                            <span className="flex items-center gap-1 text-[11px] text-slate-400">
                              <Clock size={10} className="flex-shrink-0" />
                              {draft.savedAtDisplay}
                            </span>
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="px-4 py-3.5">
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-[11px] px-2.5 gap-1 text-primary hover:bg-primary/10 hover:text-primary"
                                onClick={() => handleResume(draft)}
                              >
                                Resume <ChevronRight size={11} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDelete(draft.id)}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* ── Confirm clear all dialog ── */}
      {confirmClearAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmClearAll(false)} />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-100">Delete all drafts?</p>
                <p className="text-xs text-slate-500">
                  This will permanently remove all {drafts.length} saved draft{drafts.length !== 1 ? "s" : ""}.
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmClearAll(false)}>
                Cancel
              </Button>
              <Button size="sm" className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none" onClick={handleClearAll}>
                Delete all
              </Button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
