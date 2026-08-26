import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft, ShoppingCart, CheckCircle2,
  Package, AlertCircle, AlertTriangle, Search, Warehouse, Store, MapPin,
  CalendarDays, CalendarClock, Truck, Clock, XCircle, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Seeded RNG (matches StyleStores / WarehouseSkus) ─────────────────────────
function hashStr(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function seededRng(seed: number) {
  let s = seed | 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
}

// ─── SKU-level mock catalogue per vendor ──────────────────────────────────────
interface SkuLine {
  upc:          string;
  styleCode:    string;
  variant:      string;
  description:  string;
  moq:          number;
  orderMultiple:number;
  deficit:      number;
  suggestedQty: number;
  cost:         number;
}

const VENDOR_SKUS: Record<string, SkuLine[]> = {
  "INGRAM MICRO, INC.": [
    { upc: "190199001234", styleCode: "1000007", variant: "WHITE",     description: "APPLE LB AIRPODS PRO GEN 3 TRUE WIRELESS EARBUDS WHITE",           moq: 12, orderMultiple: 6,  deficit: 98,  suggestedQty: 120, cost: 189.99 },
    { upc: "190199001235", styleCode: "1000007", variant: "MIDNIGHT",  description: "APPLE LB AIRPODS PRO GEN 3 TRUE WIRELESS EARBUDS MIDNIGHT",         moq: 12, orderMultiple: 6,  deficit: 55,  suggestedQty: 60,  cost: 189.99 },
    { upc: "190199001236", styleCode: "1000014", variant: "WHITE",     description: "APPLE AIRPODS 4 ANC TRUE WIRELESS EARBUDS WHITE",                   moq: 10, orderMultiple: 10, deficit: 72,  suggestedQty: 80,  cost: 124.99 },
    { upc: "190199001237", styleCode: "1000014", variant: "BLACK",     description: "APPLE AIRPODS 4 ANC TRUE WIRELESS EARBUDS BLACK",                   moq: 10, orderMultiple: 10, deficit: 33,  suggestedQty: 40,  cost: 124.99 },
    { upc: "190199001238", styleCode: "1000021", variant: "MIDNIGHT",  description: "APPLE AIRPODS MAX OVER EAR WIRELESS HEADPHONES MIDNIGHT",           moq: 6,  orderMultiple: 6,  deficit: 30,  suggestedQty: 36,  cost: 349.99 },
    { upc: "190199001239", styleCode: "1000021", variant: "STARLIGHT", description: "APPLE AIRPODS MAX OVER EAR WIRELESS HEADPHONES STARLIGHT",          moq: 6,  orderMultiple: 6,  deficit: 18,  suggestedQty: 24,  cost: 349.99 },
    { upc: "190199001240", styleCode: "1000028", variant: "WHITE 1M",  description: "APPLE MAGSAFE CHARGER 1M USB-C WHITE",                              moq: 24, orderMultiple: 12, deficit: 210, suggestedQty: 240, cost: 24.99  },
    { upc: "190199001241", styleCode: "1000035", variant: "WHITE 1M",  description: "APPLE USB-C TO LIGHTNING CABLE 1M WHITE",                           moq: 24, orderMultiple: 12, deficit: 130, suggestedQty: 144, cost: 18.99  },
    { upc: "190199001242", styleCode: "1000042", variant: "WHITE",     description: "APPLE 20W USB-C POWER ADAPTER WHITE",                               moq: 24, orderMultiple: 24, deficit: 175, suggestedQty: 192, cost: 15.99  },
    { upc: "190199001243", styleCode: "1000042", variant: "BLACK",     description: "APPLE 20W USB-C POWER ADAPTER BLACK",                               moq: 24, orderMultiple: 24, deficit: 88,  suggestedQty: 96,  cost: 15.99  },
  ],
  "BOSE CORPORATION": [
    { upc: "017817825320", styleCode: "1000049", variant: "BLACK",     description: "BOSE QUIETCOMFORT 45 WIRELESS HEADPHONES BLACK",                    moq: 6,  orderMultiple: 6,  deficit: 52,  suggestedQty: 60,  cost: 209.95 },
    { upc: "017817825321", styleCode: "1000049", variant: "WHITE",     description: "BOSE QUIETCOMFORT 45 WIRELESS HEADPHONES WHITE",                    moq: 6,  orderMultiple: 6,  deficit: 28,  suggestedQty: 30,  cost: 209.95 },
    { upc: "017817825322", styleCode: "1000056", variant: "BLACK",     description: "BOSE QUIETCOMFORT EARBUDS II TRUE WIRELESS BLACK",                  moq: 6,  orderMultiple: 6,  deficit: 40,  suggestedQty: 48,  cost: 179.95 },
    { upc: "017817825323", styleCode: "1000063", variant: "BLACK",     description: "BOSE SOUNDLINK FLEX PORTABLE SPEAKER BLACK",                        moq: 6,  orderMultiple: 6,  deficit: 63,  suggestedQty: 72,  cost: 94.95  },
    { upc: "017817825324", styleCode: "1000063", variant: "BLUE",      description: "BOSE SOUNDLINK FLEX PORTABLE SPEAKER BLUE",                         moq: 6,  orderMultiple: 6,  deficit: 22,  suggestedQty: 24,  cost: 94.95  },
    { upc: "017817825325", styleCode: "1000070", variant: "BLACK",     description: "BOSE SPORT EARBUDS TRUE WIRELESS IN EAR BLACK",                    moq: 6,  orderMultiple: 6,  deficit: 31,  suggestedQty: 36,  cost: 114.95 },
  ],
  "SONY ELECTRONICS INC.": [
    { upc: "027242924819", styleCode: "1000077", variant: "BLACK",     description: "SONY WH-1000XM5 NOISE CANCELLING HEADPHONES BLACK",                 moq: 6,  orderMultiple: 6,  deficit: 48,  suggestedQty: 54,  cost: 224.99 },
    { upc: "027242924820", styleCode: "1000077", variant: "SILVER",    description: "SONY WH-1000XM5 NOISE CANCELLING HEADPHONES SILVER",                moq: 6,  orderMultiple: 6,  deficit: 21,  suggestedQty: 24,  cost: 224.99 },
    { upc: "027242924821", styleCode: "1000084", variant: "BLACK",     description: "SONY WF-1000XM5 TRUE WIRELESS EARBUDS BLACK",                       moq: 6,  orderMultiple: 6,  deficit: 42,  suggestedQty: 48,  cost: 179.99 },
    { upc: "027242924822", styleCode: "1000084", variant: "SILVER",    description: "SONY WF-1000XM5 TRUE WIRELESS EARBUDS SILVER",                      moq: 6,  orderMultiple: 6,  deficit: 19,  suggestedQty: 24,  cost: 179.99 },
    { upc: "027242924823", styleCode: "1000091", variant: "WHITE",     description: "SONY LINKBUDS S NOISE CANCELLING EARBUDS WHITE",                    moq: 12, orderMultiple: 12, deficit: 85,  suggestedQty: 96,  cost: 94.99  },
    { upc: "027242924824", styleCode: "1000098", variant: "BLACK",     description: "SONY SRS-XB100 COMPACT PORTABLE SPEAKER BLACK",                     moq: 12, orderMultiple: 12, deficit: 132, suggestedQty: 144, cost: 37.99  },
    { upc: "027242924825", styleCode: "1000098", variant: "BLUE",      description: "SONY SRS-XB100 COMPACT PORTABLE SPEAKER BLUE",                      moq: 12, orderMultiple: 12, deficit: 44,  suggestedQty: 48,  cost: 37.99  },
  ],
  "HARMAN INTERNATIONAL": [
    { upc: "050036381350", styleCode: "1000105", variant: "BLACK",     description: "JBL TUNE 770NC WIRELESS NOISE CANCELLING HEADPHONES BLACK",         moq: 10, orderMultiple: 10, deficit: 72,  suggestedQty: 80,  cost: 82.99  },
    { upc: "050036381351", styleCode: "1000105", variant: "WHITE",     description: "JBL TUNE 770NC WIRELESS NOISE CANCELLING HEADPHONES WHITE",         moq: 10, orderMultiple: 10, deficit: 38,  suggestedQty: 40,  cost: 82.99  },
    { upc: "050036381352", styleCode: "1000112", variant: "BLACK",     description: "JBL LIVE FREE 2 TWS WIRELESS EARBUDS BLACK",                        moq: 10, orderMultiple: 10, deficit: 55,  suggestedQty: 60,  cost: 62.99  },
    { upc: "050036381353", styleCode: "1000119", variant: "BLACK",     description: "JBL CHARGE 5 WATERPROOF BLUETOOTH SPEAKER BLACK",                   moq: 6,  orderMultiple: 6,  deficit: 43,  suggestedQty: 48,  cost: 112.99 },
    { upc: "050036381354", styleCode: "1000119", variant: "RED",       description: "JBL CHARGE 5 WATERPROOF BLUETOOTH SPEAKER RED",                     moq: 6,  orderMultiple: 6,  deficit: 17,  suggestedQty: 18,  cost: 112.99 },
    { upc: "050036381355", styleCode: "1000126", variant: "BLACK",     description: "JBL FLIP 6 WATERPROOF BLUETOOTH SPEAKER BLACK",                     moq: 6,  orderMultiple: 6,  deficit: 50,  suggestedQty: 54,  cost: 76.99  },
    { upc: "050036381356", styleCode: "1000133", variant: "BLACK",     description: "JBL TOUR PRO 2 NOISE CANCELLING EARBUDS BLACK",                     moq: 6,  orderMultiple: 6,  deficit: 26,  suggestedQty: 30,  cost: 139.99 },
  ],
  "SAMSUNG ELECTRONICS AMERICA": [
    { upc: "887276703305", styleCode: "1000140", variant: "SILVER",    description: "SAMSUNG GALAXY BUDS3 PRO TRUE WIRELESS EARBUDS SILVER",             moq: 6,  orderMultiple: 6,  deficit: 36,  suggestedQty: 42,  cost: 159.99 },
    { upc: "887276703306", styleCode: "1000140", variant: "BLACK",     description: "SAMSUNG GALAXY BUDS3 PRO TRUE WIRELESS EARBUDS BLACK",              moq: 6,  orderMultiple: 6,  deficit: 22,  suggestedQty: 24,  cost: 159.99 },
    { upc: "887276703307", styleCode: "1000147", variant: "SILVER",    description: "SAMSUNG GALAXY BUDS3 TRUE WIRELESS EARBUDS SILVER",                 moq: 6,  orderMultiple: 6,  deficit: 55,  suggestedQty: 60,  cost: 109.99 },
    { upc: "887276703308", styleCode: "1000154", variant: "BLACK",     description: "SAMSUNG 45W USB-C POWER ADAPTER SUPER FAST CHARGING BLACK",         moq: 24, orderMultiple: 12, deficit: 132, suggestedQty: 144, cost: 24.99  },
    { upc: "887276703309", styleCode: "1000161", variant: "BLACK 1.8M",description: "SAMSUNG USB-C TO USB-C CABLE 1.8M 5A FAST CHARGING BLACK",          moq: 24, orderMultiple: 12, deficit: 108, suggestedQty: 120, cost: 18.99  },
  ],
  "ANKER INNOVATIONS LIMITED": [
    { upc: "194644086572", styleCode: "1000168", variant: "BLACK",     description: "ANKER SOUNDCORE LIFE Q35 NOISE CANCELLING HEADPHONES BLACK",        moq: 10, orderMultiple: 10, deficit: 54,  suggestedQty: 60,  cost: 49.99  },
    { upc: "194644086573", styleCode: "1000175", variant: "BLACK",     description: "ANKER SOUNDCORE LIBERTY 4 NC TRUE WIRELESS EARBUDS BLACK",           moq: 10, orderMultiple: 10, deficit: 63,  suggestedQty: 70,  cost: 56.99  },
    { upc: "194644086574", styleCode: "1000175", variant: "WHITE",     description: "ANKER SOUNDCORE LIBERTY 4 NC TRUE WIRELESS EARBUDS WHITE",           moq: 10, orderMultiple: 10, deficit: 31,  suggestedQty: 40,  cost: 56.99  },
    { upc: "194644086575", styleCode: "1000182", variant: "BLACK",     description: "ANKER 737 POWER BANK 24000MAH 140W PORTABLE CHARGER BLACK",          moq: 10, orderMultiple: 10, deficit: 44,  suggestedQty: 50,  cost: 62.99  },
    { upc: "194644086576", styleCode: "1000189", variant: "BLACK",     description: "ANKER NANO 65W USB-C COMPACT FAST CHARGER BLACK",                   moq: 20, orderMultiple: 10, deficit: 73,  suggestedQty: 80,  cost: 28.99  },
    { upc: "194644086577", styleCode: "1000196", variant: "DARK BLUE", description: "ANKER 548 USB-C HUB 7-IN-1 DATA HUB DARK BLUE",                     moq: 10, orderMultiple: 10, deficit: 37,  suggestedQty: 40,  cost: 31.99  },
  ],
};

const DEFAULT_VENDOR   = "INGRAM MICRO, INC.";
const ALL_VENDOR_NAMES = Object.keys(VENDOR_SKUS);

// ─── Presentation stock helper ────────────────────────────────────────────────
// Presentation stock = qty needed to fill store fixtures across serviced stores.
function presStockFor(sku: SkuLine): number {
  const last2      = parseInt(sku.upc.slice(-2), 10) || 1;
  const perFixture = 2 + (last2 % 7);   // 2–8 facings per store
  const stores     = 4 + (last2 % 9);   // 4–12 stores serviced
  return perFixture * stores;
}

// ─── Per-delivery-point deficit generator ────────────────────────────────────
// Deterministic per (deliveryPointKey, upc). Returns 0 ⇒ SKU not in deficit at
// this delivery point (filtered out).
function deliveryPointDeficit(
  dpKey: string,
  upc: string,
  baseSuggested: number,
  multiple: number,
): { deficit: number; suggestedQty: number } {
  const rng = seededRng(hashStr(dpKey + "::" + upc));
  if (rng() < 0.30) return { deficit: 0, suggestedQty: 0 };
  const scale       = 0.08 + rng() * 0.32;
  const rawDeficit  = Math.max(1, Math.round(baseSuggested * 0.85 * scale));
  const suggestedQty = Math.ceil(rawDeficit / Math.max(1, multiple)) * Math.max(1, multiple);
  return { deficit: rawDeficit, suggestedQty };
}

// ─── Direct-to-Store metrics (per delivery point + SKU) ──────────────────────
// Deterministic mock metrics so the same store + SKU shows the same numbers.
interface StoreSkuMetrics {
  weeklySales:  number;
  forecast4Wk:  number;
  storeOnHand:  number;
  safetyStock:  number;
  coverageWks:  number;
}

function storeSkuMetrics(
  dpKey: string,
  sku: SkuLine,
  leadTimeDays: number,
): StoreSkuMetrics {
  const rng = seededRng(hashStr(dpKey + "::metrics::" + sku.upc));
  // Weekly sales scales with the SKU's deficit so heavier-deficit SKUs sell faster.
  const baseVelocity = Math.max(2, Math.round(sku.deficit * (0.08 + rng() * 0.18)));
  const weeklySales  = Math.max(1, baseVelocity);

  // Forecast = next 4 weeks of sales with small variance around current velocity.
  const variance     = 0.85 + rng() * 0.30; // 0.85–1.15
  const forecast4Wk  = Math.max(0, Math.round(weeklySales * 4 * variance));

  // Store on-hand = a fraction of forecast (often short for direct-to-store).
  const onHandFactor = 0.15 + rng() * 0.55; // 0.15–0.70
  const storeOnHand  = Math.max(0, Math.round(forecast4Wk * onHandFactor));

  // Safety stock = lead-time demand + 50% buffer, snapped to order multiple.
  const leadTimeWeeks = leadTimeDays / 7;
  const rawSafety     = weeklySales * leadTimeWeeks * 1.5;
  const mult          = Math.max(1, sku.orderMultiple);
  const safetyStock   = Math.max(mult, Math.ceil(rawSafety / mult) * mult);

  const coverageWks = weeklySales > 0 ? +(storeOnHand / weeklySales).toFixed(1) : 0;

  return { weeklySales, forecast4Wk, storeOnHand, safetyStock, coverageWks };
}

// Default direct-to-store receiving lead time (days)
const STORE_LEAD_TIME_DAYS = 7;

// ─── Vendor lead times (calendar days from PO submit → expected delivery) ────
interface VendorTerms {
  leadTimeDays: number;
  origin:       string;
}
const VENDOR_TERMS: Record<string, VendorTerms> = {
  "INGRAM MICRO, INC.":           { leadTimeDays: 7,  origin: "Domestic — IL"  },
  "BOSE CORPORATION":             { leadTimeDays: 14, origin: "Domestic — MA"  },
  "SONY ELECTRONICS INC.":        { leadTimeDays: 21, origin: "Import — JP"     },
  "HARMAN INTERNATIONAL":         { leadTimeDays: 14, origin: "Domestic — KY"   },
  "SAMSUNG ELECTRONICS AMERICA":  { leadTimeDays: 10, origin: "Domestic — NJ"   },
  "ANKER INNOVATIONS LIMITED":    { leadTimeDays: 30, origin: "Import — CN"     },
};
const DEFAULT_TERMS: VendorTerms = { leadTimeDays: 14, origin: "Domestic" };
// Cancel date is the cutoff vendor must ship by; default = expected delivery + 7 days.
const CANCEL_BUFFER_DAYS = 7;

// ─── Ship-to addresses ───────────────────────────────────────────────────────
interface ShipToAddress {
  id:      string;
  label:   string;          // short tag, e.g. "Main Receiving"
  street:  string;
  city:    string;
  state:   string;
  zip:     string;
  facility?: string;        // 3PL operator if applicable
}

// Per warehouse code. Some warehouses have multiple addresses (e.g. an
// overflow / co-located 3PL dock). RDC-LAS demo is shown via the second
// Ontario DC address ("GXO Las Vegas RDC overflow").
const WAREHOUSE_SHIP_TO: Record<string, ShipToAddress[]> = {
  "DC-NORTHEAST": [
    { id: "DC-NE-01", label: "Main Receiving", street: "1500 Doremus Ave", city: "Newark",  state: "NJ", zip: "07105" },
  ],
  "DC-SOUTHEAST": [
    { id: "DC-SE-01", label: "Main Receiving", street: "4200 Fulton Industrial Blvd SW", city: "Atlanta", state: "GA", zip: "30336" },
  ],
  "DC-CENTRAL":   [
    { id: "DC-CE-01", label: "Main Receiving", street: "3475 Tradeport Pkwy", city: "Memphis", state: "TN", zip: "38118" },
  ],
  "DC-WEST":      [
    { id: "DC-W-01",  label: "Main Receiving", street: "2855 E Mission Blvd", city: "Ontario",   state: "CA", zip: "91761" },
    { id: "DC-W-02",  label: "GXO Las Vegas RDC (Overflow)", street: "6555 Reno Ave", city: "Las Vegas", state: "NV", zip: "89118", facility: "GXO Logistics" },
  ],
};

// Shared 3PL fallback address used to redirect DSD shipments away from the store.
const GXO_3PL_ADDRESS: ShipToAddress = {
  id: "GXO-DSD-01",
  label: "GXO 3PL — DSD Consolidation",
  street: "9001 Norton Commerce Dr",
  city: "Louisville",
  state: "KY",
  zip: "40229",
  facility: "GXO Logistics",
};

// Build a deterministic store address from the storeId so the demo is stable.
function storeAddress(storeId: string, storeName: string): ShipToAddress {
  const rng = seededRng(hashStr("addr::" + storeId));
  const cities = [
    { city: "Las Vegas",   state: "NV", zip: "89109" },
    { city: "Phoenix",     state: "AZ", zip: "85004" },
    { city: "Dallas",      state: "TX", zip: "75201" },
    { city: "Tampa",       state: "FL", zip: "33602" },
    { city: "Charlotte",   state: "NC", zip: "28202" },
    { city: "Denver",      state: "CO", zip: "80202" },
  ];
  const c = cities[Math.floor(rng() * cities.length)];
  const num = 100 + Math.floor(rng() * 9000);
  return {
    id:     `STORE-${storeId}`,
    label:  `${storeName} (Store)`,
    street: `${num} Retail Dr`,
    city:   c.city,
    state:  c.state,
    zip:    c.zip,
  };
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function addDays(d: Date, days: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
}
function toISODate(d: Date): string {
  // YYYY-MM-DD in local time so <input type="date"> shows the same value.
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}
function fromISODate(s: string): Date {
  const [y, m, day] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, day ?? 1);
}
function diffDays(from: Date, to: Date): number {
  const ms = 24 * 60 * 60 * 1000;
  return Math.round((+to - +from) / ms);
}
function fmtPretty(d: Date): string {
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreatePO() {
  const [location, navigate] = useLocation();

  // Parse all URL params once per location change
  const urlParams = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    return {
      vendor:     p.get("vendor")     ?? DEFAULT_VENDOR,
      vendorCode: p.get("vendorCode") ?? "",
      loc:        (p.get("loc") ?? "").toLowerCase(),     // "warehouse" | "store" | ""
      code:       p.get("code")       ?? "",              // whCode or storeId
      name:       p.get("name")       ?? "",              // whName or storeName
      region:     p.get("region")     ?? "",
      style:      p.get("style")      ?? "",
      desc:       p.get("desc")       ?? "",
    };
  }, [location]);

  const [vendor, setVendor]       = useState(urlParams.vendor);
  const [search, setSearch]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [poNumber] = useState(
    () => `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`
  );

  // Resolve effective delivery point (only when loc + name provided)
  const deliveryPoint = useMemo(() => {
    if (!urlParams.loc || !urlParams.name) return null;
    return {
      kind:   urlParams.loc as "warehouse" | "store",
      code:   urlParams.code,
      name:   urlParams.name,
      region: urlParams.region,
    };
  }, [urlParams]);

  // SKUs for the chosen vendor, with per-delivery-point deficit applied (and filtered)
  const dpSkus = useMemo<SkuLine[]>(() => {
    const base = VENDOR_SKUS[vendor] ?? VENDOR_SKUS[DEFAULT_VENDOR];
    let skus: SkuLine[];
    // When scoped to a specific style, use base catalogue deficits directly so
    // the per-delivery-point random zero-filter never empties the list.
    if (urlParams.style) {
      skus = base.filter((s) => s.styleCode === urlParams.style);
    } else if (!deliveryPoint) {
      skus = base;
    } else {
      const dpKey = `${deliveryPoint.kind}:${deliveryPoint.code || deliveryPoint.name}`;
      skus = base
        .map((s) => {
          const { deficit, suggestedQty } = deliveryPointDeficit(
            dpKey, s.upc, s.suggestedQty, s.orderMultiple,
          );
          return { ...s, deficit, suggestedQty };
        })
        .filter((s) => s.deficit > 0);
    }
    return skus;
  }, [vendor, deliveryPoint, urlParams.style]);

  const [selected, setSelected] = useState<Set<string>>(() => new Set(dpSkus.map((s) => s.upc)));
  const [editQty, setEditQty]   = useState<Record<string, number>>(
    () => Object.fromEntries(dpSkus.map((s) => [s.upc, s.suggestedQty]))
  );

  useEffect(() => {
    setSelected(new Set(dpSkus.map((s) => s.upc)));
    setEditQty(Object.fromEntries(dpSkus.map((s) => [s.upc, s.suggestedQty])));
    setSearch("");
    setSubmitted(false);
  }, [dpSkus]);

  // ── Vendor terms (lead time + origin) ─────────────────────────────────────
  const vendorTerms = VENDOR_TERMS[vendor] ?? DEFAULT_TERMS;

  // ── Available ship-to addresses for the current delivery point ────────────
  const addressOptions = useMemo<ShipToAddress[]>(() => {
    if (!deliveryPoint) return [];
    if (deliveryPoint.kind === "warehouse") {
      return WAREHOUSE_SHIP_TO[deliveryPoint.code] ?? [{
        id:     `WH-${deliveryPoint.code || "DEFAULT"}`,
        label:  "Main Receiving",
        street: "Receiving Dock",
        city:   deliveryPoint.name,
        state:  deliveryPoint.region.slice(0, 2).toUpperCase(),
        zip:    "—",
      }];
    }
    // DSD store: physical store address + shared GXO 3PL fallback
    return [
      storeAddress(deliveryPoint.code, deliveryPoint.name),
      GXO_3PL_ADDRESS,
    ];
  }, [deliveryPoint]);

  const [shipToId, setShipToId] = useState<string>("");
  // Reset selected ship-to whenever the address pool changes (vendor /
  // delivery point switch). Default to the first option.
  useEffect(() => {
    setShipToId(addressOptions[0]?.id ?? "");
  }, [addressOptions]);
  const shipTo = addressOptions.find((a) => a.id === shipToId) ?? addressOptions[0];

  // ── Expected delivery + cancel date (driven by vendor lead time) ──────────
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [expectedDelivery, setExpectedDelivery] = useState<string>(
    () => toISODate(addDays(today, vendorTerms.leadTimeDays))
  );
  const [cancelDate, setCancelDate] = useState<string>(
    () => toISODate(addDays(addDays(today, vendorTerms.leadTimeDays), CANCEL_BUFFER_DAYS))
  );
  // Tracks whether the planner has manually edited the cancel date. If not,
  // it auto-follows expected delivery + buffer.
  const [cancelOverridden, setCancelOverridden] = useState(false);

  // Recompute defaults whenever the vendor (and therefore lead time) changes.
  useEffect(() => {
    const ed = addDays(today, vendorTerms.leadTimeDays);
    setExpectedDelivery(toISODate(ed));
    setCancelDate(toISODate(addDays(ed, CANCEL_BUFFER_DAYS)));
    setCancelOverridden(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor]);

  // When delivery date changes, slide cancel date with it unless the planner
  // has explicitly overridden it.
  const onChangeExpectedDelivery = (iso: string) => {
    setExpectedDelivery(iso);
    if (!cancelOverridden) {
      setCancelDate(toISODate(addDays(fromISODate(iso), CANCEL_BUFFER_DAYS)));
    }
  };
  const onChangeCancelDate = (iso: string) => {
    setCancelDate(iso);
    setCancelOverridden(true);
  };
  const resetCancelDate = () => {
    setCancelDate(toISODate(addDays(fromISODate(expectedDelivery), CANCEL_BUFFER_DAYS)));
    setCancelOverridden(false);
  };

  const deliveryDateObj = fromISODate(expectedDelivery);
  const cancelDateObj   = fromISODate(cancelDate);
  const transitDays     = diffDays(today, deliveryDateObj);
  const cancelGapDays   = diffDays(deliveryDateObj, cancelDateObj);
  const datesValid      = transitDays >= 0 && cancelGapDays >= 0;

  const filteredSkus = useMemo(() => {
    if (!search.trim()) return dpSkus;
    const q = search.trim().toLowerCase();
    return dpSkus.filter(
      (s) =>
        s.upc.includes(q) ||
        s.styleCode.includes(q) ||
        s.variant.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [dpSkus, search]);

  const allSelected  = selected.size === dpSkus.length && dpSkus.length > 0;
  const someSelected = selected.size > 0 && selected.size < dpSkus.length;

  const toggleAll = () => {
    if (selected.size === dpSkus.length) setSelected(new Set());
    else setSelected(new Set(dpSkus.map((s) => s.upc)));
  };

  const toggleSku = (upc: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(upc) ? next.delete(upc) : next.add(upc);
      return next;
    });

  const updateQty = (upc: string, raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0) setEditQty((prev) => ({ ...prev, [upc]: n }));
  };

  const snapToMultiple = (upc: string, multiple: number) => {
    const current = editQty[upc] ?? 0;
    const snapped = Math.ceil(current / multiple) * multiple;
    setEditQty((prev) => ({ ...prev, [upc]: snapped }));
  };

  const summary = useMemo(() => {
    const sel          = dpSkus.filter((s) => selected.has(s.upc));
    const totalQty     = sel.reduce((sum, s) => sum + (editQty[s.upc] ?? 0), 0);
    const totalCost    = sel.reduce((sum, s) => sum + (editQty[s.upc] ?? 0) * s.cost, 0);
    const totalDeficit = sel.reduce((sum, s) => sum + s.deficit, 0);
    return { count: sel.length, totalQty, totalCost, totalDeficit };
  }, [selected, editQty, dpSkus]);

  if (submitted) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-in fade-in duration-500">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">Purchase Order Submitted</h2>
            <p className="text-sm text-slate-500 mt-1">
              PO Number: <span className="font-mono font-bold text-primary">{poNumber}</span>
            </p>
            {deliveryPoint && (
              <p className="text-xs text-slate-400 mt-1">
                Ship to <span className="font-semibold text-slate-600">{deliveryPoint.name}</span>
                {deliveryPoint.code && <> ({deliveryPoint.code})</>}
              </p>
            )}
          </div>

          {/* Ship-to + dates summary */}
          {(shipTo || deliveryPoint) && (
            <div className="flex items-stretch gap-3 flex-wrap justify-center max-w-2xl">
              {shipTo && (
                <div className="text-left p-3 rounded-lg bg-slate-50 border border-border/50 min-w-[220px]">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1">
                    <Building2 size={10} /> Ship To
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-1 leading-tight">{shipTo.label}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{shipTo.street}</p>
                  <p className="text-[11px] text-slate-500">{shipTo.city}, {shipTo.state} {shipTo.zip}</p>
                  {shipTo.facility && (
                    <p className="text-[10px] text-amber-700 font-bold mt-1">{shipTo.facility}</p>
                  )}
                </div>
              )}
              <div className="text-left p-3 rounded-lg bg-emerald-50 border border-emerald-200 min-w-[180px]">
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-wide flex items-center gap-1">
                  <CalendarDays size={10} /> Expected Delivery
                </p>
                <p className="text-sm font-bold text-emerald-800 mt-1">{fmtPretty(deliveryDateObj)}</p>
                <p className="text-[10px] text-emerald-700/80 mt-0.5">
                  {transitDays} day{transitDays === 1 ? "" : "s"} from order ({vendorTerms.leadTimeDays}-day lead)
                </p>
              </div>
              <div className="text-left p-3 rounded-lg bg-red-50 border border-red-200 min-w-[180px]">
                <p className="text-[9px] font-bold text-red-600 uppercase tracking-wide flex items-center gap-1">
                  <XCircle size={10} /> Cancel Date
                </p>
                <p className="text-sm font-bold text-red-800 mt-1">{fmtPretty(cancelDateObj)}</p>
                <p className="text-[10px] text-red-700/80 mt-0.5">
                  {cancelGapDays} day{cancelGapDays === 1 ? "" : "s"} after delivery {cancelOverridden && "(manual)"}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 p-5 rounded-xl bg-slate-50 border border-border/50 min-w-[340px]">
            <div className="text-center flex-1 border-r border-border/50">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">SKUs</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{summary.count}</p>
            </div>
            <div className="text-center flex-1 border-r border-border/50">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Total Units</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{summary.totalQty.toLocaleString()}</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Total Cost</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                ${summary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            {deliveryPoint?.kind === "store" && urlParams.style && (
              <Button
                size="sm"
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
                onClick={() =>
                  navigate(
                    `/reports/sip-planning/store-skus` +
                    `?style=${urlParams.style}` +
                    `&desc=${encodeURIComponent(urlParams.desc)}` +
                    `&store=${encodeURIComponent(urlParams.name)}` +
                    `&storeId=${encodeURIComponent(urlParams.code)}` +
                    `&vendor=${encodeURIComponent(urlParams.vendor)}` +
                    `&vendorCode=${urlParams.vendorCode}` +
                    `&poRaised=true`
                  )
                }
              >
                <CalendarClock size={13} /> Return to SKU Detail &amp; Schedule Next PO
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => navigate("/reports/sip-planning")}>
              Return to SIP Planning
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const dpIcon       = deliveryPoint?.kind === "warehouse" ? Warehouse : Store;
  const DpIcon       = dpIcon;
  const dpKindLabel  = deliveryPoint?.kind === "warehouse" ? "Warehouse" : "Direct-Shipped Store";
  const dpAccentBg   = deliveryPoint?.kind === "warehouse" ? "bg-violet-50"  : "bg-blue-50";
  const dpAccentText = deliveryPoint?.kind === "warehouse" ? "text-violet-700" : "text-blue-700";
  const dpAccentBorder = deliveryPoint?.kind === "warehouse" ? "border-violet-200" : "border-blue-200";

  return (
    <MainLayout>
      <div className="space-y-5 animate-in fade-in duration-500">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <button
              onClick={() => navigate("/reports/sip-planning")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-1"
            >
              <ChevronLeft size={14} /> SIP Planning
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Create Purchase Order</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {deliveryPoint
                ? <>{dpSkus.length} SKU{dpSkus.length === 1 ? "" : "s"} with net demand at this delivery point · Adjust quantities and submit</>
                : <>{dpSkus.length} SKUs with net demand · Select and adjust quantities before submitting</>}
            </p>
          </div>
          <Badge variant="outline" className="text-[11px] h-7 px-3 font-mono self-start mt-1">{poNumber}</Badge>
        </div>

        {/* Delivery Point Card */}
        {deliveryPoint && (
          <Card className={cn("border shadow-none", dpAccentBorder, dpAccentBg)}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border", dpAccentBorder)}>
                    <DpIcon size={18} className={dpAccentText} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ship To · {dpKindLabel}</p>
                      {deliveryPoint.code && (
                        <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 font-mono", dpAccentBg, dpAccentText, dpAccentBorder)}>
                          {deliveryPoint.code}
                        </Badge>
                      )}
                    </div>
                    <p className="text-base font-bold text-slate-800 mt-0.5 truncate">{deliveryPoint.name}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap text-[11px] text-slate-500">
                      {deliveryPoint.region && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} className="text-slate-400" />
                          Region: <strong className="text-slate-700">{deliveryPoint.region}</strong>
                        </span>
                      )}
                      <span>Vendor: <strong className="text-slate-700">{vendor}</strong>{urlParams.vendorCode && <> ({urlParams.vendorCode})</>}</span>
                      {urlParams.style && (
                        <span>Origin Style: <span className="font-mono font-semibold text-primary">{urlParams.style}</span></span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">SKUs with Net Demand</p>
                    <p className="text-lg font-bold text-slate-800 tabular-nums">{dpSkus.length}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Total Net Demand</p>
                    <p className="text-lg font-bold text-red-600 tabular-nums">
                      {dpSkus.reduce((s, x) => s + x.deficit, 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Suggested Units</p>
                    <p className="text-lg font-bold text-emerald-700 tabular-nums">
                      {dpSkus.reduce((s, x) => s + x.suggestedQty, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Delivery, lead time & cancel date ── */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                <Truck size={14} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-none">
                  Delivery & Cancel Dates
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  Driven by <strong className="text-slate-700">{vendor.split(",")[0]}</strong> lead time of{" "}
                  <strong className="text-primary">{vendorTerms.leadTimeDays} days</strong>
                  <span className="text-slate-400"> · {vendorTerms.origin}</span>
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] h-5 px-2 bg-primary/5 text-primary border-primary/20 font-bold">
                  <Clock size={9} className="mr-1" /> {vendorTerms.leadTimeDays}-day lead
                </Badge>
                <Badge variant="outline" className="text-[10px] h-5 px-2 bg-slate-50 text-slate-600 border-slate-200">
                  Cancel = Delivery + {CANCEL_BUFFER_DAYS}d
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

              {/* Ship-to address (delivery-point dependent) */}
              {deliveryPoint && addressOptions.length > 0 && (
                <div className="md:col-span-1 flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                    <Building2 size={11} className="text-slate-400" />
                    Ship-To Address
                    {addressOptions.length > 1 && (
                      <Badge variant="outline" className="ml-1 h-4 px-1 text-[9px] bg-amber-50 text-amber-700 border-amber-200">
                        {addressOptions.length} options
                      </Badge>
                    )}
                  </label>
                  <select
                    value={shipToId}
                    onChange={(e) => setShipToId(e.target.value)}
                    className="h-8 px-2 text-[11px] border border-slate-200 rounded-md bg-white font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                    data-testid="select-shipto-address"
                  >
                    {addressOptions.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label} — {a.city}, {a.state}
                      </option>
                    ))}
                  </select>
                  {shipTo && (
                    <div className="mt-1 rounded-md border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 text-[11px] leading-snug">
                      <p className="font-semibold text-slate-700 truncate" data-testid="text-shipto-label">
                        {shipTo.label}
                      </p>
                      <p className="text-slate-600">{shipTo.street}</p>
                      <p className="text-slate-500">{shipTo.city}, {shipTo.state} {shipTo.zip}</p>
                      {shipTo.facility && (
                        <p className="mt-0.5 text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                          <Building2 size={10} /> {shipTo.facility}
                        </p>
                      )}
                      {deliveryPoint.kind === "store" && shipTo.id !== GXO_3PL_ADDRESS.id && (
                        <p className="mt-1 text-[10px] text-slate-500">
                          DSD orders can re-route to <strong className="text-amber-700">GXO 3PL</strong> via the dropdown above.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Expected delivery */}
              <div className="md:col-span-1 flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <CalendarDays size={11} className="text-emerald-600" />
                  Expected Delivery
                </label>
                <Input
                  type="date"
                  value={expectedDelivery}
                  min={toISODate(today)}
                  onChange={(e) => onChangeExpectedDelivery(e.target.value)}
                  className="h-8 text-[11px] border-slate-200 bg-white font-medium"
                  data-testid="input-expected-delivery"
                />
                <div className="mt-1 rounded-md border border-emerald-200 bg-emerald-50/50 px-2.5 py-1.5 text-[11px] leading-snug">
                  <p className="font-semibold text-emerald-800" data-testid="text-expected-delivery-pretty">
                    {fmtPretty(deliveryDateObj)}
                  </p>
                  <p className="text-[10px] text-emerald-700/80 mt-0.5">
                    {transitDays >= 0
                      ? <>{transitDays} day{transitDays === 1 ? "" : "s"} from today (vendor default {vendorTerms.leadTimeDays})</>
                      : <span className="text-red-600 font-bold">In the past — please pick a future date</span>
                    }
                  </p>
                </div>
              </div>

              {/* Cancel date */}
              <div className="md:col-span-1 flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <XCircle size={11} className="text-red-500" />
                  Cancel Date
                  {cancelOverridden && (
                    <button
                      type="button"
                      onClick={resetCancelDate}
                      className="ml-1 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 py-px hover:bg-amber-100 transition-colors"
                      data-testid="button-reset-cancel-date"
                      title="Reset to expected delivery + buffer"
                    >
                      reset auto
                    </button>
                  )}
                </label>
                <Input
                  type="date"
                  value={cancelDate}
                  min={expectedDelivery}
                  onChange={(e) => onChangeCancelDate(e.target.value)}
                  className={cn(
                    "h-8 text-[11px] border-slate-200 bg-white font-medium",
                    cancelOverridden && "border-amber-300 bg-amber-50/40",
                  )}
                  data-testid="input-cancel-date"
                />
                <div className={cn(
                  "mt-1 rounded-md border px-2.5 py-1.5 text-[11px] leading-snug",
                  cancelGapDays >= 0 ? "border-red-200 bg-red-50/50" : "border-red-300 bg-red-100",
                )}>
                  <p className="font-semibold text-red-700" data-testid="text-cancel-date-pretty">
                    {fmtPretty(cancelDateObj)}
                  </p>
                  <p className="text-[10px] text-red-700/80 mt-0.5">
                    {cancelGapDays >= 0 ? (
                      cancelOverridden
                        ? <>{cancelGapDays} day{cancelGapDays === 1 ? "" : "s"} after delivery <span className="font-bold">(manual)</span></>
                        : <>{cancelGapDays} day{cancelGapDays === 1 ? "" : "s"} after delivery (auto)</>
                    ) : (
                      <span className="font-bold">Cancel date must be on/after delivery</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {!datesValid && (
              <p className="mt-3 text-[11px] text-red-700 bg-red-50 border border-red-200 rounded px-2.5 py-1.5 flex items-center gap-1.5">
                <AlertCircle size={12} /> Please correct the dates above before submitting.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Vendor + Search */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1 min-w-[260px]">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vendor</label>
                <select
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                  className="h-8 px-3 text-[11px] border border-slate-200 rounded-md bg-white font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {ALL_VENDOR_NAMES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1 min-w-[240px]">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Search SKU</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="UPC, style, variant or description…"
                    className="h-8 pl-7 text-[11px] border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Direct-to-Store Review (Store delivery points only) ── */}
        {deliveryPoint?.kind === "store" && dpSkus.length > 0 && (() => {
          const dpKey = `${deliveryPoint.kind}:${deliveryPoint.code || deliveryPoint.name}`;
          const rows  = dpSkus.map((s) => ({
            sku: s,
            m:   storeSkuMetrics(dpKey, s, STORE_LEAD_TIME_DAYS),
          }));
          const tot = rows.reduce(
            (a, r) => ({
              forecast: a.forecast + r.m.forecast4Wk,
              onHand:   a.onHand   + r.m.storeOnHand,
              safety:   a.safety   + r.m.safetyStock,
              gap:      a.gap      + Math.max(0, r.m.forecast4Wk + r.m.safetyStock - r.m.storeOnHand),
            }),
            { forecast: 0, onHand: 0, safety: 0, gap: 0 },
          );
          const target           = tot.forecast + tot.safety;
          const skusBelowSafety  = rows.filter((r) => r.m.storeOnHand < r.m.safetyStock).length;

          return (
            <Card className="border-blue-200 bg-blue-50/30 shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Store size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700 leading-none">
                        Direct-to-Store Review
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Sales forecast, store on-hand, and safety stock by SKU · {STORE_LEAD_TIME_DAYS}-day lead time
                      </p>
                    </div>
                  </div>
                  {skusBelowSafety > 0 && (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[10px] h-5 px-2 font-bold">
                      <AlertTriangle size={9} className="mr-1" /> {skusBelowSafety} below safety stock
                    </Badge>
                  )}
                </div>

                {/* Roll-up KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-blue-200/60 rounded-md overflow-hidden border border-blue-200/60 mb-3">
                  {[
                    { label: "4-Wk Forecast",         value: tot.forecast.toLocaleString(), cls: "text-slate-800" },
                    { label: "Store On-Hand",         value: tot.onHand.toLocaleString(),   cls: "text-slate-800" },
                    { label: "Safety Stock",          value: tot.safety.toLocaleString(),   cls: "text-blue-700" },
                    { label: "Target (Fcst+Safety)",  value: target.toLocaleString(),       cls: "text-slate-800" },
                    { label: "Net Gap",               value: tot.gap.toLocaleString(),      cls: tot.gap > 0 ? "text-red-600" : "text-emerald-700" },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="bg-white py-2 px-3 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                      <p className={cn("text-sm font-bold tabular-nums mt-0.5", cls)}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* SKU breakdown table */}
                <div className="overflow-x-auto rounded-md border border-blue-200/60 bg-white">
                  <table className="text-xs w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-50/70 border-b border-blue-200/60">
                        {[
                          { l: "Style",          a: "text-left" },
                          { l: "Variant",        a: "text-left" },
                          { l: "Description",    a: "text-left" },
                          { l: "Wkly Sales",     a: "text-right" },
                          { l: "4-Wk Forecast",  a: "text-right" },
                          { l: "Store On-Hand",  a: "text-right" },
                          { l: "Safety Stock",   a: "text-right" },
                          { l: "Coverage (wks)", a: "text-right" },
                          { l: "Status",         a: "text-left" },
                        ].map(({ l, a }) => (
                          <th key={l} className={cn(
                            "px-3 py-2 font-semibold text-[9px] uppercase tracking-wide text-slate-500 border-r border-blue-200/40 last:border-r-0 whitespace-nowrap",
                            a,
                          )}>{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ sku, m }, i) => {
                        const belowSafety = m.storeOnHand < m.safetyStock;
                        const belowFcst   = m.storeOnHand < m.forecast4Wk;
                        return (
                          <tr key={sku.upc} className={cn(
                            "border-b border-blue-100/60 last:border-b-0",
                            i % 2 !== 0 && "bg-blue-50/[0.25]",
                          )}>
                            <td className="px-3 py-2 font-mono text-[10px] font-bold text-primary whitespace-nowrap border-r border-blue-100/60">{sku.styleCode}</td>
                            <td className="px-3 py-2 border-r border-blue-100/60">
                              <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-slate-50 text-slate-700 border-slate-200 whitespace-nowrap">{sku.variant}</Badge>
                            </td>
                            <td className="px-3 py-2 max-w-[220px] truncate border-r border-blue-100/60 text-slate-700" title={sku.description}>{sku.description}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-600 border-r border-blue-100/60">{m.weeklySales}</td>
                            <td className="px-3 py-2 text-right tabular-nums font-semibold text-slate-800 border-r border-blue-100/60">{m.forecast4Wk.toLocaleString()}</td>
                            <td className={cn(
                              "px-3 py-2 text-right tabular-nums font-semibold border-r border-blue-100/60",
                              belowSafety ? "text-red-600" : belowFcst ? "text-amber-600" : "text-slate-800",
                            )}>{m.storeOnHand.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right tabular-nums font-semibold text-blue-700 border-r border-blue-100/60">{m.safetyStock.toLocaleString()}</td>
                            <td className={cn(
                              "px-3 py-2 text-right tabular-nums border-r border-blue-100/60 font-semibold",
                              m.coverageWks < 1 ? "text-red-600" : m.coverageWks < 2 ? "text-amber-600" : "text-emerald-700",
                            )}>{m.coverageWks.toFixed(1)}</td>
                            <td className="px-3 py-2">
                              {belowSafety ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded px-1.5 py-0.5">
                                  <AlertTriangle size={9} /> Below Safety
                                </span>
                              ) : belowFcst ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5">
                                  <AlertCircle size={9} /> Below Forecast
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-1.5 py-0.5">
                                  <CheckCircle2 size={9} /> Healthy
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <p className="text-[10px] text-slate-500 mt-2 leading-snug">
                  Forecast is the projected unit sales for the next 4 weeks at this store.
                  Safety stock covers the {STORE_LEAD_TIME_DAYS}-day receiving lead time plus a 50% buffer, rounded to each SKU's order multiple.
                  SKUs flagged <span className="font-semibold text-red-700">Below Safety</span> need to be on this PO to keep the store in-stock through the next replenishment cycle.
                </p>
              </CardContent>
            </Card>
          );
        })()}

        <div className="flex gap-4 items-start">
          {/* Table */}
          <div className="flex-1 min-w-0">
            <Card className="border-border/60 shadow-none overflow-hidden">
              <div className="overflow-x-auto">
                <table className="text-xs w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b-2 border-border/50">
                      <th className="px-3 py-2.5 border-r border-border/20 w-10">
                        <Checkbox
                          checked={allSelected}
                          ref={(el) => { if (el) (el as any).indeterminate = someSelected; }}
                          onCheckedChange={toggleAll}
                          className="h-3.5 w-3.5"
                        />
                      </th>
                      <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 whitespace-nowrap">UPC</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 whitespace-nowrap">Style</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20">Variant</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 whitespace-nowrap">Pres. Stock</th>
                      <th className="px-3 py-2.5 text-left font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20">Description</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20">Cost</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20">MOQ</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 whitespace-nowrap">Order Mult.</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wide text-red-500 border-r border-border/20 whitespace-nowrap">Net Demand</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 whitespace-nowrap">Sugg. Qty</th>
                      <th className="px-3 py-2.5 text-right font-semibold text-[10px] uppercase tracking-wide text-primary whitespace-nowrap">Order Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSkus.map((s, i) => {
                      const isSelected = selected.has(s.upc);
                      const qty        = editQty[s.upc] ?? s.suggestedQty;
                      const isBelowMoq = qty < s.moq && qty > 0;
                      return (
                        <tr
                          key={s.upc}
                          className={cn(
                            "border-b border-border/20 transition-colors",
                            isSelected
                              ? "bg-primary/5 hover:bg-primary/8"
                              : "opacity-50 hover:opacity-70 hover:bg-slate-50/50",
                            i % 2 !== 0 && "bg-muted/[0.02]",
                          )}
                        >
                          <td className="px-3 py-2.5 border-r border-border/20">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleSku(s.upc)}
                              className="h-3.5 w-3.5"
                            />
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[10px] text-slate-400 whitespace-nowrap border-r border-border/20">
                            {s.upc}
                          </td>
                          <td className="px-3 py-2.5 font-mono text-[10px] font-medium text-primary whitespace-nowrap border-r border-border/20">
                            {s.styleCode}
                          </td>
                          <td className="px-3 py-2.5 border-r border-border/20">
                            <Badge
                              variant="outline"
                              className="text-[10px] h-5 px-1.5 bg-slate-50 text-slate-700 border-slate-200 whitespace-nowrap"
                            >
                              {s.variant}
                            </Badge>
                          </td>
                          <td
                            className="px-3 py-2.5 text-right tabular-nums font-semibold text-violet-700 border-r border-border/20"
                            title="Presentation stock — qty needed to fill store fixtures"
                          >
                            {presStockFor(s).toLocaleString()}
                          </td>
                          <td
                            className="px-3 py-2.5 max-w-[240px] truncate border-r border-border/20 text-slate-700"
                            title={s.description}
                          >
                            {s.description}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 border-r border-border/20 whitespace-nowrap">
                            ${s.cost.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-500 border-r border-border/20">
                            {s.moq}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-500 border-r border-border/20">
                            {s.orderMultiple}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums font-bold text-red-600 border-r border-border/20">
                            {s.deficit.toLocaleString()}
                          </td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-slate-500 border-r border-border/20">
                            {s.suggestedQty}
                          </td>
                          <td className="px-3 py-2.5 border-r-0">
                            <div className="flex items-center justify-end gap-1.5">
                              {isBelowMoq && (
                                <AlertCircle
                                  size={12}
                                  className="text-amber-500 flex-shrink-0"
                                />
                              )}
                              <Input
                                type="number"
                                min={0}
                                value={qty}
                                disabled={!isSelected}
                                onChange={(e) => updateQty(s.upc, e.target.value)}
                                onBlur={() => snapToMultiple(s.upc, s.orderMultiple)}
                                className={cn(
                                  "h-7 w-[72px] text-right text-[11px] font-bold tabular-nums border focus:ring-1",
                                  isBelowMoq
                                    ? "border-amber-300 focus:ring-amber-400 text-amber-700"
                                    : "border-primary/40 focus:ring-primary text-primary"
                                )}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredSkus.length === 0 && (
                      <tr>
                        <td colSpan={12} className="py-10 text-center text-xs text-slate-400">
                          {dpSkus.length === 0
                            ? "No SKUs from this vendor have net demand at this delivery point."
                            : "No SKUs match your search."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            <p className="text-[10px] text-slate-400 mt-2 ml-1">
              Qty auto-snaps to order multiple on blur. MOQ warnings shown with{" "}
              <AlertCircle size={10} className="inline text-amber-500" />.
            </p>
          </div>

          {/* Summary Panel */}
          <div className="w-64 flex-shrink-0 space-y-3">
            <Card className="border-border/60 shadow-none">
              <CardContent className="p-4 space-y-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                  <Package size={13} /> Order Summary
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Vendor</span>
                    <span className="text-[11px] font-bold text-slate-700 text-right max-w-[120px] leading-tight">
                      {vendor.split(",")[0]}
                    </span>
                  </div>
                  {deliveryPoint && shipTo && (
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs text-slate-500 flex-shrink-0 pt-0.5">Ship To</span>
                      <div className="text-right max-w-[150px] leading-tight">
                        <p className="text-[11px] font-bold text-slate-700 truncate" title={shipTo.label}>
                          {shipTo.label}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate" title={`${shipTo.street}, ${shipTo.city}, ${shipTo.state} ${shipTo.zip}`}>
                          {shipTo.city}, {shipTo.state}
                        </p>
                        {shipTo.facility && (
                          <p className="text-[9px] text-amber-700 font-bold truncate">{shipTo.facility}</p>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">PO Number</span>
                    <span className="text-[11px] font-mono font-bold text-primary">{poNumber}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <CalendarDays size={11} className="text-emerald-600" /> Expected Delivery
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 tabular-nums" data-testid="text-summary-delivery">
                      {fmtPretty(deliveryDateObj)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <XCircle size={11} className="text-red-500" /> Cancel Date
                    </span>
                    <span className={cn(
                      "text-[11px] font-bold tabular-nums",
                      cancelOverridden ? "text-amber-700" : "text-red-700",
                    )} data-testid="text-summary-cancel">
                      {fmtPretty(cancelDateObj)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">SKUs Selected</span>
                    <span className="text-sm font-bold text-slate-800">{summary.count} / {dpSkus.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Total Net Demand</span>
                    <span className="text-sm font-bold text-red-600 tabular-nums">{summary.totalDeficit.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-border/50" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Total Units</span>
                    <span className="text-lg font-bold text-slate-800 tabular-nums">{summary.totalQty.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Total Cost</span>
                    <span className="text-lg font-bold text-emerald-700 tabular-nums">
                      ${summary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
                <Button
                  className="w-full gap-1.5 text-xs font-bold"
                  disabled={summary.count === 0 || summary.totalQty === 0 || !datesValid}
                  onClick={() => setSubmitted(true)}
                  data-testid="button-submit-po"
                >
                  <ShoppingCart size={14} /> Submit PO
                </Button>
                <Button
                  variant="outline" size="sm" className="w-full text-xs"
                  onClick={() => navigate("/reports/sip-planning")}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {summary.count > 0 && (
              <Card className="border-amber-200 bg-amber-50/50 shadow-none">
                <CardContent className="p-3">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-1">Checklist</p>
                  {[
                    "All quantities above MOQ",
                    "Quantities snap to order multiple",
                    "Vendor terms confirmed",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-1.5 text-[10px] text-amber-800 py-0.5">
                      <CheckCircle2 size={10} className="text-amber-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
