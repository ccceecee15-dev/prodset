import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Download, Save, RotateCcw, ChevronRight, ChevronLeft,
  SlidersHorizontal, ChevronDown, ChevronUp, Search,
  ChevronsUpDown, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Reference Data ────────────────────────────────────────────────────────────
const BRANDS = ["APPLE", "BOSE", "SONY", "JBL", "SAMSUNG", "ANKER"];
const PLC_STATUSES = ["Active", "Launched", "Ranging", "Phase Out", "Discontinued"];
const TOP_BUCKETS = ["Top 100", "Top 250", "Top 500", "Tail"];
const PRICE_STATUS_CODES = ["REG", "PROMO", "CLEAR"];
const PRICE_STATUS_DESCS: Record<string, string> = {
  REG: "REGULAR", PROMO: "PROMOTION", CLEAR: "CLEARANCE",
};

// Realistic product catalogue per brand
const PRODUCT_CATALOGUE: Record<string, { desc: string; baseRetail: number; vendorCode: string; vendorName: string }[]> = {
  APPLE: [
    { desc: "APPLE LB AIRPODS PRO GEN 3 TRUE WIRELESS IN EAR EARBUDS", baseRetail: 299.99, vendorCode: "011286", vendorName: "INGRAM MICRO, INC." },
    { desc: "APPLE AIRPODS 4 TRUE WIRELESS EARBUDS WITH ACTIVE NOISE CANCELLATION", baseRetail: 199.99, vendorCode: "011286", vendorName: "INGRAM MICRO, INC." },
    { desc: "APPLE AIRPODS MAX OVER EAR WIRELESS HEADPHONES MIDNIGHT", baseRetail: 549.99, vendorCode: "011286", vendorName: "INGRAM MICRO, INC." },
    { desc: "APPLE MAGSAFE CHARGER 1M USB-C CABLE", baseRetail: 39.99, vendorCode: "011286", vendorName: "INGRAM MICRO, INC." },
    { desc: "APPLE USB-C TO LIGHTNING CABLE 1M", baseRetail: 29.99, vendorCode: "011286", vendorName: "INGRAM MICRO, INC." },
    { desc: "APPLE 20W USB-C POWER ADAPTER", baseRetail: 25.99, vendorCode: "011286", vendorName: "INGRAM MICRO, INC." },
  ],
  BOSE: [
    { desc: "BOSE QUIETCOMFORT 45 WIRELESS NOISE CANCELLING HEADPHONES BLACK", baseRetail: 329.95, vendorCode: "024501", vendorName: "BOSE CORPORATION" },
    { desc: "BOSE QUIETCOMFORT EARBUDS II TRUE WIRELESS IN EAR EARBUDS", baseRetail: 279.95, vendorCode: "024501", vendorName: "BOSE CORPORATION" },
    { desc: "BOSE SOUNDLINK FLEX PORTABLE BLUETOOTH SPEAKER BLACK", baseRetail: 149.95, vendorCode: "024501", vendorName: "BOSE CORPORATION" },
    { desc: "BOSE SPORT EARBUDS TRUE WIRELESS IN EAR HEADPHONES", baseRetail: 179.95, vendorCode: "024501", vendorName: "BOSE CORPORATION" },
    { desc: "BOSE SOUNDLINK REVOLVE+ II PORTABLE SPEAKER TRIPLE BLACK", baseRetail: 299.95, vendorCode: "024501", vendorName: "BOSE CORPORATION" },
  ],
  SONY: [
    { desc: "SONY WH-1000XM5 WIRELESS NOISE CANCELLING OVER EAR HEADPHONES BLACK", baseRetail: 349.99, vendorCode: "038812", vendorName: "SONY ELECTRONICS INC." },
    { desc: "SONY WF-1000XM5 TRUE WIRELESS EARBUDS NOISE CANCELLING BLACK", baseRetail: 279.99, vendorCode: "038812", vendorName: "SONY ELECTRONICS INC." },
    { desc: "SONY LINKBUDS S TRUE WIRELESS NOISE CANCELLING EARBUDS WHITE", baseRetail: 149.99, vendorCode: "038812", vendorName: "SONY ELECTRONICS INC." },
    { desc: "SONY SRS-XB100 COMPACT PORTABLE BLUETOOTH SPEAKER BLACK", baseRetail: 59.99, vendorCode: "038812", vendorName: "SONY ELECTRONICS INC." },
    { desc: "SONY SRS-XE300 PORTABLE WIRELESS SPEAKER OLIVE", baseRetail: 149.99, vendorCode: "038812", vendorName: "SONY ELECTRONICS INC." },
  ],
  JBL: [
    { desc: "JBL TUNE 770NC WIRELESS OVER-EAR NOISE CANCELLING HEADPHONES BLACK", baseRetail: 129.99, vendorCode: "052193", vendorName: "HARMAN INTERNATIONAL" },
    { desc: "JBL LIVE FREE 2 TWS TRUE WIRELESS EARBUDS WITH NOISE CANCELLING", baseRetail: 99.99, vendorCode: "052193", vendorName: "HARMAN INTERNATIONAL" },
    { desc: "JBL CHARGE 5 PORTABLE WATERPROOF BLUETOOTH SPEAKER BLACK", baseRetail: 179.99, vendorCode: "052193", vendorName: "HARMAN INTERNATIONAL" },
    { desc: "JBL FLIP 6 PORTABLE WATERPROOF BLUETOOTH SPEAKER BLACK", baseRetail: 119.99, vendorCode: "052193", vendorName: "HARMAN INTERNATIONAL" },
    { desc: "JBL TOUR PRO 2 TRUE WIRELESS NOISE CANCELLING EARBUDS BLACK", baseRetail: 219.99, vendorCode: "052193", vendorName: "HARMAN INTERNATIONAL" },
  ],
  SAMSUNG: [
    { desc: "SAMSUNG GALAXY BUDS3 PRO TRUE WIRELESS NOISE CANCELLING EARBUDS WHITE", baseRetail: 249.99, vendorCode: "061744", vendorName: "SAMSUNG ELECTRONICS AMERICA" },
    { desc: "SAMSUNG GALAXY BUDS3 TRUE WIRELESS EARBUDS SILVER", baseRetail: 169.99, vendorCode: "061744", vendorName: "SAMSUNG ELECTRONICS AMERICA" },
    { desc: "SAMSUNG 45W USB-C POWER ADAPTER SUPER FAST CHARGING", baseRetail: 39.99, vendorCode: "061744", vendorName: "SAMSUNG ELECTRONICS AMERICA" },
    { desc: "SAMSUNG USB-C TO USB-C CABLE 1.8M 5A FAST CHARGING", baseRetail: 29.99, vendorCode: "061744", vendorName: "SAMSUNG ELECTRONICS AMERICA" },
  ],
  ANKER: [
    { desc: "ANKER SOUNDCORE LIFE Q35 WIRELESS NOISE CANCELLING HEADPHONES", baseRetail: 79.99, vendorCode: "073328", vendorName: "ANKER INNOVATIONS LIMITED" },
    { desc: "ANKER SOUNDCORE LIBERTY 4 NC TRUE WIRELESS EARBUDS BLACK", baseRetail: 89.99, vendorCode: "073328", vendorName: "ANKER INNOVATIONS LIMITED" },
    { desc: "ANKER 737 POWER BANK 24000MAH 140W PORTABLE CHARGER", baseRetail: 99.99, vendorCode: "073328", vendorName: "ANKER INNOVATIONS LIMITED" },
    { desc: "ANKER NANO 65W USB-C COMPACT FAST CHARGER BLACK", baseRetail: 45.99, vendorCode: "073328", vendorName: "ANKER INNOVATIONS LIMITED" },
    { desc: "ANKER 548 USB-C HUB 7-IN-1 DATA HUB DARK BLUE", baseRetail: 49.99, vendorCode: "073328", vendorName: "ANKER INNOVATIONS LIMITED" },
  ],
};

