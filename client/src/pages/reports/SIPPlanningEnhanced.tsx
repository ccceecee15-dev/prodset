import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Download, Save, RotateCcw, ChevronRight, ChevronLeft,
  SlidersHorizontal, ChevronDown, ChevronUp, Search,
  ChevronsUpDown, Zap, ShoppingCart, AlertCircle, AlertTriangle,
  TrendingUp, LockKeyhole,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Shared catalogue (same as SIPPlanning) ───────────────────────────────────
const BRANDS = ["APPLE", "BOSE", "SONY", "JBL", "SAMSUNG", "ANKER"];
const PLC_STATUSES = ["Active", "Launched", "Ranging", "Phase Out", "Discontinued"];
const PRODUCT_CATALOGUE: Record<string, { desc: string; baseRetail: number; vendorCode: string; vendorName: string }[]> = {
  APPLE:   [
    { desc: "APPLE LB AIRPODS PRO GEN 3 TRUE WIRELESS IN EAR EARBUDS",            baseRetail: 299.99, vendorCode: "011286", vendorName: "INGRAM MICRO, INC." },
    { desc: "APPLE AIRPODS 4 TRUE WIRELESS EARBUDS WITH ACTIVE NOISE CANCELLATION", baseRetail: 199.99, vendorCode: "011286", vendorName: "INGRAM MICRO, INC." },
    { desc: "APPLE AIRPODS MAX OVER EAR WIRELESS HEADPHONES MIDNIGHT",             baseRetail: 549.99, vendorCode: "011286", vendorName: "INGRAM MICRO, INC." },
    { desc: "APPLE MAGSAFE CHARGER 1M USB-C CABLE",                               baseRetail: 39.99,  vendorCode: "011286", vendorName: "INGRAM MICRO, INC." },
    { desc: "APPLE USB-C TO LIGHTNING CABLE 1M",                                  baseRetail: 29.99,  vendorCode: "011286", vendorName: "INGRAM MICRO, INC." },
    { desc: "APPLE 20W USB-C POWER ADAPTER",                                      baseRetail: 25.99,  vendorCode: "011286", vendorName: "INGRAM MICRO, INC." },
  ],
  BOSE:    [
    { desc: "BOSE QUIETCOMFORT 45 WIRELESS NOISE CANCELLING HEADPHONES BLACK",    baseRetail: 329.95, vendorCode: "024501", vendorName: "BOSE CORPORATION" },
    { desc: "BOSE QUIETCOMFORT EARBUDS II TRUE WIRELESS IN EAR EARBUDS",          baseRetail: 279.95, vendorCode: "024501", vendorName: "BOSE CORPORATION" },
    { desc: "BOSE SOUNDLINK FLEX PORTABLE BLUETOOTH SPEAKER BLACK",               baseRetail: 149.95, vendorCode: "024501", vendorName: "BOSE CORPORATION" },
    { desc: "BOSE SPORT EARBUDS TRUE WIRELESS IN EAR HEADPHONES",                 baseRetail: 179.95, vendorCode: "024501", vendorName: "BOSE CORPORATION" },
    { desc: "BOSE SOUNDLINK REVOLVE+ II PORTABLE SPEAKER TRIPLE BLACK",           baseRetail: 299.95, vendorCode: "024501", vendorName: "BOSE CORPORATION" },
  ],
  SONY:    [
    { desc: "SONY WH-1000XM5 WIRELESS NOISE CANCELLING OVER EAR HEADPHONES",     baseRetail: 349.99, vendorCode: "038812", vendorName: "SONY ELECTRONICS INC." },
    { desc: "SONY WF-1000XM5 TRUE WIRELESS EARBUDS NOISE CANCELLING BLACK",       baseRetail: 279.99, vendorCode: "038812", vendorName: "SONY ELECTRONICS INC." },
    { desc: "SONY LINKBUDS S TRUE WIRELESS NOISE CANCELLING EARBUDS WHITE",       baseRetail: 149.99, vendorCode: "038812", vendorName: "SONY ELECTRONICS INC." },
    { desc: "SONY SRS-XB100 COMPACT PORTABLE BLUETOOTH SPEAKER BLACK",            baseRetail: 59.99,  vendorCode: "038812", vendorName: "SONY ELECTRONICS INC." },
    { desc: "SONY SRS-XE300 PORTABLE WIRELESS SPEAKER OLIVE",                     baseRetail: 149.99, vendorCode: "038812", vendorName: "SONY ELECTRONICS INC." },
  ],
  JBL:     [
    { desc: "JBL TUNE 770NC WIRELESS OVER-EAR NOISE CANCELLING HEADPHONES",      baseRetail: 129.99, vendorCode: "052193", vendorName: "HARMAN INTERNATIONAL" },
    { desc: "JBL LIVE FREE 2 TWS TRUE WIRELESS EARBUDS WITH NOISE CANCELLING",    baseRetail: 99.99,  vendorCode: "052193", vendorName: "HARMAN INTERNATIONAL" },
    { desc: "JBL CHARGE 5 PORTABLE WATERPROOF BLUETOOTH SPEAKER BLACK",           baseRetail: 179.99, vendorCode: "052193", vendorName: "HARMAN INTERNATIONAL" },
    { desc: "JBL FLIP 6 PORTABLE WATERPROOF BLUETOOTH SPEAKER BLACK",             baseRetail: 119.99, vendorCode: "052193", vendorName: "HARMAN INTERNATIONAL" },
    { desc: "JBL TOUR PRO 2 TRUE WIRELESS NOISE CANCELLING EARBUDS BLACK",        baseRetail: 219.99, vendorCode: "052193", vendorName: "HARMAN INTERNATIONAL" },
  ],
  SAMSUNG: [
    { desc: "SAMSUNG GALAXY BUDS3 PRO TRUE WIRELESS NOISE CANCELLING EARBUDS",   baseRetail: 249.99, vendorCode: "061744", vendorName: "SAMSUNG ELECTRONICS AMERICA" },
    { desc: "SAMSUNG GALAXY BUDS3 TRUE WIRELESS EARBUDS SILVER",                  baseRetail: 169.99, vendorCode: "061744", vendorName: "SAMSUNG ELECTRONICS AMERICA" },
    { desc: "SAMSUNG 45W USB-C POWER ADAPTER SUPER FAST CHARGING",               baseRetail: 39.99,  vendorCode: "061744", vendorName: "SAMSUNG ELECTRONICS AMERICA" },
    { desc: "SAMSUNG USB-C TO USB-C CABLE 1.8M 5A FAST CHARGING",                baseRetail: 29.99,  vendorCode: "061744", vendorName: "SAMSUNG ELECTRONICS AMERICA" },
  ],
  ANKER:   [
    { desc: "ANKER SOUNDCORE LIFE Q35 WIRELESS NOISE CANCELLING HEADPHONES",     baseRetail: 79.99,  vendorCode: "073328", vendorName: "ANKER INNOVATIONS LIMITED" },
    { desc: "ANKER SOUNDCORE LIBERTY 4 NC TRUE WIRELESS EARBUDS BLACK",           baseRetail: 89.99,  vendorCode: "073328", vendorName: "ANKER INNOVATIONS LIMITED" },
    { desc: "ANKER 737 POWER BANK 24000MAH 140W PORTABLE CHARGER",               baseRetail: 99.99,  vendorCode: "073328", vendorName: "ANKER INNOVATIONS LIMITED" },
    { desc: "ANKER NANO 65W USB-C COMPACT FAST CHARGER BLACK",                   baseRetail: 45.99,  vendorCode: "073328", vendorName: "ANKER INNOVATIONS LIMITED" },
    { desc: "ANKER 548 USB-C HUB 7-IN-1 DATA HUB DARK BLUE",                    baseRetail: 49.99,  vendorCode: "073328", vendorName: "ANKER INNOVATIONS LIMITED" },
  ],
};

