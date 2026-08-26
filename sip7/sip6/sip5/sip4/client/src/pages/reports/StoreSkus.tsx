import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  ChevronLeft, ShoppingCart, Search,
  ChevronsUpDown, ChevronDown, ChevronUp, Package,
  Building2, Warehouse, Truck, Store, CalendarClock, CheckCircle2, Clock,
  Eye, EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { vendorDeliveryType } from "./StyleStores";

// ─── Forecast helpers ─────────────────────────────────────────────────────────
const WEEK_COUNT = 6;
const DAY_COUNT  = 14;

const FRESH_FOOD_KEYWORDS = [
  "FRESH", "FOOD", "SANDWICH", "SALAD", "FRUIT", "SNACK",
  "MEAL", "DAIRY", "DRINK", "JUICE", "BAKERY", "CHILLED",
];
function isFreshFoodStyle(desc: string): boolean {
  const d = desc.toUpperCase();
  return FRESH_FOOD_KEYWORDS.some((kw) => d.includes(kw));
}

function computeWeeklyNetDemand(stock: number, sales: number, upc: string): number[] {
  const result: number[] = [];
  const rng = seededRng(hashStr("wnd:" + upc));
  let remaining = stock;
  for (let w = 0; w < WEEK_COUNT; w++) {
    const weekDemand = Math.max(1, Math.round(sales * (0.75 + rng() * 0.5)));
    const net = Math.max(0, weekDemand - remaining);
    result.push(net);
    remaining = Math.max(0, remaining - weekDemand);
  }
  return result;
}

function computeDailyNetDemand(stock: number, salesPerWeek: number, upc: string): number[] {
  const result: number[] = [];
  const rng = seededRng(hashStr("dnd:" + upc));
  let remaining = stock;
  for (let d = 0; d < DAY_COUNT; d++) {
    const dailyBase   = salesPerWeek / 7;
    const dayDemand   = Math.max(0, Math.round(dailyBase * (0.5 + rng() * 1.0)));
    const net         = Math.max(0, dayDemand - remaining);
    result.push(net);
    remaining         = Math.max(0, remaining - dayDemand);
  }
  return result;
}

function getWeekEndingDates(count: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayOfWeek   = today.getDay();
  const daysToSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + daysToSunday + i * 7);
    return d;
  });
}

function getDayDates(count: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i + 1);
    return d;
  });
}

