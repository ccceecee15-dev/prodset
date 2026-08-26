import { useState, useMemo, useCallback, useEffect } from "react";
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
  ChevronLeft, ShoppingCart, Search, Warehouse,
  ChevronsUpDown, ChevronDown, ChevronUp, Package, Store as StoreIcon,
  Building2, Truck, RotateCcw, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { vendorDeliveryType } from "./StyleStores";

// ─── Seeded RNG ───────────────────────────────────────────────────────────────
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

// ─── Mock store + warehouse data (kept in sync with StyleStores) ─────────────
const STORE_POOL = [
  { name: "TECH CENTRAL-JFK T4",            format: "TRAVEL"    },
  { name: "GADGET ZONE-LAX T7",             format: "TRAVEL"    },
  { name: "DIGITAL HUB-ATL CONCOURSE B",    format: "FLAGSHIP"  },
  { name: "SMART STORE-ORD T2",             format: "STANDARD"  },
  { name: "MOBILE WORLD-DFW TERMINAL D",    format: "STANDARD"  },
  { name: "CONNECT-DEN A-WEST",             format: "TRAVEL"    },
  { name: "TECH WORLD-SFO INTL G",          format: "FLAGSHIP"  },
  { name: "MOBILE PLUS-SEA CENTRAL",        format: "STANDARD"  },
  { name: "CONNECT-MIA NORTH",              format: "TRAVEL"    },
  { name: "TECH HUB-LAS T1",                format: "FLAGSHIP"  },
  { name: "LICK-HORSESHOE",                 format: "SPECIALTY" },
  { name: "HARLEY-LINQ",                    format: "WTLV"      },
  { name: "RUBY BLUE-LINQ",                 format: "SPECIALTY" },
  { name: "LICK-EXCALIBUR",                 format: "SPECIALTY" },
  { name: "GADGET PRO-BOS C-INTL",          format: "STANDARD"  },
  { name: "CONNECT-IAH TERMINAL E",         format: "TRAVEL"    },
  { name: "MOBILE CENTRAL-EWR C",           format: "STANDARD"  },
  { name: "CONNECT-MCO B-AIRSIDE",          format: "TRAVEL"    },
];

const WAREHOUSE_POOL = [
  { code: "DC-NORTHEAST", name: "Newark DC",   region: "Northeast" },
  { code: "DC-SOUTHEAST", name: "Atlanta DC",  region: "Southeast" },
  { code: "DC-CENTRAL",   name: "Memphis DC",  region: "Central"   },
  { code: "DC-WEST",      name: "Ontario DC",  region: "West"      },
];

// Must match StyleStores.assignWarehouse — keep in sync
function assignWarehouse(storeName: string): string | null {
  const h = hashStr(storeName + "WH");
  if (h % 4 === 0) return null;
  return WAREHOUSE_POOL[h % WAREHOUSE_POOL.length].code;
}

interface ServicedStore {
  storeId:   string;
  storeName: string;
  format:    string;
  deficit:   number;
}

function getServicedStores(styleCode: string, whCode: string): ServicedStore[] {
  const rng   = seededRng(hashStr(styleCode));
  const count = 10 + Math.floor(rng() * 8);
  const pool  = [...STORE_POOL].sort(() => rng() - 0.5).slice(0, count);

  return pool
    .map((s, i) => {
      const presStock   = Math.floor(rng() * 40) + 2;
      const storeOnhand = Math.floor(rng() * 80) + presStock;
      const storeSales  = Math.floor(rng() * 30) + 3;
      const required    = Math.floor(storeSales * (rng() * 6 + 4) + presStock);
      const deficit     = required - storeOnhand;
      return {
        storeId:   `S${String(100 + i).padStart(3, "0")}`,
        storeName: s.name,
        format:    s.format,
        warehouse: assignWarehouse(s.name),
        deficit,
      };
    })
    .filter((s) => s.warehouse === whCode);
}

// ─── SKU aggregation across all serviced stores ──────────────────────────────
const COLORS = ["BLACK", "WHITE", "SILVER", "MIDNIGHT", "STARLIGHT", "BLUE", "GREEN", "RED", "GOLD", "SPACE GREY"];
const SIZES  = ["S", "M", "L", "XL", "ONE SIZE"];

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
];

interface VendorStyle { styleCode: string; styleDesc: string; }