// ─── Column Schema ─────────────────────────────────────────────────────────────
interface ColDef {
  id: string; label: string; frozen?: boolean; numeric?: boolean;
  pct?: boolean; currency?: boolean; defaultHidden?: boolean; sipCol?: boolean;
}
interface GroupDef { id: string; label: string; defaultVisible: boolean; columns: ColDef[] }

const COLUMN_GROUPS: GroupDef[] = [
  {
    id: "product", label: "Product Attribute", defaultVisible: true,
    columns: [
      { id: "rank",               label: "Rank",                       frozen: true,  numeric: true },
      { id: "topBucket",          label: "TOP Bucket" },
      { id: "styleCode",          label: "Style Code",                 frozen: true },
      { id: "styleLongDesc",      label: "Style Long Desc" },
      { id: "brand",              label: "Brand" },
      { id: "chainCurrentRetail", label: "Style Chain Current Retail", currency: true },
      { id: "primaryVendorName",  label: "Primary Vendor Name" },
      { id: "plcStatus",          label: "PLC Status" },
      { id: "poPriority",         label: "PO Priority" },
      { id: "reorderableFlag",    label: "Style Reorderable Flag",     defaultHidden: true },
      { id: "primaryCurrentCost", label: "Primary Current Cost",       currency: true, defaultHidden: true },
    ],
  },
  {
    id: "sipMetrics", label: "SIP Metrics", defaultVisible: true,
    columns: [
      { id: "forecastDemand",    label: "Forecast Demand",    numeric: true, sipCol: true },
      { id: "requiredStock",     label: "Required Stock",     numeric: true, sipCol: true },
      { id: "currentStock",      label: "Current Stock",      numeric: true, sipCol: true },
      { id: "deficit",           label: "Deficit",            numeric: true, sipCol: true },
      { id: "suggestedOrderQty", label: "Suggested Order Qty",numeric: true, sipCol: true },
      { id: "storeWos",          label: "WOS (Store)",        numeric: true, sipCol: true },
      { id: "salesVelocity",     label: "Sales Velocity",     numeric: true, sipCol: true },
    ],
  },
  {
    id: "salesUnits", label: "Sales Units", defaultVisible: false,
    columns: [
      { id: "wtd",            label: "WTD",  numeric: true },
      { id: "lw",             label: "LW",   numeric: true },
      { id: "l2w",            label: "L2W",  numeric: true },
      { id: "l3w",            label: "L3W",  numeric: true },
      { id: "l4w",            label: "L4W",  numeric: true },
    ],
  },
  {
    id: "stockUnits", label: "Stock Units", defaultVisible: false,
    columns: [
      { id: "presentationStock", label: "Presentation Stock", numeric: true },
      { id: "storeOnhand",       label: "Store Onhand",       numeric: true },
      { id: "dcOnhand",          label: "DC Onhand",          numeric: true },
    ],
  },
  {
    id: "orders", label: "Orders", defaultVisible: false,
    columns: [
      { id: "orderMultiple",    label: "Style Order Multiple",   numeric: true },
      { id: "onOrderTotal",     label: "On Order Units (Total)", numeric: true },
      { id: "firstReceiptDate", label: "First Receipt Date" },
      { id: "lastReceiptDate",  label: "Last Receipt Date" },
    ],
  },
  {
    id: "wos", label: "WOS", defaultVisible: false,
    columns: [
      { id: "whWos", label: "WH WOS", numeric: true },
    ],
  },
];

