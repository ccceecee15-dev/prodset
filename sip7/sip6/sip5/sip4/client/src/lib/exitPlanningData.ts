// ─── Shared data module for Exit Planning screens ────────────────────────────

export const MERCHANDISE_AREAS = [
  "AUDIO", "CABLES & CONNECT", "COMPUTING", "GAMING", "HOME TECH",
  "IMAGING", "MOBILE ACCESSORIES", "MOBILE DEVICES", "NETWORKING",
  "SMART HOME", "STORAGE", "TABLETS", "TV & DISPLAY", "WEARABLES",
  "ACCESSORIES",
];

export const CATEGORIES_BY_MA: Record<string, string[]> = {
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

export const BRANDS = ["APPLE", "BOSE", "SONY", "JBL", "SAMSUNG", "ANKER"];

export const STORE_FORMATS = ["SPECIALTY", "WTLV", "FLAGSHIP", "STANDARD", "TRAVEL"];

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MrStage { within1m: number; older1m: number; unknown: number; total: number }
export interface AgingRow {
  ma: string; category: string; subCategory: string; brand: string;
  stockTotal: number; stock6m: number; stock12m: number; stock24m: number; stockUnk: number;
  eolTotal: number; eolWithin3m: number; eolOlder3m: number; eolUnk: number;
  clearTotal: number; mr1: MrStage; mr2: MrStage; mr3: MrStage; mr4: MrStage;
}
export interface StyleDetail {
  style: string; description: string; vendor: string;
  stockVal: number; stockUnits: number; distribution: number;
  costPrice: number; markdownPrice: number; margin: number;
}
export interface StoreDetail {
  storeId: number; description: string; format: string;
  stockVal: number; stockUnits: number; styleRef: string;
}
export interface DrillEntry { styles: StyleDetail[]; stores: StoreDetail[] }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function rnd(min: number, max: number) {
  return +((Math.random() * (max - min) + min)).toFixed(2);
}

function makeStage(sMin: number, sMax: number): MrStage {
  const within1m = rnd(0, sMin * 0.1);
  const older1m  = rnd(sMin, sMax);
  const unknown  = rnd(-200, 500);
  return { within1m, older1m, unknown, total: +(within1m + older1m + unknown).toFixed(2) };
}

function generateRow(ma: string): AgingRow {
  const cats = CATEGORIES_BY_MA[ma] ?? ["General"];
  const cat  = cats[Math.floor(Math.random() * cats.length)];
  const brand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
  const stock6m   = rnd(50000, 2500000);
  const stock12m  = rnd(1000, 60000);
  const stock24m  = rnd(500, 30000);
  const stockUnk  = rnd(0, 5000);
  const stockTotal = +(stock6m + stock12m + stock24m + stockUnk).toFixed(2);
  const eolWithin3m = rnd(10000, 400000);
  const eolOlder3m  = rnd(50000, 800000);
  const eolUnk      = rnd(0, 2000);
  const eolTotal    = +(eolWithin3m + eolOlder3m + eolUnk).toFixed(2);
  const mr1 = makeStage(5000, 180000);
  const mr2 = makeStage(4000, 150000);
  const mr3 = makeStage(3000, 100000);
  const mr4 = makeStage(1000, 50000);
  const clearTotal = +(mr1.total + mr2.total + mr3.total + mr4.total).toFixed(2);
  return {
    ma, category: cat, subCategory: `${cat} Sub`, brand,
    stockTotal, stock6m, stock12m, stock24m, stockUnk,
    eolTotal, eolWithin3m, eolOlder3m, eolUnk,
    clearTotal, mr1, mr2, mr3, mr4,
  };
}

export const ALL_ROWS: AgingRow[] = MERCHANDISE_AREAS.flatMap((ma) => {
  const n = Math.floor(Math.random() * 3) + 2;
  return Array.from({ length: n }, () => generateRow(ma));
});

// ─── Drill-down data ─────────────────────────────────────────────────────────
const STYLE_DESCS: Record<string, string[]> = {
  "AUDIO":              ["BOSE QC45 WIRELESS HEADPHONES BLACK","SONY WH-1000XM5 NOISE CANCELLING BLACK","JBL LIVE 770NC WIRELESS HEADPHONES","ANKER SOUNDCORE Q35 WIRELESS HEADPHONES"],
  "CABLES & CONNECT":   ["APPLE USB-C TO LIGHTNING CABLE 1M","SAMSUNG USB-C TO USB-C CABLE 1.8M","ANKER USB-C HUB 7-IN-1","BELKIN BOOST CHARGE USB-C CABLE 2M"],
  "COMPUTING":          ["APPLE MAGIC KEYBOARD WITH TOUCH ID","LOGITECH MX MASTER 3S WIRELESS MOUSE","SAMSUNG T7 PORTABLE SSD 1TB","BELKIN LAPTOP STAND WITH USB-C HUB"],
  "GAMING":             ["RAZER BLACKSHARK V2 X GAMING HEADSET","SONY PULSE 3D WIRELESS HEADSET WHITE","XBOX WIRELESS CONTROLLER CARBON BLACK","STEELSERIES ARCTIS NOVA 1 HEADSET"],
  "HOME TECH":          ["GOOGLE NEST MINI 2ND GEN CHALK","AMAZON ECHO DOT 5TH GEN CHARCOAL","APPLE HOMEPOD MINI SPACE GREY","BOSE HOME SPEAKER 300 BLACK"],
  "MOBILE ACCESSORIES": ["APPLE MAGSAFE CHARGER 1M","SAMSUNG 45W USB-C SUPER FAST CHARGER","ANKER NANO 65W USB-C COMPACT CHARGER","BELKIN BOOST CHARGE PRO 3-IN-1 STAND"],
  "MOBILE DEVICES":     ["SAMSUNG GALAXY A55 5G 256GB NAVY","APPLE IPHONE 15 128GB BLUE TITANIUM","GOOGLE PIXEL 8A 128GB OBSIDIAN"],
  "NETWORKING":         ["TP-LINK DECO XE75 AXE5400 MESH WIFI","NETGEAR NIGHTHAWK AX8 8-STREAM WIFI 6","ASUS ZENWIFI AX XT8 DUAL PACK"],
  "SMART HOME":         ["PHILIPS HUE WHITE & COLOUR E27 STARTER KIT","RING VIDEO DOORBELL 4 BRONZE","NEST LEARNING THERMOSTAT 3RD GEN"],
  "STORAGE":            ["SAMSUNG T7 PORTABLE SSD 2TB BLUE","SEAGATE BACKUP PLUS PORTABLE 4TB","SANDISK EXTREME PRO SDXC 256GB"],
  "TABLETS":            ["APPLE IPAD 10TH GEN 64GB WIFI SILVER","SAMSUNG GALAXY TAB S9 FE 128GB GREY","APPLE IPAD MINI 6TH GEN 64GB WIFI"],
  "TV & DISPLAY":       ["LG 55 OLED55C34LA OLED EVO TV","SAMSUNG 55 QE55QN90CATXXU NEO QLED","SONY KD-55X85L 4K HDR LED TV"],
  "WEARABLES":          ["APPLE WATCH SERIES 9 41MM MIDNIGHT","SAMSUNG GALAXY WATCH 6 CLASSIC 43MM","GARMIN FORERUNNER 265 BLACK"],
  "ACCESSORIES":        ["APPLE AIRPODS PRO 2ND GEN MAGSAFE","TARGUS SAFEFIT ROTATING TABLET CASE","PEAK DESIGN EVERYDAY BACKPACK 20L"],
  "IMAGING":            ["SONY ALPHA A6700 APS-C CAMERA BODY","CANON EOS R10 MIRRORLESS CAMERA","NIKON Z FC MIRRORLESS CAMERA KIT"],
};

const VENDORS = [
  "INGRAM MICRO, INC.", "TECH DATA", "SYNNEX CORPORATION", "HARMAN INTERNATIONAL",
  "SONY ELECTRONICS INC.", "SAMSUNG ELECTRONICS AMERICA", "APPLE INC.", "ANKER INNOVATIONS LIMITED",
];

const STORE_NAMES: [string, string][] = [
  ["LICK-HORSESHOE","SPECIALTY"], ["HARLEY-LINQ","WTLV"], ["RUBY BLUE-LINQ","SPECIALTY"],
  ["WELCOME LAS VEGAS-FORUM SHOPS","SPECIALTY"], ["LICK-EXCALIBUR","SPECIALTY"],
  ["TECH CENTRAL-DOWNTOWN","FLAGSHIP"], ["MOBILE WORLD-WESTFIELD","STANDARD"],
  ["CONNECT-HEATHROW T5","TRAVEL"], ["DIGITAL HUB-CANARY WHARF","FLAGSHIP"],
  ["GADGET ZONE-LAKESIDE","STANDARD"], ["SMART STORE-BLUEWATER","STANDARD"],
  ["CONNECT-GATWICK SOUTH","TRAVEL"], ["TECH WORLD-BULLRING","FLAGSHIP"],
  ["MOBILE PLUS-TRAFFORD CTR","STANDARD"], ["DIGITAL-MEADOWHALL","STANDARD"],
  ["CONNECT-STANSTED","TRAVEL"], ["TECH HUB-GLASGOW BUCHANAN","FLAGSHIP"],
  ["GADGET PRO-BRAEHEAD","STANDARD"], ["MOBILE CENTRAL-ARNDALE","STANDARD"],
  ["CONNECT-EDINBURGH AIRPORT","TRAVEL"],
];

function genStyleDetails(ma: string, rowIdx: number): StyleDetail[] {
  const descs = STYLE_DESCS[ma] ?? STYLE_DESCS["ACCESSORIES"];
  const count = 3 + (rowIdx % 3);
  return Array.from({ length: count }, (_, i) => {
    const cost    = +(20 + Math.random() * 200).toFixed(2);
    const mkPrice = +(cost * (1.1 + Math.random() * 0.5)).toFixed(2);
    const margin  = Math.round(((mkPrice - cost) / mkPrice) * 100);
    return {
      style:         String(1300000 + rowIdx * 100 + i * 7 + 1),
      description:   descs[i % descs.length],
      vendor:        VENDORS[Math.floor(Math.random() * VENDORS.length)],
      stockVal:      +(50 + Math.random() * 5000).toFixed(2),
      stockUnits:    Math.floor(1 + Math.random() * 200),
      distribution:  [2, 3, 4, 5, 6, 8, 10][Math.floor(Math.random() * 7)],
      costPrice:     cost,
      markdownPrice: mkPrice,
      margin,
    };
  });
}

function genStoreDetails(rowIdx: number): StoreDetail[] {
  const count = 5 + Math.floor(Math.random() * 8);
  const stylePool = [
    String(1300000 + rowIdx * 100 + 1),
    String(1300000 + rowIdx * 100 + 8),
    String(1300000 + rowIdx * 100 + 15),
  ];
  return Array.from({ length: count }, (_, i) => {
    const [name, fmt] = STORE_NAMES[(rowIdx + i) % STORE_NAMES.length];
    return {
      storeId:     120 + rowIdx + i,
      description: name,
      format:      fmt,
      stockVal:    +(5 + Math.random() * 50).toFixed(2),
      stockUnits:  Math.floor(1 + Math.random() * 15),
      styleRef:    stylePool[i % stylePool.length],
    };
  });
}

export const DRILL_DATA: DrillEntry[] = ALL_ROWS.map((row, i) => ({
  styles: genStyleDetails(row.ma, i),
  stores: genStoreDetails(i),
}));

// ─── Currency formatter ───────────────────────────────────────────────────────
export function fmt(v: number): string {
  const abs = Math.abs(v);
  const str = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return v < 0 ? `-$${str}` : `$${str}`;
}
