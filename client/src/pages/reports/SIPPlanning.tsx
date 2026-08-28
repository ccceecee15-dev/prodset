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
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Download, Save, RotateCcw, ChevronRight, ChevronLeft,
  SlidersHorizontal, ChevronDown, ChevronUp, Search,
  ChevronsUpDown, Layers, AlertCircle, Clock, CheckCircle2, TrendingUp, Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Reference Data ───────────────────────────────────────────────────────────
const BRANDS = ["APPLE", "BOSE", "SONY", "JBL", "SAMSUNG", "ANKER", "GREENCORE", "BAKKAVOR"];
const PLC_STATUSES = ["Active", "Launched", "Ranging", "Phase Out", "Discontinued"];
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
  GREENCORE: [
    { desc: "GREENCORE FRESH MEAL DEAL CLASSIC BLT SANDWICH", baseRetail: 3.75, vendorCode: "082100", vendorName: "GREENCORE GROUP PLC" },
    { desc: "GREENCORE FRESH MEAL DEAL CHICKEN SALAD WRAP", baseRetail: 3.75, vendorCode: "082100", vendorName: "GREENCORE GROUP PLC" },
    { desc: "GREENCORE FRESH MEAL DEAL TUNA MAYO SANDWICH", baseRetail: 3.75, vendorCode: "082100", vendorName: "GREENCORE GROUP PLC" },
    { desc: "GREENCORE FRESH MEAL DEAL EGG MAYO SANDWICH", baseRetail: 3.50, vendorCode: "082100", vendorName: "GREENCORE GROUP PLC" },
    { desc: "GREENCORE CHILLED SNACK POT HUMMUS & VEGGIES", baseRetail: 2.99, vendorCode: "082100", vendorName: "GREENCORE GROUP PLC" },
    { desc: "GREENCORE FRESH FRUIT SALAD CUP 250G", baseRetail: 2.49, vendorCode: "082100", vendorName: "GREENCORE GROUP PLC" },
    { desc: "GREENCORE FRESH ORANGE JUICE 330ML CHILLED", baseRetail: 2.29, vendorCode: "082100", vendorName: "GREENCORE GROUP PLC" },
  ],
  BAKKAVOR: [
    { desc: "BAKKAVOR FRESH MEAL DEAL PRAWN MARIE ROSE SANDWICH", baseRetail: 4.25, vendorCode: "091540", vendorName: "BAKKAVOR GROUP PLC" },
    { desc: "BAKKAVOR FRESH SALAD BOWL SUPERFOOD MIX 220G", baseRetail: 4.49, vendorCode: "091540", vendorName: "BAKKAVOR GROUP PLC" },
    { desc: "BAKKAVOR FRESH MEAL DEAL CORONATION CHICKEN WRAP", baseRetail: 3.99, vendorCode: "091540", vendorName: "BAKKAVOR GROUP PLC" },
    { desc: "BAKKAVOR DAIRY YOGHURT STRAWBERRY MULTIPACK 4X125G", baseRetail: 3.29, vendorCode: "091540", vendorName: "BAKKAVOR GROUP PLC" },
    { desc: "BAKKAVOR FRESH SNACK PACK CHEDDAR & CRACKERS", baseRetail: 2.75, vendorCode: "091540", vendorName: "BAKKAVOR GROUP PLC" },
    { desc: "BAKKAVOR FRESH MEAL DEAL SMOKED SALMON BAGEL", baseRetail: 4.25, vendorCode: "091540", vendorName: "BAKKAVOR GROUP PLC" },
  ],
};

const STORE_NAMES_LIST = [
  "TECH CENTRAL-JFK T4", "GADGET ZONE-LAX T7", "DIGITAL HUB-ATL CONCOURSE B",
  "SMART STORE-ORD T2", "MOBILE WORLD-DFW TERMINAL D", "CONNECT-DEN A-WEST",
  "TECH WORLD-SFO INTL G", "MOBILE PLUS-SEA CENTRAL", "CONNECT-MIA NORTH",
  "TECH HUB-LAS T1", "GADGET PRO-BOS C-INTL", "CONNECT-IAH TERMINAL E",
  "LICK-HORSESHOE", "HARLEY-LINQ", "RUBY BLUE-LINQ",
];

