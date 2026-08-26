import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft, ShoppingCart, CheckCircle2, Package,
  AlertCircle, Search, AlertTriangle, Building2, Calendar,
  Truck, TrendingDown, Zap, XCircle, MapPin, Phone, User2, Clock,
  Hash, Store as StoreIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── SKU data (same catalogue as CreatePO) ────────────────────────────────────
interface SkuLine {
  upc:          string;
  styleCode:    string;
  variant:      string;
  description:  string;
  location:     string;
  locationType: "Warehouse" | "Store";
  moq:          number;
  orderMultiple:number;
  stock:        number;
  sales:        number;
  wos:          number;
  deficit:      number;
  suggestedQty: number;
  cost:         number;
}

// ─── Delivery point master data ──────────────────────────────────────────────
interface DeliveryPoint {
  name:         string;
  type:         "Warehouse" | "Store";
  code:         string;
  address1:     string;
  address2:     string;
  contactName:  string;
  contactPhone: string;
  hours:        string;
  leadTimeDays: number;
  dock:         string;
}

const DELIVERY_POINTS: Record<string, DeliveryPoint> = {
  "DC WEST - LOS ANGELES CA": {
    name: "DC WEST - LOS ANGELES CA", type: "Warehouse", code: "DC-LAX-01",
    address1: "2800 Alameda St, Bldg A",   address2: "Los Angeles, CA 90058",
    contactName: "Maria Gonzalez", contactPhone: "(323) 555-0142",
    hours: "Mon–Fri 06:00–18:00 PT", leadTimeDays: 5, dock: "Dock 4 / Bay 12",
  },
  "DC EAST - NEW YORK NY": {
    name: "DC EAST - NEW YORK NY", type: "Warehouse", code: "DC-EWR-02",
    address1: "415 Distribution Way",       address2: "Newark, NJ 07114",
    contactName: "James O'Connor", contactPhone: "(973) 555-0188",
    hours: "Mon–Sat 05:00–20:00 ET", leadTimeDays: 4, dock: "Dock 2 / Bay 7",
  },
  "TECH CENTRAL-JFK T4": {
    name: "TECH CENTRAL-JFK T4", type: "Store", code: "ST-JFK-T4",
    address1: "JFK Intl Airport, Terminal 4", address2: "Jamaica, NY 11430",
    contactName: "Priya Shah",     contactPhone: "(718) 555-0119",
    hours: "Daily 04:00–23:00 ET", leadTimeDays: 7, dock: "Service Corridor 4-B",
  },
  "GADGET ZONE-LAX T7": {
    name: "GADGET ZONE-LAX T7", type: "Store", code: "ST-LAX-T7",
    address1: "LAX Intl Airport, Terminal 7", address2: "Los Angeles, CA 90045",
    contactName: "Daniel Ortiz",   contactPhone: "(310) 555-0167",
    hours: "Daily 04:30–23:30 PT", leadTimeDays: 7, dock: "Service Corridor 7-C",
  },
  "DIGITAL HUB-ATL CONCOURSE B": {
    name: "DIGITAL HUB-ATL CONCOURSE B", type: "Store", code: "ST-ATL-B",
    address1: "Hartsfield-Jackson, Concourse B", address2: "Atlanta, GA 30320",
    contactName: "Tasha Reynolds", contactPhone: "(404) 555-0153",
    hours: "Daily 05:00–22:00 ET", leadTimeDays: 7, dock: "Service Corridor B-9",
  },
};

