import { useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download, RotateCcw, ChevronRight, ChevronLeft,
  ChevronsUpDown, ChevronDown, ChevronUp,
  PackageX, AlertTriangle, TrendingDown, Layers,
  X, Store, Tag, ArrowRight, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MERCHANDISE_AREAS, BRANDS,
  ALL_ROWS, DRILL_DATA, fmt,
} from "@/lib/exitPlanningData";

type View    = "stock" | "eol" | "markdown";
type SortDir = "asc" | "desc" | null;

const ALL_CATEGORIES    = Array.from(new Set(ALL_ROWS.map((r) => r.category))).sort();
const ALL_SUBCATEGORIES = Array.from(new Set(ALL_ROWS.map((r) => r.subCategory))).sort();

// ─── Component ───────────────────────────────────────────────────────────────
export default function ExitPlanning() {
  const [, navigate] = useLocation();
  const [view, setView]         = useState<View>("stock");
  const [filters, setFilters]   = useState({ ma: "all", category: "all", subCategory: "all", brand: "all" });
  const [applied, setApplied]   = useState(filters);
  const [sortCol, setSortCol]   = useState<string | null>(null);
  const [sortDir, setSortDir]   = useState<SortDir>(null);
  const [page, setPage]         = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Drill-down state
  const [drillRowIdx, setDrillRowIdx] = useState<number | null>(null);
  const [drillStyleId, setDrillStyleId] = useState<string | null>(null);

  const drillData = drillRowIdx !== null ? DRILL_DATA[drillRowIdx] : null;
  const drillRow  = drillRowIdx !== null ? ALL_ROWS[drillRowIdx] : null;

  const filteredStores = useMemo(() => {
    if (!drillData) return [];
    if (!drillStyleId) return drillData.stores;
    return drillData.stores.filter((s) => s.styleRef === drillStyleId);
  }, [drillData, drillStyleId]);

  const openDrill = useCallback((idx: number) => {
    setDrillRowIdx(idx);
    setDrillStyleId(null);
  }, []);
  const closeDrill = useCallback(() => {
    setDrillRowIdx(null);
    setDrillStyleId(null);
  }, []);

  // ── Filter + sort ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let d = ALL_ROWS;
    if (applied.ma !== "all")          d = d.filter((r) => r.ma === applied.ma);
    if (applied.category !== "all")    d = d.filter((r) => r.category === applied.category);
    if (applied.subCategory !== "all") d = d.filter((r) => r.subCategory === applied.subCategory);
    if (applied.brand !== "all")       d = d.filter((r) => r.brand === applied.brand);
    return d;
  }, [applied]);

  const sorted = useMemo(() => {
    if (!sortCol || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const av = (a as any)[sortCol] ?? 0;
      const bv = (b as any)[sortCol] ?? 0;
      if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortCol, sortDir]);

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    stockTotal:   sorted.reduce((s, r) => s + r.stockTotal,   0),
    stock6m:      sorted.reduce((s, r) => s + r.stock6m,      0),
    stock12m:     sorted.reduce((s, r) => s + r.stock12m,     0),
    stock24m:     sorted.reduce((s, r) => s + r.stock24m,     0),
    stockUnk:     sorted.reduce((s, r) => s + r.stockUnk,     0),
    eolTotal:     sorted.reduce((s, r) => s + r.eolTotal,     0),
    eolWithin3m:  sorted.reduce((s, r) => s + r.eolWithin3m,  0),
    eolOlder3m:   sorted.reduce((s, r) => s + r.eolOlder3m,   0),
    eolUnk:       sorted.reduce((s, r) => s + r.eolUnk,       0),
    clearTotal:   sorted.reduce((s, r) => s + r.clearTotal,   0),
    mr1Total:     sorted.reduce((s, r) => s + r.mr1.total,    0),
    mr1w:         sorted.reduce((s, r) => s + r.mr1.within1m, 0),
    mr1o:         sorted.reduce((s, r) => s + r.mr1.older1m,  0),
    mr1u:         sorted.reduce((s, r) => s + r.mr1.unknown,  0),
    mr2Total:     sorted.reduce((s, r) => s + r.mr2.total,    0),
    mr2w:         sorted.reduce((s, r) => s + r.mr2.within1m, 0),
    mr2o:         sorted.reduce((s, r) => s + r.mr2.older1m,  0),
    mr2u:         sorted.reduce((s, r) => s + r.mr2.unknown,  0),
    mr3Total:     sorted.reduce((s, r) => s + r.mr3.total,    0),
    mr3w:         sorted.reduce((s, r) => s + r.mr3.within1m, 0),
    mr3o:         sorted.reduce((s, r) => s + r.mr3.older1m,  0),
    mr3u:         sorted.reduce((s, r) => s + r.mr3.unknown,  0),
    mr4Total:     sorted.reduce((s, r) => s + r.mr4.total,    0),
    mr4w:         sorted.reduce((s, r) => s + r.mr4.within1m, 0),
    mr4o:         sorted.reduce((s, r) => s + r.mr4.older1m,  0),
    mr4u:         sorted.reduce((s, r) => s + r.mr4.unknown,  0),
  }), [sorted]);

  // ── Summary cards ──────────────────────────────────────────────────────────
  const summary = useMemo(() => ({
    totalStock:     totals.stockTotal,
    aged12mPlus:    totals.stock12m + totals.stock24m,
    totalEol:       totals.eolTotal,
    totalClearance: totals.clearTotal,
    maCount:        new Set(filtered.map((r) => r.ma)).size,
  }), [totals, filtered]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const pageData   = sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  // ── Sort ───────────────────────────────────────────────────────────────────
  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortDir === "asc")        setSortDir("desc");
      else if (sortDir === "desc")  { setSortDir(null); setSortCol(null); }
      else                          setSortDir("asc");
    } else { setSortCol(col); setSortDir("asc"); }
    setPage(1);
  };

  const applyFilters = () => { setApplied(filters); setPage(1); };
  const clearFilters = () => {
    const z = { ma: "all", category: "all", subCategory: "all", brand: "all" };
    setFilters(z); setApplied(z); setPage(1);
  };

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const exportCsv = () => {
    let header: string[], rows: string[][];
    if (view === "stock") {
      header = ["MA", "Stock ($)", "6M", "12M", "24M", "Unknown"];
      rows   = sorted.map((r) => [r.ma, fmt(r.stockTotal), fmt(r.stock6m), fmt(r.stock12m), fmt(r.stock24m), fmt(r.stockUnk)]);
    } else if (view === "eol") {
      header = ["MA", "EOL ($)", "Within 3M", "Older 3M", "Unknown EOL"];
      rows   = sorted.map((r) => [r.ma, fmt(r.eolTotal), fmt(r.eolWithin3m), fmt(r.eolOlder3m), fmt(r.eolUnk)]);
    } else {
      header = ["MA","Total Clearance ($)","MR1 ($)","MR1 Within 1M","MR1 Older 1M","MR1 Unknown","MR2 ($)","MR2 Within 1M","MR2 Older 1M","MR2 Unknown","MR3 ($)","MR3 Within 1M","MR3 Older 1M","MR3 Unknown","MR4 ($)","MR4 Within 1M","MR4 Older 1M","MR4 Unknown"];
      rows   = sorted.map((r) => [r.ma, fmt(r.clearTotal), fmt(r.mr1.total), fmt(r.mr1.within1m), fmt(r.mr1.older1m), fmt(r.mr1.unknown), fmt(r.mr2.total), fmt(r.mr2.within1m), fmt(r.mr2.older1m), fmt(r.mr2.unknown), fmt(r.mr3.total), fmt(r.mr3.within1m), fmt(r.mr3.older1m), fmt(r.mr3.unknown), fmt(r.mr4.total), fmt(r.mr4.within1m), fmt(r.mr4.older1m), fmt(r.mr4.unknown)]);
    }
    const csv = [header.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `exit_planning_${view}.csv`;
    a.click();
  };

  // ── Sub-components ─────────────────────────────────────────────────────────
  const SortIcon = ({ col }: { col: string }) =>
    sortCol !== col
      ? <ChevronsUpDown size={10} className="ml-1 text-slate-300 flex-shrink-0" />
      : sortDir === "asc"
        ? <ChevronUp   size={10} className="ml-1 text-primary flex-shrink-0" />
        : <ChevronDown size={10} className="ml-1 text-primary flex-shrink-0" />;

  const Th = ({ col, label, sub }: { col: string; label: string; sub?: string }) => (
    <th
      onClick={() => handleSort(col)}
      className="px-3 py-2 text-right font-semibold text-[10px] uppercase tracking-wide text-slate-500 whitespace-nowrap cursor-pointer select-none border-r border-border/30 hover:bg-slate-100 hover:text-slate-800 transition-colors"
    >
      <div className="flex items-center justify-end">
        {label}<SortIcon col={col} />
      </div>
      {sub && <div className="text-[9px] font-normal text-slate-400 mt-0.5 normal-case tracking-normal text-right">{sub}</div>}
    </th>
  );

  const MaColTh = () => (
    <th
      onClick={() => handleSort("ma")}
      className="sticky left-0 z-20 bg-white px-3 py-2 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 whitespace-nowrap cursor-pointer select-none border-r-2 border-border/50 hover:bg-slate-100 hover:text-slate-800 transition-colors"
    >
      <div className="flex items-center">MA<SortIcon col="ma" /></div>
    </th>
  );

  const CurrTd = ({ v, flagRed, flagAmber }: { v: number; flagRed?: boolean; flagAmber?: boolean }) => (
    <td className={cn(
      "px-3 py-2.5 text-right text-xs tabular-nums border-r border-border/20 whitespace-nowrap",
      flagRed   && v > 0   && "text-red-700 bg-red-50/60 font-semibold",
      flagAmber && v > 50000 && "text-amber-700 bg-amber-50/60 font-medium",
      v < 0 && "text-red-600",
    )}>
      {fmt(v)}
    </td>
  );

  const MaTd = ({ v, onClick, active }: { v: string; onClick?: () => void; active?: boolean }) => (
    <td
      onClick={onClick}
      className={cn(
        "sticky left-0 z-10 px-3 py-2.5 text-xs font-bold border-r-2 border-border/50 whitespace-nowrap transition-colors",
        onClick && "cursor-pointer",
        active  ? "bg-primary/10 text-primary border-primary/40" : "bg-white hover:bg-slate-50",
      )}
    >
      <div className="flex items-center gap-1.5">
        {v}
        {onClick && (
          <ArrowRight size={11} className={cn("flex-shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity", active && "opacity-100 text-primary")} />
        )}
      </div>
    </td>
  );

  const TotRow = ({ cells }: { cells: number[] }) => (
    <tr className="border-t-2 border-border/60 bg-slate-50">
      <td className="sticky left-0 z-10 bg-slate-100 px-3 py-2 text-[10px] font-bold uppercase tracking-wide border-r-2 border-border/50 whitespace-nowrap text-slate-600">
        TOTAL
      </td>
      {cells.map((v, i) => (
        <td key={i} className="px-3 py-2 text-right text-xs tabular-nums font-bold border-r border-border/20 whitespace-nowrap">
          {fmt(v)}
        </td>
      ))}
    </tr>
  );

  return (
    <MainLayout>
      <div className="flex flex-col h-full">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-border/50 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Exit Planning</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {sorted.length} rows · {summary.maCount} merchandise areas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="h-9 text-xs gap-1.5" onClick={clearFilters}>
                <RotateCcw size={13} /> Reset Filters
              </Button>
              <Button size="sm" className="h-9 text-xs gap-1.5" onClick={exportCsv}>
                <Download size={13} /> Export to Excel
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-6 py-4 space-y-4">

            {/* ── Filters ──────────────────────────────────────────────────── */}
            <Card className="border-border/60 shadow-none">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Merchandise Area</label>
                    <Select value={filters.ma} onValueChange={(v) => setFilters((f) => ({ ...f, ma: v }))}>
                      <SelectTrigger className="h-8 text-xs border-border/60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">All</SelectItem>
                        {MERCHANDISE_AREAS.map((m) => <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Category</label>
                    <Select value={filters.category} onValueChange={(v) => setFilters((f) => ({ ...f, category: v }))}>
                      <SelectTrigger className="h-8 text-xs border-border/60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">All</SelectItem>
                        {ALL_CATEGORIES.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Sub Category</label>
                    <Select value={filters.subCategory} onValueChange={(v) => setFilters((f) => ({ ...f, subCategory: v }))}>
                      <SelectTrigger className="h-8 text-xs border-border/60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">All</SelectItem>
                        {ALL_SUBCATEGORIES.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Brand</label>
                    <Select value={filters.brand} onValueChange={(v) => setFilters((f) => ({ ...f, brand: v }))}>
                      <SelectTrigger className="h-8 text-xs border-border/60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">All</SelectItem>
                        {BRANDS.map((b) => <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="h-8 text-xs" onClick={applyFilters}>Apply Filters</Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs" onClick={clearFilters}>Clear Filters</Button>
                </div>
              </CardContent>
            </Card>

            {/* ── Summary Cards ────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Stock Value",      value: `$${Math.round(summary.totalStock).toLocaleString()}`,      icon: Layers,        color: "text-primary",    bg: "bg-primary/10" },
                { label: "Aged 12M+ Exposure",     value: `$${Math.round(summary.aged12mPlus).toLocaleString()}`,     icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-50" },
                { label: "Total EOL Value",        value: `$${Math.round(summary.totalEol).toLocaleString()}`,        icon: TrendingDown,  color: "text-amber-600",  bg: "bg-amber-50" },
                { label: "Total Clearance Value",  value: `$${Math.round(summary.totalClearance).toLocaleString()}`,  icon: PackageX,      color: "text-orange-600", bg: "bg-orange-50" },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <Card key={label} className="border-border/60 shadow-none">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
                      <Icon size={16} className={color} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground leading-tight truncate">{label}</p>
                      <p className={cn("text-base font-bold leading-tight mt-0.5 tabular-nums", color)}>{value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ── View Tabs ────────────────────────────────────────────────── */}
            <div className="flex gap-0 border-b border-border/50">
              {([
                ["stock",    "Total Stock Aging"],
                ["eol",      "EOL Aging"],
                ["markdown", "Markdown Aging"],
              ] as [View, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => { setView(id); setPage(1); setSortCol(null); setSortDir(null); }}
                  className={cn(
                    "px-5 py-2.5 text-xs font-semibold border-b-2 transition-all",
                    view === id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/60"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Table / Empty State ───────────────────────────────────────── */}
            {sorted.length === 0 ? (
              <Card className="border-border/60 shadow-none">
                <CardContent className="py-20 text-center">
                  <PackageX size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-semibold text-muted-foreground">
                    No exit planning data available for the selected filters.
                  </p>
                  <Button size="sm" variant="outline" className="mt-4 text-xs" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/60 shadow-none overflow-hidden">
                <div className="overflow-x-auto">

                  {/* ─── VIEW 1: Total Stock Aging ─────────────────────────── */}
                  {view === "stock" && (
                    <table className="text-xs w-full border-collapse">
                      <thead>
                        <tr className="bg-white border-b-2 border-border/50">
                          <MaColTh />
                          <Th col="stockTotal" label="Stock ($)" />
                          <Th col="stock6m"    label="6M"        sub="≤ 6 months" />
                          <Th col="stock12m"   label="12M"       sub="6–12 months" />
                          <Th col="stock24m"   label="24M"       sub="12–24 months" />
                          <Th col="stockUnk"   label="Unknown" />
                        </tr>
                      </thead>
                      <tbody>
                        {pageData.map((r, i) => {
                          const globalIdx = ALL_ROWS.indexOf(r);
                          const isActive  = drillRowIdx === globalIdx;
                          return (
                            <tr key={i} className={cn("group/row border-b border-border/30 transition-colors", isActive ? "bg-primary/5" : "hover:bg-slate-50/70")}>
                              <MaTd v={r.ma} onClick={() => openDrill(globalIdx)} active={isActive} />
                              <CurrTd v={r.stockTotal} />
                              <CurrTd v={r.stock6m} />
                              <CurrTd v={r.stock12m} flagAmber />
                              <CurrTd v={r.stock24m} flagRed />
                              <CurrTd v={r.stockUnk} />
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <TotRow cells={[totals.stockTotal, totals.stock6m, totals.stock12m, totals.stock24m, totals.stockUnk]} />
                      </tfoot>
                    </table>
                  )}

                  {/* ─── VIEW 2: EOL Aging ─────────────────────────────────── */}
                  {view === "eol" && (
                    <table className="text-xs w-full border-collapse">
                      <thead>
                        <tr className="bg-white border-b-2 border-border/50">
                          <MaColTh />
                          <Th col="eolTotal"    label="EOL ($)" />
                          <Th col="eolWithin3m" label="Within 3M"   sub="≤ 3 months" />
                          <Th col="eolOlder3m"  label="Older 3M"    sub="> 3 months" />
                          <Th col="eolUnk"      label="Unknown EOL" />
                        </tr>
                      </thead>
                      <tbody>
                        {pageData.map((r, i) => {
                          const globalIdx = ALL_ROWS.indexOf(r);
                          const isActive  = drillRowIdx === globalIdx;
                          return (
                            <tr key={i} className={cn("group/row border-b border-border/30 transition-colors", isActive ? "bg-primary/5" : "hover:bg-slate-50/70")}>
                              <MaTd v={r.ma} onClick={() => openDrill(globalIdx)} active={isActive} />
                              <CurrTd v={r.eolTotal} />
                              <CurrTd v={r.eolWithin3m} />
                              <CurrTd v={r.eolOlder3m} flagRed />
                              <CurrTd v={r.eolUnk} />
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <TotRow cells={[totals.eolTotal, totals.eolWithin3m, totals.eolOlder3m, totals.eolUnk]} />
                      </tfoot>
                    </table>
                  )}

                  {/* ─── VIEW 3: Markdown Aging ───────────────────────────── */}
                  {view === "markdown" && (
                    <table className="text-xs w-full border-collapse">
                      <thead>
                        {/* Group label row */}
                        <tr className="bg-slate-50 border-b border-border/30">
                          <th className="sticky left-0 z-20 bg-slate-50 px-3 py-1.5 border-r-2 border-border/50" />
                          <th className="px-3 py-1.5 border-r border-border/20 text-[9px] font-bold uppercase tracking-widest text-slate-400 text-right" />
                          {(["MR1","MR2","MR3","MR4"] as const).map((mr) => (
                            <th
                              key={mr}
                              colSpan={4}
                              className="px-3 py-1.5 text-center text-[9px] font-bold uppercase tracking-widest text-slate-500 border-r-2 border-border/40"
                            >
                              {mr}
                            </th>
                          ))}
                        </tr>
                        {/* Column headers */}
                        <tr className="bg-white border-b-2 border-border/50">
                          <MaColTh />
                          <Th col="clearTotal" label="Total Clearance ($)" />
                          {(["mr1","mr2","mr3","mr4"] as const).map((mr) => (
                            <>
                              <Th key={`${mr}t`} col={`${mr}.total`}   label={`${mr.toUpperCase()} ($)`} />
                              <Th key={`${mr}w`} col={`${mr}.within1m`} label="Within 1M" sub="≤ 1 month" />
                              <Th key={`${mr}o`} col={`${mr}.older1m`}  label="Older 1M"  sub="> 1 month" />
                              <Th key={`${mr}u`} col={`${mr}.unknown`}  label={`Unknown ${mr.toUpperCase()}`} />
                            </>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pageData.map((r, i) => {
                          const globalIdx = ALL_ROWS.indexOf(r);
                          const isActive  = drillRowIdx === globalIdx;
                          return (
                            <tr key={i} className={cn("group/row border-b border-border/30 transition-colors", isActive ? "bg-primary/5" : "hover:bg-slate-50/70")}>
                              <MaTd v={r.ma} onClick={() => openDrill(globalIdx)} active={isActive} />
                              <CurrTd v={r.clearTotal} />
                              <CurrTd v={r.mr1.total} /><CurrTd v={r.mr1.within1m} /><CurrTd v={r.mr1.older1m} flagAmber /><CurrTd v={r.mr1.unknown} />
                              <CurrTd v={r.mr2.total} /><CurrTd v={r.mr2.within1m} /><CurrTd v={r.mr2.older1m} flagAmber /><CurrTd v={r.mr2.unknown} />
                              <CurrTd v={r.mr3.total} /><CurrTd v={r.mr3.within1m} /><CurrTd v={r.mr3.older1m} flagAmber /><CurrTd v={r.mr3.unknown} />
                              <CurrTd v={r.mr4.total} /><CurrTd v={r.mr4.within1m} /><CurrTd v={r.mr4.older1m} flagRed  /><CurrTd v={r.mr4.unknown} />
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <TotRow cells={[
                          totals.clearTotal,
                          totals.mr1Total, totals.mr1w, totals.mr1o, totals.mr1u,
                          totals.mr2Total, totals.mr2w, totals.mr2o, totals.mr2u,
                          totals.mr3Total, totals.mr3w, totals.mr3o, totals.mr3u,
                          totals.mr4Total, totals.mr4w, totals.mr4o, totals.mr4u,
                        ]} />
                      </tfoot>
                    </table>
                  )}
                </div>

                {/* ── Pagination ───────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">Rows per page</span>
                    <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(1); }}>
                      <SelectTrigger className="h-7 w-16 text-xs border-border/60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[25, 50, 100].map((n) => (
                          <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-[11px] text-muted-foreground ml-2">
                      {(safePage - 1) * rowsPerPage + 1}–{Math.min(safePage * rowsPerPage, sorted.length)} of {sorted.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline" size="sm" className="h-7 w-7 p-0"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={13} />
                    </Button>
                    <span className="text-[11px] font-medium mx-2">
                      Page {safePage} / {totalPages}
                    </span>
                    <Button
                      variant="outline" size="sm" className="h-7 w-7 p-0"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      <ChevronRight size={13} />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

          </div>
        </div>
      </div>

      {/* ── Drill-Down Panel ─────────────────────────────────────────────────── */}
      {/* Backdrop */}
      {drillRowIdx !== null && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={closeDrill}
        />
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full z-50 bg-white border-l border-border/60 shadow-2xl flex flex-col transition-all duration-300 ease-in-out",
          drillRowIdx !== null ? "w-[640px] translate-x-0" : "w-[640px] translate-x-full",
        )}
      >
        {drillRow && drillData && (
          <>
            {/* Panel Header */}
            <div className="flex-shrink-0 px-5 py-4 border-b border-border/50 bg-slate-50 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-primary flex-shrink-0" />
                  <h2 className="text-sm font-bold text-foreground">{drillRow.ma}</h2>
                  <Badge variant="secondary" className="text-[10px] h-5">{drillRow.category}</Badge>
                  <Badge variant="outline" className="text-[10px] h-5">{drillRow.brand}</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 ml-5">
                  {drillData.styles.length} styles · {drillData.stores.length} stores
                  {drillStyleId && (
                    <span className="ml-2 text-primary font-medium">
                      · filtered to style {drillStyleId}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={closeDrill}
                className="flex-shrink-0 p-1.5 rounded-md hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-800"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto">

              {/* ── Section 1: Markdown Details (Style-level) ──────────────── */}
              <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Tag size={12} className="text-primary" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">Markdown Details</h3>
                  <span className="text-[10px] text-muted-foreground">(Style-level)</span>
                  {drillStyleId && (
                    <button
                      onClick={() => setDrillStyleId(null)}
                      className="ml-auto flex items-center gap-1 text-[10px] text-primary hover:underline"
                    >
                      <X size={10} /> Clear style filter
                    </button>
                  )}
                </div>

                <div className="overflow-x-auto rounded-md border border-border/50">
                  <table className="text-xs w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-border/50">
                        {["Style", "Description", "Vendor", "Stock ($)", "Units", "Distrib.", "Cost", "Mkdn Price", "Margin"].map((h) => (
                          <th key={h} className="px-2.5 py-2 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 whitespace-nowrap border-r border-border/20 last:border-r-0">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {drillData.styles.map((s) => {
                        const isSelected = drillStyleId === s.style;
                        return (
                          <tr
                            key={s.style}
                            onClick={() => setDrillStyleId(isSelected ? null : s.style)}
                            className={cn(
                              "border-b border-border/20 cursor-pointer transition-colors",
                              isSelected ? "bg-primary/10" : "hover:bg-slate-50/80",
                            )}
                          >
                            <td className={cn("px-2.5 py-2 font-mono text-[10px] whitespace-nowrap border-r border-border/20", isSelected && "text-primary font-bold")}>
                              {s.style}
                            </td>
                            <td className="px-2.5 py-2 max-w-[160px] truncate border-r border-border/20" title={s.description}>
                              {s.description}
                            </td>
                            <td className="px-2.5 py-2 max-w-[110px] truncate border-r border-border/20 text-slate-500" title={s.vendor}>
                              {s.vendor}
                            </td>
                            <td className="px-2.5 py-2 text-right tabular-nums border-r border-border/20 whitespace-nowrap">{fmt(s.stockVal)}</td>
                            <td className="px-2.5 py-2 text-right tabular-nums border-r border-border/20">{s.stockUnits}</td>
                            <td className="px-2.5 py-2 text-right tabular-nums border-r border-border/20">{s.distribution}</td>
                            <td className="px-2.5 py-2 text-right tabular-nums border-r border-border/20 whitespace-nowrap">{fmt(s.costPrice)}</td>
                            <td className="px-2.5 py-2 text-right tabular-nums border-r border-border/20 whitespace-nowrap">{fmt(s.markdownPrice)}</td>
                            <td className={cn("px-2.5 py-2 text-right tabular-nums font-medium whitespace-nowrap", s.margin >= 20 ? "text-green-700" : "text-amber-700")}>
                              {s.margin}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ── Section 2: Store Details (Store-level) ─────────────────── */}
              <div className="px-5 pb-5 pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <Store size={12} className="text-slate-600" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">Store Details</h3>
                  <span className="text-[10px] text-muted-foreground">(Store-level)</span>
                  <Badge variant="secondary" className="text-[10px] h-5 ml-auto">
                    {filteredStores.length} stores
                  </Badge>
                </div>

                <div className="overflow-x-auto rounded-md border border-border/50">
                  <table className="text-xs w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-border/50">
                        {["Store #", "Description", "Format", "Stock ($)", "Units"].map((h) => (
                          <th key={h} className="px-2.5 py-2 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 whitespace-nowrap border-r border-border/20 last:border-r-0">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStores.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-xs text-muted-foreground">
                            No stores match the selected style.
                          </td>
                        </tr>
                      ) : (
                        filteredStores.map((s, idx) => (
                          <tr key={idx} className="border-b border-border/20 hover:bg-slate-50/70 transition-colors">
                            <td className="px-2.5 py-2 font-mono text-[10px] whitespace-nowrap border-r border-border/20">{s.storeId}</td>
                            <td className="px-2.5 py-2 max-w-[180px] truncate border-r border-border/20" title={s.description}>{s.description}</td>
                            <td className="px-2.5 py-2 border-r border-border/20">
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5">{s.format}</Badge>
                            </td>
                            <td className="px-2.5 py-2 text-right tabular-nums border-r border-border/20 whitespace-nowrap">{fmt(s.stockVal)}</td>
                            <td className="px-2.5 py-2 text-right tabular-nums">{s.stockUnits}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {filteredStores.length > 0 && (
                      <tfoot>
                        <tr className="border-t-2 border-border/60 bg-slate-50">
                          <td colSpan={3} className="px-2.5 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-600">TOTAL</td>
                          <td className="px-2.5 py-2 text-right text-xs tabular-nums font-bold whitespace-nowrap border-r border-border/20">
                            {fmt(filteredStores.reduce((s, r) => s + r.stockVal, 0))}
                          </td>
                          <td className="px-2.5 py-2 text-right text-xs tabular-nums font-bold">
                            {filteredStores.reduce((s, r) => s + r.stockUnits, 0)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                {drillStyleId && (
                  <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                    <ArrowRight size={10} />
                    Showing stores for style <span className="font-semibold text-primary">{drillStyleId}</span>.
                    <button onClick={() => setDrillStyleId(null)} className="underline hover:no-underline ml-1">Show all stores</button>
                  </p>
                )}
              </div>

            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