// ─── Column Schema ─────────────────────────────────────────────────────────────
interface ColDef {
  id: string;
  label: string;
  frozen?: boolean;
  numeric?: boolean;
  pct?: boolean;
  currency?: boolean;
  defaultHidden?: boolean;
}
interface GroupDef {
  id: string;
  label: string;
  defaultVisible: boolean;
  columns: ColDef[];
}

const COLUMN_GROUPS: GroupDef[] = [
  {
    id: "product",
    label: "Product Attribute",
    defaultVisible: true,
    columns: [
      { id: "rank",              label: "Rank",                         frozen: true,  numeric: true },
      { id: "topBucket",         label: "TOP Bucket" },
      { id: "styleCode",         label: "Style Code",                   frozen: true },
      { id: "styleLongDesc",     label: "Style Long Desc" },
      { id: "brand",             label: "Brand" },
      { id: "upcNumber",         label: "UPC Number – Vendor",          defaultHidden: true },
      { id: "chainCurrentRetail",label: "Style Chain Current Retail",   currency: true },
      { id: "primaryVendorCode", label: "Primary Vendor Code",          defaultHidden: true },
      { id: "primaryVendorName", label: "Primary Vendor Name" },
      { id: "primaryVendorStyle",label: "Primary Vendor Style",         defaultHidden: true },
      { id: "plcStatus",         label: "PLC Status" },
      { id: "rtvAttribute",      label: "RTV Attribute",                defaultHidden: true },
      { id: "reorderableFlag",   label: "Style Reorderable Flag",       defaultHidden: true },
      { id: "primaryCurrentCost",label: "Primary Current Cost",         currency: true, defaultHidden: true },
    ],
  },
  {
    id: "logistics",
    label: "Logistics",
    defaultVisible: false,
    columns: [
      { id: "styleHeight", label: "Style Height", numeric: true },
      { id: "styleWidth",  label: "Style Width",  numeric: true },
      { id: "styleDepth",  label: "Style Depth",  numeric: true },
      { id: "styleWeight", label: "Style Weight", numeric: true },
    ],
  },
  {
    id: "salesUnits",
    label: "Sales Units",
    defaultVisible: true,
    columns: [
      { id: "wtd",            label: "WTD",              numeric: true },
      { id: "lw",             label: "LW",               numeric: true },
      { id: "l2w",            label: "L2W",              numeric: true },
      { id: "l3w",            label: "L3W",              numeric: true },
      { id: "l4w",            label: "L4W",              numeric: true },
      { id: "avgWeeklySales", label: "Avg Weekly Sales", numeric: true },
      { id: "totalYearSales", label: "Total Year Sales", numeric: true },
    ],
  },
  {
    id: "stockUnits",
    label: "Stock Units",
    defaultVisible: true,
    columns: [
      { id: "presentationStock", label: "Presentation Stock", numeric: true },
      { id: "storeOnhand",       label: "Store Onhand",       numeric: true },
      { id: "storeIntransit",    label: "Store Intransit",    numeric: true },
      { id: "dcOnhand",          label: "DC Onhand",          numeric: true },
      { id: "dcAllocation",      label: "DC Allocation",      numeric: true },
    ],
  },
  {
    id: "wos",
    label: "WOS",
    defaultVisible: false,
    columns: [
      { id: "storeWos", label: "Store WOS", numeric: true },
      { id: "whWos",    label: "WH WOS",    numeric: true },
    ],
  },
  {
    id: "availability",
    label: "Store Availability",
    defaultVisible: false,
    columns: [
      { id: "availabilityOhPct",    label: "Availability OH %",      numeric: true, pct: true },
      { id: "wowAvailabilityChange",label: "WOW Availability Change", numeric: true, pct: true },
    ],
  },
  {
    id: "promotion",
    label: "Promotion",
    defaultVisible: false,
    columns: [
      { id: "priceStatusCode", label: "Style Price Status Code" },
      { id: "priceStatusDesc", label: "Style Price Status Description" },
      { id: "promoFlag",       label: "Style Promo Flag" },
    ],
  },
  {
    id: "orders",
    label: "Orders",
    defaultVisible: false,
    columns: [
      { id: "orderMultiple",      label: "Style Order Multiple",         numeric: true },
      { id: "distributionMultiple",label: "Style Distribution Multiple", numeric: true },
      { id: "firstReceiptDate",   label: "First Receipt Date" },
      { id: "lastReceiptDate",    label: "Last Receipt Date" },
      { id: "grUnitsL8w",         label: "GR Units (Last 8 Weeks)",      numeric: true },
      { id: "onOrderL8w",         label: "On Order Units (Last 8 Weeks)", numeric: true },
      { id: "onOrderTotal",       label: "On Order Units (Total)",       numeric: true },
    ],
  },
  {
    id: "salesByStore",
    label: "Sales by Store",
    defaultVisible: false,
    columns: [
      { id: "storesWithPresStock", label: "Count of Stores With Pres Stock",         numeric: true },
      { id: "salesPerStore1w",     label: "Sales Units Per Store (1 Week Ago)",      numeric: true },
      { id: "salesPerStore2w",     label: "Sales Units Per Store (2 Weeks Ago)",     numeric: true },
      { id: "salesPerStore3w",     label: "Sales Units Per Store (3 Weeks Ago)",     numeric: true },
      { id: "salesPerStore4w",     label: "Sales Units Per Store (4 Weeks Ago)",     numeric: true },
      { id: "salesPerStore4wSum",  label: "Sales Units Per Store (4 Weeks Summed)",  numeric: true },
    ],
  },
];