const VENDOR_SKUS: Record<string, SkuLine[]> = {
  "INGRAM MICRO, INC.": [
    { upc: "190199001234", styleCode: "1000007", variant: "WHITE",     description: "APPLE LB AIRPODS PRO GEN 3 TRUE WIRELESS EARBUDS WHITE",    location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 12, orderMultiple: 6,  stock: 42,  sales: 31, wos: 1.4, deficit: 98,  suggestedQty: 120, cost: 189.99 },
    { upc: "190199001235", styleCode: "1000007", variant: "MIDNIGHT",  description: "APPLE LB AIRPODS PRO GEN 3 TRUE WIRELESS EARBUDS MIDNIGHT",  location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 12, orderMultiple: 6,  stock: 22,  sales: 18, wos: 1.2, deficit: 55,  suggestedQty: 60,  cost: 189.99 },
    { upc: "190199001236", styleCode: "1000014", variant: "WHITE",     description: "APPLE AIRPODS 4 ANC TRUE WIRELESS EARBUDS WHITE",           location: "DC EAST - NEW YORK NY",     locationType: "Warehouse", moq: 10, orderMultiple: 10, stock: 64,  sales: 28, wos: 2.3, deficit: 72,  suggestedQty: 80,  cost: 124.99 },
    { upc: "190199001237", styleCode: "1000014", variant: "BLACK",     description: "APPLE AIRPODS 4 ANC TRUE WIRELESS EARBUDS BLACK",           location: "DC EAST - NEW YORK NY",     locationType: "Warehouse", moq: 10, orderMultiple: 10, stock: 30,  sales: 14, wos: 2.1, deficit: 33,  suggestedQty: 40,  cost: 124.99 },
    { upc: "190199001238", styleCode: "1000021", variant: "MIDNIGHT",  description: "APPLE AIRPODS MAX OVER EAR WIRELESS HEADPHONES MIDNIGHT",   location: "TECH CENTRAL-JFK T4"     ,    locationType: "Store",     moq: 6,  orderMultiple: 6,  stock: 8,   sales: 9,  wos: 0.9, deficit: 30,  suggestedQty: 36,  cost: 349.99 },
    { upc: "190199001239", styleCode: "1000021", variant: "STARLIGHT", description: "APPLE AIRPODS MAX OVER EAR WIRELESS HEADPHONES STARLIGHT",  location: "TECH CENTRAL-JFK T4"     ,    locationType: "Store",     moq: 6,  orderMultiple: 6,  stock: 6,   sales: 7,  wos: 0.9, deficit: 18,  suggestedQty: 24,  cost: 349.99 },
    { upc: "190199001240", styleCode: "1000028", variant: "WHITE 1M",  description: "APPLE MAGSAFE CHARGER 1M USB-C WHITE",                     location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 24, orderMultiple: 12, stock: 180, sales: 68, wos: 2.6, deficit: 210, suggestedQty: 240, cost: 24.99  },
    { upc: "190199001241", styleCode: "1000035", variant: "WHITE 1M",  description: "APPLE USB-C TO LIGHTNING CABLE 1M WHITE",                  location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 24, orderMultiple: 12, stock: 90,  sales: 55, wos: 1.6, deficit: 130, suggestedQty: 144, cost: 18.99  },
    { upc: "190199001242", styleCode: "1000042", variant: "WHITE",     description: "APPLE 20W USB-C POWER ADAPTER WHITE",                      location: "DC EAST - NEW YORK NY",     locationType: "Warehouse", moq: 24, orderMultiple: 24, stock: 150, sales: 74, wos: 2.0, deficit: 175, suggestedQty: 192, cost: 15.99  },
    { upc: "190199001243", styleCode: "1000042", variant: "BLACK",     description: "APPLE 20W USB-C POWER ADAPTER BLACK",                      location: "DC EAST - NEW YORK NY",     locationType: "Warehouse", moq: 24, orderMultiple: 24, stock: 70,  sales: 42, wos: 1.7, deficit: 88,  suggestedQty: 96,  cost: 15.99  },
  ],
  "BOSE CORPORATION": [
    { upc: "017817825320", styleCode: "1000049", variant: "BLACK",  description: "BOSE QUIETCOMFORT 45 WIRELESS HEADPHONES BLACK",  location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 6, orderMultiple: 6, stock: 38,  sales: 22, wos: 1.7, deficit: 52,  suggestedQty: 60,  cost: 209.95 },
    { upc: "017817825321", styleCode: "1000049", variant: "WHITE",  description: "BOSE QUIETCOMFORT 45 WIRELESS HEADPHONES WHITE",  location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 6, orderMultiple: 6, stock: 18,  sales: 12, wos: 1.5, deficit: 28,  suggestedQty: 30,  cost: 209.95 },
    { upc: "017817825322", styleCode: "1000056", variant: "BLACK",  description: "BOSE QUIETCOMFORT EARBUDS II TRUE WIRELESS BLACK", location: "DIGITAL HUB-ATL CONCOURSE B", locationType: "Store",     moq: 6, orderMultiple: 6, stock: 14,  sales: 11, wos: 1.3, deficit: 40,  suggestedQty: 48,  cost: 179.95 },
    { upc: "017817825323", styleCode: "1000063", variant: "BLACK",  description: "BOSE SOUNDLINK FLEX PORTABLE SPEAKER BLACK",       location: "DC EAST - NEW YORK NY",    locationType: "Warehouse", moq: 6, orderMultiple: 6, stock: 55,  sales: 28, wos: 2.0, deficit: 63,  suggestedQty: 72,  cost: 94.95  },
    { upc: "017817825324", styleCode: "1000063", variant: "BLUE",   description: "BOSE SOUNDLINK FLEX PORTABLE SPEAKER BLUE",        location: "DC EAST - NEW YORK NY",    locationType: "Warehouse", moq: 6, orderMultiple: 6, stock: 22,  sales: 14, wos: 1.6, deficit: 22,  suggestedQty: 24,  cost: 94.95  },
    { upc: "017817825325", styleCode: "1000070", variant: "BLACK",  description: "BOSE SPORT EARBUDS TRUE WIRELESS IN EAR BLACK",    location: "GADGET ZONE-LAX T7"      ,     locationType: "Store",     moq: 6, orderMultiple: 6, stock: 10,  sales: 13, wos: 0.8, deficit: 31,  suggestedQty: 36,  cost: 114.95 },
  ],
  "SONY ELECTRONICS INC.": [
    { upc: "027242924819", styleCode: "1000077", variant: "BLACK",  description: "SONY WH-1000XM5 NOISE CANCELLING HEADPHONES BLACK", location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 6,  orderMultiple: 6,  stock: 44,  sales: 20, wos: 2.2, deficit: 48,  suggestedQty: 54,  cost: 224.99 },
    { upc: "027242924820", styleCode: "1000077", variant: "SILVER", description: "SONY WH-1000XM5 NOISE CANCELLING HEADPHONES SILVER",location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 6,  orderMultiple: 6,  stock: 18,  sales: 10, wos: 1.8, deficit: 21,  suggestedQty: 24,  cost: 224.99 },
    { upc: "027242924821", styleCode: "1000084", variant: "BLACK",  description: "SONY WF-1000XM5 TRUE WIRELESS EARBUDS BLACK",       location: "DC EAST - NEW YORK NY",    locationType: "Warehouse", moq: 6,  orderMultiple: 6,  stock: 38,  sales: 17, wos: 2.2, deficit: 42,  suggestedQty: 48,  cost: 179.99 },
    { upc: "027242924822", styleCode: "1000084", variant: "SILVER", description: "SONY WF-1000XM5 TRUE WIRELESS EARBUDS SILVER",      location: "DC EAST - NEW YORK NY",    locationType: "Warehouse", moq: 6,  orderMultiple: 6,  stock: 14,  sales: 9,  wos: 1.6, deficit: 19,  suggestedQty: 24,  cost: 179.99 },
    { upc: "027242924823", styleCode: "1000091", variant: "WHITE",  description: "SONY LINKBUDS S NOISE CANCELLING EARBUDS WHITE",    location: "TECH CENTRAL-JFK T4"     ,    locationType: "Store",     moq: 12, orderMultiple: 12, stock: 32,  sales: 22, wos: 1.5, deficit: 85,  suggestedQty: 96,  cost: 94.99  },
    { upc: "027242924824", styleCode: "1000098", variant: "BLACK",  description: "SONY SRS-XB100 COMPACT PORTABLE SPEAKER BLACK",     location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 12, orderMultiple: 12, stock: 80,  sales: 44, wos: 1.8, deficit: 132, suggestedQty: 144, cost: 37.99  },
    { upc: "027242924825", styleCode: "1000098", variant: "BLUE",   description: "SONY SRS-XB100 COMPACT PORTABLE SPEAKER BLUE",      location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 12, orderMultiple: 12, stock: 30,  sales: 19, wos: 1.6, deficit: 44,  suggestedQty: 48,  cost: 37.99  },
  ],
  "HARMAN INTERNATIONAL": [
    { upc: "050036381350", styleCode: "1000105", variant: "BLACK", description: "JBL TUNE 770NC NOISE CANCELLING HEADPHONES BLACK",  location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 10, orderMultiple: 10, stock: 62,  sales: 30, wos: 2.1, deficit: 72,  suggestedQty: 80,  cost: 82.99  },
    { upc: "050036381351", styleCode: "1000105", variant: "WHITE", description: "JBL TUNE 770NC NOISE CANCELLING HEADPHONES WHITE",  location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 10, orderMultiple: 10, stock: 28,  sales: 15, wos: 1.9, deficit: 38,  suggestedQty: 40,  cost: 82.99  },
    { upc: "050036381352", styleCode: "1000112", variant: "BLACK", description: "JBL LIVE FREE 2 TWS WIRELESS EARBUDS BLACK",        location: "DC EAST - NEW YORK NY",    locationType: "Warehouse", moq: 10, orderMultiple: 10, stock: 44,  sales: 26, wos: 1.7, deficit: 55,  suggestedQty: 60,  cost: 62.99  },
    { upc: "050036381353", styleCode: "1000119", variant: "BLACK", description: "JBL CHARGE 5 WATERPROOF BLUETOOTH SPEAKER BLACK",   location: "DIGITAL HUB-ATL CONCOURSE B", locationType: "Store",     moq: 6,  orderMultiple: 6,  stock: 20,  sales: 14, wos: 1.4, deficit: 43,  suggestedQty: 48,  cost: 112.99 },
    { upc: "050036381354", styleCode: "1000119", variant: "RED",   description: "JBL CHARGE 5 WATERPROOF BLUETOOTH SPEAKER RED",     location: "DIGITAL HUB-ATL CONCOURSE B", locationType: "Store",     moq: 6,  orderMultiple: 6,  stock: 8,   sales: 7,  wos: 1.1, deficit: 17,  suggestedQty: 18,  cost: 112.99 },
    { upc: "050036381355", styleCode: "1000126", variant: "BLACK", description: "JBL FLIP 6 WATERPROOF BLUETOOTH SPEAKER BLACK",     location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 6,  orderMultiple: 6,  stock: 36,  sales: 22, wos: 1.6, deficit: 50,  suggestedQty: 54,  cost: 76.99  },
    { upc: "050036381356", styleCode: "1000133", variant: "BLACK", description: "JBL TOUR PRO 2 NOISE CANCELLING EARBUDS BLACK",     location: "GADGET ZONE-LAX T7"      ,     locationType: "Store",     moq: 6,  orderMultiple: 6,  stock: 12,  sales: 8,  wos: 1.5, deficit: 26,  suggestedQty: 30,  cost: 139.99 },
  ],
  "SAMSUNG ELECTRONICS AMERICA": [
    { upc: "887276703305", styleCode: "1000140", variant: "SILVER",     description: "SAMSUNG GALAXY BUDS3 PRO TRUE WIRELESS EARBUDS SILVER", location: "DC EAST - NEW YORK NY",    locationType: "Warehouse", moq: 6,  orderMultiple: 6,  stock: 28,  sales: 14, wos: 2.0, deficit: 36,  suggestedQty: 42,  cost: 159.99 },
    { upc: "887276703306", styleCode: "1000140", variant: "BLACK",      description: "SAMSUNG GALAXY BUDS3 PRO TRUE WIRELESS EARBUDS BLACK",  location: "DC EAST - NEW YORK NY",    locationType: "Warehouse", moq: 6,  orderMultiple: 6,  stock: 16,  sales: 9,  wos: 1.8, deficit: 22,  suggestedQty: 24,  cost: 159.99 },
    { upc: "887276703307", styleCode: "1000147", variant: "SILVER",     description: "SAMSUNG GALAXY BUDS3 TRUE WIRELESS EARBUDS SILVER",     location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 6,  orderMultiple: 6,  stock: 40,  sales: 22, wos: 1.8, deficit: 55,  suggestedQty: 60,  cost: 109.99 },
    { upc: "887276703308", styleCode: "1000154", variant: "BLACK",      description: "SAMSUNG 45W USB-C POWER ADAPTER SUPER FAST CHARGING",   location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 24, orderMultiple: 12, stock: 100, sales: 60, wos: 1.7, deficit: 132, suggestedQty: 144, cost: 24.99  },
    { upc: "887276703309", styleCode: "1000161", variant: "BLACK 1.8M", description: "SAMSUNG USB-C TO USB-C CABLE 1.8M 5A FAST CHARGING",    location: "DC EAST - NEW YORK NY",    locationType: "Warehouse", moq: 24, orderMultiple: 12, stock: 88,  sales: 50, wos: 1.8, deficit: 108, suggestedQty: 120, cost: 18.99  },
  ],
  "ANKER INNOVATIONS LIMITED": [
    { upc: "194644086572", styleCode: "1000168", variant: "BLACK",      description: "ANKER SOUNDCORE LIFE Q35 NOISE CANCELLING HEADPHONES",    location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 10, orderMultiple: 10, stock: 44,  sales: 24, wos: 1.8, deficit: 54,  suggestedQty: 60,  cost: 49.99  },
    { upc: "194644086573", styleCode: "1000175", variant: "BLACK",      description: "ANKER SOUNDCORE LIBERTY 4 NC TRUE WIRELESS EARBUDS BLACK", location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 10, orderMultiple: 10, stock: 50,  sales: 28, wos: 1.8, deficit: 63,  suggestedQty: 70,  cost: 56.99  },
    { upc: "194644086574", styleCode: "1000175", variant: "WHITE",      description: "ANKER SOUNDCORE LIBERTY 4 NC TRUE WIRELESS EARBUDS WHITE", location: "TECH CENTRAL-JFK T4"     ,    locationType: "Store",     moq: 10, orderMultiple: 10, stock: 22,  sales: 14, wos: 1.6, deficit: 31,  suggestedQty: 40,  cost: 56.99  },
    { upc: "194644086575", styleCode: "1000182", variant: "BLACK",      description: "ANKER 737 POWER BANK 24000MAH 140W PORTABLE CHARGER",      location: "DC EAST - NEW YORK NY",    locationType: "Warehouse", moq: 10, orderMultiple: 10, stock: 36,  sales: 20, wos: 1.8, deficit: 44,  suggestedQty: 50,  cost: 62.99  },
    { upc: "194644086576", styleCode: "1000189", variant: "BLACK",      description: "ANKER NANO 65W USB-C COMPACT FAST CHARGER BLACK",           location: "DC WEST - LOS ANGELES CA", locationType: "Warehouse", moq: 20, orderMultiple: 10, stock: 58,  sales: 34, wos: 1.7, deficit: 73,  suggestedQty: 80,  cost: 28.99  },
    { upc: "194644086577", styleCode: "1000196", variant: "DARK BLUE",  description: "ANKER 548 USB-C HUB 7-IN-1 DATA HUB DARK BLUE",             location: "DC EAST - NEW YORK NY",    locationType: "Warehouse", moq: 10, orderMultiple: 10, stock: 28,  sales: 16, wos: 1.8, deficit: 37,  suggestedQty: 40,  cost: 31.99  },
  ],
};

