import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Download, ChevronRight, ChevronLeft, Layers,
  BarChart3, Grid3X3, Eye,
} from "lucide-react";

// ─── Reference Data ────────────────────────────────────────────────────────────
const FORMATS = [
  "Marketplace", "Travel Essentials", "High Street",
  "Airport", "Outlet", "Hospital", "Express",
] as const;
const GRADES = ["XS", "S", "M", "L", "XL", "Mega"] as const;

type Format = typeof FORMATS[number];
type Grade  = typeof GRADES[number];

const ROW_GROUPS: Record<string, string[]> = {
  "Planning Group":   ["Electronics", "Travel Accessories", "Food & Beverage", "Personal Care", "Books & Media", "Clothing"],
  "SPG":              ["Audio & Headphones", "Charging & Cables", "Bags & Luggage", "Snacks & Confectionery", "Skincare & Beauty", "Fiction & Non-Fiction"],
  "Tier Pricing":     ["Premium (>$50)", "Mid-Range ($20–$50)", "Value (<$20)"],
  "Product Lifecycle":["Active", "Launched", "Ranging", "Phase Out"],
  "Range":            ["Core Range", "Seasonal", "New Season", "Clearance"],
};

interface CellData { storeCount: number; skuCount: number; ytdSales: number; onHand: number }

// Deterministic seeded random so the matrix is stable across renders
function sr(seed: number) { const x = Math.sin(seed + 1) * 10000; return x - Math.floor(x); }

const BASE_STORES: Record<Format, Record<Grade, number>> = {
  "Marketplace":       { XS: 0, S: 3,  M: 14, L: 22, XL: 8,  Mega: 2 },
  "Travel Essentials": { XS: 5, S: 18, M: 32, L: 20, XL: 7,  Mega: 0 },
  "High Street":       { XS: 8, S: 25, M: 45, L: 30, XL: 12, Mega: 3 },
  "Airport":           { XS: 2, S: 12, M: 28, L: 18, XL: 5,  Mega: 0 },
  "Outlet":            { XS: 4, S: 16, M: 22, L: 14, XL: 3,  Mega: 0 },
  "Hospital":          { XS: 10,S: 20, M: 15, L: 6,  XL: 2,  Mega: 0 },
  "Express":           { XS: 6, S: 30, M: 28, L: 10, XL: 2,  Mega: 0 },
};

// Build the full data cube once
type DataCube = Record<string, Record<string, Record<Format, Record<Grade, CellData>>>>;
function buildDataCube(): DataCube {
  const cube: DataCube = {};
  let seed = 1;
  for (const [gName, rows] of Object.entries(ROW_GROUPS)) {
    cube[gName] = {};
    for (const row of rows) {
      cube[gName][row] = {} as any;
      for (const fmt of FORMATS) {
        cube[gName][row][fmt] = {} as any;
        for (const grd of GRADES) {
          const sc = BASE_STORES[fmt][grd];
          const skuMult  = 2 + Math.floor(sr(seed++) * 15);
          cube[gName][row][fmt][grd] = {
            storeCount: sc,
            skuCount:   sc === 0 ? 0 : sc * skuMult,
            ytdSales:   sc === 0 ? 0 : Math.floor(sc * (500 + sr(seed++) * 4500) * skuMult * 0.3),
            onHand:     sc === 0 ? 0 : Math.floor(sc * (10  + sr(seed++) *   90) * skuMult * 0.2),
          };
        }
      }
    }
  }
  return cube;
}
const DATA_CUBE = buildDataCube();

// Drill-down sample records
interface DrillRecord { style: string; sku: string; description: string; retail: number; format: string; grade: string; onHand: number; ytdSales: number }
function getDrillRecords(row: string, fmt: string, grd: string): DrillRecord[] {
  const brands  = ["APPLE","BOSE","SONY","JBL","SAMSUNG","ANKER"];
  const descs   = ["Wireless Noise Cancelling Headphones","Portable Bluetooth Speaker","True Wireless Earbuds","USB-C Fast Charger 65W","Power Bank 20000mAh","Smart Watch Sport Edition","Tablet Case Premium"];
  const base    = (row.length + fmt.length + grd.length) * 7;
  return Array.from({ length: 7 }, (_, i) => {
    const brand = brands[Math.floor(sr(base + i * 3) * brands.length)];
    return {
      style:       `${brand.slice(0,2)}-${10001 + i}`,
      sku:         `${brand.slice(0,3)}${grd.replace(/[^A-Z]/g,"")}${10000 + i}`,
      description: `${brand} ${descs[Math.floor(sr(base + i * 3 + 1) * descs.length)]}`,
      retail:      parseFloat((19.99 + sr(base + i * 3 + 2) * 480).toFixed(2)),
      format:      fmt, grade: grd,
      onHand:      Math.floor(10 + sr(base + i * 5) * 200),
      ytdSales:    Math.floor(100 + sr(base + i * 7) * 5000),
    };
  });
}