function generateVendorStyles(
  vendorCode: string,
  currentStyleCode: string,
  currentStyleDesc: string,
): VendorStyle[] {
  const rng    = seededRng(hashStr(vendorCode + "STYLES"));
  const count  = 6 + Math.floor(rng() * 5); // 6–10 other styles
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

// Build a synthetic 8-week forecast that sums (approximately) to `total`
// using the SKU's seeded RNG so the breakdown is deterministic.
function buildWeeklyForecast(seedKey: string, total: number, weeks = 8): number[] {
  const rng = seededRng(hashStr(seedKey + "FCST"));
  if (total <= 0) return Array(weeks).fill(0);
  // Generate raw weights with mild week-over-week variation
  const raw = Array.from({ length: weeks }, () => 0.7 + rng() * 0.6);
  const sum = raw.reduce((a, b) => a + b, 0);
  const scaled = raw.map((w) => (w / sum) * total);
  // Round to integers and reconcile rounding drift into the last week
  const rounded = scaled.map((v) => Math.round(v));
  const drift = total - rounded.reduce((a, b) => a + b, 0);
  rounded[weeks - 1] = Math.max(0, rounded[weeks - 1] + drift);
  return rounded;
}

interface SkuRow {
  upc:                   string;
  variant:               string;
  description:           string;
  styleCode:             string;
  styleDesc:             string;
  storesNeeding:         number;
  pressStock:            number;
  totalSales:            number;
  totalRequired:         number;
  whOnhand:              number;
  warehouseWos:          number;
  totalOnOrder:          number;
  warehouseAvailability: number;
  totalDeficit:          number;
  suggestedQty:          number;
  cost:                  number;
}

function generateAggregatedSkus(
  styleCode: string,
  styleDesc: string,
  whCode: string,
  servicedStores: number,
): SkuRow[] {
  const rng   = seededRng(hashStr(styleCode + whCode + "SKU"));
  const count = 4 + Math.floor(rng() * 4); // 4–7 SKUs
  const colors = [...COLORS].sort(() => rng() - 0.5).slice(0, count);

  return colors.map((color, i) => {
    // each SKU is needed by a fraction of stores
    const storesNeeding = Math.max(1, Math.floor(servicedStores * (0.4 + rng() * 0.6)));
    const perStoreSales = Math.floor(rng() * 20) + 4;
    const totalSales = perStoreSales * storesNeeding;
    const perStoreReq = Math.floor(perStoreSales * (rng() * 4 + 3));
    const totalRequired = perStoreReq * storesNeeding;
    // Press stock = qty needed to fill the fixture across all stores carrying this SKU.
    const perStorePress = Math.floor(rng() * 8) + 2;
    const pressStock = perStorePress * storesNeeding;
    const whOnhand = Math.floor(rng() * (totalRequired * 0.6));
    const warehouseWos = totalSales > 0 ? +(whOnhand / totalSales).toFixed(1) : 0;
    const totalOnOrder = Math.floor(rng() * (totalRequired * 0.4));
    const warehouseAvailability = whOnhand + totalOnOrder;
    const totalDeficit = Math.max(0, totalRequired - whOnhand);
    const mult = [6, 12, 24, 48][Math.floor(rng() * 4)];
    const suggestedQty = totalDeficit > 0 ? Math.ceil(totalDeficit / mult) * mult : 0;
    const cost = +(rng() * 60 + 12).toFixed(2);
    const upc = String(190000000000 + hashStr(styleCode + whCode + color + i) % 900000000000);
    const hasSize = rng() > 0.6;
    const size = hasSize ? SIZES[Math.floor(rng() * SIZES.length)] : null;
    const variant = size ? `${color} / ${size}` : color;

    return {
      upc,
      variant,
      description: `${styleDesc} ${variant}`,
      styleCode,
      styleDesc,
      storesNeeding,
      pressStock,
      totalSales,
      totalRequired,
      whOnhand,
      warehouseWos,
      totalOnOrder,
      warehouseAvailability,
      totalDeficit,
      suggestedQty,
      cost,
    };
  }).sort((a, b) => a.warehouseWos - b.warehouseWos);
}

function defLevel(v: number): "high" | "medium" | "none" {
  if (v > 200) return "high";
  if (v > 50)  return "medium";
  return "none";
}

// ─── Per-store SKU breakdown ─────────────────────────────────────────────────
interface PerStoreSkuRow {
  storeId:      string;
  storeName:    string;
  format:       string;
  deficit:      number;
  suggestedQty: number;
  sales:        number;
}

function generatePerStoreForSku(
  sku: SkuRow,
  servicedStores: ServicedStore[],
): PerStoreSkuRow[] {
  if (servicedStores.length === 0) return [];

  const N = Math.max(1, Math.min(sku.storesNeeding, servicedStores.length));
  const rng = seededRng(hashStr(sku.upc + "PERSTORE"));

  // Pick a deterministic subset of the warehouse's stores
  const ordered = [...servicedStores]
    .map((s) => ({ s, k: rng() }))
    .sort((a, b) => a.k - b.k)
    .slice(0, N)
    .map((x) => x.s);

  // Generate per-store weights then distribute the SKU's totals so they sum exactly
  const weights = ordered.map(() => rng() + 0.3);
  const totalW  = weights.reduce((a, b) => a + b, 0);

  let allocatedDef = 0;
  let allocatedQty = 0;
  let allocatedSls = 0;
  return ordered.map((s, i) => {
    const isLast = i === ordered.length - 1;
    const def = isLast
      ? Math.max(0, sku.totalDeficit - allocatedDef)
      : Math.max(0, Math.round((sku.totalDeficit * weights[i]) / totalW));
    allocatedDef += def;

    const qty = isLast
      ? Math.max(0, sku.suggestedQty - allocatedQty)
      : Math.max(0, Math.round((sku.suggestedQty * weights[i]) / totalW));
    allocatedQty += qty;

    const sls = isLast
      ? Math.max(0, sku.totalSales - allocatedSls)
      : Math.max(0, Math.round((sku.totalSales * weights[i]) / totalW));
    allocatedSls += sls;

    return {
      storeId:      s.storeId,
      storeName:    s.storeName,
      format:       s.format,
      deficit:      def,
      suggestedQty: qty,
      sales:        sls,
    };
  });
}

type SortDir = "asc" | "desc" | null;

// ─── Component ────────────────────────────────────────────────────────────────
export default function WarehouseSkus() {
  const [location, navigate] = useLocation();

  const params     = useMemo(() => new URLSearchParams(window.location.search), [location]);
  const styleCode  = params.get("style")      ?? "—";
  const styleDesc  = params.get("desc")       ?? "—";
  const whCode     = params.get("wh")         ?? "—";
  const whName     = params.get("whName")     ?? "—";
  const region     = params.get("region")     ?? "—";
  const vendorName = params.get("vendor")     ?? "—";
  const vendorCode = params.get("vendorCode") ?? "—";

  const [search, setSearch]   = useState("");
  const [sortCol, setSortCol] = useState<string>("warehouseWos");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [showAllSkus, setShowAllSkus] = useState(false);
  const [scope, setScope] = useState<"style" | "vendor">("style");
  const [selectedSkus, setSelectedSkus] = useState<Set<string>>(new Set());

  // Per-store suggested qty overrides keyed by SKU upc -> storeId -> qty.
  // The source of truth for any SKU that has been touched (either via the
  // store-level dialog or via a direct edit on the main row) is this map.
  // The SKU's "rolled-up" suggested qty is the sum of these per-store values.
  const [storeQtyOverrides, setStoreQtyOverrides] =
    useState<Record<string, Record<string, number>>>({});

  // SKU-level inline overrides. When the planner edits the Suggested Order QTY
  // directly on a SKU row, we store that flat value here. It takes precedence
  // over the per-store rollup when computing the row's effective quantity.
  const [skuQtyOverrides, setSkuQtyOverrides] =
    useState<Record<string, number>>({});

  // Which SKU's per-store breakdown is currently open in the dialog
  const [dialogSkuUpc, setDialogSkuUpc] = useState<string | null>(null);

  // Forecast (lead-time demand) breakdown dialog — keyed by SKU upc
  const [forecastSkuUpc, setForecastSkuUpc] = useState<string | null>(null);

  const servicedStores = useMemo(() => getServicedStores(styleCode, whCode), [styleCode, whCode]);

  const styleSkus = useMemo(
    () => generateAggregatedSkus(styleCode, styleDesc, whCode, servicedStores.length),
    [styleCode, styleDesc, whCode, servicedStores.length],
  );

  const vendorStyles = useMemo(
    () => generateVendorStyles(vendorCode, styleCode, styleDesc),
    [vendorCode, styleCode, styleDesc],
  );

  const vendorSkus = useMemo(
    () => vendorStyles.flatMap((st) =>
      generateAggregatedSkus(st.styleCode, st.styleDesc, whCode, servicedStores.length)
    ),
    [vendorStyles, whCode, servicedStores.length],
  );

  const allSkus = scope === "vendor" ? vendorSkus : styleSkus;

  // Build the effective per-store breakdown for a SKU: generated defaults
  // overlaid with any user overrides we've collected.
  const getPerStoreData = useCallback(
    (sku: SkuRow): PerStoreSkuRow[] => {
      const generated = generatePerStoreForSku(sku, servicedStores);
      const overrides = storeQtyOverrides[sku.upc];
      if (!overrides) return generated;
      return generated.map((s) => ({
        ...s,
        suggestedQty: overrides[s.storeId] ?? s.suggestedQty,
      }));
    },
    [servicedStores, storeQtyOverrides],
  );

  const getEffectiveSuggQty = useCallback(
    (sku: SkuRow): number => {
      if (skuQtyOverrides[sku.upc] !== undefined) return skuQtyOverrides[sku.upc];
      return getPerStoreData(sku).reduce((acc, s) => acc + s.suggestedQty, 0);
    },
    [getPerStoreData, skuQtyOverrides],
  );

  // Has the user touched this SKU's quantities (either via the row-level input
  // or via the per-store dialog)?
  const isOverridden = (upc: string) =>
    Boolean(storeQtyOverrides[upc]) || skuQtyOverrides[upc] !== undefined;

  // Inline edit on the SKU row.
  const setSkuQty = (upc: string, qty: number) => {
    setSkuQtyOverrides((prev) => ({ ...prev, [upc]: Math.max(0, Math.round(qty || 0)) }));
  };

  // Apply the per-store quantities entered in the dialog to the override map.
  const applyStoreOverrides = (upc: string, perStore: PerStoreSkuRow[]) => {
    setStoreQtyOverrides((prev) => ({
      ...prev,
      [upc]: perStore.reduce<Record<string, number>>((acc, s) => {
        acc[s.storeId] = Math.max(0, Math.round(s.suggestedQty));
        return acc;
      }, {}),
    }));
  };

  // Drop overrides for a SKU and revert to generated suggested qty.
  const resetSku = (upc: string) => {
    setStoreQtyOverrides((prev) => {
      const next = { ...prev };
      delete next[upc];
      return next;
    });
    setSkuQtyOverrides((prev) => {
      const next = { ...prev };
      delete next[upc];
      return next;
    });
  };

  const skuData = useMemo(() => {
    // Project each SKU through the override layer so the table shows the
    // rolled-up per-store quantities the planner has dialled in.
    let rows: SkuRow[] = (showAllSkus ? allSkus : allSkus.filter((s) => s.totalDeficit > 0))
      .map((s) => ({ ...s, suggestedQty: getEffectiveSuggQty(s) }));

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
  }, [allSkus, search, sortCol, sortDir, showAllSkus, getEffectiveSuggQty]);

  const totals = useMemo(() => ({
    deficit:  skuData.reduce((s, r) => s + r.totalDeficit, 0),
    orderQty: skuData.reduce((s, r) => s + r.suggestedQty, 0),
    skus:     skuData.filter((s) => s.totalDeficit > 0).length,
    value:    skuData.reduce((s, r) => s + r.suggestedQty * r.cost, 0),
  }), [skuData]);

  const selectedTotals = useMemo(() => {
    const sel = skuData.filter((s) => selectedSkus.has(s.upc));
    return {
      count:    sel.length,
      orderQty: sel.reduce((s, r) => s + r.suggestedQty, 0),
      value:    sel.reduce((s, r) => s + r.suggestedQty * r.cost, 0),
    };
  }, [selectedSkus, skuData]);

  const dialogSku = useMemo(
    () => (dialogSkuUpc ? skuData.find((s) => s.upc === dialogSkuUpc) ?? null : null),
    [dialogSkuUpc, skuData],
  );

  const handleSort = (col: string) => {
    if (sortCol !== col) { setSortCol(col); setSortDir("desc"); }
    else if (sortDir === "desc") setSortDir("asc");
    else { setSortCol("warehouseWos"); setSortDir("asc"); }
  };

  const toggleSku = (upc: string) => {
    setSelectedSkus((prev) => {
      const next = new Set(prev);
      next.has(upc) ? next.delete(upc) : next.add(upc);
      return next;
    });
  };

  const allOrderableUpcs = useMemo(
    () => skuData.filter((s) => s.suggestedQty > 0).map((s) => s.upc),
    [skuData],
  );
  const allSelected = allOrderableUpcs.length > 0 && allOrderableUpcs.every((u) => selectedSkus.has(u));

  const toggleAll = () => {
    if (allSelected) setSelectedSkus(new Set());
    else setSelectedSkus(new Set(allOrderableUpcs));
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

  const openCreatePO = () => {
    const upcs = selectedSkus.size > 0 ? Array.from(selectedSkus) : allOrderableUpcs;
    if (upcs.length === 0) return;
    navigate(
      `/reports/sip-planning/create-po?vendor=${encodeURIComponent(vendorName)}` +
      `&vendorCode=${vendorCode}` +
      `&loc=warehouse` +
      `&code=${encodeURIComponent(whCode)}` +
      `&name=${encodeURIComponent(whName)}` +
      `&region=${encodeURIComponent(region)}` +
      `&style=${styleCode}` +
      `&desc=${encodeURIComponent(styleDesc)}`
    );
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
            <ChevronLeft size={14} /> Network Deficit
          </button>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">Warehouse SKU Detail</h1>
              <p className="text-sm text-slate-500 mt-0.5 truncate max-w-xl">
                Style <span className="font-mono font-bold text-primary">{styleCode}</span> — {styleDesc}
              </p>
            </div>
            <Button
              size="sm" className="gap-1.5 text-xs font-bold bg-primary shrink-0"
              disabled={allOrderableUpcs.length === 0}
              onClick={openCreatePO}
            >
              <ShoppingCart size={13} />
              {selectedSkus.size > 0
                ? `Create PO (${selectedSkus.size} SKU${selectedSkus.size === 1 ? "" : "s"})`
                : `Create PO — All SKUs`}
            </Button>
          </div>
        </div>

        {/* Context: Warehouse + Vendor (prominent) */}
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
                  {/* Warehouse block */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-indigo-200 text-indigo-700">
                      <Warehouse size={22} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
                        Warehouse
                      </p>
                      <p className="text-base font-bold text-slate-900 mt-1 truncate" title={whName}>
                        {whName}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 inline-flex items-center gap-2 flex-wrap">
                        <span>Code: <span className="font-mono font-semibold text-slate-700">{whCode}</span></span>
                        <span className="text-slate-300">·</span>
                        <span>Region: <span className="font-semibold text-slate-700">{region}</span></span>
                        <span className="text-slate-300">·</span>
                        <span className="inline-flex items-center gap-1">
                          <StoreIcon size={10} /> Servicing <span className="font-semibold text-slate-700">{servicedStores.length}</span> stores
                        </span>
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

        {/* Summary pills */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: "SKUs with Net Demand",   value: totals.skus, color: "text-red-600 bg-red-50 border-red-200" },
            { label: "Aggregated Net Demand",  value: totals.deficit.toLocaleString(), color: "text-orange-600 bg-orange-50 border-orange-200" },
            { label: "Suggested order qty",    value: totals.orderQty.toLocaleString(), color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
            { label: "Estimated PO value",     value: `$${totals.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: "text-primary bg-primary/10 border-primary/30" },
          ].map(({ label, value, color }) => (
            <div key={label} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold", color)}>
              {label}: <span className="text-sm font-bold">{value}</span>
            </div>
          ))}
        </div>

        {/* Stores serviced strip */}
        {servicedStores.length > 0 && (
          <Card className="border-border/60 shadow-none bg-slate-50/40">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <StoreIcon size={12} className="text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Stores serviced by this warehouse
                </span>
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-white border-slate-200 text-slate-600">
                  {servicedStores.length}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {servicedStores.map((s) => (
                  <div
                    key={s.storeId}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] bg-white",
                      s.deficit > 0 ? "border-red-200" : "border-slate-200",
                    )}
                  >
                    <span className="font-mono text-slate-400">{s.storeId}</span>
                    <span className="font-medium text-slate-700">{s.storeName}</span>
                    {s.deficit > 0 && (
                      <span className="text-red-600 font-bold tabular-nums">−{s.deficit}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
                    onClick={() => { setScope("style"); setSelectedSkus(new Set()); }}
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
                    onClick={() => { setScope("vendor"); setSelectedSkus(new Set()); }}
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
                {showAllSkus ? "Showing all SKUs" : "Showing Net Demand SKUs only"}
              </button>
              {(search || selectedSkus.size > 0) && (
                <Button size="sm" variant="outline" className="h-8 text-[11px]"
                  onClick={() => { setSearch(""); setSelectedSkus(new Set()); }}>
                  Clear
                </Button>
              )}
              {selectedSkus.size > 0 && (
                <div className="ml-auto inline-flex items-center gap-2 text-[11px] text-slate-600 bg-primary/5 border border-primary/20 rounded-md px-2.5 py-1.5">
                  <strong className="text-primary">{selectedTotals.count}</strong> selected ·
                  <span><strong>{selectedTotals.orderQty.toLocaleString()}</strong> units</span> ·
                  <span>est. <strong>${selectedTotals.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong></span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border/60 shadow-none overflow-hidden">
          <div className="overflow-x-auto">
            <table className="text-xs w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-border/50">
                  <th className="px-3 py-2.5 text-center font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-3.5 w-3.5 cursor-pointer accent-primary"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-2.5 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20">UPC</th>
                  {scope === "vendor" && (
                    <th className="px-2.5 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 whitespace-nowrap">Style</th>
                  )}
                  <th className="px-2.5 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20">Variant</th>
                  <th className="px-2.5 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 min-w-[140px]">Description</th>
                  {[
                    { col: "storesNeeding",         label: "Stores"      },
                    { col: "pressStock",            label: "Pres. Stock" },
                    { col: "whOnhand",              label: "WH On Hand"  },
                    { col: "warehouseWos",          label: "WH WOS"      },
                    { col: "totalSales",            label: "Net Demand"  },
                    { col: "totalOnOrder",          label: "On Order"    },
                    { col: "warehouseAvailability", label: "WH Avail."   },
                    { col: "suggestedQty",          label: "Sugg. Qty"   },
                  ].map(({ col, label }) => (
                    <th key={col}
                      onClick={() => handleSort(col)}
                      className={cn(
                        "px-2 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wide border-r border-border/20 last:border-r-0 cursor-pointer hover:bg-slate-100 select-none text-slate-500 leading-tight",
                        sortCol === col && "bg-slate-100",
                      )}
                    >
                      <span className="inline-flex items-center justify-end gap-0.5">
                        {label} <SortIcon col={col} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skuData.map((sku, i) => {
                  const level = defLevel(sku.totalDeficit);
                  const checked = selectedSkus.has(sku.upc);
                  const orderable = sku.suggestedQty > 0;
                  const isCurrentStyle = sku.styleCode === styleCode;
                  return (
                    <tr key={`${sku.styleCode}-${sku.upc}`}
                      className={cn(
                        "border-b border-border/20 transition-colors",
                        checked ? "bg-primary/5" : i % 2 === 0 ? "bg-background hover:bg-slate-50/60" : "bg-muted/[0.02] hover:bg-slate-50/60"
                      )}
                    >
                      <td className="px-3 py-2.5 text-center border-r border-border/20">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!orderable}
                          onChange={() => toggleSku(sku.upc)}
                          className="h-3.5 w-3.5 cursor-pointer accent-primary disabled:cursor-not-allowed disabled:opacity-30"
                          aria-label={`Select ${sku.variant}`}
                        />
                      </td>
                      <td className="px-2.5 py-2.5 font-mono text-[10px] text-slate-500 border-r border-border/20 whitespace-nowrap">{sku.upc}</td>
                      {scope === "vendor" && (
                        <td className="px-2.5 py-2.5 border-r border-border/20 whitespace-nowrap">
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
                      <td className="px-2.5 py-2.5 border-r border-border/20">
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-slate-50 text-slate-700 border-slate-200 whitespace-nowrap">
                          {sku.variant}
                        </Badge>
                      </td>
                      <td className="px-2.5 py-2.5 border-r border-border/20 text-slate-600 max-w-[160px] truncate" title={sku.description}>
                        {sku.description}
                      </td>
                      <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-600 border-r border-border/20">
                        <button
                          type="button"
                          onClick={() => setDialogSkuUpc(sku.upc)}
                          data-testid={`button-stores-${sku.upc}`}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-primary hover:bg-primary/10 hover:underline transition-colors font-semibold"
                          title="View / edit per-store net demand and suggested order quantities"
                        >
                          <StoreIcon size={11} />
                          {sku.storesNeeding}
                        </button>
                      </td>
                      <td
                        className="px-2.5 py-2.5 text-right tabular-nums text-slate-600 border-r border-border/20"
                        title="Quantity needed to fill the fixture across all serviced stores"
                        data-testid={`text-press-stock-${sku.upc}`}
                      >
                        {sku.pressStock.toLocaleString()}
                      </td>
                      <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-600 border-r border-border/20">{sku.whOnhand.toLocaleString()}</td>
                      <td className={cn("px-2.5 py-2.5 text-right tabular-nums border-r border-border/20",
                        sku.warehouseWos < 2 ? "text-red-500 font-semibold" : "text-slate-600"
                      )}>{sku.warehouseWos}</td>
                      <td className="px-2.5 py-2.5 text-right tabular-nums border-r border-border/20">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setForecastSkuUpc(sku.upc); }}
                          data-testid={`button-net-demand-${sku.upc}`}
                          className="text-red-600 hover:underline font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-red-300 rounded px-1"
                          title="View per-store weekly forecast for this SKU"
                        >
                          {sku.totalSales.toLocaleString()}
                        </button>
                      </td>
                      <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-600 border-r border-border/20">{sku.totalOnOrder.toLocaleString()}</td>
                      <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-600 border-r border-border/20">{sku.warehouseAvailability.toLocaleString()}</td>
                      <td className="px-2.5 py-2.5 text-right border-r border-border/20">
                        <div
                          className="inline-flex items-center gap-1.5 justify-end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isOverridden(sku.upc) && (
                            <button
                              type="button"
                              onClick={() => resetSku(sku.upc)}
                              className="text-slate-400 hover:text-slate-700 transition-colors"
                              title="Reset to system-suggested quantity"
                              data-testid={`button-reset-qty-${sku.upc}`}
                            >
                              <RotateCcw size={11} />
                            </button>
                          )}
                          <Input
                            type="number"
                            min={0}
                            value={sku.suggestedQty}
                            onChange={(e) => setSkuQty(sku.upc, Number(e.target.value))}
                            onFocus={(e) => e.target.select()}
                            data-testid={`input-sugg-qty-${sku.upc}`}
                            title={
                              skuQtyOverrides[sku.upc] !== undefined
                                ? "Edited by planner"
                                : storeQtyOverrides[sku.upc]
                                  ? "Rolled up from edited per-store quantities"
                                  : "System-suggested order quantity"
                            }
                            className={cn(
                              "h-7 w-16 text-right tabular-nums text-xs font-bold px-1.5",
                              "focus-visible:ring-1 focus-visible:ring-primary",
                              isOverridden(sku.upc)
                                ? "bg-amber-50 border-amber-300 text-amber-800"
                                : sku.suggestedQty > 0
                                  ? "text-primary border-slate-200"
                                  : "text-slate-400 border-slate-200",
                            )}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {skuData.length === 0 && (
                  <tr>
                    <td colSpan={scope === "vendor" ? 13 : 12} className="py-12 text-center">
                      <Package size={28} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-xs text-slate-400">
                        {showAllSkus ? "No SKUs found." : "No SKUs with Net Demand at this warehouse. Toggle to show all SKUs."}
                      </p>
                    </td>
                  </tr>
                )}

                {/* Totals row */}
                {skuData.length > 0 && (
                  <tr className="border-t-2 border-border/50 bg-slate-50 font-semibold">
                    <td className="border-r border-border/20" />
                    <td colSpan={scope === "vendor" ? 4 : 3} className="px-2.5 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 border-r border-border/20">
                      Total ({skuData.length} SKUs)
                    </td>
                    <td className="px-2.5 py-2.5 border-r border-border/20" />
                    <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-700 border-r border-border/20">
                      {skuData.reduce((s, r) => s + r.pressStock, 0).toLocaleString()}
                    </td>
                    <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-700 border-r border-border/20">
                      {skuData.reduce((s, r) => s + r.whOnhand, 0).toLocaleString()}
                    </td>
                    <td className="border-r border-border/20" />
                    <td className="px-2.5 py-2.5 text-right tabular-nums text-red-600 font-bold border-r border-border/20">
                      {skuData.reduce((s, r) => s + r.totalSales, 0).toLocaleString()}
                    </td>
                    <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-700 border-r border-border/20">
                      {skuData.reduce((s, r) => s + r.totalOnOrder, 0).toLocaleString()}
                    </td>
                    <td className="px-2.5 py-2.5 text-right tabular-nums text-slate-700 border-r border-border/20">
                      {skuData.reduce((s, r) => s + r.warehouseAvailability, 0).toLocaleString()}
                    </td>
                    <td className="px-2.5 py-2.5 text-right tabular-nums font-bold text-primary">
                      {totals.orderQty.toLocaleString()}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="text-[11px] text-muted-foreground">
          Aggregated SKU Net Demand across <strong>{servicedStores.length}</strong> stores serviced by <strong>{whName}</strong>.
          Select specific SKUs or use <strong>Create PO — All SKUs</strong> to raise a purchase order with {vendorName.split(",")[0]}.
        </p>
      </div>

      {/* Per-store weekly forecast breakdown for a single SKU */}
      {(() => {
        const fSku = forecastSkuUpc ? skuData.find((s) => s.upc === forecastSkuUpc) ?? null : null;
        if (!fSku) return null;
        return (
          <ForecastBreakdownDialog
            sku={fSku}
            whName={whName}
            perStore={getPerStoreData(fSku)}
            onClose={() => setForecastSkuUpc(null)}
          />
        );
      })()}

      {/* Per-store breakdown dialog. Only mount while a SKU is active so the
          working draft is always fresh on each open. */}
      {dialogSku && (
        <StoreDeficitDialog
          sku={dialogSku}
          whName={whName}
          initialPerStore={getPerStoreData(dialogSku)}
          onClose={() => setDialogSkuUpc(null)}
          onApply={(perStore) => {
            applyStoreOverrides(dialogSku.upc, perStore);
            setDialogSkuUpc(null);
          }}
          onReset={() => resetSku(dialogSku.upc)}
          isOverridden={isOverridden(dialogSku.upc)}
        />
      )}
    </MainLayout>
  );
}

// ─── Store-level deficit & order qty dialog ──────────────────────────────────
interface StoreDeficitDialogProps {
  sku:             SkuRow | null;
  whName:          string;
  initialPerStore: PerStoreSkuRow[];
  onClose:         () => void;
  onApply:         (perStore: PerStoreSkuRow[]) => void;
  onReset:         () => void;
  isOverridden:    boolean;
}

function StoreDeficitDialog({
  sku, whName, initialPerStore, onClose, onApply, onReset, isOverridden,
}: StoreDeficitDialogProps) {
  // Local working copy so the planner can tweak then apply / cancel.
  const [draft, setDraft] = useState<PerStoreSkuRow[]>(initialPerStore);
  const [storeSearch, setStoreSearch] = useState("");

  // Reset the draft whenever a new SKU is opened. We key on the SKU upc so
  // the planner's in-flight edits aren't trampled by re-renders.
  const draftKey = sku?.upc ?? "";
  useEffect(() => {
    setDraft(initialPerStore);
    setStoreSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  const totalDeficit = useMemo(() => draft.reduce((s, r) => s + r.deficit, 0), [draft]);
  const totalOrder   = useMemo(() => draft.reduce((s, r) => s + r.suggestedQty, 0), [draft]);
  const baselineTotal = useMemo(
    () => initialPerStore.reduce((s, r) => s + r.suggestedQty, 0),
    [initialPerStore],
  );
  const dirty = useMemo(
    () => draft.some((r, i) => r.suggestedQty !== initialPerStore[i]?.suggestedQty),
    [draft, initialPerStore],
  );

  const updateQty = (storeId: string, value: number) => {
    setDraft((prev) =>
      prev.map((r) =>
        r.storeId === storeId
          ? { ...r, suggestedQty: Math.max(0, Math.round(value || 0)) }
          : r,
      ),
    );
  };

  const matchDeficit = (storeId: string) => {
    setDraft((prev) =>
      prev.map((r) => (r.storeId === storeId ? { ...r, suggestedQty: r.deficit } : r)),
    );
  };

  const setAllToDeficit = () =>
    setDraft((prev) => prev.map((r) => ({ ...r, suggestedQty: r.deficit })));

  const zeroAll = () =>
    setDraft((prev) => prev.map((r) => ({ ...r, suggestedQty: 0 })));

  const filteredDraft = useMemo(() => {
    const q = storeSearch.trim().toLowerCase();
    if (!q) return draft;
    return draft.filter(
      (r) =>
        r.storeId.toLowerCase().includes(q) ||
        r.storeName.toLowerCase().includes(q) ||
        r.format.toLowerCase().includes(q),
    );
  }, [draft, storeSearch]);

  return (
    <Dialog open={sku !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0">
        <DialogHeader className="p-5 pb-4 border-b border-border/50">
          <DialogTitle className="flex items-center gap-2 text-base">
            <StoreIcon size={16} className="text-primary" />
            Store-level Net Demand & order quantities
          </DialogTitle>
          <DialogDescription className="text-xs mt-1">
            {sku ? (
              <>
                <span className="font-mono font-semibold text-slate-700">{sku.upc}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span className="font-semibold text-slate-700">{sku.variant}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span>{sku.description}</span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span>Serviced by <strong>{whName}</strong></span>
              </>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {/* Top metrics */}
        <div className="px-5 py-3 border-b border-border/40 bg-slate-50/50 flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Stores:</span>
            <strong className="text-slate-800">{draft.length}</strong>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Σ Net Demand:</span>
            <strong className="text-red-600">{totalDeficit.toLocaleString()}</strong>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Σ Order qty:</span>
            <strong className="text-primary">{totalOrder.toLocaleString()}</strong>
            {baselineTotal !== totalOrder && (
              <span className="text-[10px] text-slate-400">
                (was {baselineTotal.toLocaleString()})
              </span>
            )}
          </div>

          <div className="ml-auto inline-flex items-center gap-1.5">
            <Button
              size="sm" variant="outline" className="h-7 text-[10px]"
              onClick={setAllToDeficit}
              data-testid="button-match-all-deficit"
            >
              Match Net Demand (all)
            </Button>
            <Button
              size="sm" variant="outline" className="h-7 text-[10px]"
              onClick={zeroAll}
              data-testid="button-zero-all"
            >
              Zero all
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-2 border-b border-border/40">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
              placeholder="Filter by store ID, name or format…"
              className="h-8 pl-7 text-[11px] border-slate-200"
              data-testid="input-store-search"
            />
          </div>
        </div>

        {/* Per-store table */}
        <div className="max-h-[55vh] overflow-y-auto">
          <table className="text-xs w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50">
              <tr className="border-b-2 border-border/50">
                <th className="px-4 py-2 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500">Store</th>
                <th className="px-4 py-2 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500">Format</th>
                <th className="px-4 py-2 text-right font-semibold text-[10px] uppercase tracking-wide text-red-600">Net Demand</th>
                <th className="px-4 py-2 text-right font-semibold text-[10px] uppercase tracking-wide text-slate-500">Sugg. qty</th>
                <th className="px-2 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {filteredDraft.map((row, i) => {
                const baseline = initialPerStore.find((r) => r.storeId === row.storeId)?.suggestedQty ?? 0;
                const edited   = row.suggestedQty !== baseline;
                return (
                  <tr
                    key={row.storeId}
                    className={cn(
                      "border-b border-border/20 transition-colors",
                      i % 2 === 0 ? "bg-background" : "bg-muted/[0.02]",
                      edited && "bg-amber-50/40",
                    )}
                  >
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-slate-400">{row.storeId}</span>
                        <span className="font-medium text-slate-700">{row.storeName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <Badge variant="outline" className="text-[9px] h-4 px-1 bg-slate-50 text-slate-600 border-slate-200">
                        {row.format}
                      </Badge>
                    </td>
                    <td className={cn(
                      "px-4 py-2 text-right tabular-nums font-semibold",
                      row.deficit > 0 ? "text-red-600" : "text-slate-300",
                    )}>
                      {row.deficit > 0 ? row.deficit.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Input
                        type="number"
                        min={0}
                        value={row.suggestedQty}
                        onChange={(e) => updateQty(row.storeId, Number(e.target.value))}
                        onFocus={(e) => e.currentTarget.select()}
                        data-testid={`input-store-qty-${row.storeId}`}
                        className={cn(
                          "h-7 w-20 text-right tabular-nums px-2 text-[11px] ml-auto",
                          row.suggestedQty > 0 ? "font-bold text-primary" : "text-slate-400",
                          edited && "bg-amber-50 border-amber-300",
                        )}
                      />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => matchDeficit(row.storeId)}
                        title="Match this store's Net Demand"
                        data-testid={`button-match-deficit-${row.storeId}`}
                        className="text-slate-400 hover:text-primary transition-colors p-1 rounded hover:bg-primary/10"
                      >
                        <Pencil size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredDraft.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-slate-400">
                    No stores match your search.
                  </td>
                </tr>
              )}
            </tbody>
            {filteredDraft.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border/50 bg-slate-50 font-semibold">
                  <td colSpan={2} className="px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Total ({draft.length} stores)
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-red-700">
                    {totalDeficit.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-primary">
                    {totalOrder.toLocaleString()}
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <DialogFooter className="p-4 border-t border-border/50 flex flex-row items-center justify-between gap-2">
          <div className="text-[10px] text-slate-500 mr-auto">
            {dirty
              ? "Updates roll up to the SKU on apply."
              : isOverridden
                ? "This SKU has saved per-store overrides."
                : "Edit any quantity to override the suggestion."}
          </div>
          {isOverridden && (
            <Button
              size="sm" variant="outline" className="h-8 text-[11px] gap-1.5"
              onClick={() => { onReset(); onClose(); }}
              data-testid="button-reset-overrides"
            >
              <RotateCcw size={12} /> Reset to suggested
            </Button>
          )}
          <Button
            size="sm" variant="ghost" className="h-8 text-[11px]"
            onClick={onClose}
            data-testid="button-cancel-store-edit"
          >
            Cancel
          </Button>
          <Button
            size="sm" className="h-8 text-[11px] bg-primary"
            onClick={() => onApply(draft)}
            disabled={!dirty}
            data-testid="button-apply-store-edit"
          >
            Apply & roll up
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sparkline (inline SVG) for week-on-week forecast trend ──────────────────
interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  className?: string;
  testId?: string;
}

function Sparkline({ values, width = 88, height = 26, className, testId }: SparklineProps) {
  if (!values.length) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : width;

  const pts = values.map((v, i) => {
    const x = i * stepX;
    const y = height - 2 - ((v - min) / range) * (height - 4);
    return [x, y] as const;
  });

  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1][0].toFixed(1)},${height} L0,${height} Z`;

  const first = values[0];
  const last  = values[values.length - 1];
  const up    = last > first;
  const flat  = last === first;
  const stroke = flat ? "#94a3b8" : up ? "#dc2626" : "#16a34a";
  const fill   = flat ? "#94a3b81a" : up ? "#dc26261a" : "#16a34a1a";

  const [lx, ly] = pts[pts.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      data-testid={testId}
      aria-hidden="true"
    >
      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={1.25} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r={1.8} fill={stroke} />
    </svg>
  );
}

function trendDelta(values: number[]): { pct: number; up: boolean; flat: boolean } {
  if (values.length < 2) return { pct: 0, up: false, flat: true };
  const first = values[0];
  const last  = values[values.length - 1];
  if (first === 0 && last === 0) return { pct: 0, up: false, flat: true };
  if (first === 0)               return { pct: 100, up: last > 0, flat: false };
  const pct = ((last - first) / first) * 100;
  return { pct, up: pct > 0, flat: Math.abs(pct) < 0.5 };
}

// ─── Forecast (lead-time demand) weekly breakdown dialog ─────────────────────
interface ForecastBreakdownDialogProps {
  sku:      SkuRow;
  whName:   string;
  perStore: PerStoreSkuRow[];
  onClose:  () => void;
}

function ForecastBreakdownDialog({ sku, whName, perStore, onClose }: ForecastBreakdownDialogProps) {
  const WEEKS = 8;
  const [search, setSearch]   = useState("");
  const [formatFilter, setFormatFilter] = useState<string>("all");

  // Compute the per-week forecast for every store carrying this SKU.
  const matrix = useMemo(() => {
    return perStore.map((s) => ({
      store:  s,
      weekly: buildWeeklyForecast(sku.upc + s.storeId, s.sales, WEEKS),
    }));
  }, [sku.upc, perStore]);

  const formats = useMemo(
    () => Array.from(new Set(perStore.map((s) => s.format))).sort(),
    [perStore],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return matrix.filter(({ store }) => {
      if (formatFilter !== "all" && store.format !== formatFilter) return false;
      if (!q) return true;
      return (
        store.storeId.toLowerCase().includes(q) ||
        store.storeName.toLowerCase().includes(q) ||
        store.format.toLowerCase().includes(q)
      );
    });
  }, [matrix, search, formatFilter]);

  // Compute the visible-rows totals (responds to search/filter)
  const filteredWeekTotals = useMemo(() => {
    const arr = Array(WEEKS).fill(0);
    filtered.forEach((row) => row.weekly.forEach((v, i) => { arr[i] += v; }));
    return arr;
  }, [filtered]);

  const filteredGrandTotal = filteredWeekTotals.reduce((a, b) => a + b, 0);

  // Generate week labels starting from the upcoming Monday for clarity.
  const weekLabels = useMemo(() => {
    const labels: string[] = [];
    const start = new Date();
    const day   = start.getDay();
    // Move to next Monday (or today if already Monday)
    const offset = day === 0 ? 1 : (8 - day) % 7;
    start.setDate(start.getDate() + offset);
    for (let i = 0; i < WEEKS; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i * 7);
      labels.push(d.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
    }
    return labels;
  }, []);

  return (
    <Dialog open={true} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl p-0 gap-0">
        <DialogHeader className="px-5 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <StoreIcon size={16} className="text-primary" />
            Net Demand · Per-Store Weekly Forecast
          </DialogTitle>
          <DialogDescription className="text-[11px] mt-1">
            <span className="font-mono font-semibold text-slate-700">{sku.upc}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="font-semibold text-slate-700">{sku.variant}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span>{sku.description}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span>Serviced by <strong>{whName}</strong></span>
          </DialogDescription>
        </DialogHeader>

        {/* Top metrics */}
        <div className="px-5 py-3 border-b border-border/40 bg-slate-50/50 flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Stores:</span>
            <strong className="text-slate-800">{filtered.length}<span className="text-slate-400 font-normal">/{matrix.length}</span></strong>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Forecast horizon:</span>
            <strong className="text-slate-800">{WEEKS} weeks</strong>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Σ Net Demand:</span>
            <strong className="text-red-600">{filteredGrandTotal.toLocaleString()}</strong>
          </div>
          <span className="text-slate-300">·</span>
          <div className="flex items-center gap-1.5" data-testid="metric-overall-trend">
            <span className="text-slate-500">Trend (W1→W{WEEKS}):</span>
            <Sparkline values={filteredWeekTotals} width={70} height={20} />
            {(() => {
              const d = trendDelta(filteredWeekTotals);
              const cls = d.flat ? "text-slate-500" : d.up ? "text-red-600" : "text-emerald-600";
              const sign = d.flat ? "" : d.up ? "▲" : "▼";
              return (
                <strong className={cls}>
                  {sign} {d.flat ? "flat" : `${Math.abs(d.pct).toFixed(1)}%`}
                </strong>
              );
            })()}
          </div>
        </div>

        {/* Search + format filter */}
        <div className="px-5 py-2 border-b border-border/40 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by store ID, name or format…"
              className="h-8 pl-7 text-[11px] border-slate-200"
              data-testid="input-forecast-search"
            />
          </div>
          {formats.length > 1 && (
            <select
              value={formatFilter}
              onChange={(e) => setFormatFilter(e.target.value)}
              className="h-8 text-[11px] border border-slate-200 rounded-md px-2 bg-white"
              data-testid="select-forecast-format"
            >
              <option value="all">All formats</option>
              {formats.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          )}
        </div>

        <div className="overflow-auto max-h-[55vh]">
          <table className="w-full text-[11px]">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr className="border-b border-border/40">
                <th className="px-3 py-2 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20">
                  Store
                </th>
                <th className="px-3 py-2 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20">
                  Format
                </th>
                <th className="px-3 py-2 text-center font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 whitespace-nowrap">
                  Trend
                </th>
                {weekLabels.map((lbl, i) => (
                  <th key={i} className="px-3 py-2 text-right font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 whitespace-nowrap">
                    <div>Week {i + 1}</div>
                    <div className="font-normal text-slate-400 normal-case">{lbl}</div>
                  </th>
                ))}
                <th className="px-3 py-2 text-right font-semibold text-[10px] uppercase tracking-wide text-slate-500 bg-slate-100 whitespace-nowrap">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={WEEKS + 4} className="py-8 text-center text-xs text-slate-400">
                    No stores match your filters.
                  </td>
                </tr>
              )}
              {filtered.map(({ store, weekly }, i) => {
                const total = weekly.reduce((a, b) => a + b, 0);
                const d = trendDelta(weekly);
                const deltaCls = d.flat ? "text-slate-500" : d.up ? "text-red-600" : "text-emerald-600";
                const deltaSign = d.flat ? "" : d.up ? "▲" : "▼";
                const deltaTitle = d.flat
                  ? "Forecast is flat across the horizon"
                  : `${d.up ? "Up" : "Down"} ${Math.abs(d.pct).toFixed(1)}% from Week 1 to Week ${weekly.length}`;
                return (
                  <tr
                    key={store.storeId}
                    className={cn(
                      "border-b border-border/20",
                      i % 2 === 0 ? "bg-background" : "bg-muted/[0.02]",
                    )}
                    data-testid={`row-forecast-${store.storeId}`}
                  >
                    <td className="px-3 py-2 border-r border-border/20 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <StoreIcon size={11} className="text-slate-400 shrink-0" />
                        <span className="font-mono text-[10px] text-slate-500">{store.storeId}</span>
                        <span className="text-slate-700">{store.storeName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 border-r border-border/20">
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-slate-50 text-slate-600">
                        {store.format}
                      </Badge>
                    </td>
                    <td
                      className="px-3 py-1 border-r border-border/20 align-middle"
                      title={deltaTitle}
                    >
                      <div className="flex items-center gap-2">
                        <Sparkline
                          values={weekly}
                          testId={`sparkline-forecast-${store.storeId}`}
                        />
                        <span
                          className={cn("text-[10px] font-semibold tabular-nums whitespace-nowrap", deltaCls)}
                          data-testid={`text-forecast-delta-${store.storeId}`}
                        >
                          {deltaSign} {d.flat ? "—" : `${Math.abs(d.pct).toFixed(0)}%`}
                        </span>
                      </div>
                    </td>
                    {weekly.map((v, w) => (
                      <td key={w} className="px-3 py-2 text-right tabular-nums text-slate-600 border-r border-border/20"
                        data-testid={`text-forecast-${store.storeId}-w${w + 1}`}
                      >
                        {v.toLocaleString()}
                      </td>
                    ))}
                    <td className="px-3 py-2 text-right tabular-nums font-bold text-slate-800 bg-slate-50">
                      {total.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border/50 bg-slate-100 font-semibold sticky bottom-0">
                  <td colSpan={2} className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-600 border-r border-border/20">
                    Total ({filtered.length} stores)
                  </td>
                  <td className="px-3 py-1 border-r border-border/20 align-middle">
                    {(() => {
                      const d = trendDelta(filteredWeekTotals);
                      const cls = d.flat ? "text-slate-500" : d.up ? "text-red-600" : "text-emerald-600";
                      const sign = d.flat ? "" : d.up ? "▲" : "▼";
                      return (
                        <div className="flex items-center gap-2">
                          <Sparkline values={filteredWeekTotals} testId="sparkline-forecast-total" />
                          <span className={cn("text-[10px] font-semibold tabular-nums whitespace-nowrap", cls)}>
                            {sign} {d.flat ? "—" : `${Math.abs(d.pct).toFixed(0)}%`}
                          </span>
                        </div>
                      );
                    })()}
                  </td>
                  {filteredWeekTotals.map((v, i) => (
                    <td key={i} className="px-3 py-2 text-right tabular-nums text-slate-800 border-r border-border/20">
                      {v.toLocaleString()}
                    </td>
                  ))}
                  <td className="px-3 py-2 text-right tabular-nums font-bold text-primary bg-primary/5">
                    {filteredGrandTotal.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <DialogFooter className="px-5 py-3 border-t bg-slate-50">
          <Button
            size="sm" variant="outline" className="h-8 text-[11px]"
            onClick={onClose}
            data-testid="button-close-forecast"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