// ─── Column Schema ─────────────────────────────────────────────────────────────
interface ColDef {
  id: string; label: string; frozen?: boolean; numeric?: boolean;
  pct?: boolean; currency?: boolean; defaultHidden?: boolean; sipCol?: boolean; avail?: boolean;
}
interface GroupDef { id: string; label: string; defaultVisible: boolean; columns: ColDef[] }

const COLUMN_GROUPS: GroupDef[] = [
  {
    id: "product", label: "Product Attribute", defaultVisible: true,
    columns: [
      { id: "rank",               label: "Rank",                       frozen: true,  numeric: true },
      { id: "topBucket",          label: "TOP Bucket" },
      { id: "styleCode",          label: "Style Code",                 frozen: true },
      { id: "deliveryType",       label: "Delivery Type" },
      { id: "styleLongDesc",      label: "Style Long Desc" },
      { id: "brand",              label: "Brand" },
      { id: "chainCurrentRetail", label: "Style Chain Current Retail", currency: true },
      { id: "primaryVendorName",  label: "Primary Vendor Name" },
      { id: "plcStatus",          label: "PLC Status" },
      { id: "reorderableFlag",    label: "Style Reorderable Flag",     defaultHidden: true },
      { id: "primaryCurrentCost", label: "Primary Current Cost",       currency: true, defaultHidden: true },
    ],
  },
  {
    id: "sipMetrics", label: "SIP Metrics", defaultVisible: true,
    columns: [
      { id: "forecastDemand",         label: "Forecasted Demand (Next 8 Weeks)", numeric: true, sipCol: true },
      { id: "requiredStock",          label: "Required Stock",                   numeric: true, sipCol: true },
      { id: "currentStock",           label: "Total On Hand",                    numeric: true, sipCol: true },
      { id: "totalOnHandWos",         label: "Total On Hand WOS",                numeric: true, sipCol: true },
      { id: "onOrderNext8",           label: "On Order (Next 8 Weeks)",          numeric: true, sipCol: true },
      { id: "totalOnOrder",           label: "Total On Order",                   numeric: true, sipCol: true },
      { id: "availabilityPct",        label: "Availability",                     numeric: true, sipCol: true, pct: true },
      { id: "netDemand",              label: "Net Demand",                       numeric: true, sipCol: true },
    ],
  },
  {
    id: "salesUnits", label: "Sales Units", defaultVisible: true,
    columns: [
      { id: "wtd",            label: "WTD",              numeric: true },
      { id: "lw",             label: "LW",               numeric: true },
      { id: "l2w",            label: "L2W",              numeric: true },
      { id: "l3w",            label: "L3W",              numeric: true },
      { id: "l4w",            label: "L4W",              numeric: true },
      { id: "avgWeeklySales", label: "Avg Weekly Sales", numeric: true },
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
      { id: "orderMultiple",   label: "Style Order Multiple",  numeric: true },
      { id: "onOrderTotal",    label: "On Order Units (Total)", numeric: true },
      { id: "firstReceiptDate",label: "First Receipt Date" },
      { id: "lastReceiptDate", label: "Last Receipt Date" },
    ],
  },
  {
    id: "wos", label: "WOS", defaultVisible: false,
    columns: [
      { id: "storeWos", label: "Store WOS", numeric: true },
      { id: "whWos",    label: "WH WOS",    numeric: true },
    ],
  },
  {
    id: "sipFresh", label: "SIP Fresh · 14-Day DSD", defaultVisible: false,
    columns: [
      { id: "fresh14DayForecast", label: "14 Day Forecast",      numeric: true, sipCol: true },
      { id: "freshRequiredStock", label: "Required Stock",       numeric: true, sipCol: true },
      { id: "currentStock",       label: "Total On Hand",        numeric: true, sipCol: true },
      { id: "freshDeficit",       label: "Deficit",              numeric: true, sipCol: true },
      { id: "freshDsdOrderQty",   label: "DSD Order Qty",        numeric: true, sipCol: true },
      { id: "freshDosRemaining",  label: "DOS Remaining (days)", numeric: true, sipCol: true },
      { id: "availabilityPct",    label: "Availability",         numeric: true, sipCol: true, pct: true },
      { id: "netDemand",          label: "Net Demand",           numeric: true, sipCol: true },
    ],
  },
];