const DEFAULT_VENDOR   = "INGRAM MICRO, INC.";
const ALL_VENDOR_NAMES = Object.keys(VENDOR_SKUS);

const nextDeliveryDate = (() => {
  const d = new Date(); d.setDate(d.getDate() + 14);
  return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
})();

// ─── Presentation stock helper ───────────────────────────────────────────────
// Presentation stock = qty needed to fill store fixtures across serviced stores.
// Derived deterministically from the SKU's UPC + MOQ so values are stable
// across renders and feel realistic in the mock (per-store facing × stores).
function presStockFor(sku: SkuLine): number {
  const last2     = parseInt(sku.upc.slice(-2), 10) || 1;
  const perFixture = 2 + (last2 % 7);                     // 2–8 facings per store
  const stores     = sku.locationType === "Warehouse"
    ? 4 + (last2 % 9)                                     // 4–12 stores from this DC
    : 1;                                                  // direct-to-store = 1
  return perFixture * stores;
}

// ─── Alert helpers ─────────────────────────────────────────────────────────────
type AlertType = "oos" | "negWos" | "lowAvail";
function getAlerts(sku: SkuLine): AlertType[] {
  const alerts: AlertType[] = [];
  if (sku.wos < 1)                                        alerts.push("oos");
  if (sku.wos <= 0)                                       alerts.push("negWos");
  if (sku.deficit > 0 && sku.deficit / (sku.stock + sku.deficit) > 0.7) alerts.push("lowAvail");
  return alerts;
}
const ALERT_CFG: Record<AlertType, { label: string; cls: string; icon: any }> = {
  oos:     { label: "OOS Risk",    cls: "bg-red-100 text-red-700 border-red-200",       icon: XCircle },
  negWos:  { label: "Neg. WOS",   cls: "bg-red-50 text-red-600 border-red-100",        icon: TrendingDown },
  lowAvail:{ label: "Low Avail.", cls: "bg-amber-100 text-amber-700 border-amber-200", icon: AlertTriangle },
};