type Metric = "skuCount" | "ytdSales" | "onHand";
const METRIC_LABELS: Record<Metric, string> = {
  skuCount: "SKU Count", ytdSales: "YTD Sales", onHand: "On Hand Inventory",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function PlannerReportV2() {
  const [metric,          setMetric]          = useState<Metric>("skuCount");
  const [groupBy,         setGroupBy]         = useState("Planning Group");
  const [visibleFormats,  setVisibleFormats]  = useState<Set<Format>>(new Set(FORMATS));
  const [visibleGrades,   setVisibleGrades]   = useState<Set<Grade>>(new Set(GRADES));
  const [expandedFormats, setExpandedFormats] = useState<Set<Format>>(new Set(["Airport", "Marketplace"]));
  const [displayMode,     setDisplayMode]     = useState<"matrix" | "heatmap">("matrix");
  const [drillCell,       setDrillCell]       = useState<{ row: string; fmt: Format; grd: Grade | "total" } | null>(null);

  const rows      = ROW_GROUPS[groupBy];
  const groupData = DATA_CUBE[groupBy];

  const getVal = (c: CellData) => metric === "skuCount" ? c.skuCount : metric === "ytdSales" ? c.ytdSales : c.onHand;

  const getCell = (row: string, fmt: Format, grd: Grade): CellData => groupData[row][fmt][grd];

  const visGrades  = useMemo(() => GRADES.filter(g => visibleGrades.has(g)),  [visibleGrades]);
  const visFmts    = useMemo(() => FORMATS.filter(f => visibleFormats.has(f)), [visibleFormats]);

  // Column totals (all rows) for a given format+grade combo
  const colTotal = (fmt: Format, grd: Grade | null): number =>
    grd
      ? rows.reduce((s, r) => s + getVal(getCell(r, fmt, grd)), 0)
      : visGrades.reduce((s, g) => s + rows.reduce((s2, r) => s2 + getVal(getCell(r, fmt, g)), 0), 0);

  // Row total across visible grades for one format
  const rowFmtTotal = (row: string, fmt: Format): number =>
    visGrades.reduce((s, g) => s + getVal(getCell(row, fmt, g)), 0);

  const grandTotal = useMemo(
    () => visFmts.reduce((s, f) => s + colTotal(f, null), 0),
    [metric, groupBy, visibleFormats, visibleGrades] // eslint-disable-line
  );

  const maxVal = useMemo(() => {
    let m = 0;
    for (const r of rows) for (const f of visFmts) for (const g of visGrades) m = Math.max(m, getVal(getCell(r, f, g)));
    return m;
  }, [metric, groupBy, visibleFormats, visibleGrades]); // eslint-disable-line

  const heatCls = (v: number) => {
    if (displayMode !== "heatmap" || maxVal === 0 || v === 0) return "";
    const t = v / maxVal;
    if (t < 0.15) return "bg-sky-50 dark:bg-sky-950/20";
    if (t < 0.30) return "bg-sky-100 dark:bg-sky-900/30";
    if (t < 0.50) return "bg-sky-200 dark:bg-sky-800/40";
    if (t < 0.70) return "bg-sky-300/80 dark:bg-sky-700/50";
    return "bg-sky-400/60 dark:bg-sky-600/60";
  };

  const fmtVal = (v: number) => {
    if (metric === "ytdSales") return v >= 1_000_000 ? `$${(v/1e6).toFixed(1)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v}`;
    return v >= 1000 ? `${(v/1000).toFixed(1)}K` : String(v);
  };

  const storeFmt  = (f: Format) => visGrades.reduce((s, g) => s + BASE_STORES[f][g], 0);
  const storeGrd  = (f: Format, g: Grade) => BASE_STORES[f][g];
  const totalStores = visFmts.reduce((s, f) => s + storeFmt(f), 0);

  const toggleFmt   = (f: Format) => setVisibleFormats(p => { const n=new Set(p); n.has(f)?n.delete(f):n.add(f); return n; });
  const toggleGrd   = (g: Grade)  => setVisibleGrades(p => { const n=new Set(p); n.has(g)?n.delete(g):n.add(g); return n; });
  const toggleExpand= (f: Format) => setExpandedFormats(p => { const n=new Set(p); n.has(f)?n.delete(f):n.add(f); return n; });

  return (
    <MainLayout>
      <div className="space-y-4 animate-in fade-in duration-500">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Planner Report V2</h1>
            <p className="text-sm text-slate-500 mt-0.5">Analyse assortment distribution across Store Formats and Grades</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>

        {/* ── Analysis Controls ── */}
        <Card className="rounded-xl shadow-sm">
          <CardContent className="p-4 space-y-4">
            {/* Selects + display mode toggle */}
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">Show Metric</p>
                <Select value={metric} onValueChange={v => setMetric(v as Metric)}>
                  <SelectTrigger className="h-8 text-xs w-[180px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skuCount">SKU Count</SelectItem>
                    <SelectItem value="ytdSales">YTD Sales</SelectItem>
                    <SelectItem value="onHand">On Hand Inventory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">Group Rows By</p>
                <Select value={groupBy} onValueChange={setGroupBy}>
                  <SelectTrigger className="h-8 text-xs w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(ROW_GROUPS).map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Segmented display mode */}
              <div className="ml-auto flex items-center gap-0 self-end">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-2">View</span>
                {(["matrix","heatmap"] as const).map((mode, i) => (
                  <button
                    key={mode}
                    onClick={() => setDisplayMode(mode)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 border text-xs font-medium transition-colors",
                      i === 0 ? "rounded-l-lg" : "rounded-r-lg border-l-0",
                      displayMode === mode
                        ? "bg-primary text-white border-primary"
                        : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {mode === "matrix" ? <Grid3X3 size={12} /> : <BarChart3 size={12} />}
                    <span className="capitalize">{mode}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Visible Formats chips */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">Visible Formats</p>
              <div className="flex flex-wrap gap-1.5">
                {FORMATS.map(f => (
                  <button
                    key={f}
                    onClick={() => toggleFmt(f)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium border transition-all select-none",
                      visibleFormats.has(f)
                        ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-50"
                    )}
                  >
                    {visibleFormats.has(f) ? "☑" : "☐"} {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Visible Grades chips */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wide">Visible Grades</p>
              <div className="flex flex-wrap gap-1.5">
                {GRADES.map(g => (
                  <button
                    key={g}
                    onClick={() => toggleGrd(g)}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-semibold border transition-all select-none",
                      visibleGrades.has(g)
                        ? "bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 border-transparent"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 opacity-50"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Matrix + Context Panel ── */}
        <div className="flex gap-4 items-start">

          {/* Matrix card */}
          <Card className="flex-1 min-w-0 rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-2">
                <Layers size={15} className="text-primary" />
                <CardTitle className="text-sm font-bold">Assortment Matrix</CardTitle>
                <Badge variant="secondary" className="text-[10px] font-bold">{METRIC_LABELS[metric]}</Badge>
                <Badge variant="outline" className="text-[10px] font-medium">By {groupBy}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Scroll container — vertical + horizontal */}
              <div
                className="overflow-auto"
                style={{ maxHeight: 560 }}
              >
                <table className="text-xs border-collapse" style={{ minWidth: "max-content" }}>
                  <thead className="sticky top-0 z-30 bg-slate-50 dark:bg-slate-800">

                    {/* Row 1 — Format group headers */}
                    <tr>
                      <th
                        rowSpan={2}
                        className="sticky left-0 z-40 bg-slate-50 dark:bg-slate-800 border-b-2 border-r border-slate-200 dark:border-slate-700 px-4 py-3 text-left text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap min-w-[160px] align-bottom"
                      >
                        {groupBy}
                      </th>
                      {visFmts.map(fmt => {
                        const expanded    = expandedFormats.has(fmt);
                        const numCols     = expanded ? visGrades.length + 1 : 1;
                        const fTotal      = colTotal(fmt, null);
                        const contrib     = grandTotal > 0 ? (fTotal / grandTotal * 100).toFixed(1) : "0.0";
                        return (
                          <th
                            key={fmt}
                            colSpan={numCols}
                            className="border-b border-l border-slate-200 dark:border-slate-700 px-3 py-2 text-center"
                          >
                            <div className="flex flex-col items-center gap-0.5">
                              <div className="flex items-center gap-1">
                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{fmt}</span>
                                <button
                                  onClick={() => toggleExpand(fmt)}
                                  className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                  title={expanded ? "Collapse" : "Expand grades"}
                                >
                                  {expanded
                                    ? <ChevronLeft size={10} className="text-slate-400" />
                                    : <ChevronRight size={10} className="text-slate-400" />}
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-slate-400">{storeFmt(fmt)} stores</span>
                                <span className="text-[9px] font-semibold text-slate-500">{contrib}%</span>
                              </div>
                            </div>
                          </th>
                        );
                      })}
                    </tr>

                    {/* Row 2 — Grade sub-headers (or "Total") */}
                    <tr>
                      {visFmts.map(fmt => {
                        const expanded = expandedFormats.has(fmt);
                        if (!expanded) {
                          return (
                            <th
                              key={`${fmt}-total`}
                              className="border-b-2 border-l border-slate-200 dark:border-slate-700 px-2 py-2 text-center min-w-[90px]"
                            >
                              <div className="text-[9px] uppercase font-bold text-slate-400">Total</div>
                              <div className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                                {fmtVal(colTotal(fmt, null))}
                              </div>
                            </th>
                          );
                        }
                        return visGrades.map((grd, gi) => {
                          const ct      = colTotal(fmt, grd);
                          const contrib = grandTotal > 0 ? (ct / grandTotal * 100).toFixed(1) : "0.0";
                          return (
                            <th
                              key={`${fmt}-${grd}`}
                              className={cn(
                                "border-b-2 border-slate-200 dark:border-slate-700 px-2 py-2 text-center min-w-[80px]",
                                gi === 0 && "border-l"
                              )}
                            >
                              <div className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase">{grd}</div>
                              <div className="text-[9px] text-slate-400">{storeGrd(fmt, grd)} stores</div>
                              <div className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{fmtVal(ct)}</div>
                              <div className="text-[9px] text-slate-400">{contrib}%</div>
                            </th>
                          );
                        });
                      })}
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map(row => (
                      <tr
                        key={row}
                        className="group border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        {/* Sticky row label */}
                        <td className="sticky left-0 z-20 bg-white dark:bg-slate-900 group-hover:bg-slate-50/80 dark:group-hover:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 px-4 py-3 font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap transition-colors">
                          {row}
                        </td>

                        {/* Data cells */}
                        {visFmts.map(fmt => {
                          const expanded = expandedFormats.has(fmt);

                          if (!expanded) {
                            const v = rowFmtTotal(row, fmt);
                            return (
                              <td
                                key={`${fmt}-total`}
                                onClick={() => setDrillCell({ row, fmt, grd: "total" })}
                                className={cn(
                                  "border-l border-slate-200 dark:border-slate-700 px-3 py-3 text-right tabular-nums cursor-pointer hover:bg-primary/5 transition-colors",
                                  heatCls(v)
                                )}
                              >
                                <span className={cn("font-medium", v === 0 ? "text-slate-300 dark:text-slate-600" : "text-slate-700 dark:text-slate-200")}>
                                  {v === 0 ? "—" : fmtVal(v)}
                                </span>
                              </td>
                            );
                          }

                          return visGrades.map((grd, gi) => {
                            const v = getVal(getCell(row, fmt, grd));
                            return (
                              <td
                                key={`${fmt}-${grd}`}
                                onClick={() => setDrillCell({ row, fmt, grd })}
                                className={cn(
                                  "border-slate-200 dark:border-slate-700 px-3 py-3 text-right tabular-nums cursor-pointer hover:bg-primary/5 transition-colors",
                                  gi === 0 && "border-l",
                                  heatCls(v)
                                )}
                              >
                                <span className={cn("font-medium", v === 0 ? "text-slate-300 dark:text-slate-600" : "text-slate-700 dark:text-slate-200")}>
                                  {v === 0 ? "—" : fmtVal(v)}
                                </span>
                              </td>
                            );
                          });
                        })}
                      </tr>
                    ))}

                    {/* Totals row */}
                    <tr className="border-t-2 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/60">
                      <td className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800/60 border-r border-slate-200 dark:border-slate-700 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                        Total
                      </td>
                      {visFmts.map(fmt => {
                        const expanded = expandedFormats.has(fmt);
                        if (!expanded) {
                          return (
                            <td key={`${fmt}-total`} className="border-l border-slate-200 dark:border-slate-700 px-3 py-3 text-right tabular-nums text-xs font-bold text-slate-700 dark:text-slate-200">
                              {fmtVal(colTotal(fmt, null))}
                            </td>
                          );
                        }
                        return visGrades.map((grd, gi) => (
                          <td
                            key={`${fmt}-${grd}`}
                            className={cn(
                              "border-slate-200 dark:border-slate-700 px-3 py-3 text-right tabular-nums text-xs font-bold text-slate-700 dark:text-slate-200",
                              gi === 0 && "border-l"
                            )}
                          >
                            {fmtVal(colTotal(fmt, grd))}
                          </td>
                        ));
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* ── Sticky Context Panel ── */}
          <div className="w-52 flex-shrink-0 self-start sticky top-0">
            <Card className="rounded-xl shadow-sm">
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                  <Eye size={13} className="text-primary" /> Analysis Context
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3 text-xs">
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Current Metric</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{METRIC_LABELS[metric]}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Grouping</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200">{groupBy}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Visible Formats</p>
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {visFmts.map(f => (
                      <Badge key={f} variant="secondary" className="text-[8px] py-0 h-4 leading-none">
                        {f.split(" ")[0]}
                      </Badge>
                    ))}
                    {visFmts.length === 0 && <span className="text-slate-400 text-[10px]">None</span>}
                  </div>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400 mb-1">Visible Grades</p>
                  <div className="flex flex-wrap gap-0.5 mt-0.5">
                    {visGrades.map(g => (
                      <Badge key={g} variant="outline" className="text-[8px] py-0 h-4 leading-none">{g}</Badge>
                    ))}
                    {visGrades.length === 0 && <span className="text-slate-400 text-[10px]">None</span>}
                  </div>
                </div>
                <div className="border-t pt-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Total Stores</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-[12px]">{totalStores.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Grand Total</span>
                    <span className="font-bold text-primary text-[12px]">{fmtVal(grandTotal)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Rows</span>
                    <span className="font-semibold text-slate-600 dark:text-slate-300 text-[11px]">{rows.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] uppercase font-bold text-slate-400">View</span>
                    <Badge variant={displayMode === "heatmap" ? "default" : "secondary"} className="text-[8px] capitalize h-4 py-0">
                      {displayMode}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Drill-down Drawer ── */}
      <Sheet open={!!drillCell} onOpenChange={() => setDrillCell(null)}>
        <SheetContent className="w-[540px] sm:max-w-[540px] overflow-y-auto">
          {drillCell && (() => {
            const records = getDrillRecords(drillCell.row, drillCell.fmt, String(drillCell.grd));
            return (
              <>
                <SheetHeader className="mb-4">
                  <SheetTitle className="text-sm font-bold">{drillCell.row}</SheetTitle>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[10px]">{drillCell.fmt}</Badge>
                    {drillCell.grd !== "total" && (
                      <Badge variant="secondary" className="text-[10px]">Grade {drillCell.grd}</Badge>
                    )}
                    <Badge className="text-[10px] bg-primary/10 text-primary border-0">{METRIC_LABELS[metric]}</Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Showing representative records — drill-down will surface live data when connected to a data source.
                  </p>
                </SheetHeader>

                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      {["Style / SKU", "Description", "Retail", "Store Format", "Grade", "On Hand", "YTD Sales"].map(h => (
                        <th key={h} className={cn("pb-2 text-[9px] uppercase font-bold text-slate-400", h !== "Style / SKU" && h !== "Description" ? "text-right" : "text-left")}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-2.5 pr-3">
                          <p className="font-mono text-[9px] font-bold text-slate-600 dark:text-slate-300">{rec.style}</p>
                          <p className="font-mono text-[8px] text-slate-400">{rec.sku}</p>
                        </td>
                        <td className="py-2.5 pr-3 max-w-[160px]">
                          <p className="text-[10px] text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug">{rec.description}</p>
                        </td>
                        <td className="py-2.5 text-right tabular-nums font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                          ${rec.retail.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-right">
                          <Badge variant="outline" className="text-[8px] py-0 h-4">{rec.format.split(" ")[0]}</Badge>
                        </td>
                        <td className="py-2.5 text-right">
                          <Badge variant="secondary" className="text-[8px] py-0 h-4">{rec.grade}</Badge>
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">
                          {rec.onHand.toLocaleString()}
                        </td>
                        <td className="py-2.5 text-right tabular-nums text-slate-600 dark:text-slate-300">
                          {rec.ytdSales.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}