// ─── Saved Views ───────────────────────────────────────────────────────────────
type ViewConfig = { visibleGroups: string[]; hiddenCols: string[] };
const SAVED_VIEW_CONFIGS: Record<string, ViewConfig> = {
  "Merchandising View":  { visibleGroups: ["product", "salesUnits", "stockUnits", "promotion"], hiddenCols: ["upcNumber","primaryVendorCode","primaryVendorStyle","rtvAttribute","reorderableFlag","primaryCurrentCost"] },
  "Inventory View":      { visibleGroups: ["product", "stockUnits", "wos", "orders"], hiddenCols: ["upcNumber","primaryVendorCode","primaryVendorStyle","rtvAttribute","reorderableFlag","primaryCurrentCost"] },
  "Performance View":    { visibleGroups: ["product", "salesUnits", "availability", "wos"], hiddenCols: ["upcNumber","primaryVendorCode","primaryVendorStyle","rtvAttribute","reorderableFlag","primaryCurrentCost"] },
};
const SAVED_VIEW_NAMES = Object.keys(SAVED_VIEW_CONFIGS);

// ─── Mock Data Generator ───────────────────────────────────────────────────────
function rnd(min: number, max: number, dp = 0): number {
  const v = Math.random() * (max - min) + min;
  return dp ? +v.toFixed(dp) : Math.floor(v);
}
function vary(base: number, pct: number): number {
  return Math.max(0, Math.round(base * (1 + (Math.random() * 2 - 1) * pct)));
}
function fmtDate(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
}
function randomDate(startDaysAgo: number, endDaysAgo: number): Date {
  const ms = Date.now() - rnd(endDaysAgo, startDaysAgo) * 86400000;
  return new Date(ms);
}