// ─── Saved Views ───────────────────────────────────────────────────────────────
type ViewConfig = { visibleGroups: string[]; hiddenCols: string[] };
const SAVED_VIEW_CONFIGS: Record<string, ViewConfig> = {
  "Order Action View":   { visibleGroups: ["product", "sipMetrics"], hiddenCols: ["reorderableFlag","primaryCurrentCost"] },
  "Order Planning View": { visibleGroups: ["product", "sipMetrics", "orders"], hiddenCols: ["reorderableFlag","primaryCurrentCost"] },
  "Full Planning View":  { visibleGroups: ["product", "sipMetrics", "salesUnits", "stockUnits", "orders"], hiddenCols: ["reorderableFlag","primaryCurrentCost"] },
  "Sales View":          { visibleGroups: ["product", "sipMetrics", "salesUnits", "wos"], hiddenCols: ["reorderableFlag","primaryCurrentCost"] },
  "Compact View":        { visibleGroups: ["product", "sipMetrics"], hiddenCols: ["topBucket","deliveryType","styleLongDesc","brand","chainCurrentRetail","primaryVendorName","plcStatus","reorderableFlag","primaryCurrentCost"] },
};
const SAVED_VIEW_NAMES = Object.keys(SAVED_VIEW_CONFIGS);

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  return new Date(Date.now() - rnd(endDaysAgo, startDaysAgo) * 86400000);
}

interface StoreBreakdown { store: string; storeStock: number; storeSales: number; storeWos: number; deficit: number }

