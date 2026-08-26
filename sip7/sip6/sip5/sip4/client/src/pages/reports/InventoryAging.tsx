import { useState, useMemo } from "react";
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
import {
  Download, RotateCcw, ChevronRight, ChevronLeft,
  ChevronsUpDown, ChevronDown, ChevronUp, PackageX,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Reference data ───────────────────────────────────────────────────────────
const MERCHANDISE_AREAS = [
  "AUDIO", "CABLES & CONNECT", "COMPUTING", "GAMING", "HOME TECH",
  "IMAGING", "MOBILE ACCESSORIES", "MOBILE DEVICES", "NETWORKING",
  "SMART HOME", "STORAGE", "TABLETS", "TV & DISPLAY", "WEARABLES",
  "ACCESSORIES",
];
const CATEGORIES: Record<string, string[]> = {
  "AUDIO":              ["Headphones", "Speakers", "Earbuds"],
  "CABLES & CONNECT":   ["USB-C", "Lightning", "HDMI", "Adapters"],
  "COMPUTING":          ["Laptops", "Peripherals", "Cases"],
  "GAMING":             ["Controllers", "Headsets", "Accessories"],
  "HOME TECH":          ["Smart Speakers", "Smart Displays", "Hubs"],
  "IMAGING":            ["Cameras", "Lenses", "Accessories"],
  "MOBILE ACCESSORIES": ["Cases", "Screen Protectors", "Chargers"],
  "MOBILE DEVICES":     ["Smartphones", "Feature Phones"],
  "NETWORKING":         ["Routers", "Switches", "Range Extenders"],
  "SMART HOME":         ["Lighting", "Security", "Thermostats"],
  "STORAGE":            ["SSD", "HDD", "USB Drives", "Memory Cards"],
  "TABLETS":            ["iPads", "Android Tablets", "Accessories"],
  "TV & DISPLAY":       ["LED TVs", "OLED TVs", "Monitors"],
  "WEARABLES":          ["Smartwatches", "Fitness Trackers"],
  "ACCESSORIES":        ["Bags", "Cleaning Kits", "Mounts"],
};
const BRANDS = ["APPLE", "BOSE", "SONY", "JBL", "SAMSUNG", "ANKER"];

// ─── Mock data generator ──────────────────────────────────────────────────────
function rnd(min: number, max: number, dp = 2): number {
  const v = Math.random() * (max - min) + min;
  return dp === 0 ? Math.floor(v) : +v.toFixed(dp);
}

function generateRow(ma: string) {
  // Total Stock Aging
  const stock6m    = rnd(50000, 2500000);
  const stock12m   = rnd(1000, 50000);
  const stock24m   = rnd(500, 20000);
  const stockUnk   = rnd(0, 5000);
  const stockTotal = +(stock6m + stock12m + stock24m + stockUnk).toFixed(2);

  // EOL Aging
  const eolWithin3m = rnd(10000, 400000);
  const eolOlder3m  = rnd(50000, 800000);
  const eolUnk      = rnd(0, 2000);
  const eolTotal    = +(eolWithin3m + eolOlder3m + eolUnk).toFixed(2);

  // Markdown Aging — MR1-MR4
  const mkStage = () => {
    const w1m  = rnd(0, 5000);
    const o1m  = rnd(5000, 180000);
    const unk  = rnd(-200, 500);
    const tot  = +(w1m + o1m + unk).toFixed(2);
    return { within1m: w1m, older1m: o1m, unknown: unk, total: tot };
  };
  const mr1 = mkStage();
  const mr2 = mkStage();
  const mr3 = mkStage();
  const mr4 = mkStage();
  const clearTotal = +(mr1.total + mr2.total + mr3.total + mr4.total).toFixed(2);

  const cats = CATEGORIES[ma] ?? ["General"];

  return {
    ma,
    category:    cats[Math.floor(Math.random() * cats.length)],
    subCategory: `${cats[Math.floor(Math.random() * cats.length)]} Sub`,
    brand:       BRANDS[Math.floor(Math.random() * BRANDS.length)],

    stockTotal, stock6m, stock12m, stock24m, stockUnk,
    eolTotal, eolWithin3m, eolOlder3m, eolUnk,
    clearTotal, mr1, mr2, mr3, mr4,
  };
}

// Generate one row per MA, plus a few extra rows for the same MA with different category/brand combos
const RAW_DATA = (() => {
  const rows: ReturnType<typeof generateRow>[] = [];
  for (const ma of MERCHANDISE_AREAS) {
    const reps = Math.floor(Math.random() * 3) + 2; // 2-4 rows per MA
    for (let i = 0; i < reps; i++) {
      rows.push(generateRow(ma));
    }
  }
  return rows;
})();

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(v: number): string {
  const abs = Math.abs(v);
  const str = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return v < 0 ? `-$${str}` : `$${str}`;
}

type View = "stock" | "eol" | "markdown";
type SortDir = "asc" | "desc" | null;

// ─── Component ───────────────────────────────────────────────────────────────
export default function InventoryAging() {
  const [view, setView] = useState<View>("stock");

  const [filters, setFilters] = useState({ ma: "all", category: "all", subCategory: "all", brand: "all" });
  const [applied, setApplied] = useState(filters);

  const [sortCol, setSortCol]   = useState<string | null>(null);
  const [sortDir, setSortDir]   = useState<SortDir>(null);
  const [page, setPage]         = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const allCategories   = useMemo(() => Array.from(new Set(RAW_DATA.map((r) => r.category))).sort(), []);
  const allSubCategories = useMemo(() => Array.from(new Set(RAW_DATA.map((r) => r.subCategory))).sort(), []);

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let d = RAW_DATA;
    if (applied.ma !== "all")          d = d.filter((r) => r.ma === applied.ma);
    if (applied.category !== "all")    d = d.filter((r) => r.category === applied.category);
    if (applied.subCategory !== "all") d = d.filter((r) => r.subCategory === applied.subCategory);
    if (applied.brand !== "all")       d = d.filter((r) => r.brand === applied.brand);
    return d;
  }, [applied]);

  // ── Sort ───────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    if (!sortCol || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const av = (a as any)[sortCol] ?? 0;
      const bv = (b as any)[sortCol] ?? 0;
      if (typeof av === "number") return sortDir === "asc" ? av - bv : bv - av;
      return sortDir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const safePage   = Math.min(page, totalPages);
  const pageData   = sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      if (sortDir === "asc")  { setSortDir("desc"); }
      else if (sortDir === "desc") { setSortDir(null); setSortCol(null); }
      else { setSortDir("asc"); }
    } else {
      setSortCol(col); setSortDir("asc");
    }
    setPage(1);
  };

  const applyFilters = () => { setApplied(filters); setPage(1); };
  const clearFilters = () => {
    const reset = { ma: "all", category: "all", subCategory: "all", brand: "all" };
    setFilters(reset); setApplied(reset); setPage(1);
  };

  // ── Sort icon ──────────────────────────────────────────────────────────────
  const SortIcon = ({ col }: { col: string }) => {
    if (sortCol !== col) return <ChevronsUpDown size={10} className="ml-1 text-slate-300 flex-shrink-0" />;
    return sortDir === "asc"
      ? <ChevronUp size={10} className="ml-1 text-primary flex-shrink-0" />
      : <ChevronDown size={10} className="ml-1 text-primary flex-shrink-0" />;
  };

  // ── CSV export ─────────────────────────────────────────────────────────────
  const exportCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (view === "stock") {
      headers = ["MA", "Stock ($)", "6M", "12M", "24M", "Unknown"];
      rows = sorted.map((r) => [r.ma, fmt(r.stockTotal), fmt(r.stock6m), fmt(r.stock12m), fmt(r.stock24m), fmt(r.stockUnk)]);
    } else if (view === "eol") {
      headers = ["MA", "EOL ($)", "Within 3M", "Older 3M", "Unknown EOL"];
      rows = sorted.map((r) => [r.ma, fmt(r.eolTotal), fmt(r.eolWithin3m), fmt(r.eolOlder3m), fmt(r.eolUnk)]);
    } else {
      headers = ["MA", "Total Clearance ($)", "MR1 Total", "MR1 Within 1M", "MR1 Older 1M", "MR1 Unknown", "MR2 Total", "MR2 Within 1M", "MR2 Older 1M", "MR2 Unknown", "MR3 Total", "MR3 Within 1M", "MR3 Older 1M", "MR3 Unknown", "MR4 Total", "MR4 Within 1M", "MR4 Older 1M", "MR4 Unknown"];
      rows = sorted.map((r) => [r.ma, fmt(r.clearTotal), fmt(r.mr1.total), fmt(r.mr1.within1m), fmt(r.mr1.older1m), fmt(r.mr1.unknown), fmt(r.mr2.total), fmt(r.mr2.within1m), fmt(r.mr2.older1m), fmt(r.mr2.unknown), fmt(r.mr3.total), fmt(r.mr3.within1m), fmt(r.mr3.older1m), fmt(r.mr3.unknown), fmt(r.mr4.total), fmt(r.mr4.within1m), fmt(r.mr4.older1m), fmt(r.mr4.unknown)]);
    }

    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a   = document.createElement("a");
    a.href = url; a.download = `inventory_aging_${view}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Totals row ─────────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    stockTotal:  sorted.reduce((s, r) => s + r.stockTotal, 0),
    stock6m:     sorted.reduce((s, r) => s + r.stock6m, 0),
    stock12m:    sorted.reduce((s, r) => s + r.stock12m, 0),
    stock24m:    sorted.reduce((s, r) => s + r.stock24m, 0),
    stockUnk:    sorted.reduce((s, r) => s + r.stockUnk, 0),
    eolTotal:    sorted.reduce((s, r) => s + r.eolTotal, 0),
    eolWithin3m: sorted.reduce((s, r) => s + r.eolWithin3m, 0),
    eolOlder3m:  sorted.reduce((s, r) => s + r.eolOlder3m, 0),
    eolUnk:      sorted.reduce((s, r) => s + r.eolUnk, 0),
    clearTotal:  sorted.reduce((s, r) => s + r.clearTotal, 0),
    mr1Total:    sorted.reduce((s, r) => s + r.mr1.total, 0),
    mr1w1m:      sorted.reduce((s, r) => s + r.mr1.within1m, 0),
    mr1o1m:      sorted.reduce((s, r) => s + r.mr1.older1m, 0),
    mr1unk:      sorted.reduce((s, r) => s + r.mr1.unknown, 0),
    mr2Total:    sorted.reduce((s, r) => s + r.mr2.total, 0),
    mr2w1m:      sorted.reduce((s, r) => s + r.mr2.within1m, 0),
    mr2o1m:      sorted.reduce((s, r) => s + r.mr2.older1m, 0),
    mr2unk:      sorted.reduce((s, r) => s + r.mr2.unknown, 0),
    mr3Total:    sorted.reduce((s, r) => s + r.mr3.total, 0),
    mr3w1m:      sorted.reduce((s, r) => s + r.mr3.within1m, 0),
    mr3o1m:      sorted.reduce((s, r) => s + r.mr3.older1m, 0),
    mr3unk:      sorted.reduce((s, r) => s + r.mr3.unknown, 0),
    mr4Total:    sorted.reduce((s, r) => s + r.mr4.total, 0),
    mr4w1m:      sorted.reduce((s, r) => s + r.mr4.within1m, 0),
    mr4o1m:      sorted.reduce((s, r) => s + r.mr4.older1m, 0),
    mr4unk:      sorted.reduce((s, r) => s + r.mr4.unknown, 0),
  }), [sorted]);

  // ── Shared th style ────────────────────────────────────────────────────────
  const Th = ({ col, label, sub, right }: { col: string; label: string; sub?: string; right?: boolean }) => (
    <th
      onClick={() => handleSort(col)}
      className={cn(
        "px-3 py-2 font-semibold text-[10px] uppercase tracking-wide text-slate-500 whitespace-nowrap cursor-pointer select-none border-r border-border/30 hover:bg-slate-100 hover:text-slate-800 transition-colors",
        right ? "text-right" : "text-left"
      )}
    >
      <div className={cn("flex items-center", right && "justify-end")}>
        <span>{label}</span>
        <SortIcon col={col} />
      </div>
      {sub && <div className="text-[9px] font-normal text-slate-400 mt-0.5 normal-case tracking-normal">{sub}</div>}
    </th>
  );

  const FrozenTh = () => (
    <th
      onClick={() => handleSort("ma")}
      className="sticky left-0 z-20 bg-white px-3 py-2 font-semibold text-[10px] uppercase tracking-wide text-slate-500 whitespace-nowrap cursor-pointer select-none border-r-2 border-border/50 hover:bg-slate-100 hover:text-slate-800 transition-colors"
    >
      <div className="flex items-center">MA <SortIcon col="ma" /></div>
    </th>
  );

  const Td = ({ v, highlight }: { v: number; highlight?: "red" | "amber" | "none" }) => (
    <td className={cn(
      "px-3 py-2 text-right text-xs tabular-nums border-r border-border/20 whitespace-nowrap",
      highlight === "red" && v > 0 && "text-red-700 font-medium",
      highlight === "amber" && v > 50000 && "text-amber-700 font-medium",
    )}>
      <span className={cn(v < 0 && "text-red-600")}>{fmt(v)}</span>
    </td>
  );

  const FrozenTd = ({ v, bg }: { v: string; bg?: string }) => (
    <td className={cn(
      "sticky left-0 z-10 px-3 py-2 text-xs font-semibold border-r-2 border-border/50 whitespace-nowrap",
      bg ?? "bg-white"
    )}>
      {v}
    </td>
  );

  const TotTd = ({ v }: { v: number }) => (
    <td className="px-3 py-2 text-right text-xs tabular-nums font-bold border-r border-border/20 whitespace-nowrap bg-slate-50">
      {fmt(v)}
    </td>
  );

  return (
    <MainLayout>
      <div className="flex flex-col h-full">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="px-6 py-5 border-b border-border/50 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Inventory Aging</h1>
              <p className="text-sm text-muted-foreground mt-1">{sorted.length} rows matched</p>
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

            {/* ── Filters ─────────────────────────────────────────────────── */}
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
                        {allCategories.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Sub Category</label>
                    <Select value={filters.subCategory} onValueChange={(v) => setFilters((f) => ({ ...f, subCategory: v }))}>
                      <SelectTrigger className="h-8 text-xs border-border/60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-xs">All</SelectItem>
                        {allSubCategories.map((c) => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}
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

            {/* ── View Tabs ────────────────────────────────────────────────── */}
            <div className="flex gap-1 border-b border-border/50">
              {([ ["stock", "Total Stock Aging"], ["eol", "EOL Aging"], ["markdown", "Markdown Aging"] ] as [View, string][]).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => { setView(id); setPage(1); setSortCol(null); setSortDir(null); }}
                  className={cn(
                    "px-5 py-2.5 text-xs font-semibold border-b-2 transition-all",
                    view === id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* ── Table ────────────────────────────────────────────────────── */}
            {sorted.length === 0 ? (
              <Card className="border-border/60 shadow-none">
                <CardContent className="py-20 text-center">
                  <PackageX size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm font-semibold text-muted-foreground">No exit planning data available for the selected filters.</p>
                  <Button size="sm" variant="outline" className="mt-4 text-xs" onClick={clearFilters}>Clear Filters</Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/60 shadow-none overflow-hidden">
                <div className="overflow-x-auto">

                  {/* ──────── VIEW: TOTAL STOCK AGING ──────── */}
                  {view === "stock" && (
                    <table className="text-xs w-full border-collapse">
                      <thead>
                        <tr className="bg-white border-b-2 border-border/50">
                          <FrozenTh />
                          <Th col="stockTotal" label="Stock ($)" right />
                          <Th col="stock6m"    label="6M"        sub="≤ 6 months" right />
                          <Th col="stock12m"   label="12M"       sub="6–12 months" right />
                          <Th col="stock24m"   label="24M"       sub="12–24 months" right />
                          <Th col="stockUnk"   label="Unknown"   right />
                        </tr>
                      </thead>
                      <tbody>
                        {pageData.map((r, i) => (
                          <tr key={i} className="border-b border-border/30 hover:bg-slate-50/50 transition-colors">
                            <FrozenTd v={r.ma} />
                            <Td v={r.stockTotal} />
                            <Td v={r.stock6m} />
                            <Td v={r.stock12m} highlight="amber" />
                            <Td v={r.stock24m} highlight="red" />
                            <Td v={r.stockUnk} />
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-border/50">
                          <td className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-xs font-bold border-r-2 border-border/50">TOTAL</td>
                          <TotTd v={totals.stockTotal} />
                          <TotTd v={totals.stock6m} />
                          <TotTd v={totals.stock12m} />
                          <TotTd v={totals.stock24m} />
                          <TotTd v={totals.stockUnk} />
                        </tr>
                      </tfoot>
                    </table>
                  )}

                  {/* ──────── VIEW: EOL AGING ──────── */}
                  {view === "eol" && (
                    <table className="text-xs w-full border-collapse">
                      <thead>
                        <tr className="bg-white border-b-2 border-border/50">
                          <FrozenTh />
                          <Th col="eolTotal"    label="EOL ($)"     right />
                          <Th col="eolWithin3m" label="Within 3M"   sub="≤ 3 months" right />
                          <Th col="eolOlder3m"  label="Older 3M"    sub="> 3 months" right highlight />
                          <Th col="eolUnk"      label="Unknown EOL" right />
                        </tr>
                      </thead>
                      <tbody>
                        {pageData.map((r, i) => (
                          <tr key={i} className="border-b border-border/30 hover:bg-slate-50/50 transition-colors">
                            <FrozenTd v={r.ma} />
                            <Td v={r.eolTotal} />
                            <Td v={r.eolWithin3m} />
                            <Td v={r.eolOlder3m} highlight="red" />
                            <Td v={r.eolUnk} />
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-border/50">
                          <td className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-xs font-bold border-r-2 border-border/50">TOTAL</td>
                          <TotTd v={totals.eolTotal} />
                          <TotTd v={totals.eolWithin3m} />
                          <TotTd v={totals.eolOlder3m} />
                          <TotTd v={totals.eolUnk} />
                        </tr>
                      </tfoot>
                    </table>
                  )}

                  {/* ──────── VIEW: MARKDOWN AGING ──────── */}
                  {view === "markdown" && (
                    <table className="text-xs w-full border-collapse">
                      <thead>
                        {/* Group row */}
                        <tr className="bg-slate-50 border-b border-border/30 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                          <th className="sticky left-0 z-20 bg-slate-50 px-3 py-1.5 border-r-2 border-border/50" />
                          <th className="px-3 py-1.5 text-right border-r border-border/20" />
                          {["MR1", "MR2", "MR3", "MR4"].map((mr) => (
                            <th key={mr} colSpan={4} className="px-3 py-1.5 text-center border-r-2 border-border/40 tracking-widest">{mr}</th>
                          ))}
                        </tr>
                        {/* Column header row */}
                        <tr className="bg-white border-b-2 border-border/50">
                          <FrozenTh />
                          <Th col="clearTotal" label="Total Clearance ($)" right />
                          {(["mr1","mr2","mr3","mr4"] as const).map((mr) => (
                            <>
                              <Th key={`${mr}-tot`}  col={`${mr}Total`}  label={`${mr.toUpperCase()} ($)`} right />
                              <Th key={`${mr}-w1m`}  col={`${mr}Within1m`} label="Within 1M" sub="≤ 1 month" right />
                              <Th key={`${mr}-o1m`}  col={`${mr}Older1m`}  label="Older 1M"  sub="> 1 month" right />
                              <Th key={`${mr}-unk`}  col={`${mr}Unknown`}  label={`Unkn ${mr.toUpperCase()}`} right />
                            </>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pageData.map((r, i) => (
                          <tr key={i} className="border-b border-border/30 hover:bg-slate-50/50 transition-colors">
                            <FrozenTd v={r.ma} />
                            <Td v={r.clearTotal} />
                            <Td v={r.mr1.total} /><Td v={r.mr1.within1m} /><Td v={r.mr1.older1m} highlight="amber" /><Td v={r.mr1.unknown} />
                            <Td v={r.mr2.total} /><Td v={r.mr2.within1m} /><Td v={r.mr2.older1m} highlight="amber" /><Td v={r.mr2.unknown} />
                            <Td v={r.mr3.total} /><Td v={r.mr3.within1m} /><Td v={r.mr3.older1m} highlight="amber" /><Td v={r.mr3.unknown} />
                            <Td v={r.mr4.total} /><Td v={r.mr4.within1m} /><Td v={r.mr4.older1m} highlight="red" />  <Td v={r.mr4.unknown} />
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-border/50">
                          <td className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-xs font-bold border-r-2 border-border/50">TOTAL</td>
                          <TotTd v={totals.clearTotal} />
                          <TotTd v={totals.mr1Total} /><TotTd v={totals.mr1w1m} /><TotTd v={totals.mr1o1m} /><TotTd v={totals.mr1unk} />
                          <TotTd v={totals.mr2Total} /><TotTd v={totals.mr2w1m} /><TotTd v={totals.mr2o1m} /><TotTd v={totals.mr2unk} />
                          <TotTd v={totals.mr3Total} /><TotTd v={totals.mr3w1m} /><TotTd v={totals.mr3o1m} /><TotTd v={totals.mr3unk} />
                          <TotTd v={totals.mr4Total} /><TotTd v={totals.mr4w1m} /><TotTd v={totals.mr4o1m} /><TotTd v={totals.mr4unk} />
                        </tr>
                      </tfoot>
                    </table>
                  )}

                </div>

                {/* ── Pagination ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground">Rows per page</span>
                    <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(1); }}>
                      <SelectTrigger className="h-7 w-16 text-xs border-border/60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[25, 50, 100].map((n) => <SelectItem key={n} value={String(n)} className="text-xs">{n}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <span className="text-[11px] text-muted-foreground ml-2">
                      {(safePage - 1) * rowsPerPage + 1}–{Math.min(safePage * rowsPerPage, sorted.length)} of {sorted.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0"
                      disabled={safePage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                      <ChevronLeft size={13} />
                    </Button>
                    <span className="text-[11px] font-medium mx-2">Page {safePage} / {totalPages}</span>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0"
                      disabled={safePage >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                      <ChevronRight size={13} />
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