function generateMockData(count: number) {
  const rows = [];
  // Build a flat product pool cycling through the catalogue
  const catalogueEntries: { brand: string; desc: string; baseRetail: number; vendorCode: string; vendorName: string }[] = [];
  for (const brand of BRANDS) {
    for (const p of PRODUCT_CATALOGUE[brand]) {
      catalogueEntries.push({ brand, ...p });
    }
  }

  for (let i = 0; i < count; i++) {
    const product = catalogueEntries[i % catalogueEntries.length];
    const retail  = +(product.baseRetail * (0.9 + Math.random() * 0.2)).toFixed(2);
    const cost    = +(retail * (0.5 + Math.random() * 0.3)).toFixed(2);
    const plc     = PLC_STATUSES[Math.floor(Math.random() * PLC_STATUSES.length)];
    const psc     = Math.random() < 0.75 ? "REG" : Math.random() < 0.6 ? "PROMO" : "CLEAR";
    const promoFlag = psc === "PROMO" ? "Y" : "N";

    // Sales – WTD as anchor, siblings within ±25%
    const wtd = rnd(50, 6000);
    const lw  = vary(wtd, 0.25);
    const l2w = vary(wtd, 0.25);
    const l3w = vary(wtd, 0.25);
    const l4w = vary(wtd, 0.25);
    const avgWeeklySales = +((lw + l2w + l3w + l4w) / 4).toFixed(0);
    const totalYearSales = rnd(Math.max(500, avgWeeklySales * 30), Math.min(150000, avgWeeklySales * 60));

    // Stock
    const presStock   = rnd(100, 6000);
    const storeOnhand = rnd(200, 12000);
    const storeIntrans = rnd(100, 8000);
    const dcOnhand    = rnd(1000, 25000);
    const dcAlloc     = rnd(500, 15000);

    // WOS
    const storeWos = rnd(2, 10, 2);
    const whWos    = rnd(4, 15, 2);

    // Availability
    const availOh  = rnd(65, 95, 1);
    const wowChange = rnd(-3, 5, 1);

    // Orders
    const orderMult = [2, 4, 5, 6, 10, 12, 20][Math.floor(Math.random() * 7)];
    const distMult  = [2, 4, 5, 6, 10][Math.floor(Math.random() * 5)];
    const firstRcpt = randomDate(730, 90);
    const lastRcpt  = new Date(firstRcpt.getTime() + rnd(30, 365) * 86400000);
    const grL8w     = rnd(0, 4000);
    const onOrderL8w = rnd(0, 3000);
    const onOrderTotal = rnd(0, 5000);

    // Sales by store
    const storeCount = rnd(50, 300);
    const s1 = rnd(10, 300, 2);
    const s2 = rnd(10, 300, 2);
    const s3 = rnd(10, 300, 2);
    const s4 = rnd(10, 300, 2);
    const s4sum = +((s1 + s2 + s3 + s4)).toFixed(2);

    // Vendor style codes follow brand naming conventions
    const vendorStylePrefixes: Record<string, string> = {
      APPLE: "MF", BOSE: "QC", SONY: "WH", JBL: "TN", SAMSUNG: "GB", ANKER: "A",
    };
    const vsp = vendorStylePrefixes[product.brand] ?? "XX";
    const upc = String(100000000000 + i * 13 + Math.floor(Math.random() * 999));

    rows.push({
      rank:               i + 1,
      topBucket:          i < 100 ? "Top 100" : i < 250 ? "Top 250" : i < 500 ? "Top 500" : "Tail",
      styleCode:          String(1000000 + i * 7 + rnd(1, 6)),
      styleLongDesc:      product.desc,
      brand:              product.brand,
      upcNumber:          upc,
      chainCurrentRetail: retail,
      primaryVendorCode:  product.vendorCode,
      primaryVendorName:  product.vendorName,
      primaryVendorStyle: `${vsp}${String(rnd(1000, 9999))}LL/A`,
      plcStatus:          plc,
      rtvAttribute:       Math.random() > 0.3 ? "NOT RETURNABLE" : "RETURNABLE",
      reorderableFlag:    Math.random() > 0.2 ? 1 : 0,
      primaryCurrentCost: cost,

      styleHeight: rnd(3, 30, 1),
      styleWidth:  rnd(3, 25, 1),
      styleDepth:  rnd(1, 15, 1),
      styleWeight: rnd(50, 1500),

      wtd,
      lw,
      l2w,
      l3w,
      l4w,
      avgWeeklySales,
      totalYearSales,

      presentationStock: presStock,
      storeOnhand,
      storeIntransit:    storeIntrans,
      dcOnhand,
      dcAllocation:      dcAlloc,

      storeWos,
      whWos,

      availabilityOhPct:     availOh,
      wowAvailabilityChange: wowChange,

      priceStatusCode: psc,
      priceStatusDesc: PRICE_STATUS_DESCS[psc],
      promoFlag,

      orderMultiple:       orderMult,
      distributionMultiple:distMult,
      firstReceiptDate:   fmtDate(firstRcpt),
      lastReceiptDate:    fmtDate(lastRcpt),
      grUnitsL8w:         grL8w,
      onOrderL8w,
      onOrderTotal,

      storesWithPresStock: storeCount,
      salesPerStore1w:     s1,
      salesPerStore2w:     s2,
      salesPerStore3w:     s3,
      salesPerStore4w:     s4,
      salesPerStore4wSum:  s4sum,
    });
  }
  return rows;
}