function generateSIPData(count: number) {
  const rows = [];
  const catalogue: { brand: string; desc: string; baseRetail: number; vendorCode: string; vendorName: string }[] = [];
  for (const brand of BRANDS) {
    for (const p of PRODUCT_CATALOGUE[brand]) catalogue.push({ brand, ...p });
  }

  for (let i = 0; i < count; i++) {
    const product    = catalogue[i % catalogue.length];
    const isFreshFood = ["GREENCORE", "BAKKAVOR"].includes(product.brand);
    const retail  = +(product.baseRetail * (0.9 + Math.random() * 0.2)).toFixed(2);
    const cost    = +(retail * (0.5 + Math.random() * 0.3)).toFixed(2);
    // Fresh food is always Active or Launched (short lifecycle, never Phase Out)
    const plc     = isFreshFood
      ? (Math.random() > 0.15 ? "Active" : "Launched")
      : PLC_STATUSES[Math.floor(Math.random() * PLC_STATUSES.length)];

    // Fresh food: high velocity, low stock holdings (short shelf life)
    const wtd = isFreshFood ? rnd(400, 2400) : rnd(50, 6000);
    const lw  = vary(wtd, 0.15);
    const l2w = vary(wtd, 0.15);
    const l3w = vary(wtd, 0.15);
    const l4w = vary(wtd, 0.15);
    const avgWeeklySales = Math.round((lw + l2w + l3w + l4w) / 4);

    // Fresh food: tight stock (days not weeks of cover)
    const presStock   = isFreshFood ? rnd(20, 120)  : rnd(100, 6000);
    const storeOnhand = isFreshFood ? rnd(30, 250)  : rnd(200, 12000);
    const dcOnhand    = isFreshFood ? rnd(50, 400)  : rnd(1000, 25000);
    const storeWos    = isFreshFood ? rnd(0, 2, 2)  : rnd(2, 10, 2);
    const whWos       = isFreshFood ? rnd(0, 3, 2)  : rnd(4, 15, 2);
    const orderMult   = isFreshFood ? [12, 24, 48][Math.floor(Math.random() * 3)] : [2, 4, 5, 6, 10, 12, 20][Math.floor(Math.random() * 7)];
    const onOrderTotal = isFreshFood ? rnd(0, 800) : rnd(0, 5000);
    const firstRcpt   = randomDate(730, 90);
    const lastRcpt    = new Date(firstRcpt.getTime() + rnd(30, 365) * 86400000);

    // SIP Metrics — 8-week planning horizon
    const forecastDemand        = Math.round(avgWeeklySales * 8);
    const safetyStock           = Math.round(presStock * 1.5);
    const requiredStock         = forecastDemand + safetyStock;
    const currentStock          = storeOnhand + dcOnhand;
    const totalOnHandWos        = avgWeeklySales > 0
      ? +(currentStock / avgWeeklySales).toFixed(1)
      : 0;
    const onOrderNext8          = Math.round(onOrderTotal * (0.4 + Math.random() * 0.4));
    const totalOnOrder          = onOrderTotal;
    const netDemand             = Math.max(0, forecastDemand - currentStock - totalOnOrder);
    const availability          = storeOnhand + dcOnhand + totalOnOrder;
    const availabilityPct       = requiredStock > 0
      ? Math.min(100, Math.round((availability / requiredStock) * 100))
      : 100;

    let orderIndicator: "Order Now" | "Order Soon" | "Monitor";
    if (currentStock <= 0 || totalOnHandWos < 1)            orderIndicator = "Order Now";
    else if (currentStock < requiredStock || totalOnHandWos < 4) orderIndicator = "Order Soon";
    else                                                    orderIndicator = "Monitor";

    // Store-level breakdown (5-8 stores per style)
    const storeCount = 5 + Math.floor(Math.random() * 4);
    const stores: StoreBreakdown[] = Array.from({ length: storeCount }, (_, si) => {
      const storeStock = rnd(5, 300);
      const storeSales = rnd(2, 80);
      const storeWosCalc = storeSales > 0 ? +(storeStock / storeSales).toFixed(1) : 0;
      const storeDeficit = Math.round(storeSales * rnd(4, 8)) - storeStock;
      return {
        store:      STORE_NAMES_LIST[(i + si) % STORE_NAMES_LIST.length],
        storeStock,
        storeSales,
        storeWos:   storeWosCalc,
        deficit:    storeDeficit,
      };
    });

    rows.push({
      rank:               i + 1,
      topBucket:          i < 100 ? "Top 100" : i < 250 ? "Top 250" : i < 500 ? "Top 500" : "Tail",
      styleCode:          String(1000000 + (i + 1) * 7),
      deliveryType:       i < 10 ? (i % 2 === 0 ? "DSD" : "Warehouse") : "Warehouse",
      styleLongDesc:      product.desc,
      brand:              product.brand,
      chainCurrentRetail: retail,
      primaryVendorCode:  product.vendorCode,
      primaryVendorName:  product.vendorName,
      plcStatus:          plc,
      reorderableFlag:    Math.random() > 0.2 ? 1 : 0,
      primaryCurrentCost: cost,
      wtd, lw, l2w, l3w, l4w, avgWeeklySales,
      presentationStock:  presStock,
      storeOnhand,
      dcOnhand,
      storeWos,
      whWos,
      orderMultiple:      orderMult,
      onOrderTotal,
      firstReceiptDate:   fmtDate(firstRcpt),
      lastReceiptDate:    fmtDate(lastRcpt),
      forecastDemand,
      requiredStock,
      currentStock,
      totalOnHandWos,
      onOrderNext8,
      totalOnOrder,
      availabilityPct,
      netDemand,
      availability,
      orderIndicator,
      isFreshFood,
      stores,
      // SIP Fresh — 14-day DSD metrics (only meaningful for fresh food rows)
      fresh14DayForecast:  Math.round(avgWeeklySales * 2),
      freshRequiredStock:  Math.round(avgWeeklySales * 2 + presStock * 1.5),
      freshDeficit:        Math.max(0, Math.round(avgWeeklySales * 2 + presStock * 1.5) - currentStock - totalOnOrder),
      freshDsdOrderQty:    Math.max(0, Math.round(avgWeeklySales * 2 + presStock * 1.5) - currentStock - totalOnOrder) > 0
                             ? Math.ceil(Math.max(0, Math.round(avgWeeklySales * 2 + presStock * 1.5) - currentStock - totalOnOrder) / orderMult) * orderMult
                             : 0,
      freshDosRemaining:   avgWeeklySales > 0 ? +(currentStock / (avgWeeklySales / 7)).toFixed(1) : 0,
    });
  }
  return rows;
}

const ALL_DATA = generateSIPData(300);