const SAVED_VIEW_CONFIGS: Record<string, { visibleGroups: string[]; hiddenCols: string[] }> = {
  "Priority View":    { visibleGroups: ["product", "sipMetrics"],                              hiddenCols: ["reorderableFlag","primaryCurrentCost"] },
  "Order View":       { visibleGroups: ["product", "sipMetrics", "orders"],                   hiddenCols: ["reorderableFlag","primaryCurrentCost"] },
  "Full View":        { visibleGroups: ["product", "sipMetrics", "salesUnits", "stockUnits"], hiddenCols: ["reorderableFlag","primaryCurrentCost"] },
  "Sales View":       { visibleGroups: ["product", "sipMetrics", "salesUnits"],               hiddenCols: ["reorderableFlag","primaryCurrentCost"] },
};
const SAVED_VIEW_NAMES = Object.keys(SAVED_VIEW_CONFIGS);

const DEFAULT_VISIBLE_GROUPS = new Set(COLUMN_GROUPS.filter((g) => g.defaultVisible).map((g) => g.id));
const DEFAULT_HIDDEN_COLS    = new Set(COLUMN_GROUPS.flatMap((g) => g.columns.filter((c) => c.defaultHidden).map((c) => c.id)));
const FROZEN_LEFTS           = ["left-[40px]", "left-[100px]"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function rnd(min: number, max: number, dp = 0): number {
  const v = Math.random() * (max - min) + min;
  return dp ? +v.toFixed(dp) : Math.floor(v);
}
function vary(base: number, pct: number): number {
  return Math.max(0, Math.round(base * (1 + (Math.random() * 2 - 1) * pct)));
}
function fmtDate(d: Date): string {
  return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
}

type PoPriority = "high" | "medium" | "low";

function calcPoPriority(deficit: number, storeWos: number, whWos: number): PoPriority {
  if (deficit > 500 && (storeWos < 3 || whWos < 5)) return "high";
  if (deficit > 100 && (storeWos < 6 || whWos < 8)) return "medium";
  return "low";
}

function generateData(count: number) {
  const catalogue: { brand: string; desc: string; baseRetail: number; vendorCode: string; vendorName: string }[] = [];
  for (const b of BRANDS) for (const p of PRODUCT_CATALOGUE[b]) catalogue.push({ brand: b, ...p });

  return Array.from({ length: count }, (_, i) => {
    const product = catalogue[i % catalogue.length];
    const retail  = +(product.baseRetail * (0.9 + Math.random() * 0.2)).toFixed(2);
    const cost    = +(retail * (0.5 + Math.random() * 0.3)).toFixed(2);
    const plc     = PLC_STATUSES[Math.floor(Math.random() * PLC_STATUSES.length)];

    const wtd = rnd(50, 6000); const lw = vary(wtd, 0.25); const l2w = vary(wtd, 0.25);
    const l3w = vary(wtd, 0.25); const l4w = vary(wtd, 0.25);
    const avgWeeklySales = Math.round((lw + l2w + l3w + l4w) / 4);
    const salesVelocity  = avgWeeklySales;

    const presStock   = rnd(100, 6000);
    const storeOnhand = rnd(200, 12000);
    const dcOnhand    = rnd(1000, 25000);
    const storeWos    = rnd(1, 12, 1);
    const whWos       = rnd(2, 18, 1);
    const orderMult   = [2, 4, 5, 6, 10, 12, 20][Math.floor(Math.random() * 7)];
    const onOrderTotal = rnd(0, 5000);

    const forecastDemand    = Math.round(avgWeeklySales * rnd(10, 18));
    const safetyStock       = Math.round(presStock * 1.5);
    const requiredStock     = forecastDemand + safetyStock;
    const currentStock      = storeOnhand + dcOnhand;
    const deficit           = requiredStock - currentStock;
    const suggestedOrderQty = deficit > 0 ? Math.ceil(deficit / orderMult) * orderMult : 0;

    const firstRcpt = new Date(Date.now() - rnd(90, 730) * 86400000);
    const lastRcpt  = new Date(firstRcpt.getTime() + rnd(30, 365) * 86400000);

    const poPriority = calcPoPriority(deficit, storeWos, whWos);

    return {
      rank: i + 1,
      topBucket: i < 100 ? "Top 100" : i < 250 ? "Top 250" : i < 500 ? "Top 500" : "Tail",
      styleCode: String(1000000 + i * 7 + rnd(1, 6)),
      styleLongDesc: product.desc,
      brand: product.brand,
      chainCurrentRetail: retail,
      primaryVendorCode: product.vendorCode,
      primaryVendorName: product.vendorName,
      plcStatus: plc,
      poPriority,
      reorderableFlag: Math.random() > 0.2 ? 1 : 0,
      primaryCurrentCost: cost,
      wtd, lw, l2w, l3w, l4w, avgWeeklySales, salesVelocity,
      presentationStock: presStock,
      storeOnhand, dcOnhand, storeWos, whWos,
      orderMultiple: orderMult, onOrderTotal,
      firstReceiptDate: fmtDate(firstRcpt), lastReceiptDate: fmtDate(lastRcpt),
      forecastDemand, requiredStock, currentStock, deficit, suggestedOrderQty,
    };
  });
}

const ALL_DATA = generateData(300);

const PLC_COLORS: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Launched: "bg-blue-100 text-blue-700",
  Ranging: "bg-violet-100 text-violet-700",
  "Phase Out": "bg-amber-100 text-amber-700",
  Discontinued: "bg-red-100 text-red-700",
};