// ─── Direct-to-Store helpers ─────────────────────────────────────────────────
// Forecast = projected unit sales for the upcoming review window (4 weeks).
// We build it from current sales velocity and apply a small SKU-specific
// variance so the numbers feel realistic in the mock.
function forecastUnits(sku: SkuLine, weeks = 4): number {
  const variance = 0.85 + (parseInt(sku.upc.slice(-2), 10) % 30) / 100; // 0.85–1.15
  return Math.max(0, Math.round(sku.sales * weeks * variance));
}

// Safety stock = lead-time demand + buffer, rounded to the order multiple.
// Uses receiving lead time (days) for the delivery point and weekly sales velocity.
function safetyStockUnits(sku: SkuLine, leadTimeDays: number): number {
  const weeklySales   = sku.sales;
  const leadTimeWeeks = leadTimeDays / 7;
  const buffer        = 0.5; // +50% buffer for store-level volatility
  const raw           = weeklySales * leadTimeWeeks * (1 + buffer);
  const mult          = sku.orderMultiple || 1;
  return Math.max(mult, Math.ceil(raw / mult) * mult);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function CreatePOEnhanced() {
  const [location, navigate] = useLocation();

  const params = useMemo(() => new URLSearchParams(window.location.search), [location]);
  const vendorFromUrl = params.get("vendor") ?? DEFAULT_VENDOR;
  const styleFromUrl  = params.get("style")  ?? "";
  const descFromUrl   = params.get("desc")   ?? "";
  const priorityFromUrl = params.get("priority") ?? "high";
  const dpFromUrl     = params.get("deliveryPoint") ?? "";

  const [vendor, setVendor]     = useState(vendorFromUrl);

  // Delivery points serviced by the selected vendor (where it has deficit SKUs)
  const vendorDeliveryPoints = useMemo(() => {
    const skus = VENDOR_SKUS[vendor] ?? VENDOR_SKUS[DEFAULT_VENDOR];
    const names = [...new Set(skus.filter((s) => s.deficit > 0).map((s) => s.location))];
    return names;
  }, [vendor]);

  const [deliveryPoint, setDeliveryPoint] = useState<string>(() => {
    const candidates = (VENDOR_SKUS[vendorFromUrl] ?? VENDOR_SKUS[DEFAULT_VENDOR])
      .filter((s) => s.deficit > 0).map((s) => s.location);
    if (dpFromUrl && candidates.includes(dpFromUrl)) return dpFromUrl;
    return candidates[0] ?? "";
  });

  const [search, setSearch]     = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [poNumber] = useState(
    () => `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`
  );

  // SKUs from the selected vendor for the selected delivery point with a deficit
  const rawSkus = useMemo(() => {
    const all = VENDOR_SKUS[vendor] ?? VENDOR_SKUS[DEFAULT_VENDOR];
    return all
      .filter((s) => s.location === deliveryPoint && s.deficit > 0)
      .slice()
      .sort((a, b) => b.deficit - a.deficit);
  }, [vendor, deliveryPoint]);

  const [selected, setSelected] = useState<Set<string>>(() => new Set(rawSkus.map((s) => s.upc)));
  const [editQty, setEditQty]   = useState<Record<string, number>>(
    () => Object.fromEntries(rawSkus.map((s) => [s.upc, s.suggestedQty]))
  );

  // Reset delivery point when vendor changes (if current is not serviced)
  useEffect(() => {
    if (!vendorDeliveryPoints.includes(deliveryPoint)) {
      setDeliveryPoint(vendorDeliveryPoints[0] ?? "");
    }
  }, [vendor, vendorDeliveryPoints]);

  useEffect(() => {
    setSelected(new Set(rawSkus.map((s) => s.upc)));
    setEditQty(Object.fromEntries(rawSkus.map((s) => [s.upc, s.suggestedQty])));
    setSearch(""); setSubmitted(false);
  }, [vendor, deliveryPoint]);

  const filteredSkus = useMemo(() => {
    if (!search.trim()) return rawSkus;
    const q = search.trim().toLowerCase();
    return rawSkus.filter((s) =>
      s.upc.includes(q) || s.styleCode.includes(q) ||
      s.variant.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
    );
  }, [rawSkus, search]);

  const allSkus      = rawSkus;
  const allSelected  = selected.size === allSkus.length;
  const someSelected = selected.size > 0 && selected.size < allSkus.length;

  const toggleAll = () => {
    if (selected.size === allSkus.length) setSelected(new Set());
    else setSelected(new Set(allSkus.map((s) => s.upc)));
  };
  const toggleSku = (upc: string) =>
    setSelected((prev) => { const n = new Set(prev); n.has(upc) ? n.delete(upc) : n.add(upc); return n; });

  const updateQty = (upc: string, raw: string) => {
    const n = parseInt(raw, 10);
    if (!isNaN(n) && n >= 0) setEditQty((prev) => ({ ...prev, [upc]: n }));
  };
  const snapToMultiple = (upc: string, mult: number) => {
    const cur = editQty[upc] ?? 0;
    setEditQty((prev) => ({ ...prev, [upc]: Math.ceil(cur / mult) * mult }));
  };

  const summary = useMemo(() => {
    const sel = allSkus.filter((s) => selected.has(s.upc));
    const totalQty   = sel.reduce((s, r) => s + (editQty[r.upc] ?? 0), 0);
    const totalCost  = sel.reduce((s, r) => s + (editQty[r.upc] ?? 0) * r.cost, 0);
    const totalDef   = sel.reduce((s, r) => s + r.deficit, 0);
    const sugTotal   = allSkus.reduce((s, r) => s + r.suggestedQty, 0);
    const sugCost    = allSkus.reduce((s, r) => s + r.suggestedQty * r.cost, 0);
    const moqFail    = sel.filter((s) => (editQty[s.upc] ?? 0) < s.moq && (editQty[s.upc] ?? 0) > 0).length;
    const zeroSel    = sel.filter((s) => (editQty[s.upc] ?? 0) === 0).length;
    const editedCount = sel.filter((s) => (editQty[s.upc] ?? 0) !== s.suggestedQty).length;
    const delivTypes = [...new Set(allSkus.map((s) => s.locationType))];
    return { count: sel.length, totalQty, totalCost, totalDef, sugTotal, sugCost, moqFail, zeroSel, editedCount, delivTypes };
  }, [selected, editQty, allSkus]);

  const dpDetails = DELIVERY_POINTS[deliveryPoint];
  const primaryLocation = deliveryPoint || allSkus[0]?.location || "—";
  const locType         = dpDetails?.type ?? allSkus[0]?.locationType ?? "Warehouse";

  const dpDeliveryDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + (dpDetails?.leadTimeDays ?? 14));
    return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
  }, [dpDetails]);

  if (submitted) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-in fade-in duration-500">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-slate-800">Purchase Order Submitted</h2>
            <p className="text-sm text-slate-500 mt-1">PO Number: <span className="font-mono font-bold text-primary">{poNumber}</span></p>
          </div>
          <div className="grid grid-cols-3 gap-px bg-border overflow-hidden rounded-xl border border-border/50 min-w-[400px]">
            {[
              { label: "SKUs", value: summary.count },
              { label: "Total Units", value: summary.totalQty.toLocaleString() },
              { label: "Total Cost",  value: `$${summary.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, green: true },
            ].map(({ label, value, green }) => (
              <div key={label} className="bg-white text-center py-5 px-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{label}</p>
                <p className={cn("text-2xl font-bold mt-1", green ? "text-emerald-700" : "text-slate-800")}>{value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/reports/sip-planning-enhanced")}>
              Back to SIP Planning
            </Button>
            <Button size="sm" onClick={() => { setSubmitted(false); }}>
              Create Another PO
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-5 animate-in fade-in duration-500">

        {/* Header */}
        <div>
          <button
            onClick={() => navigate("/reports/sip-planning-enhanced")}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-1"
          >
            <ChevronLeft size={14} /> SIP Planning (Enhanced)
          </button>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">Create Purchase Order</h1>
                <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">ENHANCED</span>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {allSkus.length} SKUs with Net Demand at <span className="font-semibold text-slate-700">{primaryLocation.split(" - ")[0]}</span> · sorted by highest Net Demand
                {styleFromUrl && <> · Style <span className="font-mono font-bold text-primary">{styleFromUrl}</span></>}
              </p>
            </div>
            <Badge variant="outline" className="text-[11px] h-7 px-3 font-mono self-start mt-1">{poNumber}</Badge>
          </div>
        </div>

        {/* ── PO Summary Panel ── */}
        <Card className="border-primary/25 bg-primary/[0.02] shadow-none">
          <CardContent className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <Zap size={11} className="text-primary" /> PO Summary
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Vendor */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Vendor</p>
                <p className="text-xs font-bold text-slate-800 leading-tight">{vendor.split(",")[0]}</p>
              </div>
              {/* Delivery location */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                  <Building2 size={9} /> Delivery Location
                </p>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]" title={primaryLocation}>{primaryLocation.split(" - ")[0]}</span>
                  <Badge variant="outline" className={cn("text-[9px] h-4 px-1 border shrink-0",
                    locType === "Warehouse" ? "bg-primary/10 text-primary border-primary/20" : "bg-violet-50 text-violet-700 border-violet-200"
                  )}>{locType}</Badge>
                </div>
              </div>
              {/* Total suggested */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                  <Truck size={9} /> Total Suggested Units
                </p>
                <p className="text-lg font-bold text-primary tabular-nums">{summary.sugTotal.toLocaleString()}</p>
              </div>
              {/* Total value */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Total Order Value</p>
                <p className="text-lg font-bold text-emerald-700 tabular-nums">
                  ${summary.sugCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </p>
              </div>
              {/* MOQ Status */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">MOQ Status</p>
                {summary.moqFail === 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                    <CheckCircle2 size={10} /> Met
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
                    <AlertCircle size={10} /> {summary.moqFail} Not Met
                  </span>
                )}
              </div>
              {/* Next delivery */}
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                  <Calendar size={9} /> Next Available Delivery
                </p>
                <p className="text-xs font-bold text-slate-700 font-mono">
                  {dpDeliveryDate}
                  {dpDetails && <span className="ml-1 text-[10px] font-normal text-slate-400">({dpDetails.leadTimeDays}d lead)</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Delivery Point Details ── */}
        {dpDetails && (
          <Card className="border-border/60 shadow-none">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-8 w-8 rounded-md flex items-center justify-center",
                    dpDetails.type === "Warehouse" ? "bg-primary/10 text-primary" : "bg-violet-50 text-violet-700"
                  )}>
                    {dpDetails.type === "Warehouse" ? <Building2 size={16} /> : <StoreIcon size={16} />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 leading-none">
                      Delivery Point
                    </p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5 leading-tight">{dpDetails.name}</p>
                  </div>
                </div>
                <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 border shrink-0",
                  dpDetails.type === "Warehouse"
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-violet-50 text-violet-700 border-violet-200"
                )}>
                  {dpDetails.type}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Location code */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                    <Hash size={9} /> Location Code
                  </p>
                  <p className="text-xs font-mono font-bold text-slate-800">{dpDetails.code}</p>
                </div>
                {/* Address */}
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                    <MapPin size={9} /> Address
                  </p>
                  <p className="text-xs font-medium text-slate-800 leading-tight">{dpDetails.address1}</p>
                  <p className="text-[11px] text-slate-500 leading-tight">{dpDetails.address2}</p>
                </div>
                {/* Contact */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                    <User2 size={9} /> Receiving Contact
                  </p>
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{dpDetails.contactName}</p>
                  <p className="text-[11px] text-slate-500 leading-tight flex items-center gap-1 mt-0.5">
                    <Phone size={9} className="text-slate-400" /> {dpDetails.contactPhone}
                  </p>
                </div>
                {/* Hours */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5 flex items-center gap-1">
                    <Clock size={9} /> Receiving Hours
                  </p>
                  <p className="text-[11px] text-slate-700 leading-tight">{dpDetails.hours}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{dpDetails.dock}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vendor + Delivery Point + Search */}
        <Card className="border-border/60 shadow-none">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1 min-w-[260px]">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vendor</label>
                <select value={vendor} onChange={(e) => setVendor(e.target.value)}
                  className="h-8 px-3 text-[11px] border border-slate-200 rounded-md bg-white font-medium focus:outline-none focus:ring-1 focus:ring-primary">
                  {ALL_VENDOR_NAMES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1 min-w-[280px]">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Building2 size={10} /> Delivery Point
                  <span className="text-[9px] font-normal normal-case tracking-normal text-slate-400">
                    ({vendorDeliveryPoints.length} serviced)
                  </span>
                </label>
                <select
                  value={deliveryPoint}
                  onChange={(e) => setDeliveryPoint(e.target.value)}
                  disabled={vendorDeliveryPoints.length === 0}
                  className="h-8 px-3 text-[11px] border border-slate-200 rounded-md bg-white font-medium focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-slate-50 disabled:text-slate-400"
                >
                  {vendorDeliveryPoints.length === 0 && <option value="">No delivery points with Net Demand</option>}
                  {vendorDeliveryPoints.map((dp) => {
                    const d = DELIVERY_POINTS[dp];
                    return (
                      <option key={dp} value={dp}>
                        {dp}{d ? ` · ${d.type}` : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex flex-col gap-1 min-w-[240px]">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Search SKU</label>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <Input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="UPC, style, variant or description…"
                    className="h-8 pl-7 text-[11px] border-slate-200 bg-white" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Direct-to-Store Review (Store delivery points only) ── */}
        {locType === "Store" && rawSkus.length > 0 && (() => {
          const leadDays = dpDetails?.leadTimeDays ?? 7;
          const rows = rawSkus.map((s) => {
            const forecast    = forecastUnits(s, 4);
            const onHand      = s.stock;
            const safety      = safetyStockUnits(s, leadDays);
            const target      = forecast + safety;
            const gap         = target - onHand;
            const coverageWks = s.sales > 0 ? +(onHand / s.sales).toFixed(1) : 0;
            return { s, forecast, onHand, safety, target, gap, coverageWks };
          });
          const tot = rows.reduce(
            (acc, r) => ({
              forecast: acc.forecast + r.forecast,
              onHand:   acc.onHand   + r.onHand,
              safety:   acc.safety   + r.safety,
              target:   acc.target   + r.target,
              gap:      acc.gap      + Math.max(0, r.gap),
            }),
            { forecast: 0, onHand: 0, safety: 0, target: 0, gap: 0 },
          );
          const skusBelowSafety = rows.filter((r) => r.onHand < r.safety).length;

          return (
            <Card className="border-violet-200 bg-violet-50/30 shadow-none">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-violet-100 text-violet-700 flex items-center justify-center">
                      <StoreIcon size={14} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-violet-700 leading-none">
                        Direct-to-Store Review
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Sales forecast, store on-hand, and safety stock by SKU · {leadDays}-day lead time
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
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-violet-200/60 rounded-md overflow-hidden border border-violet-200/60 mb-3">
                  {[
                    { label: "4-Wk Forecast",    value: tot.forecast.toLocaleString(), cls: "text-slate-800" },
                    { label: "Store On-Hand",    value: tot.onHand.toLocaleString(),   cls: "text-slate-800" },
                    { label: "Safety Stock",     value: tot.safety.toLocaleString(),   cls: "text-violet-700" },
                    { label: "Target (Fcst+Safety)", value: tot.target.toLocaleString(),   cls: "text-slate-800" },
                    { label: "Net Gap",          value: tot.gap.toLocaleString(),     cls: tot.gap > 0 ? "text-red-600" : "text-emerald-700" },
                  ].map(({ label, value, cls }) => (
                    <div key={label} className="bg-white py-2 px-3 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                      <p className={cn("text-sm font-bold tabular-nums mt-0.5", cls)}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* SKU breakdown table */}
                <div className="overflow-x-auto rounded-md border border-violet-200/60 bg-white">
                  <table className="text-xs w-full border-collapse">
                    <thead>
                      <tr className="bg-violet-50/70 border-b border-violet-200/60">
                        {[
                          { l: "Style",         a: "text-left" },
                          { l: "Variant",       a: "text-left" },
                          { l: "Description",   a: "text-left" },
                          { l: "Wkly Sales",    a: "text-right" },
                          { l: "4-Wk Forecast", a: "text-right" },
                          { l: "Store On-Hand", a: "text-right" },
                          { l: "Safety Stock",  a: "text-right" },
                          { l: "Coverage (wks)",a: "text-right" },
                          { l: "Status",        a: "text-left" },
                        ].map(({ l, a }) => (
                          <th key={l} className={cn(
                            "px-3 py-2 font-semibold text-[9px] uppercase tracking-wide text-slate-500 border-r border-violet-200/40 last:border-r-0 whitespace-nowrap",
                            a,
                          )}>{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(({ s, forecast, onHand, safety, coverageWks }, i) => {
                        const belowSafety = onHand < safety;
                        const belowFcst   = onHand < forecast;
                        return (
                          <tr key={s.upc} className={cn(
                            "border-b border-violet-100/60 last:border-b-0",
                            i % 2 !== 0 && "bg-violet-50/[0.25]",
                          )}>
                            <td className="px-3 py-2 font-mono text-[10px] font-bold text-primary whitespace-nowrap border-r border-violet-100/60">{s.styleCode}</td>
                            <td className="px-3 py-2 border-r border-violet-100/60">
                              <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-slate-50 text-slate-700 border-slate-200 whitespace-nowrap">{s.variant}</Badge>
                            </td>
                            <td className="px-3 py-2 max-w-[220px] truncate border-r border-violet-100/60 text-slate-700" title={s.description}>{s.description}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-slate-600 border-r border-violet-100/60">{s.sales}</td>
                            <td className="px-3 py-2 text-right tabular-nums font-semibold text-slate-800 border-r border-violet-100/60">{forecast.toLocaleString()}</td>
                            <td className={cn(
                              "px-3 py-2 text-right tabular-nums font-semibold border-r border-violet-100/60",
                              belowSafety ? "text-red-600" : belowFcst ? "text-amber-600" : "text-slate-800",
                            )}>{onHand.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right tabular-nums font-semibold text-violet-700 border-r border-violet-100/60">{safety.toLocaleString()}</td>
                            <td className={cn(
                              "px-3 py-2 text-right tabular-nums border-r border-violet-100/60 font-semibold",
                              coverageWks < 1 ? "text-red-600" : coverageWks < 2 ? "text-amber-600" : "text-emerald-700",
                            )}>{coverageWks.toFixed(1)}</td>
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
                  Safety stock covers the {leadDays}-day receiving lead time plus a 50% buffer, rounded to each SKU's order multiple.
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
                        <Checkbox checked={allSelected}
                          ref={(el) => { if (el) (el as any).indeterminate = someSelected; }}
                          onCheckedChange={toggleAll} className="h-3.5 w-3.5" />
                      </th>
                      {[
                        { label: "UPC",         cls: "text-left" },
                        { label: "Style",        cls: "text-left" },
                        { label: "Variant",      cls: "text-left" },
                        { label: "Pres. Stock",  cls: "text-right" },
                        { label: "Description",  cls: "text-left" },
                        { label: "Stock",        cls: "text-right" },
                        { label: "Sales",        cls: "text-right" },
                        { label: "WOS",          cls: "text-right" },
                        { label: "Cost",         cls: "text-right" },
                        { label: "MOQ",          cls: "text-right" },
                        { label: "Order Mult.",  cls: "text-right" },
                        { label: "Net Demand",   cls: "text-right text-red-500" },
                        { label: "Sugg. Qty",   cls: "text-right" },
                        { label: "Alerts",       cls: "text-left" },
                        { label: "Order Qty",    cls: "text-right text-primary" },
                      ].map(({ label, cls }) => (
                        <th key={label} className={cn("px-3 py-2.5 font-semibold text-[10px] uppercase tracking-wide text-slate-500 border-r border-border/20 last:border-r-0 whitespace-nowrap", cls)}>
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSkus.map((s, i) => {
                      const isSelected = selected.has(s.upc);
                      const qty        = editQty[s.upc] ?? s.suggestedQty;
                      const isBelowMoq = qty < s.moq && qty > 0;
                      const isEdited   = qty !== s.suggestedQty;
                      const alerts     = getAlerts(s);
                      return (
                        <tr key={s.upc}
                          className={cn(
                            "border-b border-border/20 transition-colors",
                            isSelected ? "hover:bg-primary/[0.03]" : "opacity-50 hover:opacity-70",
                            i % 2 !== 0 && "bg-muted/[0.02]",
                          )}
                        >
                          <td className="px-3 py-2 border-r border-border/20">
                            <Checkbox checked={isSelected} onCheckedChange={() => toggleSku(s.upc)} className="h-3.5 w-3.5" />
                          </td>
                          <td className="px-3 py-2 font-mono text-[10px] text-slate-400 whitespace-nowrap border-r border-border/20">{s.upc}</td>
                          <td className="px-3 py-2 font-mono text-[10px] font-bold text-primary whitespace-nowrap border-r border-border/20">{s.styleCode}</td>
                          <td className="px-3 py-2 border-r border-border/20">
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-slate-50 text-slate-700 border-slate-200 whitespace-nowrap">{s.variant}</Badge>
                          </td>
                          <td
                            className="px-3 py-2 text-right tabular-nums text-slate-600 border-r border-border/20"
                            title="Presentation stock — qty needed to fill store fixtures across serviced stores"
                            data-testid={`text-pres-stock-${s.upc}`}
                          >
                            {presStockFor(s).toLocaleString()}
                          </td>
                          <td className="px-3 py-2 max-w-[200px] truncate border-r border-border/20 text-slate-700" title={s.description}>{s.description}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-600 border-r border-border/20">{s.stock}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-600 border-r border-border/20">{s.sales}</td>
                          <td className={cn("px-3 py-2 text-right tabular-nums border-r border-border/20 font-semibold",
                            s.wos < 1 ? "text-red-600" : s.wos < 2 ? "text-orange-500" : "text-slate-600"
                          )}>{s.wos.toFixed(1)}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-600 border-r border-border/20 whitespace-nowrap">${s.cost.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-500 border-r border-border/20">{s.moq}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-500 border-r border-border/20">{s.orderMultiple}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-bold text-red-600 border-r border-border/20" data-testid={`text-net-demand-${s.upc}`}>{s.deficit.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right tabular-nums text-slate-500 border-r border-border/20">{s.suggestedQty}</td>
                          {/* Alerts */}
                          <td className="px-3 py-2 border-r border-border/20">
                            <div className="flex flex-wrap gap-0.5">
                              {alerts.length === 0 ? (
                                <span className="text-[10px] text-slate-300">—</span>
                              ) : alerts.map((a) => {
                                const cfg = ALERT_CFG[a];
                                const Icon = cfg.icon;
                                return (
                                  <span key={a} className={cn("inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap", cfg.cls)}>
                                    <Icon size={8} /> {cfg.label}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          {/* Order Qty */}
                          <td className="px-3 py-2">
                            <div className="flex items-center justify-end gap-1.5">
                              {isBelowMoq && <AlertCircle size={12} className="text-amber-500 flex-shrink-0" title={`Below MOQ (${s.moq})`} />}
                              <Input
                                type="number" min={0} value={qty}
                                disabled={!isSelected}
                                onChange={(e) => updateQty(s.upc, e.target.value)}
                                onBlur={() => snapToMultiple(s.upc, s.orderMultiple)}
                                className={cn(
                                  "h-7 w-[72px] text-right text-[11px] font-bold tabular-nums border focus:ring-1",
                                  isEdited && isSelected && "bg-amber-50 border-amber-300",
                                  isBelowMoq ? "border-amber-300 focus:ring-amber-400 text-amber-700"
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
                        <td colSpan={16} className="py-10 text-center text-xs text-slate-400">
                          {rawSkus.length === 0
                            ? `No Net Demand SKUs from ${vendor.split(",")[0]} for this delivery point.`
                            : "No SKUs match your search."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
            <p className="text-[10px] text-slate-400 mt-2 ml-1">
              Qty auto-snaps to order multiple on blur.{" "}
              <span className="bg-amber-50 border border-amber-200 px-1 rounded text-amber-700 font-semibold">Yellow cells</span>{" "}
              indicate values edited from suggested. MOQ warnings shown with <AlertCircle size={10} className="inline text-amber-500" />.
            </p>
          </div>

          {/* Side Panel */}
          <div className="w-64 flex-shrink-0 space-y-3">
            {/* Order Summary */}
            <Card className="border-border/60 shadow-none">
              <CardContent className="p-4 space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 flex items-center gap-1.5">
                  <Package size={13} /> Order Summary
                </p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Vendor</span>
                    <span className="text-[11px] font-bold text-slate-700 text-right max-w-[110px] leading-tight">{vendor.split(",")[0]}</span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs text-slate-500">Delivery Point</span>
                    <div className="text-right max-w-[140px]">
                      <p className="text-[11px] font-bold text-slate-700 leading-tight truncate" title={primaryLocation}>{primaryLocation.split(" - ")[0]}</p>
                      {dpDetails && (
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">{dpDetails.code}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">PO Number</span>
                    <span className="text-[11px] font-mono font-bold text-primary">{poNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">SKUs Selected</span>
                    <span className="text-sm font-bold text-slate-800">{summary.count} / {allSkus.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Total Net Demand</span>
                    <span className="text-sm font-bold text-red-600 tabular-nums">{summary.totalDef.toLocaleString()}</span>
                  </div>
                  {summary.editedCount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">Edited Qtys</span>
                      <span className="text-[11px] font-bold text-amber-600">{summary.editedCount} SKU{summary.editedCount > 1 ? "s" : ""}</span>
                    </div>
                  )}
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
                <Button className="w-full gap-1.5 text-xs font-bold"
                  disabled={summary.count === 0 || summary.totalQty === 0}
                  onClick={() => setSubmitted(true)}>
                  <ShoppingCart size={14} /> Submit PO
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs"
                  onClick={() => navigate("/reports/sip-planning-enhanced")}>
                  Cancel
                </Button>
              </CardContent>
            </Card>

            {/* Validation panel */}
            {summary.count > 0 && (
              <Card className={cn("shadow-none", summary.moqFail > 0 || summary.zeroSel > 0 ? "border-red-200 bg-red-50/40" : "border-amber-200 bg-amber-50/40")}>
                <CardContent className="p-3 space-y-1.5">
                  <p className={cn("text-[10px] font-bold uppercase tracking-wide mb-2",
                    summary.moqFail > 0 || summary.zeroSel > 0 ? "text-red-700" : "text-amber-700"
                  )}>Validation</p>
                  {[
                    {
                      ok: summary.moqFail === 0,
                      msg: summary.moqFail === 0 ? "All quantities above MOQ" : `${summary.moqFail} SKU${summary.moqFail > 1 ? "s" : ""} below MOQ`
                    },
                    {
                      ok: summary.zeroSel === 0,
                      msg: summary.zeroSel === 0 ? "No zero-quantity lines selected" : `${summary.zeroSel} selected with qty = 0`
                    },
                    { ok: true, msg: "Quantities are order-multiple aligned" },
                    { ok: true, msg: "Correct vendor selected" },
                  ].map(({ ok, msg }) => (
                    <div key={msg} className="flex items-start gap-1.5">
                      {ok
                        ? <CheckCircle2 size={11} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        : <XCircle size={11} className="text-red-500 mt-0.5 flex-shrink-0" />}
                      <span className={cn("text-[10px]", ok ? "text-amber-700" : "text-red-700 font-semibold")}>{msg}</span>
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