const PLC_COLORS: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Launched: "bg-blue-100 text-blue-700",
  Ranging: "bg-violet-100 text-violet-700",
  "Phase Out": "bg-amber-100 text-amber-700",
  Discontinued: "bg-red-100 text-red-700",
};

const INDICATOR_CONFIG: Record<"Order Now" | "Order Soon" | "Monitor", {
  className: string; icon: typeof AlertCircle; testId: string;
}> = {
  "Order Now": {
    className: "bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:hover:bg-red-950/60 dark:text-red-300 dark:border-red-900",
    icon: AlertCircle,
    testId: "order-now",
  },
  "Order Soon": {
    className: "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:hover:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900",
    icon: Clock,
    testId: "order-soon",
  },
  "Monitor": {
    className: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:hover:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900",
    icon: CheckCircle2,
    testId: "monitor",
  },
};

type SortDir = "asc" | "desc" | null;

const DEFAULT_VISIBLE_GROUPS = new Set(
  COLUMN_GROUPS.filter((g) => g.defaultVisible).map((g) => g.id)
);
const DEFAULT_HIDDEN_COLS = new Set(
  COLUMN_GROUPS.flatMap((g) => g.columns.filter((c) => c.defaultHidden).map((c) => c.id))
);
// Expand col (40px) + Rank (60px) = 100px for StyleCode
const FROZEN_LEFTS = ["left-[40px]", "left-[100px]"];