function fmtWeekEnd(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function fmtDayLabel(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

// ─── Delivery calendar helpers ─────────────────────────────────────────────────
// DSD vendors deliver on Tuesdays (2) and Fridays (5)
const DSD_DELIVERY_DAYS = [2, 5]; // 0=Sun, 1=Mon, 2=Tue … 6=Sat

function getNextDeliveryDays(count: number): Date[] {
  const results: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() + 1); // start checking from tomorrow
  while (results.length < count) {
    if (DSD_DELIVERY_DAYS.includes(cursor.getDay())) {
      results.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return results;
}

function fmtDeliveryDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
}

function fmtShortDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function fmtIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ─── Seeded RNG (same as StyleStores) ────────────────────────────────────────
function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}
function seededRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

// ─── SKU data ─────────────────────────────────────────────────────────────────
const COLORS  = ["BLACK", "WHITE", "SILVER", "MIDNIGHT", "STARLIGHT", "BLUE", "GREEN", "RED", "GOLD", "SPACE GREY"];
const SIZES   = ["S", "M", "L", "XL", "ONE SIZE"];

const VENDOR_STYLE_DESCRIPTORS = [
  "APPLE LB AIRPODS PRO GEN 3",
  "APPLE MAGSAFE CHARGER 2",
  "APPLE USB-C CABLE 2M",
  "APPLE LIGHTNING ADAPTER",
  "APPLE WATCH BAND SPORT",
  "APPLE PENCIL TIP REPLACEMENT",
  "APPLE SMART KEYBOARD COVER",
  "APPLE TV SIRI REMOTE",
  "APPLE HOMEPOD MINI SPEAKER",
  "APPLE AIRTAG 4-PACK",
  "INGRAM USB-C HUB 7-IN-1",
  "INGRAM PORTABLE SSD 1TB",
  "INGRAM WIRELESS CHARGER",
  "INGRAM BLUETOOTH MOUSE",
  "INGRAM LAPTOP STAND ALU",
  "FRESH MEAL DEAL SANDWICH RANGE",
  "FRESH FRUIT SALAD 250G",
  "FRESH SNACK POT SELECTION",
  "DAIRY MILK SEMI-SKIMMED 1L",
  "FRESH ORANGE JUICE 500ML",
  "CHILLED YOGHURT MULTIPACK",
  "BAKERY CROISSANT 4PK",
];

interface VendorStyle { styleCode: string; styleDesc: string; }

function generateVendorStyles(
  vendorCode: string,
  currentStyleCode: string,
  currentStyleDesc: string,
): VendorStyle[] {
  const rng    = seededRng(hashStr(vendorCode + "STYLES"));
  const count  = 6 + Math.floor(rng() * 5);
  const descs  = [...VENDOR_STYLE_DESCRIPTORS].sort(() => rng() - 0.5).slice(0, count);
  const others = descs.map((desc) => ({
    styleCode: String(1000000 + (hashStr(vendorCode + desc) % 999999)),
    styleDesc: desc,
  }));
  return [
    { styleCode: currentStyleCode, styleDesc: currentStyleDesc },
    ...others.filter((s) => s.styleCode !== currentStyleCode),
  ];
}

interface SkuRow {
  upc:         string;
  variant:     string;
  description: string;
  styleCode:   string;
  styleDesc:   string;
  stock:           number;
  sales:           number;
  wos:             number;
  required:        number;
  deficit:         number;
  totalOnOrder:    number;
  storeAvailability: number;
  suggestedQty:    number;
  vendor:          string;
  vendorCode:      string;
  presentationStock: number;
  forecastData: number[];
}

function generateSkus(styleCode: string, storeName: string, styleDesc: string, vendor: string, vendorCode: string): SkuRow[] {
  const seed = hashStr(styleCode + storeName);
  const rng  = seededRng(seed);

  const count   = 3 + Math.floor(rng() * 4); // 3–6 SKUs
  const colors  = [...COLORS].sort(() => rng() - 0.5).slice(0, count);

  return colors.map((color, i) => {
    const stock   = Math.floor(rng() * 30) + 1;
    const sales   = Math.floor(rng() * 15) + 1;
    const wos     = sales > 0 ? +(stock / sales).toFixed(1) : 0;
    const required = Math.floor(sales * (rng() * 5 + 3));
    const deficit  = required - stock;
    const totalOnOrder      = Math.floor(rng() * 40);
    const storeAvailability = stock + totalOnOrder;
    const mult     = [6, 10, 12, 24][Math.floor(rng() * 4)];
    const suggestedQty = deficit > 0 ? Math.ceil(deficit / mult) * mult : 0;
    const upc     = String(190000000000 + hashStr(styleCode + color + i) % 900000000000);
    const hasSize = rng() > 0.6;
    const size    = hasSize ? SIZES[Math.floor(rng() * SIZES.length)] : null;
    const variant = size ? `${color} / ${size}` : color;
    const freshFood   = isFreshFoodStyle(styleDesc);
    const forecastData = freshFood
      ? computeDailyNetDemand(stock, sales, upc)
      : computeWeeklyNetDemand(stock, sales, upc);
    return {
      upc,
      variant,
      description: `${styleDesc} ${variant}`,
      styleCode,
      styleDesc,
      stock,
      sales,
      wos,
      required,
      deficit,
      totalOnOrder,
      storeAvailability,
      suggestedQty,
      vendor,
      vendorCode,
      presentationStock: Math.floor(rng() * 6) + 2,
      forecastData,
    };
  }).sort((a, b) => b.deficit - a.deficit);
}

function defLevel(v: number): "high" | "medium" | "none" {
  if (v > 100) return "high";
  if (v > 20)  return "medium";
  return "none";
}

type SortDir = "asc" | "desc" | null;

// ─── Component ────────────────────────────────────────────────────────────────
export default function StoreSkus() {
  const [location, navigate] = useLocation();

  const params    = useMemo(() => new URLSearchParams(window.location.search), [location]);
  const styleCode  = params.get("style")     ?? "—";
  const styleDesc  = params.get("desc")      ?? "—";
  const storeName  = params.get("store")     ?? "—";
  const storeId    = params.get("storeId")   ?? "—";
  const vendorName = params.get("vendor")    ?? "—";
  const vendorCode = params.get("vendorCode") ?? "—";

  const [search, setSearch]     = useState("");
  const [sortCol, setSortCol]   = useState<string>("wos");
  const [sortDir, setSortDir]   = useState<SortDir>("asc");
  const [showAllSkus, setShowAllSkus] = useState(false);
  const [scope, setScope] = useState<"style" | "vendor">("style");
  const [showForecast, setShowForecast] = useState(true);
  const [editedQty, setEditedQty] = useState<Record<string, number>>({});

  // Detect if this style is a fresh food item (daily forecast) or standard (weekly)
  const isFreshFood    = isFreshFoodStyle(styleDesc);
  const forecastCount  = isFreshFood ? DAY_COUNT : WEEK_COUNT;

  // ── Schedule PO state ──────────────────────────────────────────────────────
  // "raised"    = PO has been submitted; waiting for user to schedule next one
  // "scheduled" = user picked a delivery date; data shown as if PO was fulfilled
  const poRaisedParam = params.get("poRaised") === "true";
  const [poState, setPoState] = useState<"none" | "raised" | "scheduled">(
    () => poRaisedParam ? "raised" : "none",
  );
  const [scheduleOpen, setScheduleOpen]     = useState(false);
  const [pendingDate, setPendingDate]       = useState<Date | null>(null);
  const [scheduledDate, setScheduledDate]   = useState<Date | null>(null);
  const nextDeliveryDays  = useMemo(() => getNextDeliveryDays(3), []);
  const forecastDates     = useMemo(
    () => isFreshFood ? getDayDates(DAY_COUNT) : getWeekEndingDates(WEEK_COUNT),
    [isFreshFood],
  );

  const styleSkus = useMemo(
    () => generateSkus(styleCode, storeName, styleDesc, vendorName, vendorCode),
    [styleCode, storeName, styleDesc, vendorName, vendorCode]
  );

  const vendorStyles = useMemo(
    () => generateVendorStyles(vendorCode, styleCode, styleDesc),
    [vendorCode, styleCode, styleDesc],
  );

  const vendorSkus = useMemo(
    () => vendorStyles.flatMap((st) =>
      generateSkus(st.styleCode, storeName, st.styleDesc, vendorName, vendorCode)
    ),
    [vendorStyles, storeName, vendorName, vendorCode],
  );

  const baseSkus = scope === "vendor" ? vendorSkus : styleSkus;

  // When in scheduled mode, show projected stock AFTER the raised PO is fulfilled.
  const allSkus = useMemo(() => {
    if (poState !== "scheduled") return baseSkus;
    return baseSkus.map((sku) => {
      const newStock        = sku.stock + sku.suggestedQty;
      const newDef          = Math.max(0, sku.required - newStock);
      const mult            = [6, 10, 12, 24][Math.floor(hashStr(sku.upc + "mult") % 4)];
      const newSuggested    = newDef > 0 ? Math.ceil(newDef / mult) * mult : 0;
      const newAvailability = newStock; // on-order cleared — PO received
      return {
        ...sku,
        stock:             newStock,
        deficit:           newDef,
        suggestedQty:      newSuggested,
        totalOnOrder:      0,
        storeAvailability: newAvailability,
        wos: sku.sales > 0 ? +(newStock / sku.sales).toFixed(1) : 0,
        forecastData: isFreshFood
          ? computeDailyNetDemand(newStock, sku.sales, sku.upc + "_sch")
          : computeWeeklyNetDemand(newStock, sku.sales, sku.upc + "_sch"),
      };
    });
  }, [baseSkus, poState, isFreshFood]);

  const skuData = useMemo(() => {
    let rows = showAllSkus ? allSkus : allSkus.filter((s) => s.deficit > 0);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter((s) =>
        s.upc.includes(q) ||
        s.variant.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.styleCode.includes(q) ||
        s.styleDesc.toLowerCase().includes(q)
      );
    }
    if (sortCol && sortDir) {
      rows = [...rows].sort((a, b) => {
        const av = (a as any)[sortCol], bv = (b as any)[sortCol];
        if (typeof av === "number" && typeof bv === "number")
          return sortDir === "asc" ? av - bv : bv - av;
        return sortDir === "asc"
          ? String(av).localeCompare(String(bv))
          : String(bv).localeCompare(String(av));
      });
    }
    return rows;
  }, [allSkus, search, sortCol, sortDir, showAllSkus]);

  const totals = useMemo(() => ({
    deficit:  skuData.reduce((s, r) => s + Math.max(0, r.deficit), 0),
    orderQty: skuData.reduce((s, r) => s + (editedQty[r.upc] ?? r.suggestedQty), 0),
  }), [skuData, editedQty]);

  const handleSort = (col: string) => {
    if (sortCol !== col) { setSortCol(col); setSortDir("desc"); }
    else if (sortDir === "desc") setSortDir("asc");
    else { setSortCol("wos"); setSortDir("asc"); }
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span className="ml-1 inline-flex opacity-60">
      {sortCol === col
        ? sortDir === "asc" ? <ChevronUp size={9} /> : <ChevronDown size={9} />
        : <ChevronsUpDown size={9} className="opacity-50" />}
    </span>
  );

  const backToStores = () => {
    navigate(
      `/reports/sip-planning/style-stores?style=${styleCode}` +
      `&desc=${encodeURIComponent(styleDesc)}` +
      `&vendor=${encodeURIComponent(vendorName)}` +
      `&vendorCode=${vendorCode}`
    );
  };

  const buildCreatePoUrl = (scheduledFor?: Date) =>
    `/reports/sip-planning/create-po?vendor=${encodeURIComponent(vendorName)}` +
    `&vendorCode=${vendorCode}` +
    `&loc=store` +
    `&code=${encodeURIComponent(storeId)}` +
    `&name=${encodeURIComponent(storeName)}` +
    `&style=${styleCode}` +
    `&desc=${encodeURIComponent(styleDesc)}` +
    (scheduledFor ? `&scheduledFor=${fmtIso(scheduledFor)}` : "");

  const handleAcceptSchedule = () => {
    if (!pendingDate) return;
    setScheduledDate(pendingDate);
    setPoState("scheduled");
    setScheduleOpen(false);
  };

  return (
    <MainLayout>
      <div className="space-y-5 animate-in fade-in duration-500">

        {/* Breadcrumb */}
        <div>
          <button
            onClick={backToStores}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <ChevronLeft size={14} /> Store Performance
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">SKU Detail</h1>
            <p className="text-sm text-slate-500 mt-0.5 max-w-xl">
              Style <span className="font-mono font-bold text-primary">{styleCode}</span> — {styleDesc}
            </p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {/* Create PO — greyed once a PO is raised; active again after scheduling */}
              <Button
                size="sm"
                className={cn(
                  "gap-1.5 text-xs font-bold",
                  poState === "raised"
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed pointer-events-none border border-slate-300"
                    : "bg-primary",
                )}
                disabled={poState === "raised"}
                onClick={() => navigate(buildCreatePoUrl(scheduledDate ?? undefined))}
              >
                <ShoppingCart size={13} />
                {poState === "scheduled"
                  ? `Create PO · ${scheduledDate ? fmtShortDate(scheduledDate) : ""}`
                  : `Create PO for ${vendorName.split(",")[0]}`}
              </Button>

              {/* Schedule PO — appears once a PO has been raised */}
              {poState !== "none" && (
                <Button
                  size="sm"
                  variant="outline"
                  className={cn(
                    "gap-1.5 text-xs font-bold border",
                    poState === "raised"
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      : "border-emerald-300 bg-emerald-50 text-emerald-700 pointer-events-none",
                  )}
                  onClick={() => {
                    if (poState === "raised") {
                      setPendingDate(nextDeliveryDays[0]);
                      setScheduleOpen(true);
                    }
                  }}
                >
                  {poState === "scheduled" ? (
                    <><CheckCircle2 size={13} /> Scheduled</>
                  ) : (
                    <><CalendarClock size={13} /> Schedule PO</>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Scheduled-view banner */}
        {poState === "scheduled" && scheduledDate && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-800">
            <Clock size={16} className="shrink-0 text-indigo-500" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold">
                Projected view for <span className="font-mono">{fmtDeliveryDate(scheduledDate)}</span>
              </p>
              <p className="text-[11px] text-indigo-600 mt-0.5">
                Stock levels assume the previously raised PO has been fulfilled. Use <strong>Create PO</strong> above to raise the next order for this delivery date.
              </p>
            </div>
          </div>
        )}

        {/* Context: Store + Vendor (prominent) */}
        {(() => {
          const vType = vendorDeliveryType(vendorCode, vendorName);
          const isWhVendor = vType === "warehouse";
          return (
            <Card
              className={cn(
                "border shadow-none",
                isWhVendor ? "border-indigo-200 bg-indigo-50/40" : "border-blue-200 bg-blue-50/40",
              )}
            >
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] items-center gap-4">
                  {/* Store block */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 text-slate-700">
                      <Store size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
                        Store
                      </p>
                      <p className="text-base font-bold text-slate-900 mt-1 truncate" title={storeName}>
                        {storeName}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Store ID: <span className="font-mono font-semibold text-slate-700">{storeId}</span>
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block h-12 w-px bg-slate-200" />

                  {/* Vendor block */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border",
                        isWhVendor ? "border-indigo-200 text-indigo-700" : "border-blue-200 text-blue-700",
                      )}
                    >
                      <Building2 size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
                        Vendor
                      </p>
                      <p className="text-base font-bold text-slate-900 mt-1 truncate" title={vendorName}>
                        {vendorName}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Vendor Code: <span className="font-mono font-semibold text-slate-700">{vendorCode}</span>
                      </p>
                    </div>
                  </div>

                  {/* Delivery-type badge */}
                  <div className="flex items-center justify-end flex-shrink-0">
                    <Badge
                      variant="outline"
                      className={cn(
                        "h-8 px-3 gap-1.5 text-[11px] font-bold uppercase tracking-wide",
                        isWhVendor
                          ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                          : "bg-blue-100 text-blue-800 border-blue-300",
                      )}
                    >
                      {isWhVendor ? <Warehouse size={13} /> : <Truck size={13} />}
                      {isWhVendor ? "Warehouse Delivery Vendor" : "Direct Store Delivery Vendor"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Summary */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: "SKUs with deficit",  value: allSkus.filter((s) => s.deficit > 0).length, color: "text-red-600 bg-red-50 border-red-200" },
            { label: "Total deficit units", value: totals.deficit.toLocaleString(), color: "text-orange-600 bg-orange-50 border-orange-200" },
            { label: "Units to order",      value: totals.orderQty.toLocaleString(), color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
          ].map(({ label, value, color }) => (
            <div key={label} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold", color)}>
              {label}: <span className="text-sm font-bold">{value}</span>
            </div>
          ))}
        </div>

        {/* Filters + toggle */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Scope</label>
                <div className="inline-flex rounded-md border border-slate-200 overflow-hidden bg-white" role="tablist">
                  <button
                    role="tab"
                    aria-selected={scope === "style"}
                    onClick={() => setScope("style")}
                    className={cn(
                      "px-3 h-8 text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5",
                      scope === "style"
                        ? "bg-primary text-primary-foreground"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Package size={12} /> This Style
                  </button>
                  <button
                    role="tab"
                    aria-selected={scope === "vendor"}
                    onClick={() => setScope("vendor")}
                    className={cn(
                      "px-3 h-8 text-[11px] font-semibold transition-colors inline-flex items-center gap-1.5 border-l border-slate-200",
                      scope === "vendor"
                        ? "bg-primary text-primary-foreground"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    All Vendor SKUs
                    <Badge variant="outline" className={cn(
                      "text-[9px] h-4 px-1 ml-0.5",
                      scope === "vendor" ? "bg-white/20 text-primary-foreground border-white/30" : "bg-slate-100 text-slate-500 border-slate-200"
                    )}>
                      {vendorStyles.length}
                    </Badge>
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1 min-w-[220px]">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Search SKU / Variant</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder={scope === "vendor" ? "UPC, style, colour…" : "UPC, colour or description…"}
                    className="h-8 pl-7 text-[11px] border-slate-200 bg-white" />
                </div>
              </div>
              <button
                onClick={() => setShowAllSkus((v) => !v)}
                className={cn(
                  "h-8 px-3 rounded-md text-[11px] font-semibold border transition-all",
                  showAllSkus ? "bg-slate-100 border-slate-300 text-slate-700" : "bg-primary/10 border-primary/30 text-primary"
                )}
              >
                {showAllSkus ? "Showing all SKUs" : "Showing deficit SKUs only"}
              </button>
              <button
                onClick={() => setShowForecast((v) => !v)}
                className={cn(
                  "h-8 px-3 rounded-md text-[11px] font-semibold border transition-all inline-flex items-center gap-1.5",
                  showForecast
                    ? "bg-rose-50 border-rose-200 text-rose-600"
                    : "bg-slate-100 border-slate-300 text-slate-500"
                )}
              >
                {showForecast ? <Eye size={12} /> : <EyeOff size={12} />}
                {showForecast ? "Hide Forecast" : "Show Forecast"}
              </button>
              {search && (
                <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => setSearch("")}>
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/60 shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-xs w-full border-collapse">
              <thead>
                {/* Row 1: existing columns + optional forecast group header */}
                <tr className="bg-slate-50 border-b border-border/30">
                  <th rowSpan={showForecast ? 2 : 1} className="sticky left-0 z-20 px-4 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 align-bottom bg-slate-50 w-[130px] min-w-[130px]">UPC</th>
                  {scope === "vendor" && (
                    <th rowSpan={showForecast ? 2 : 1} className="sticky left-[130px] z-20 px-4 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 whitespace-nowrap align-bottom bg-slate-50 w-[180px] min-w-[180px]">Style</th>
                  )}
                  <th rowSpan={showForecast ? 2 : 1} className={cn("sticky z-20 px-4 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 align-bottom bg-slate-50 w-[100px] min-w-[100px]", scope === "vendor" ? "left-[310px]" : "left-[130px]")}>Variant</th>
                  <th rowSpan={showForecast ? 2 : 1} className={cn("sticky z-20 px-4 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 align-bottom bg-slate-50 min-w-[200px]", scope === "vendor" ? "left-[410px]" : "left-[230px]")}>Description</th>
                  <th rowSpan={showForecast ? 2 : 1} className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 align-bottom whitespace-nowrap">Presentation Stock</th>
                  {[
                    { col: "stock",             label: "Store On Hand"      },
                    { col: "wos",               label: "Store WOS"          },
                    { col: "sales",             label: "Lead Time Demand"   },
                    { col: "totalOnOrder",      label: "Total On Order"     },
                    { col: "storeAvailability", label: "Store Availability" },
                  ].map(({ col, label }) => (
                    <th key={col} rowSpan={showForecast ? 2 : 1}
                      onClick={() => handleSort(col)}
                      className={cn(
                        "px-4 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wide border-r border-border/20 cursor-pointer hover:bg-slate-100 whitespace-nowrap select-none text-slate-500 align-bottom",
                        sortCol === col && "bg-slate-100",
                      )}
                    >
                      <span className="inline-flex items-center justify-end">
                        {label} <SortIcon col={col} />
                      </span>
                    </th>
                  ))}
                  {/* Forecasted Net Demand group header — before Suggested Order QTY */}
                  {showForecast && (
                    <th
                      colSpan={forecastCount}
                      className="px-4 py-1.5 text-center font-bold text-[10px] uppercase tracking-widest text-rose-600 border-l-2 border-rose-200 bg-rose-50/60 whitespace-nowrap"
                    >
                      {isFreshFood
                        ? `Forecasted Net Demand — Next ${DAY_COUNT} Days (units)`
                        : `Forecasted Net Demand — Next ${WEEK_COUNT} Weeks (units)`}
                    </th>
                  )}
                  <th rowSpan={showForecast ? 2 : 1}
                    onClick={() => handleSort("suggestedQty")}
                    className={cn(
                      "px-4 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wide border-r border-border/20 cursor-pointer hover:bg-slate-100 whitespace-nowrap select-none text-slate-500 align-bottom",
                      sortCol === "suggestedQty" && "bg-slate-100",
                    )}
                  >
                    <span className="inline-flex items-center justify-end">
                      Suggested Order QTY <SortIcon col="suggestedQty" />
                    </span>
                  </th>
                </tr>
                {/* Row 2: period sub-headers — only when forecast visible */}
                {showForecast && (
                  <tr className="bg-slate-50 border-b-2 border-border/50">
                    {forecastDates.map((d, i) => (
                      <th
                        key={i}
                        className={cn(
                          "px-3 py-1.5 text-right font-semibold text-[10px] text-rose-500 whitespace-nowrap border-r border-border/20",
                          i === 0 ? "border-l-2 border-l-rose-200 bg-rose-50/60" : "bg-rose-50/40",
                        )}
                      >
                        {isFreshFood ? fmtDayLabel(d) : `W/E ${fmtWeekEnd(d)}`}
                      </th>
                    ))}
                  </tr>
                )}
                {/* Single-row border when forecast is hidden */}
                {!showForecast && (
                  <tr className="border-b-2 border-border/50 h-0" />
                )}
              </thead>
              <tbody>
                {skuData.map((sku, i) => {
                  const isCurrentStyle = sku.styleCode === styleCode;
                  return (
                    <tr key={`${sku.styleCode}-${sku.upc}`}
                      className={cn(
                        "border-b border-border/20 transition-colors",
                        i % 2 === 0 ? "bg-background hover:bg-slate-50/60" : "bg-muted/[0.02] hover:bg-slate-50/60"
                      )}
                    >
                      <td className={cn("sticky left-0 z-10 px-4 py-2.5 font-mono text-[10px] text-slate-500 border-r border-border/20 whitespace-nowrap w-[130px] min-w-[130px]", i % 2 === 0 ? "bg-white" : "bg-slate-50")}>{sku.upc}</td>
                      {scope === "vendor" && (
                        <td className={cn("sticky left-[130px] z-10 px-4 py-2.5 border-r border-border/20 whitespace-nowrap w-[180px] min-w-[180px]", i % 2 === 0 ? "bg-white" : "bg-slate-50")}>
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "font-mono text-[10px] font-semibold",
                              isCurrentStyle ? "text-primary" : "text-slate-500"
                            )}>{sku.styleCode}</span>
                            {isCurrentStyle && (
                              <Badge variant="outline" className="text-[9px] h-4 px-1 bg-primary/10 text-primary border-primary/30">selected</Badge>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px]" title={sku.styleDesc}>
                            {sku.styleDesc}
                          </div>
                        </td>
                      )}
                      <td className={cn("sticky z-10 px-4 py-2.5 border-r border-border/20 w-[100px] min-w-[100px]", scope === "vendor" ? "left-[310px]" : "left-[130px]", i % 2 === 0 ? "bg-white" : "bg-slate-50")}>
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-slate-50 text-slate-700 border-slate-200 whitespace-nowrap">
                          {sku.variant}
                        </Badge>
                      </td>
                      <td className={cn("sticky z-10 px-4 py-2.5 border-r border-border/20 text-slate-600 min-w-[200px] truncate", scope === "vendor" ? "left-[410px]" : "left-[230px]", i % 2 === 0 ? "bg-white" : "bg-slate-50")} title={sku.description}>
                        {sku.description}
                      </td>
                      <td className="px-3 py-2.5 border-r border-border/20 text-right tabular-nums text-slate-600">
                        {sku.presentationStock}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-600 border-r border-border/20">{sku.stock}</td>
                      <td className={cn("px-4 py-2.5 text-right tabular-nums border-r border-border/20",
                        sku.wos < 2 ? "text-red-500 font-semibold" : "text-slate-600"
                      )}>{sku.wos}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-600 border-r border-border/20">{sku.sales}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-slate-600 border-r border-border/20">{sku.totalOnOrder}</td>
                      {(() => {
                        const pct = sku.required > 0 ? Math.round((sku.storeAvailability / sku.required) * 100) : 0;
                        const color = pct >= 100 ? "text-emerald-600 font-semibold" : pct >= 75 ? "text-amber-500 font-semibold" : "text-red-500 font-semibold";
                        return (
                          <td className={cn("px-4 py-2.5 text-right tabular-nums border-r border-border/20", color)}>
                            {pct}%
                          </td>
                        );
                      })()}
                      {/* Forecast cells — before Suggested Order QTY */}
                      {showForecast && sku.forecastData.map((nd, wi) => (
                        <td
                          key={wi}
                          className={cn(
                            "px-3 py-2.5 text-right tabular-nums border-r border-border/20",
                            wi === 0 ? "border-l-2 border-l-rose-200" : "",
                            nd > 0
                              ? "font-semibold text-rose-600 bg-rose-50/30"
                              : "text-slate-300",
                          )}
                        >
                          {nd > 0 ? nd : "—"}
                        </td>
                      ))}
                      <td className="px-2 py-1.5 border-r border-border/20">
                        {sku.suggestedQty > 0 ? (() => {
                          const current = editedQty[sku.upc] ?? sku.suggestedQty;
                          const delta = current - sku.suggestedQty;
                          return (
                            <div className="flex items-center justify-end gap-1.5">
                              {delta !== 0 && (
                                <span className={cn(
                                  "text-[9px] font-semibold px-1 py-0.5 rounded",
                                  delta > 0
                                    ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                                    : "text-red-600 bg-red-50 border border-red-200"
                                )}>
                                  {delta > 0 ? `+${delta}` : delta}
                                </span>
                              )}
                              <input
                                type="number"
                                min={0}
                                value={current}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!isNaN(val) && val >= 0) {
                                    setEditedQty(prev => ({ ...prev, [sku.upc]: val }));
                                  }
                                }}
                                className="w-14 h-6 text-[11px] text-right tabular-nums font-bold text-primary bg-white border border-primary/30 rounded px-1.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                              />
                            </div>
                          );
                        })() : <span className="text-slate-300 text-right block pr-1">—</span>}
                      </td>
                    </tr>
                  );
                })}

                {skuData.length === 0 && (
                  <tr>
                    <td colSpan={scope === "vendor"
                      ? (showForecast ? 11 + forecastCount : 11)
                      : (showForecast ? 10 + forecastCount : 10)
                    } className="py-12 text-center">
                      <Package size={28} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-xs text-slate-400">
                        {showAllSkus ? "No SKUs found." : "No SKUs with deficit. Toggle to show all SKUs."}
                      </p>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </Card>

        <p className="text-[11px] text-muted-foreground">
          {poState === "scheduled" && scheduledDate
            ? <>Showing projected stock for <strong>{fmtDeliveryDate(scheduledDate)}</strong> — assumes the raised PO was fulfilled. Use <strong>Create PO</strong> above to order for this date.</>
            : <>Showing {showAllSkus ? "all" : "deficit"} SKUs for style <strong>{styleCode}</strong> at <strong>{storeName}</strong>. Use <strong>Create PO for {vendorName.split(",")[0]}</strong> at the top to raise a purchase order.</>}
        </p>
      </div>

      {/* ── Schedule PO dialog ─────────────────────────────────────────────────── */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock size={18} className="text-indigo-600" />
              Schedule Next Delivery
            </DialogTitle>
            <DialogDescription>
              Select the next available ordering date from the DSD delivery calendar.
              The screen will update to show projected stock assuming your raised PO has been received.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
              Available delivery days (Tue / Fri)
            </p>
            {nextDeliveryDays.map((d, i) => {
              const iso = fmtIso(d);
              const isSelected = pendingDate ? fmtIso(pendingDate) === iso : false;
              return (
                <button
                  key={iso}
                  onClick={() => setPendingDate(d)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all",
                    isSelected
                      ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300"
                      : "border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30",
                  )}
                >
                  <div className={cn(
                    "h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                    isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300",
                  )}>
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <p className={cn("text-sm font-semibold", isSelected ? "text-indigo-800" : "text-slate-800")}>
                      {fmtDeliveryDate(d)}
                    </p>
                    {i === 0 && (
                      <p className="text-[10px] text-indigo-500 font-bold mt-0.5">Next available</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => setScheduleOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 gap-1.5"
              disabled={!pendingDate}
              onClick={handleAcceptSchedule}
            >
              <CheckCircle2 size={13} /> Accept &amp; View Projected Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