const ALL_DATA = generateMockData(300);

const PLC_COLORS: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Launched: "bg-blue-100 text-blue-700",
  Ranging: "bg-violet-100 text-violet-700",
  "Phase Out": "bg-amber-100 text-amber-700",
  Discontinued: "bg-red-100 text-red-700",
};

type SortDir = "asc" | "desc" | null;

const DEFAULT_VISIBLE_GROUPS = new Set(
  COLUMN_GROUPS.filter((g) => g.defaultVisible).map((g) => g.id)
);
const DEFAULT_HIDDEN_COLS = new Set(
  COLUMN_GROUPS.flatMap((g) => g.columns.filter((c) => c.defaultHidden).map((c) => c.id))
);

// frozen offset map: rank=0→left-0 (w-[60px]), styleCode=1→left-[60px] (w-[120px])
const FROZEN_LEFTS = ["left-0", "left-[60px]"];

export default function StyleAnalysis() {
  const [filters, setFilters] = useState({
    brand: "all", plcStatus: "all", search: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [visibleGroups, setVisibleGroups] = useState<Set<string>>(new Set(DEFAULT_VISIBLE_GROUPS));
  const [hiddenCols, setHiddenCols]       = useState<Set<string>>(new Set(DEFAULT_HIDDEN_COLS));
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const [customizeOpen, setCustomizeOpen]         = useState(false);
  const [expandedPanelGroups, setExpandedPanelGroups] = useState<Set<string>>(new Set(["product"]));
  const [selectedView, setSelectedView]           = useState("");

  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage]       = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // ── Active groups/cols ────────────────────────────────────────────────────
  const activeGroupsWithCols = useMemo(
    () =>
      COLUMN_GROUPS.filter((g) => visibleGroups.has(g.id)).map((g) => ({
        ...g,
        activeCols: g.columns.filter((c) => !hiddenCols.has(c.id)),
      })),
    [visibleGroups, hiddenCols]
  );

  // ── Filtering / sorting ───────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let d = ALL_DATA;
    if (appliedFilters.brand !== "all")     d = d.filter((r) => r.brand === appliedFilters.brand);
    if (appliedFilters.plcStatus !== "all") d = d.filter((r) => r.plcStatus === appliedFilters.plcStatus);
    if (appliedFilters.search.trim()) {
      const q = appliedFilters.search.trim().toLowerCase();
      d = d.filter((r) => r.styleCode.toLowerCase().includes(q) || r.styleLongDesc.toLowerCase().includes(q));
    }
    if (sortCol && sortDir) {
      d = [...d].sort((a, b) => {
        const av = (a as any)[sortCol], bv = (b as any)[sortCol];
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

  // ── Actions ───────────────────────────────────────────────────────────────
  const toggleVisibleGroup = (id: string) => {
    if (id === "product") return;
    setVisibleGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setPage(1);
  };

  const toggleColInGroup = (colId: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      next.has(colId) ? next.delete(colId) : next.add(colId);
      return next;
    });
  };

  const toggleCollapsed = (id: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const togglePanelGroup = (id: string) => {
    setExpandedPanelGroups((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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
    if (!col.numeric) return;
    if (sortCol !== col.id) { setSortCol(col.id); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else { setSortCol(null); setSortDir(null); }
  };

  const handleApply = () => { setAppliedFilters(filters); setPage(1); };
  const handleClear = () => {
    const e = { brand: "all", plcStatus: "all", search: "" };
    setFilters(e); setAppliedFilters(e); setPage(1);
  };
  const handleReset = () => {
    handleClear();
    setVisibleGroups(new Set(DEFAULT_VISIBLE_GROUPS));
    setHiddenCols(new Set(DEFAULT_HIDDEN_COLS));
    setCollapsedGroups(new Set());
    setSortCol(null); setSortDir(null);
    setPage(1); setRowsPerPage(25); setSelectedView("");
  };

  const handleExport = () => {
    const exportCols = activeGroupsWithCols.flatMap((g) =>
      collapsedGroups.has(g.id) ? [] : g.activeCols
    );
    const header = exportCols.map((c) => c.label).join(",");
    const rows = filteredData.map((r) =>
      exportCols.map((c) => {
        const v = (r as any)[c.id];
        return typeof v === "string" && v.includes(",") ? `"${v}"` : (v ?? "");
      }).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "style_analysis.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Cell renderer ─────────────────────────────────────────────────────────
  const renderCell = (col: ColDef, val: any) => {
    if (val === undefined || val === null || val === "") return "—";
    if (col.id === "plcStatus")
      return <Badge className={cn("text-[9px] font-bold border-none h-5 px-2", PLC_COLORS[val] ?? "bg-slate-100 text-slate-600")}>{val}</Badge>;
    if (col.id === "promoFlag")
      return val === "Y"
        ? <Badge className="bg-amber-100 text-amber-700 border-none text-[9px] font-bold h-5 px-2">PROMO</Badge>
        : <span className="text-slate-300 text-[10px]">—</span>;
    if (col.id === "priceStatusCode")
      return <Badge className={cn("text-[9px] font-bold border-none h-5 px-2",
        val === "REG" ? "bg-slate-100 text-slate-600"
        : val === "PROMO" ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-600")}>{val}</Badge>;
    if (col.id === "rtvAttribute")
      return <span className={cn("text-[10px] font-medium", val === "RETURNABLE" ? "text-emerald-600" : "text-slate-500")}>{val}</span>;
    if (col.id === "reorderableFlag")
      return val === 1
        ? <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-bold h-5 px-2">YES</Badge>
        : <Badge className="bg-slate-100 text-slate-400 border-none text-[9px] font-bold h-5 px-2">NO</Badge>;
    if (col.id === "wowAvailabilityChange") {
      const n = Number(val);
      return <span className={cn("font-medium tabular-nums", n > 0 ? "text-emerald-600" : n < 0 ? "text-red-500" : "text-slate-400")}>
        {n > 0 ? "+" : ""}{val}%
      </span>;
    }
    if (col.pct) return `${val}%`;
    if (col.currency) return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (col.numeric && typeof val === "number") {
      // Decimals for WOS and per-store sales
      if (Number.isInteger(val)) return val.toLocaleString();
      return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return String(val);
  };

  // ── Sort icon ─────────────────────────────────────────────────────────────
  const SortIcon = ({ col }: { col: ColDef }) => {
    if (!col.numeric) return null;
    return (
      <span className="ml-1 inline-flex opacity-60">
        {sortCol === col.id
          ? sortDir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />
          : <ChevronsUpDown size={10} className="opacity-50" />}
      </span>
    );
  };

  // ── Build flat header cols with frozen tracking ────────────────────────────
  interface FlatCol { col: ColDef; groupId: string; frozenIdx: number | null }
  const flatHeaderCols = useMemo<FlatCol[]>(() => {
    let fi = 0;
    return activeGroupsWithCols.flatMap((g) => {
      if (collapsedGroups.has(g.id)) return [{ col: { id: `${g.id}__collapsed`, label: "···" } as ColDef, groupId: g.id, frozenIdx: null }];
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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Style Analysis Report</h1>
            <p className="text-sm text-slate-500 mt-0.5">{filteredData.length} styles matched</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleExport}>
              <Download className="h-3.5 w-3.5" /> Export to Excel
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Save className="h-3.5 w-3.5" /> Save View
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={handleReset}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="rounded-xl border shadow-sm bg-background">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-wrap gap-2 flex-1">
                {[
                  { id: "brand",     label: "Brand",      options: BRANDS },
                  { id: "plcStatus", label: "PLC Status",  options: PLC_STATUSES },
                ].map(({ id, label, options }) => (
                  <div key={id} className="flex flex-col gap-1 min-w-[150px]">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</label>
                    <Select value={(filters as any)[id]} onValueChange={(v) => setFilters((p) => ({ ...p, [id]: v }))}>
                      <SelectTrigger className="h-8 text-[11px] font-medium border-slate-200 bg-white">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all" className="text-[11px]">All</SelectItem>
                        {options.map((o) => <SelectItem key={o} value={o} className="text-[11px]">{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                <div className="flex flex-col gap-1 min-w-[220px]">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Style Code / Description</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input value={filters.search} onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                      placeholder="Search code or description…" className="h-8 pl-7 text-[11px] border-slate-200 bg-white" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pb-0.5">
                <Button size="sm" onClick={handleApply} className="h-8 text-[11px] font-bold px-4">Apply Filters</Button>
                <Button size="sm" variant="outline" onClick={handleClear} className="h-8 text-[11px] px-4">Clear</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Column Groups Selector */}
        <Card className="rounded-xl border shadow-sm bg-background">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 shrink-0">
                <Layers className="h-3.5 w-3.5" /> Column Groups
              </div>
              {COLUMN_GROUPS.map((g) => {
                const isOn    = visibleGroups.has(g.id);
                const isFixed = g.id === "product";
                return (
                  <label key={g.id}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border transition-all select-none text-[11px] font-semibold whitespace-nowrap",
                      isOn ? "bg-primary/10 border-primary/30 text-primary" : "border-slate-200 text-slate-500 hover:border-slate-300",
                      isFixed && "cursor-default opacity-70"
                    )}
                  >
                    <Checkbox checked={isOn} disabled={isFixed} onCheckedChange={() => toggleVisibleGroup(g.id)} className="h-3.5 w-3.5" />
                    {g.label}
                    <Badge variant="outline" className={cn("text-[9px] px-1.5 h-4 border-none ml-0.5", isOn ? "bg-primary/15 text-primary" : "bg-slate-100 text-slate-400")}>
                      {g.columns.length}
                    </Badge>
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
            <Select value={selectedView} onValueChange={(v) => applyView(v)}>
              <SelectTrigger className="h-7 text-[11px] w-[190px] border-slate-200">
                <SelectValue placeholder="Select view…" />
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
                <p className="text-sm font-medium text-slate-500">No styles match the selected filters.</p>
                <Button size="sm" variant="outline" onClick={handleClear} className="mt-4 text-xs gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
                </Button>
              </div>
            ) : (
              <div className="overflow-auto max-h-[calc(100vh-440px)]">
                <table className="border-collapse text-[11px] w-max min-w-full">
                  <thead className="sticky top-0 z-20">
                    {/* Row 1: Group names */}
                    <tr>
                      {activeGroupsWithCols.map((group) => {
                        const isCollapsed = collapsedGroups.has(group.id);
                        const colSpan = isCollapsed ? 1 : Math.max(1, group.activeCols.length);
                        return (
                          <th key={group.id} colSpan={colSpan}
                            onClick={() => toggleCollapsed(group.id)}
                            className={cn(
                              "border border-border/50 px-3 py-1.5 text-center cursor-pointer select-none whitespace-nowrap",
                              group.id === "product" ? "bg-slate-100 sticky left-0 z-30" : "bg-slate-50"
                            )}
                          >
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                              {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                              {group.label}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                    {/* Row 2: Column names */}
                    <tr className="bg-muted/50">
                      {flatHeaderCols.map((fc, hi) => {
                        const isCollapsed = fc.col.id.endsWith("__collapsed");
                        const isFrozen   = fc.frozenIdx !== null;
                        const leftClass  = isFrozen ? FROZEN_LEFTS[fc.frozenIdx!] : undefined;
                        return (
                          <th key={`h-${hi}`}
                            onClick={() => !isCollapsed && handleSort(fc.col)}
                            className={cn(
                              "border border-border/50 h-9 px-3 text-left text-[10px] font-bold text-slate-600 whitespace-nowrap select-none",
                              fc.col.numeric && !isCollapsed && "cursor-pointer hover:bg-muted/80",
                              isFrozen && leftClass && `sticky ${leftClass} z-10 bg-muted/50`,
                              isCollapsed && "text-slate-300 text-center"
                            )}
                          >
                            {isCollapsed ? "···" : (
                              <span className="inline-flex items-center">
                                {fc.col.label}
                                <SortIcon col={fc.col} />
                              </span>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((row, ri) => {
                      let frozenTrack = 0;
                      return (
                        <tr key={`${row.styleCode}-${ri}`}
                          className={cn("h-9 border-b border-border/30 hover:bg-muted/20 transition-colors",
                            ri % 2 === 0 ? "bg-background" : "bg-muted/[0.03]")}>
                          {activeGroupsWithCols.flatMap((group) => {
                            const isCollapsed = collapsedGroups.has(group.id);
                            if (isCollapsed) return [(
                              <td key={`${group.id}-c`} className="border border-border/20 px-2 text-center text-slate-200">·</td>
                            )];
                            return group.activeCols.map((col) => {
                              const isFrozen  = !!col.frozen;
                              const frozenIdx = isFrozen ? frozenTrack++ : null;
                              const leftClass = frozenIdx !== null ? FROZEN_LEFTS[frozenIdx] : undefined;
                              const val = (row as any)[col.id];
                              const rowBg = ri % 2 === 0 ? "bg-background" : "bg-muted/[0.03]";
                              return (
                                <td key={col.id}
                                  className={cn(
                                    "border border-border/20 px-3 py-1 whitespace-nowrap",
                                    rowBg,
                                    isFrozen && leftClass && `sticky ${leftClass} z-10`,
                                    frozenIdx === 0 && "font-mono font-medium text-primary text-[10px]",
                                    frozenIdx === 1 && "font-mono font-medium text-[10px]",
                                    col.numeric && "text-right tabular-nums text-slate-600",
                                  )}
                                >
                                  {renderCell(col, val)}
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
          </CardContent>
        </Card>

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Rows per page:</span>
              {[25, 50, 100].map((n) => (
                <button key={n} onClick={() => { setRowsPerPage(n); setPage(1); }}
                  className={cn("px-2.5 py-1 text-[11px] font-bold rounded-md transition-all border",
                    rowsPerPage === n ? "bg-primary text-white border-primary" : "text-slate-500 border-slate-200 hover:border-primary hover:text-primary")}>
                  {n}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500">
                Page <strong>{page}</strong> of <strong>{totalPages}</strong>&nbsp;·&nbsp;{filteredData.length} results
              </span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="outline" size="sm" className="h-7 w-7 p-0" disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Customize Panel */}
      <Sheet open={customizeOpen} onOpenChange={setCustomizeOpen}>
        <SheetContent className="w-[340px] sm:w-[400px] flex flex-col">
          <SheetHeader>
            <SheetTitle className="text-base font-bold">Customize Columns</SheetTitle>
            <p className="text-[11px] text-slate-400 mt-1">Toggle groups above the table. Fine-tune individual columns here.</p>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
            {COLUMN_GROUPS.map((group) => {
              const groupOn    = visibleGroups.has(group.id);
              const isExpanded = expandedPanelGroups.has(group.id);
              return (
                <div key={group.id} className={cn("rounded-xl border transition-all", groupOn ? "border-primary/20 bg-primary/[0.02]" : "border-slate-200 opacity-50")}>
                  <button className="w-full flex items-center justify-between px-4 py-2.5" onClick={() => togglePanelGroup(group.id)}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full shrink-0", groupOn ? "bg-primary" : "bg-slate-300")} />
                      <span className="text-[12px] font-bold text-slate-700">{group.label}</span>
                      {!groupOn && <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-slate-100 text-slate-400 border-none">Hidden</Badge>}
                    </div>
                    {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-3 space-y-2 border-t border-border/40 pt-2.5">
                      {group.columns.map((col) => {
                        const isVisible = !hiddenCols.has(col.id);
                        return (
                          <label key={col.id} className={cn("flex items-center gap-2.5 cursor-pointer", col.frozen && "cursor-not-allowed opacity-60")}>
                            <Checkbox checked={isVisible} disabled={col.frozen}
                              onCheckedChange={() => !col.frozen && toggleColInGroup(col.id)} className="h-3.5 w-3.5" />
                            <span className="text-[12px] font-medium text-slate-700 flex-1">{col.label}</span>
                            {col.frozen && <span className="text-[9px] text-slate-400 font-bold uppercase">Frozen</span>}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            <div className="border-t pt-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Apply Saved View</p>
              <div className="space-y-1.5">
                {SAVED_VIEW_NAMES.map((v) => (
                  <button key={v} onClick={() => { applyView(v); setCustomizeOpen(false); }}
                    className={cn("w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium border transition-all",
                      selectedView === v ? "bg-primary/10 text-primary border-primary/20" : "border-slate-200 text-slate-600 hover:border-primary/30 hover:text-primary")}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-3 border-t mt-2">
            <Button className="w-full text-xs font-bold" onClick={() => setCustomizeOpen(false)}>Done</Button>
          </div>
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}