// ─── Component ────────────────────────────────────────────────────────────────
export default function SIPPlanning() {
  const [, navigate] = useLocation();

  const [filters, setFilters] = useState({ brand: "all", plcStatus: "all", subCategory: "all", search: "" });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const [visibleGroups, setVisibleGroups]       = useState<Set<string>>(new Set(SAVED_VIEW_CONFIGS["Compact View"].visibleGroups));
  const [hiddenCols, setHiddenCols]             = useState<Set<string>>(new Set(SAVED_VIEW_CONFIGS["Compact View"].hiddenCols));
  const [collapsedGroups, setCollapsedGroups]   = useState<Set<string>>(new Set());
  const [customizeOpen, setCustomizeOpen]       = useState(false);
  const [expandedPanelGroups, setExpandedPanelGroups] = useState<Set<string>>(new Set(["product", "sipMetrics"]));
  const [selectedView, setSelectedView]         = useState("Compact View");

  const [sortCol, setSortCol] = useState<string | null>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage]       = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // ── Active groups/cols ──────────────────────────────────────────────────────
  const isFreshFoodActive = appliedFilters.subCategory === "fresh-food";

  const activeGroupsWithCols = useMemo(
    () => COLUMN_GROUPS
      .filter((g) => {
        if (g.id === "sipFresh") return isFreshFoodActive;
        return visibleGroups.has(g.id);
      })
      .map((g) => ({
        ...g,
        activeCols: g.columns.filter((c) => !hiddenCols.has(c.id)),
      })),
    [visibleGroups, hiddenCols, isFreshFoodActive]
  );

  // ── Filter / sort ───────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    let d = ALL_DATA;
    if (appliedFilters.brand !== "all")     d = d.filter((r) => r.brand === appliedFilters.brand);
    if (appliedFilters.plcStatus !== "all") d = d.filter((r) => r.plcStatus === appliedFilters.plcStatus);
    if (appliedFilters.subCategory === "fresh-food") d = d.filter((r) => r.isFreshFood);
    else if (appliedFilters.subCategory !== "all")   d = d.filter((r) => !r.isFreshFood);
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

  // ── Summary stats ───────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const stylesWithDemand = filteredData.filter((r) => r.netDemand > 0);
    const totalNetDemandUnits = filteredData.reduce((acc, r) => acc + r.netDemand, 0);
    const stylesCovered = filteredData.filter((r) => r.netDemand === 0);
    return {
      totalStyles:         filteredData.length,
      stylesWithDemand:    stylesWithDemand.length,
      totalNetDemandUnits,
      stylesCovered:       stylesCovered.length,
    };
  }, [filteredData]);

  // ── Actions ─────────────────────────────────────────────────────────────────
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
    const e = { brand: "all", plcStatus: "all", subCategory: "all", search: "" };
    setFilters(e); setAppliedFilters(e); setPage(1);
  };
  const handleReset = () => {
    handleClear();
    setVisibleGroups(new Set(DEFAULT_VISIBLE_GROUPS));
    setHiddenCols(new Set(DEFAULT_HIDDEN_COLS));
    setCollapsedGroups(new Set());
    setSortCol("totalOnHandWos"); setSortDir("asc");
    setPage(1); setRowsPerPage(25); setSelectedView("Order Action View");
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
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "sip_planning.csv"; a.click();
  };

  // ── Cell renderer ───────────────────────────────────────────────────────────
  const renderCell = (col: ColDef, val: any, row: any) => {
    if (val === undefined || val === null || val === "") return "—";

    // Availability — colored percentage
    if (col.id === "availabilityPct") {
      const pct = Number(val);
      const color = pct >= 85
        ? "text-emerald-600 dark:text-emerald-400"
        : pct >= 70
          ? "text-amber-600 dark:text-amber-400"
          : "text-rose-600 dark:text-rose-400";
      return (
        <span className={cn("text-[11px] font-bold tabular-nums", color)}>
          {pct.toFixed(1)}%
        </span>
      );
    }

    // Net Demand — red highlighted value + colored dot with order action tooltip
    if (col.id === "netDemand") {
      const units = Number(val);
      const ind = (row.orderIndicator ?? "Monitor") as keyof typeof INDICATOR_CONFIG;
      const dotColor =
        ind === "Order Now"  ? "bg-red-500"
        : ind === "Order Soon" ? "bg-amber-500"
        : "bg-emerald-500";
      const tooltipText =
        ind === "Order Now"  ? "Order Now — urgent stock required"
        : ind === "Order Soon" ? "Order Soon — stock running low"
        : "Monitor — stock levels adequate";
      return (
        <span className="inline-flex items-center gap-1.5 justify-end">
          {units > 0 && (
            <span className="font-bold tabular-nums text-red-600 dark:text-red-400">
              {units.toLocaleString()}
            </span>
          )}
          {units === 0 && (
            <span className="tabular-nums text-slate-400">0</span>
          )}
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/reports/sip-planning/create-po?style=${row.styleCode}` +
                      `&desc=${encodeURIComponent(row.styleLongDesc)}` +
                      `&vendor=${encodeURIComponent(row.primaryVendorName)}` +
                      `&vendorCode=${row.primaryVendorCode}` +
                      `&action=${encodeURIComponent(ind)}`
                    );
                  }}
                  className="flex-shrink-0 focus:outline-none"
                >
                  <span className={cn("inline-block w-2.5 h-2.5 rounded-full", dotColor)} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[11px] font-medium">
                {tooltipText}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </span>
      );
    }

    if (col.id === "styleLongDesc")
      return (
        <span className="inline-flex items-center gap-1.5">
          {row.isFreshFood && (
            <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[9px] font-bold h-4 px-1.5 shrink-0">
              FRESH
            </Badge>
          )}
          <span className="truncate max-w-[320px]" title={String(val)}>{String(val)}</span>
        </span>
      );
    if (col.id === "plcStatus")
      return <Badge className={cn("text-[9px] font-bold border-none h-5 px-2", PLC_COLORS[val] ?? "bg-slate-100 text-slate-600")}>{val}</Badge>;
    if (col.id === "reorderableFlag")
      return val === 1
        ? <Badge className="bg-emerald-100 text-emerald-700 border-none text-[9px] font-bold h-5 px-2">YES</Badge>
        : <Badge className="bg-slate-100 text-slate-400 border-none text-[9px] font-bold h-5 px-2">NO</Badge>;
    if (col.currency) return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (col.numeric && typeof val === "number") {
      if (Number.isInteger(val)) return val.toLocaleString();
      return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return String(val);
  };

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
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">SIP Planning</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {filteredData.length} styles · <span className="text-red-600 font-semibold">{summary.stylesWithDemand} with net demand</span> · <span className="text-emerald-600 font-semibold">{summary.stylesCovered} fully covered</span>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Styles",          value: summary.totalStyles.toLocaleString(),         color: "text-primary",     bg: "bg-primary/10",   icon: Layers },
            { label: "Styles with Net Demand", value: summary.stylesWithDemand.toLocaleString(),   color: "text-red-600",     bg: "bg-red-50",       icon: AlertCircle },
            { label: "Total Net Demand Units", value: summary.totalNetDemandUnits.toLocaleString(), color: "text-amber-600",  bg: "bg-amber-50",     icon: TrendingUp },
            { label: "Styles Covered",         value: summary.stylesCovered.toLocaleString(),      color: "text-emerald-600", bg: "bg-emerald-50",   icon: CheckCircle2 },
          ].map(({ label, value, color, bg, icon: Icon }) => (
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

        {/* Filters */}
        <Card className="rounded-xl border shadow-sm bg-background">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex flex-wrap gap-2 flex-1">
                {[
                  { id: "brand",     label: "Brand",     options: BRANDS },
                  { id: "plcStatus", label: "PLC Status", options: PLC_STATUSES },
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
                <div className="flex flex-col gap-1 min-w-[150px]">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sub Category</label>
                  <Select value={filters.subCategory} onValueChange={(v) => setFilters((p) => ({ ...p, subCategory: v }))}>
                    <SelectTrigger className={cn("h-8 text-[11px] font-medium border-slate-200 bg-white", filters.subCategory === "fresh-food" && "border-emerald-400 ring-1 ring-emerald-300")}>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all"       className="text-[11px]">All</SelectItem>
                      <SelectItem value="fresh-food" className="text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Leaf className="h-3 w-3 text-emerald-600" />Fresh Food
                        </span>
                      </SelectItem>
                      <SelectItem value="grocery"   className="text-[11px]">Grocery</SelectItem>
                      <SelectItem value="beverages" className="text-[11px]">Beverages</SelectItem>
                      <SelectItem value="snacks"    className="text-[11px]">Snacks</SelectItem>
                      <SelectItem value="dairy"     className="text-[11px]">Dairy</SelectItem>
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
              </div>
              <div className="flex gap-2 pb-0.5">
                <Button size="sm" onClick={handleApply} className="h-8 text-[11px] font-bold px-4">Apply</Button>
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
                const isSip   = g.id === "sipMetrics";
                return (
                  <label key={g.id}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border transition-all select-none text-[11px] font-semibold whitespace-nowrap",
                      isOn
                        ? isSip
                          ? "bg-red-50 border-red-200 text-red-700"
                          : "bg-primary/10 border-primary/30 text-primary"
                        : "border-slate-200 text-slate-500 hover:border-slate-300",
                      isFixed && "cursor-default opacity-70"
                    )}
                  >
                    <Checkbox checked={isOn} disabled={isFixed} onCheckedChange={() => toggleVisibleGroup(g.id)} className="h-3.5 w-3.5" />
                    {g.label}
                    {isSip && <Badge className="text-[9px] px-1.5 h-4 bg-red-100 text-red-600 border-none ml-0.5">NEW</Badge>}
                    {!isSip && (
                      <Badge variant="outline" className={cn("text-[9px] px-1.5 h-4 border-none ml-0.5", isOn ? "bg-primary/15 text-primary" : "bg-slate-100 text-slate-400")}>
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
            <Select value={selectedView} onValueChange={(v) => applyView(v)}>
              <SelectTrigger className="h-7 text-[11px] w-[200px] border-slate-200">
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
              <div className="overflow-auto max-h-[calc(100vh-520px)]">
                <table className="border-collapse text-[11px] w-max min-w-full">
                  <thead className="sticky top-0 z-20">
                    {/* Row 1: Group names */}
                    <tr>
                      {/* Nav column header */}
                      <th rowSpan={2} className="sticky left-0 z-30 bg-slate-100 border border-border/50 w-10 min-w-[40px]" title="View stores" />
                      {activeGroupsWithCols.map((group) => {
                        const isCollapsed = collapsedGroups.has(group.id);
                        const colSpan = isCollapsed ? 1 : Math.max(1, group.activeCols.length);
                        return (
                          <th key={group.id} colSpan={colSpan}
                            onClick={() => toggleCollapsed(group.id)}
                            className={cn(
                              "border border-border/50 px-3 py-1.5 text-center cursor-pointer select-none whitespace-nowrap",
                              group.id === "product" ? "bg-slate-100 sticky left-[40px] z-30"
                              : group.id === "sipMetrics" ? "bg-red-50"
                              : "bg-slate-50"
                            )}
                          >
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                              {isCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}
                              {group.label}
                              {group.id === "sipMetrics" && <span className="text-red-500 text-[8px] font-bold ml-1">●</span>}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                    {/* Row 2: Column names */}
                    <tr className="bg-muted/50">
                      {flatHeaderCols.map((fc, hi) => {
                        const isCollapsed = fc.col.id.endsWith("__collapsed");
                        const isFrozen    = fc.frozenIdx !== null;
                        const leftClass   = isFrozen ? FROZEN_LEFTS[fc.frozenIdx!] : undefined;
                        return (
                          <th key={`h-${hi}`}
                            onClick={() => !isCollapsed && handleSort(fc.col)}
                            className={cn(
                              "border border-border/50 h-9 px-3 text-left text-[10px] font-bold text-slate-600 whitespace-nowrap select-none",
                              fc.col.numeric && !isCollapsed && "cursor-pointer hover:bg-muted/80",
                              isFrozen && leftClass && `sticky ${leftClass} z-10 bg-muted/50`,
                              fc.col.sipCol && "text-red-700 bg-red-50/70",
                              isCollapsed && "text-slate-300 text-center",
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
                        <tr
                          key={`row-${ri}`}
                          className={cn(
                            "h-9 border-b border-border/30 hover:bg-muted/20 transition-colors",
                            ri % 2 === 0 ? "bg-background" : "bg-muted/[0.03]",
                          )}
                        >
                          {/* Nav button — opens StyleStores screen */}
                          <td className="sticky left-0 z-10 bg-white border border-border/20 w-10 min-w-[40px] text-center">
                            <button
                              onClick={() => navigate(
                                `/reports/sip-planning/style-stores?style=${row.styleCode}` +
                                `&desc=${encodeURIComponent(row.styleLongDesc)}` +
                                `&vendor=${encodeURIComponent(row.primaryVendorName)}` +
                                `&vendorCode=${row.primaryVendorCode}`
                              )}
                              title="View stores for this style"
                              className="p-1 rounded hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"
                            >
                              <ChevronRight size={13} />
                            </button>
                          </td>
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
                              const isSipCol = !!col.sipCol;
                              return (
                                <td key={col.id}
                                  className={cn(
                                    "border border-border/20 px-3 py-1 whitespace-nowrap",
                                    rowBg,
                                    isFrozen && leftClass && `sticky ${leftClass} z-10`,
                                    frozenIdx === 0 && "font-mono font-medium text-primary text-[10px]",
                                    frozenIdx === 1 && "font-mono font-medium text-[10px]",
                                    col.numeric && "text-right tabular-nums text-slate-600",
                                    isSipCol && "bg-red-50/30",
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
            <p className="text-[11px] text-slate-400 mt-1">Toggle groups and fine-tune individual columns.</p>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
            {COLUMN_GROUPS.map((group) => {
              const groupOn    = visibleGroups.has(group.id);
              const isExpanded = expandedPanelGroups.has(group.id);
              const isSip      = group.id === "sipMetrics";
              return (
                <div key={group.id} className={cn("rounded-xl border transition-all",
                  isSip ? "border-red-200 bg-red-50/30"
                  : groupOn ? "border-primary/20 bg-primary/[0.02]"
                  : "border-slate-200 opacity-50"
                )}>
                  <button className="w-full flex items-center justify-between px-4 py-2.5" onClick={() => togglePanelGroup(group.id)}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full shrink-0", isSip ? "bg-red-500" : groupOn ? "bg-primary" : "bg-slate-300")} />
                      <span className="text-[12px] font-bold text-slate-700">{group.label}</span>
                      {isSip && <Badge className="text-[9px] h-4 px-1.5 bg-red-100 text-red-600 border-none">SIP</Badge>}
                      {!groupOn && !isSip && <Badge variant="outline" className="text-[9px] h-4 px-1.5 bg-slate-100 text-slate-400 border-none">Hidden</Badge>}
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
                            {col.sipCol && <span className="text-[9px] text-red-500 font-bold uppercase">SIP</span>}
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