const PRIORITY_CFG: Record<PoPriority, { label: string; cls: string; dot: string }> = {
  high:   { label: "High",   cls: "bg-red-100 text-red-700 border-red-200",       dot: "bg-red-500" },
  medium: { label: "Medium", cls: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  low:    { label: "Low",    cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-400" },
};

type SortDir = "asc" | "desc" | null;

// ─── Component ────────────────────────────────────────────────────────────────
export default function SIPPlanningEnhanced() {
  const [, navigate] = useLocation();

  const [filters, setFilters]         = useState({ brand: "all", plcStatus: "all", priority: "all", search: "" });
  const [appliedFilters, setApplied]  = useState(filters);
  const [visibleGroups, setVisibleGroups]       = useState<Set<string>>(new Set(DEFAULT_VISIBLE_GROUPS));
  const [hiddenCols, setHiddenCols]             = useState<Set<string>>(new Set(DEFAULT_HIDDEN_COLS));
  const [collapsedGroups, setCollapsedGroups]   = useState<Set<string>>(new Set());
  const [customizeOpen, setCustomizeOpen]       = useState(false);
  const [expandedPanelGroups, setExpandedPanelGroups] = useState<Set<string>>(new Set(["product", "sipMetrics"]));
  const [selectedView, setSelectedView]         = useState("Priority View");

  const [sortCol, setSortCol] = useState<string | null>("poPriorityNum");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage]       = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const activeGroupsWithCols = useMemo(
    () => COLUMN_GROUPS.filter((g) => visibleGroups.has(g.id)).map((g) => ({
      ...g,
      activeCols: g.columns.filter((c) => !hiddenCols.has(c.id)),
    })),
    [visibleGroups, hiddenCols]
  );

  const priorityNum = (p: PoPriority) => p === "high" ? 3 : p === "medium" ? 2 : 1;

  const filteredData = useMemo(() => {
    let d = ALL_DATA;
    if (appliedFilters.brand !== "all")     d = d.filter((r) => r.brand === appliedFilters.brand);
    if (appliedFilters.plcStatus !== "all") d = d.filter((r) => r.plcStatus === appliedFilters.plcStatus);
    if (appliedFilters.priority !== "all")  d = d.filter((r) => r.poPriority === appliedFilters.priority);
    if (appliedFilters.search.trim()) {
      const q = appliedFilters.search.trim().toLowerCase();
      d = d.filter((r) => r.styleCode.toLowerCase().includes(q) || r.styleLongDesc.toLowerCase().includes(q));
    }
    if (sortCol && sortDir) {
      d = [...d].sort((a, b) => {
        const getVal = (row: typeof a) =>
          sortCol === "poPriorityNum" ? priorityNum(row.poPriority) : (row as any)[sortCol];
        const av = getVal(a), bv = getVal(b);
        if (typeof av === "number" && typeof bv === "number")
          return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }
    return d;
  }, [appliedFilters, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const pageData   = useMemo(
    () => filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [filteredData, page, rowsPerPage]
  );

  const summary = useMemo(() => {
    const withDef = filteredData.filter((r) => r.deficit > 0);
    const highCnt = filteredData.filter((r) => r.poPriority === "high").length;
    const medCnt  = filteredData.filter((r) => r.poPriority === "medium").length;
    return {
      total: filteredData.length,
      withDeficit: withDef.length,
      totalDeficit: withDef.reduce((s, r) => s + r.deficit, 0),
      totalOrder: filteredData.reduce((s, r) => s + r.suggestedOrderQty, 0),
      highPriority: highCnt,
      medPriority: medCnt,
    };
  }, [filteredData]);

  const allBrands   = [...new Set(ALL_DATA.map((r) => r.brand))].sort();
  const allPlcStats = [...new Set(ALL_DATA.map((r) => r.plcStatus))].sort();

  const toggleVisibleGroup = (id: string) => {
    if (id === "product") return;
    setVisibleGroups((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setPage(1);
  };
  const toggleColInGroup = (colId: string) => {
    setHiddenCols((prev) => { const n = new Set(prev); n.has(colId) ? n.delete(colId) : n.add(colId); return n; });
  };
  const toggleCollapsed = (id: string) => {
    setCollapsedGroups((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const togglePanel = (id: string) => {
    setExpandedPanelGroups((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const applyView = (name: string) => {
    const cfg = SAVED_VIEW_CONFIGS[name];
    if (!cfg) return;
    setVisibleGroups(new Set(["product", ...cfg.visibleGroups]));
    setHiddenCols(new Set(cfg.hiddenCols));
    setSelectedView(name);
    setPage(1);
  };
  const handleSort = (col: ColDef) => {
    if (!col.numeric && col.id !== "poPriority") return;
    const sortId = col.id === "poPriority" ? "poPriorityNum" : col.id;
    if (sortCol !== sortId) { setSortCol(sortId); setSortDir("desc"); }
    else if (sortDir === "desc") setSortDir("asc");
    else { setSortCol(null); setSortDir(null); }
  };
  const handleApply = () => { setApplied(filters); setPage(1); };
  const handleClear = () => { const e = { brand:"all", plcStatus:"all", priority:"all", search:"" }; setFilters(e); setApplied(e); setPage(1); };
  const handleReset = () => {
    handleClear();
    setVisibleGroups(new Set(DEFAULT_VISIBLE_GROUPS));
    setHiddenCols(new Set(DEFAULT_HIDDEN_COLS));
    setCollapsedGroups(new Set());
    setSortCol("poPriorityNum"); setSortDir("desc");
    setPage(1); setRowsPerPage(25); setSelectedView("Priority View");
  };
  const handleExport = () => {
    const exportCols = activeGroupsWithCols.flatMap((g) => collapsedGroups.has(g.id) ? [] : g.activeCols);
    const header = exportCols.map((c) => c.label).join(",");
    const rows = filteredData.map((r) =>
      exportCols.map((c) => { const v = (r as any)[c.id]; return typeof v === "string" && v.includes(",") ? `"${v}"` : (v ?? ""); }).join(",")
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([[header, ...rows].join("\n")], { type: "text/csv" }));
    a.download = "sip_planning_enhanced.csv"; a.click();
  };

  const renderCell = (col: ColDef, val: any, row: typeof ALL_DATA[0]) => {
    if (col.id === "poPriority") {
      const cfg = PRIORITY_CFG[val as PoPriority];
      return (
        <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border", cfg.cls)}>
          <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", cfg.dot)} />
          {cfg.label}
        </span>
      );
    }
    if (val === undefined || val === null || val === "") return "—";
    if (col.id === "plcStatus")
      return <Badge className={cn("text-[9px] font-bold border-none h-5 px-2", PLC_COLORS[val] ?? "bg-slate-100 text-slate-600")}>{val}</Badge>;
    if (col.id === "reorderableFlag")
      return val === 1
        ? <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-bold h-5 px-2">YES</Badge>
        : <Badge className="bg-slate-100 text-slate-400 border-none text-[9px] font-bold h-5 px-2">NO</Badge>;
    if (col.id === "deficit") {
      const isBelowSafety = row.currentStock < row.requiredStock * 0.5;
      return (
        <span className="inline-flex items-center gap-1.5 flex-wrap">
          <span className={cn("font-bold tabular-nums text-xs",
            Number(val) > 500 ? "text-red-600" : Number(val) > 100 ? "text-orange-500" : "text-slate-400"
          )}>
            {Number(val).toLocaleString()}
          </span>
          {isBelowSafety && Number(val) > 0 && (
            <span className="text-[9px] font-bold bg-red-100 text-red-700 rounded px-1 py-px leading-tight">Below Safety</span>
          )}
        </span>
      );
    }
    if (col.id === "storeWos") {
      const wos = Number(val);
      return (
        <span className="inline-flex items-center gap-1">
          <span className={cn("tabular-nums", wos < 2 ? "text-red-600 font-bold" : wos < 4 ? "text-orange-500 font-semibold" : "text-slate-600")}>{val}</span>
          {wos < 3 && <span className="text-[9px] font-bold bg-red-100 text-red-700 rounded px-1 py-px leading-tight">Low WOS</span>}
        </span>
      );
    }
    if (col.id === "salesVelocity") {
      const v = Number(val);
      return (
        <span className="inline-flex items-center gap-1">
          <span className="tabular-nums text-slate-600">{v.toLocaleString()}</span>
          {v > 2500 && (
            <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 rounded px-1 py-px leading-tight flex items-center gap-0.5">
              <TrendingUp size={8} />High
            </span>
          )}
        </span>
      );
    }
    if (col.id === "suggestedOrderQty" && Number(val) > 0)
      return <span className="font-bold text-primary tabular-nums">{Number(val).toLocaleString()}</span>;
    if (col.currency) return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (col.numeric && typeof val === "number") {
      if (Number.isInteger(val)) return val.toLocaleString();
      return val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    }
    return String(val);
  };

  const SortIcon = ({ col }: { col: ColDef }) => {
    const sortId = col.id === "poPriority" ? "poPriorityNum" : col.id;
    const canSort = col.numeric || col.id === "poPriority";
    if (!canSort) return null;
    return (
      <span className="ml-1 inline-flex opacity-60">
        {sortCol === sortId ? sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />
          : <ChevronsUpDown size={10} className="opacity-50" />}
      </span>
    );
  };

  interface FlatCol { col: ColDef; groupId: string; frozenIdx: number | null }
  const flatHeaderCols = useMemo<FlatCol[]>(() => {
    let fi = 0;
    return activeGroupsWithCols.flatMap((g) => {
      if (collapsedGroups.has(g.id)) return [{ col: { id: `${g.id}__c`, label: "···" } as ColDef, groupId: g.id, frozenIdx: null }];
      return g.activeCols.map((col) => {
        const isFrozen = !!col.frozen;
        const idx = isFrozen ? fi++ : null;
        return { col, groupId: g.id, frozenIdx: idx };
      });
    });
  }, [activeGroupsWithCols, collapsedGroups]);

  return (
    <MainLayout>
      <div className="space-y-4 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">SIP Planning</h1>
              <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full tracking-wide">ENHANCED</span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {filteredData.length} styles ·{" "}
              <span className="text-red-600 font-semibold">{summary.highPriority} High</span> ·{" "}
              <span className="text-amber-600 font-semibold">{summary.medPriority} Medium</span> ·{" "}
              {summary.totalOrder.toLocaleString()} units to order
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" /> Export
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Save className="h-3.5 w-3.5" /> Save View
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
          </div>
        </div>

        {/* Priority summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "High Priority",     value: summary.highPriority, color: "text-red-600",    bg: "bg-red-50",     border: "border-red-200", icon: AlertCircle },
            { label: "Medium Priority",   value: summary.medPriority,  color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-200", icon: AlertTriangle },
            { label: "Total Deficit",     value: summary.totalDeficit.toLocaleString(), color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: AlertCircle },
            { label: "Units to Order",    value: summary.totalOrder.toLocaleString(),   color: "text-primary",    bg: "bg-primary/10", border: "border-primary/20", icon: ShoppingCart },
          ].map(({ label, value, color, bg, border, icon: Icon }) => (
            <Card key={label} className={cn("shadow-none border", border)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", bg)}>
                  <Icon size={16} className={color} />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className={cn("text-xl font-bold leading-tight tabular-nums", color)}>{value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1 min-w-[130px]">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Brand</label>
                <Select value={filters.brand} onValueChange={(v) => setFilters((p) => ({ ...p, brand: v }))}>
                  <SelectTrigger className="h-8 text-[11px] border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-[11px]">All</SelectItem>
                    {allBrands.map((b) => <SelectItem key={b} value={b} className="text-[11px]">{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1 min-w-[130px]">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PLC Status</label>
                <Select value={filters.plcStatus} onValueChange={(v) => setFilters((p) => ({ ...p, plcStatus: v }))}>
                  <SelectTrigger className="h-8 text-[11px] border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-[11px]">All</SelectItem>
                    {allPlcStats.map((s) => <SelectItem key={s} value={s} className="text-[11px]">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1 min-w-[130px]">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">PO Priority</label>
                <Select value={filters.priority} onValueChange={(v) => setFilters((p) => ({ ...p, priority: v }))}>
                  <SelectTrigger className="h-8 text-[11px] border-slate-200 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-[11px]">All</SelectItem>
                    <SelectItem value="high" className="text-[11px]">🔴 High</SelectItem>
                    <SelectItem value="medium" className="text-[11px]">🟠 Medium</SelectItem>
                    <SelectItem value="low" className="text-[11px]">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1 min-w-[220px]">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Style Code / Description</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                    placeholder="Search code or description…" className="h-8 pl-7 text-[11px] border-slate-200 bg-white" />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <Button size="sm" className="h-8 text-[11px] gap-1" onClick={handleApply}>Apply</Button>
                <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={handleClear}>Clear</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Column groups toggle */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Zap size={11} /> Column Groups
              </span>
              {COLUMN_GROUPS.map((g) => {
                const isOn  = visibleGroups.has(g.id);
                const isSip = g.id === "sipMetrics";
                const lock  = g.id === "product";
                return (
                  <label key={g.id}
                    className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer text-[11px] font-semibold transition-all select-none",
                      isOn && isSip ? "bg-red-600 text-white border-red-700" :
                      isOn ? "bg-primary/10 text-primary border-primary/25" :
                      "bg-white text-slate-500 border-slate-200 hover:border-primary/30",
                      lock && "cursor-default opacity-70"
                    )}
                  >
                    {!lock && (
                      <Checkbox
                        checked={isOn}
                        onCheckedChange={() => toggleVisibleGroup(g.id)}
                        className="h-3 w-3 border-current data-[state=checked]:bg-current"
                      />
                    )}
                    {g.label}
                    {isSip && <span className="ml-1 text-[9px] font-bold bg-white/30 rounded px-1">NEW</span>}
                    {!isSip && (
                      <Badge variant="outline" className={cn("text-[9px] px-1.5 h-4 border-none ml-0.5", isOn ? "bg-white/30 text-current" : "bg-slate-100 text-slate-400")}>
                        {g.columns.length}
                      </Badge>
                    )}
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold" onClick={() => setCustomizeOpen(true)}>
            <SlidersHorizontal className="h-3.5 w-3.5" /> Customize Columns
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Saved View:</span>
            <Select value={selectedView} onValueChange={applyView}>
              <SelectTrigger className="h-7 text-[11px] w-[200px] border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAVED_VIEW_NAMES.map((v) => <SelectItem key={v} value={v} className="text-[11px]">{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <Card className="rounded-xl border shadow-sm overflow-hidden bg-background">
          <CardContent className="p-0">
            {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <p className="text-sm font-medium text-slate-500">No styles match the filters.</p>
                <Button size="sm" variant="outline" onClick={handleClear} className="mt-4 text-xs gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-auto max-h-[calc(100vh-520px)]">
                <table className="border-collapse text-[11px] w-max min-w-full">
                  <thead className="sticky top-0 z-20">
                    {/* Row 1: group names */}
                    <tr>
                      <th rowSpan={2} className="sticky left-0 z-30 bg-slate-100 border border-border/50 w-10 min-w-[40px]" />
                      {activeGroupsWithCols.map((group) => {
                        const isCollapsed = collapsedGroups.has(group.id);
                        const colSpan = isCollapsed ? 1 : Math.max(1, group.activeCols.length);
                        const isSip   = group.id === "sipMetrics";
                        return (
                          <th key={group.id} colSpan={colSpan}
                            onClick={() => toggleCollapsed(group.id)}
                            className={cn(
                              "border border-border/50 px-3 py-1.5 text-center text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none transition-colors",
                              isSip ? "bg-red-600 text-white hover:bg-red-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                            )}
                          >
                            <span className="flex items-center justify-center gap-1.5">
                              {group.label}
                              {isSip && <span className="text-[8px] bg-white/30 rounded px-1">ENHANCED</span>}
                              {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                    {/* Row 2: column names */}
                    <tr>
                      {flatHeaderCols.map(({ col, groupId, frozenIdx }) => {
                        const isSip    = groupId === "sipMetrics";
                        const leftClass = frozenIdx !== null ? FROZEN_LEFTS[frozenIdx] : undefined;
                        const canSort  = col.numeric || col.id === "poPriority";
                        return (
                          <th key={col.id}
                            onClick={() => handleSort(col)}
                            className={cn(
                              "border border-border/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap transition-colors",
                              canSort ? "cursor-pointer select-none hover:bg-slate-50" : "",
                              isSip ? "bg-red-50 text-red-800 border-red-200" : "bg-slate-50 text-slate-500",
                              frozenIdx !== null && leftClass && `sticky ${leftClass} z-20`,
                              col.numeric ? "text-right" : "text-left",
                            )}
                          >
                            <span className="inline-flex items-center">
                              {col.label} <SortIcon col={col} />
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((row, ri) => {
                      const priority   = row.poPriority as PoPriority;
                      const canNavigate = priority === "high" || priority === "medium";
                      let frozenTrack  = 0;
                      return (
                        <tr key={`row-${ri}`}
                          className={cn(
                            "h-9 border-b border-border/30 transition-colors",
                            ri % 2 === 0 ? "bg-background" : "bg-muted/[0.03]",
                            priority === "high"   && "border-l-2 border-l-red-400",
                            priority === "medium" && "border-l-2 border-l-amber-400",
                          )}
                        >
                          {/* Nav button */}
                          <td className="sticky left-0 z-10 bg-white border border-border/20 w-10 min-w-[40px] text-center">
                            {canNavigate ? (
                              <button
                                onClick={() => navigate(
                                  `/reports/sip-planning-enhanced/create-po?vendor=${encodeURIComponent(row.primaryVendorName)}` +
                                  `&style=${row.styleCode}&desc=${encodeURIComponent(row.styleLongDesc)}` +
                                  `&priority=${priority}`
                                )}
                                title={`${PRIORITY_CFG[priority].label} priority — create PO`}
                                className={cn(
                                  "p-1 rounded transition-colors",
                                  priority === "high"
                                    ? "text-red-500 hover:bg-red-50 hover:text-red-700"
                                    : "text-amber-500 hover:bg-amber-50 hover:text-amber-700"
                                )}
                              >
                                <ChevronRight size={13} />
                              </button>
                            ) : (
                              <span title="Low priority — no PO action required" className="flex items-center justify-center">
                                <LockKeyhole size={11} className="text-slate-300" />
                              </span>
                            )}
                          </td>
                          {activeGroupsWithCols.flatMap((group) => {
                            const isCollapsed = collapsedGroups.has(group.id);
                            if (isCollapsed) return [<td key={`${group.id}-c`} className="border border-border/20 px-2 text-center text-slate-200">·</td>];
                            return group.activeCols.map((col) => {
                              const isFrozen  = !!col.frozen;
                              const frozenIdx = isFrozen ? frozenTrack++ : null;
                              const leftClass = frozenIdx !== null ? FROZEN_LEFTS[frozenIdx] : undefined;
                              const val       = (row as any)[col.id];
                              const rowBg     = ri % 2 === 0 ? "bg-background" : "bg-muted/[0.03]";
                              const isSipCol  = !!col.sipCol;
                              return (
                                <td key={col.id}
                                  className={cn(
                                    "border border-border/20 px-3 py-1 whitespace-nowrap",
                                    rowBg,
                                    isFrozen && leftClass && `sticky ${leftClass} z-10`,
                                    frozenIdx === 0 && "font-mono font-medium text-primary text-[10px]",
                                    frozenIdx === 1 && "font-mono font-medium text-[10px]",
                                    col.numeric && "text-right tabular-nums text-slate-600",
                                    isSipCol && "bg-red-50/20",
                                    col.id === "deficit" && Number(val) > 500 && "bg-red-100/60",
                                    col.id === "deficit" && Number(val) > 100 && Number(val) <= 500 && "bg-orange-50/60",
                                  )}
                                >
                                  {renderCell(col, val, row)}
                                </td>
                              );
                            });
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/40 bg-slate-50/60">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Rows per page:</span>
                  <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setPage(1); }}>
                    <SelectTrigger className="h-7 w-16 text-[11px] border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {[10, 25, 50, 100].map((n) => <SelectItem key={n} value={String(n)} className="text-[11px]">{n}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">
                    {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredData.length)} of {filteredData.length}
                  </span>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft size={12} />
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-[11px]" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                    <ChevronRight size={12} />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Note */}
        <p className="text-[11px] text-muted-foreground">
          <span className="font-semibold text-red-600">High</span> and{" "}
          <span className="font-semibold text-amber-600">Medium</span> priority rows are actionable — click the{" "}
          <ChevronRight size={11} className="inline" /> to create a PO.{" "}
          <LockKeyhole size={10} className="inline text-slate-400" /> Low priority rows are locked from ordering.
        </p>

        {/* Customize Columns Sheet */}
        <Sheet open={customizeOpen} onOpenChange={setCustomizeOpen}>
          <SheetContent side="right" className="w-80 overflow-y-auto">
            <SheetHeader><SheetTitle className="text-sm">Customize Columns</SheetTitle></SheetHeader>
            <div className="mt-4 space-y-4">
              {COLUMN_GROUPS.map((g) => {
                const isExpanded = expandedPanelGroups.has(g.id);
                const isOn = visibleGroups.has(g.id);
                return (
                  <div key={g.id} className="border border-border/40 rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors"
                      onClick={() => togglePanel(g.id)}
                    >
                      <div className="flex items-center gap-2">
                        {g.id !== "product" && (
                          <Checkbox checked={isOn} onCheckedChange={() => toggleVisibleGroup(g.id)} className="h-3.5 w-3.5"
                            onClick={(e) => e.stopPropagation()} />
                        )}
                        <span className="text-[11px] font-semibold">{g.label}</span>
                      </div>
                      {isExpanded ? <ChevronDown size={12} className="text-slate-400" /> : <ChevronRight size={12} className="text-slate-400" />}
                    </button>
                    {isExpanded && (
                      <div className="p-3 space-y-1.5">
                        {g.columns.map((col) => (
                          <label key={col.id} className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                              checked={!hiddenCols.has(col.id)}
                              onCheckedChange={() => toggleColInGroup(col.id)}
                              className="h-3 w-3"
                            />
                            <span className="text-[11px] text-slate-700">{col.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </MainLayout>
  );
}
