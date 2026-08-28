// ─── Buyers ───────────────────────────────────────────────────────────────────
export const BUYERS = [
  "Sarah Chen", "Marcus Williams", "Priya Patel", "James Okafor",
  "Emma Larsson", "David Kim", "Fatima Al-Hassan", "Tom Nguyen",
];

// ─── Vendors ─────────────────────────────────────────────────────────────────
export const VENDORS = [
  { code: "011286", name: "INGRAM MICRO, INC.",         categories: ["TECH"] },
  { code: "024501", name: "BOSE CORPORATION",            categories: ["TECH"] },
  { code: "038812", name: "SONY ELECTRONICS INC.",       categories: ["TECH"] },
  { code: "052193", name: "HARMAN INTERNATIONAL",        categories: ["TECH"] },
  { code: "061744", name: "SAMSUNG ELECTRONICS AMERICA", categories: ["TECH"] },
  { code: "073328", name: "ANKER INNOVATIONS LIMITED",   categories: ["TECH"] },
  { code: "082100", name: "GREENCORE GROUP PLC",         categories: ["FRESH FOOD"] },
  { code: "091540", name: "BAKKAVOR GROUP PLC",          categories: ["FRESH FOOD"] },
  { code: "100210", name: "FRESH DIRECT CO.",            categories: ["FRESH FOOD"] },
  { code: "110330", name: "DIAGEO PLC",                  categories: ["ALCOHOL"] },
  { code: "120440", name: "PERNOD RICARD",               categories: ["ALCOHOL"] },
  { code: "130550", name: "TREASURY WINE ESTATES",       categories: ["ALCOHOL"] },
  { code: "140660", name: "AB INBEV",                    categories: ["ALCOHOL"] },
  { code: "150770", name: "INDITEX S.A.",                categories: ["FASHION"] },
  { code: "160880", name: "H&M GROUP",                   categories: ["FASHION"] },
  { code: "170990", name: "PVH CORP.",                   categories: ["FASHION"] },
];

// ─── Brands ───────────────────────────────────────────────────────────────────
export const BRANDS: Record<string, string[]> = {
  TECH:       ["APPLE", "BOSE", "SONY", "JBL", "SAMSUNG", "ANKER", "BEATS", "JABRA"],
  "FRESH FOOD":["GREENCORE", "BAKKAVOR", "FRESH DAILY", "EAT WELL", "NATURE'S BEST"],
  ALCOHOL:    ["JOHNNIE WALKER", "BAILEYS", "SMIRNOFF", "ABSOLUT", "JACOB'S CREEK", "HEINEKEN"],
  FASHION:    ["ZARA", "H&M", "TOMMY HILFIGER", "CALVIN KLEIN", "LEVIS"],
};

// ─── Hierarchy Tree ───────────────────────────────────────────────────────────
export interface HierarchyNode {
  label: string;
  children?: HierarchyNode[];
}

export const HIERARCHY: Record<string, HierarchyNode> = {
  TECH: {
    label: "Tech",
    children: [
      {
        label: "Audio",
        children: [
          {
            label: "Headphones",
            children: [
              { label: "Wireless Headphones" },
              { label: "Noise Cancelling" },
              { label: "Sports / Active" },
            ],
          },
          { label: "Earbuds", children: [{ label: "True Wireless" }, { label: "Wired" }] },
          { label: "Speakers",  children: [{ label: "Portable Bluetooth" }, { label: "Smart Speakers" }] },
        ],
      },
      {
        label: "Accessories",
        children: [
          { label: "Charging",     children: [{ label: "Cables" }, { label: "Adapters" }, { label: "Power Banks" }] },
          { label: "Travel Essentials", children: [{ label: "Adapters" }, { label: "Cases" }] },
          { label: "Connectivity", children: [{ label: "Hubs & Docks" }] },
        ],
      },
    ],
  },
  ALCOHOL: {
    label: "Alcohol",
    children: [
      {
        label: "Spirits",
        children: [
          { label: "Whiskey",  children: [{ label: "Single Malt" }, { label: "Blended" }] },
          { label: "Vodka",    children: [{ label: "Premium Vodka" }, { label: "Flavoured Vodka" }] },
          { label: "Gin",      children: [{ label: "London Dry" }, { label: "Contemporary" }] },
        ],
      },
      {
        label: "Wine",
        children: [
          { label: "Red Wine",   children: [{ label: "Full Bodied" }, { label: "Light Red" }] },
          { label: "White Wine", children: [{ label: "Crisp & Dry" }, { label: "Rich & Buttery" }] },
          { label: "Sparkling",  children: [{ label: "Champagne" }, { label: "Prosecco" }] },
        ],
      },
      {
        label: "Beer",
        children: [
          { label: "Lager",     children: [{ label: "Premium Lager" }, { label: "Craft Lager" }] },
          { label: "Ale",       children: [{ label: "Pale Ale" }, { label: "IPA" }] },
        ],
      },
    ],
  },
  "FRESH FOOD": {
    label: "Fresh Food",
    children: [
      {
        label: "Meal Solutions",
        children: [
          { label: "Sandwiches", children: [{ label: "Classic Range" }, { label: "Premium Range" }] },
          { label: "Wraps",      children: [{ label: "Hot Wraps" }, { label: "Cold Wraps" }] },
          { label: "Salads",     children: [{ label: "Bowl Salads" }, { label: "Side Salads" }] },
        ],
      },
      {
        label: "Bakery",
        children: [
          { label: "Pastries",   children: [{ label: "Sweet" }, { label: "Savoury" }] },
          { label: "Bread",      children: [{ label: "Artisan" }, { label: "Sliced" }] },
        ],
      },
      {
        label: "Dairy & Chilled",
        children: [
          { label: "Yoghurt",   children: [{ label: "Greek Style" }, { label: "Natural" }] },
          { label: "Cheese",    children: [{ label: "Hard Cheese" }, { label: "Soft Cheese" }] },
          { label: "Snack Pots",children: [{ label: "Dips & Crudites" }, { label: "Fruit Pots" }] },
        ],
      },
    ],
  },
  FASHION: {
    label: "Fashion",
    children: [
      {
        label: "Apparel",
        children: [
          { label: "Tops",   children: [{ label: "T-Shirts" }, { label: "Shirts" }, { label: "Knitwear" }] },
          { label: "Bottoms",children: [{ label: "Trousers" }, { label: "Jeans" }, { label: "Shorts" }] },
          { label: "Dresses",children: [{ label: "Casual" }, { label: "Formal" }] },
        ],
      },
      {
        label: "Accessories",
        children: [
          { label: "Bags",   children: [{ label: "Handbags" }, { label: "Backpacks" }] },
          { label: "Scarves",children: [{ label: "Silk" }, { label: "Wool" }] },
        ],
      },
    ],
  },
};

export const CATEGORY_KEYS = Object.keys(HIERARCHY);

// ─── Flat Hierarchy Leaves (5-level, for cascading dropdowns) ─────────────────
export interface HierarchyLeaf {
  category: string;
  subCategory: string;
  merchArea: string;
  planningGroup: string;
  subGroup: string;
}

export const APTOS_LEAVES: HierarchyLeaf[] = [
  // TECH — Audio
  { category: "TECH", subCategory: "Audio", merchArea: "Headphones", planningGroup: "Wireless",        subGroup: "In-Ear Wireless" },
  { category: "TECH", subCategory: "Audio", merchArea: "Headphones", planningGroup: "Wireless",        subGroup: "Over-Ear Wireless" },
  { category: "TECH", subCategory: "Audio", merchArea: "Headphones", planningGroup: "Noise Cancelling", subGroup: "In-Ear NC" },
  { category: "TECH", subCategory: "Audio", merchArea: "Headphones", planningGroup: "Noise Cancelling", subGroup: "Over-Ear NC" },
  { category: "TECH", subCategory: "Audio", merchArea: "Headphones", planningGroup: "Sports Active",   subGroup: "Sports In-Ear" },
  { category: "TECH", subCategory: "Audio", merchArea: "Earbuds",    planningGroup: "True Wireless",   subGroup: "TWS Premium" },
  { category: "TECH", subCategory: "Audio", merchArea: "Earbuds",    planningGroup: "True Wireless",   subGroup: "TWS Standard" },
  { category: "TECH", subCategory: "Audio", merchArea: "Earbuds",    planningGroup: "Wired",           subGroup: "Wired Standard" },
  { category: "TECH", subCategory: "Audio", merchArea: "Speakers",   planningGroup: "Portable Bluetooth", subGroup: "Compact BT" },
  { category: "TECH", subCategory: "Audio", merchArea: "Speakers",   planningGroup: "Portable Bluetooth", subGroup: "Large BT" },
  { category: "TECH", subCategory: "Audio", merchArea: "Speakers",   planningGroup: "Smart Speakers",  subGroup: "Entry Smart" },
  { category: "TECH", subCategory: "Audio", merchArea: "Speakers",   planningGroup: "Smart Speakers",  subGroup: "Premium Smart" },
  // TECH — Accessories
  { category: "TECH", subCategory: "Accessories", merchArea: "Charging",          planningGroup: "Cables",       subGroup: "USB-C Cables" },
  { category: "TECH", subCategory: "Accessories", merchArea: "Charging",          planningGroup: "Cables",       subGroup: "Multi Cables" },
  { category: "TECH", subCategory: "Accessories", merchArea: "Charging",          planningGroup: "Adapters",     subGroup: "Wall Adapters" },
  { category: "TECH", subCategory: "Accessories", merchArea: "Charging",          planningGroup: "Power Banks",  subGroup: "Compact Power" },
  { category: "TECH", subCategory: "Accessories", merchArea: "Travel Essentials", planningGroup: "Adapters",     subGroup: "Universal Travel" },
  { category: "TECH", subCategory: "Accessories", merchArea: "Travel Essentials", planningGroup: "Cases",        subGroup: "Standard Cases" },
  { category: "TECH", subCategory: "Accessories", merchArea: "Connectivity",      planningGroup: "Hubs & Docks", subGroup: "USB-C Hubs" },
  // ALCOHOL — Spirits
  { category: "ALCOHOL", subCategory: "Spirits", merchArea: "Whiskey", planningGroup: "Single Malt", subGroup: "Scotch Single Malt" },
  { category: "ALCOHOL", subCategory: "Spirits", merchArea: "Whiskey", planningGroup: "Single Malt", subGroup: "Irish Single Malt" },
  { category: "ALCOHOL", subCategory: "Spirits", merchArea: "Whiskey", planningGroup: "Blended",     subGroup: "Blended Standard" },
  { category: "ALCOHOL", subCategory: "Spirits", merchArea: "Whiskey", planningGroup: "Blended",     subGroup: "Blended Premium" },
  { category: "ALCOHOL", subCategory: "Spirits", merchArea: "Vodka",   planningGroup: "Premium Vodka",   subGroup: "Standard Premium" },
  { category: "ALCOHOL", subCategory: "Spirits", merchArea: "Vodka",   planningGroup: "Flavoured Vodka", subGroup: "Fruit Flavoured" },
  { category: "ALCOHOL", subCategory: "Spirits", merchArea: "Gin",     planningGroup: "London Dry",   subGroup: "London Dry Standard" },
  { category: "ALCOHOL", subCategory: "Spirits", merchArea: "Gin",     planningGroup: "Contemporary", subGroup: "Craft Contemporary" },
  // ALCOHOL — Wine
  { category: "ALCOHOL", subCategory: "Wine", merchArea: "Red Wine",   planningGroup: "Full Bodied",     subGroup: "Australian Red" },
  { category: "ALCOHOL", subCategory: "Wine", merchArea: "Red Wine",   planningGroup: "Light Red",       subGroup: "European Light Red" },
  { category: "ALCOHOL", subCategory: "Wine", merchArea: "White Wine", planningGroup: "Crisp & Dry",     subGroup: "Sauvignon Blanc" },
  { category: "ALCOHOL", subCategory: "Wine", merchArea: "White Wine", planningGroup: "Rich & Buttery",  subGroup: "Chardonnay Premium" },
  { category: "ALCOHOL", subCategory: "Wine", merchArea: "Sparkling",  planningGroup: "Champagne",       subGroup: "NV Champagne" },
  { category: "ALCOHOL", subCategory: "Wine", merchArea: "Sparkling",  planningGroup: "Prosecco",        subGroup: "Standard Prosecco" },
  // ALCOHOL — Beer
  { category: "ALCOHOL", subCategory: "Beer", merchArea: "Lager", planningGroup: "Premium Lager", subGroup: "Domestic Lager" },
  { category: "ALCOHOL", subCategory: "Beer", merchArea: "Lager", planningGroup: "Craft Lager",   subGroup: "Independent Craft" },
  { category: "ALCOHOL", subCategory: "Beer", merchArea: "Ale",   planningGroup: "Pale Ale",      subGroup: "Standard Pale Ale" },
  { category: "ALCOHOL", subCategory: "Beer", merchArea: "Ale",   planningGroup: "IPA",           subGroup: "Craft IPA" },
  // FRESH FOOD — Meal Solutions
  { category: "FRESH FOOD", subCategory: "Meal Solutions", merchArea: "Sandwiches", planningGroup: "Classic Range", subGroup: "Classic Standard" },
  { category: "FRESH FOOD", subCategory: "Meal Solutions", merchArea: "Sandwiches", planningGroup: "Premium Range", subGroup: "Gourmet Premium" },
  { category: "FRESH FOOD", subCategory: "Meal Solutions", merchArea: "Wraps",      planningGroup: "Hot Wraps",     subGroup: "Hot Wrap Standard" },
  { category: "FRESH FOOD", subCategory: "Meal Solutions", merchArea: "Wraps",      planningGroup: "Cold Wraps",    subGroup: "Cold Wrap Standard" },
  { category: "FRESH FOOD", subCategory: "Meal Solutions", merchArea: "Salads",     planningGroup: "Bowl Salads",   subGroup: "Premium Bowl" },
  { category: "FRESH FOOD", subCategory: "Meal Solutions", merchArea: "Salads",     planningGroup: "Side Salads",   subGroup: "Side Standard" },
  // FRESH FOOD — Bakery
  { category: "FRESH FOOD", subCategory: "Bakery", merchArea: "Pastries", planningGroup: "Sweet",   subGroup: "Sweet Standard" },
  { category: "FRESH FOOD", subCategory: "Bakery", merchArea: "Pastries", planningGroup: "Savoury", subGroup: "Savoury Standard" },
  { category: "FRESH FOOD", subCategory: "Bakery", merchArea: "Bread",    planningGroup: "Artisan", subGroup: "Artisan Sourdough" },
  { category: "FRESH FOOD", subCategory: "Bakery", merchArea: "Bread",    planningGroup: "Sliced",  subGroup: "Sliced Standard" },
  // FRESH FOOD — Dairy & Chilled
  { category: "FRESH FOOD", subCategory: "Dairy & Chilled", merchArea: "Yoghurt",    planningGroup: "Greek Style", subGroup: "Greek Full Fat" },
  { category: "FRESH FOOD", subCategory: "Dairy & Chilled", merchArea: "Yoghurt",    planningGroup: "Natural",     subGroup: "Natural Standard" },
  { category: "FRESH FOOD", subCategory: "Dairy & Chilled", merchArea: "Cheese",     planningGroup: "Hard Cheese", subGroup: "Aged Cheddar" },
  { category: "FRESH FOOD", subCategory: "Dairy & Chilled", merchArea: "Cheese",     planningGroup: "Soft Cheese", subGroup: "Brie & Camembert" },
  { category: "FRESH FOOD", subCategory: "Dairy & Chilled", merchArea: "Snack Pots", planningGroup: "Dips",        subGroup: "Hummus & Crudites" },
  // FASHION — Apparel
  { category: "FASHION", subCategory: "Apparel", merchArea: "Tops",    planningGroup: "T-Shirts",  subGroup: "Unisex Tee" },
  { category: "FASHION", subCategory: "Apparel", merchArea: "Tops",    planningGroup: "Shirts",    subGroup: "Mens Business" },
  { category: "FASHION", subCategory: "Apparel", merchArea: "Tops",    planningGroup: "Knitwear",  subGroup: "Womens Knit" },
  { category: "FASHION", subCategory: "Apparel", merchArea: "Bottoms", planningGroup: "Trousers",  subGroup: "Smart Trousers" },
  { category: "FASHION", subCategory: "Apparel", merchArea: "Bottoms", planningGroup: "Jeans",     subGroup: "Slim Fit Jeans" },
  { category: "FASHION", subCategory: "Apparel", merchArea: "Bottoms", planningGroup: "Shorts",    subGroup: "Casual Shorts" },
  { category: "FASHION", subCategory: "Apparel", merchArea: "Dresses", planningGroup: "Casual",    subGroup: "Day Dress" },
  { category: "FASHION", subCategory: "Apparel", merchArea: "Dresses", planningGroup: "Formal",    subGroup: "Evening Formal" },
  // FASHION — Accessories
  { category: "FASHION", subCategory: "Accessories", merchArea: "Bags",    planningGroup: "Handbags",  subGroup: "Standard Handbag" },
  { category: "FASHION", subCategory: "Accessories", merchArea: "Bags",    planningGroup: "Backpacks", subGroup: "Standard Backpack" },
  { category: "FASHION", subCategory: "Accessories", merchArea: "Scarves", planningGroup: "Silk",      subGroup: "Silk Standard" },
  { category: "FASHION", subCategory: "Accessories", merchArea: "Scarves", planningGroup: "Wool",      subGroup: "Wool Standard" },
];

export const ALT_LEAVES: HierarchyLeaf[] = [
  // CONSUMER ELECTRONICS — Digital Audio
  { category: "CONSUMER ELECTRONICS", subCategory: "Digital Audio",  merchArea: "In-Ear Audio",      planningGroup: "True Wireless",      subGroup: "TWS Premium Tier" },
  { category: "CONSUMER ELECTRONICS", subCategory: "Digital Audio",  merchArea: "In-Ear Audio",      planningGroup: "True Wireless",      subGroup: "TWS Value Tier" },
  { category: "CONSUMER ELECTRONICS", subCategory: "Digital Audio",  merchArea: "Over-Ear Audio",    planningGroup: "Noise Cancelling",   subGroup: "ANC Premium" },
  { category: "CONSUMER ELECTRONICS", subCategory: "Digital Audio",  merchArea: "Over-Ear Audio",    planningGroup: "Noise Cancelling",   subGroup: "ANC Entry" },
  { category: "CONSUMER ELECTRONICS", subCategory: "Digital Audio",  merchArea: "Portable Speakers", planningGroup: "BT Speakers",        subGroup: "Compact BT" },
  { category: "CONSUMER ELECTRONICS", subCategory: "Digital Audio",  merchArea: "Portable Speakers", planningGroup: "BT Speakers",        subGroup: "Large Format BT" },
  // CONSUMER ELECTRONICS — Connectivity
  { category: "CONSUMER ELECTRONICS", subCategory: "Connectivity",   merchArea: "Charging",          planningGroup: "USB-C Charging",     subGroup: "Multi-Port Hub" },
  { category: "CONSUMER ELECTRONICS", subCategory: "Connectivity",   merchArea: "Charging",          planningGroup: "USB-C Charging",     subGroup: "Fast Charge Single" },
  { category: "CONSUMER ELECTRONICS", subCategory: "Connectivity",   merchArea: "Charging",          planningGroup: "Power Banks",        subGroup: "Compact Power Bank" },
  { category: "CONSUMER ELECTRONICS", subCategory: "Connectivity",   merchArea: "Mobile Accessories", planningGroup: "Protection",        subGroup: "Universal Cases" },
  // GROCERY — Chilled Convenience
  { category: "GROCERY", subCategory: "Chilled Convenience", merchArea: "Meal Solutions",  planningGroup: "Sandwiches",      subGroup: "Premium Sandwich" },
  { category: "GROCERY", subCategory: "Chilled Convenience", merchArea: "Meal Solutions",  planningGroup: "Sandwiches",      subGroup: "Value Sandwich" },
  { category: "GROCERY", subCategory: "Chilled Convenience", merchArea: "Meal Solutions",  planningGroup: "Wraps & Rolls",   subGroup: "Hot Wrap Range" },
  { category: "GROCERY", subCategory: "Chilled Convenience", merchArea: "Bakery Chilled",  planningGroup: "Sweet Pastries",  subGroup: "Premium Sweet" },
  { category: "GROCERY", subCategory: "Chilled Convenience", merchArea: "Bakery Chilled",  planningGroup: "Savoury Pastries", subGroup: "Savoury Standard" },
  // GROCERY — Fresh Dairy
  { category: "GROCERY", subCategory: "Fresh Dairy", merchArea: "Chilled Dairy", planningGroup: "Yoghurt", subGroup: "Greek Style" },
  { category: "GROCERY", subCategory: "Fresh Dairy", merchArea: "Chilled Dairy", planningGroup: "Cheese",  subGroup: "Hard Cheese" },
  { category: "GROCERY", subCategory: "Fresh Dairy", merchArea: "Chilled Dairy", planningGroup: "Cheese",  subGroup: "Soft Cheese" },
  // LIQUOR — Dark Spirits
  { category: "LIQUOR", subCategory: "Dark Spirits",   merchArea: "Scotch Whisky",  planningGroup: "Single Malt",   subGroup: "Premium Single Malt" },
  { category: "LIQUOR", subCategory: "Dark Spirits",   merchArea: "Scotch Whisky",  planningGroup: "Blended Scotch", subGroup: "Standard Blended" },
  { category: "LIQUOR", subCategory: "Dark Spirits",   merchArea: "Irish Whiskey",  planningGroup: "Single Malt",   subGroup: "Premium Irish Malt" },
  // LIQUOR — White Spirits
  { category: "LIQUOR", subCategory: "White Spirits",  merchArea: "Vodka", planningGroup: "Premium Vodka",  subGroup: "Premium Standard" },
  { category: "LIQUOR", subCategory: "White Spirits",  merchArea: "Vodka", planningGroup: "Flavoured Vodka", subGroup: "Fruit Variants" },
  { category: "LIQUOR", subCategory: "White Spirits",  merchArea: "Gin",   planningGroup: "London Dry Gin",  subGroup: "Classic London Dry" },
  { category: "LIQUOR", subCategory: "White Spirits",  merchArea: "Gin",   planningGroup: "Contemporary Gin", subGroup: "Craft Contemporary" },
  // LIQUOR — Wine & Beer
  { category: "LIQUOR", subCategory: "Wine", merchArea: "Red Wine",   planningGroup: "Full Bodied Red", subGroup: "Premium Red" },
  { category: "LIQUOR", subCategory: "Wine", merchArea: "White Wine", planningGroup: "Crisp White",     subGroup: "Sauvignon Range" },
  { category: "LIQUOR", subCategory: "Wine", merchArea: "Sparkling",  planningGroup: "Champagne",       subGroup: "NV Champagne" },
  { category: "LIQUOR", subCategory: "Beer", merchArea: "Craft Beer",     planningGroup: "IPA",         subGroup: "Local Craft IPA" },
  { category: "LIQUOR", subCategory: "Beer", merchArea: "Premium Lager",  planningGroup: "Domestic",    subGroup: "Domestic Standard" },
  // CLOTHING — Ready to Wear
  { category: "CLOTHING", subCategory: "Ready to Wear",       merchArea: "Casual Tops", planningGroup: "T-Shirts",  subGroup: "Unisex Tee" },
  { category: "CLOTHING", subCategory: "Ready to Wear",       merchArea: "Casual Tops", planningGroup: "Knitwear",  subGroup: "Womens Knit" },
  { category: "CLOTHING", subCategory: "Ready to Wear",       merchArea: "Bottoms",     planningGroup: "Jeans",     subGroup: "Slim Fit" },
  { category: "CLOTHING", subCategory: "Ready to Wear",       merchArea: "Bottoms",     planningGroup: "Trousers",  subGroup: "Smart Casual" },
  // CLOTHING — Accessories
  { category: "CLOTHING", subCategory: "Accessories & Bags",  merchArea: "Bags & Luggage",   planningGroup: "Handbags",     subGroup: "Standard Handbag" },
  { category: "CLOTHING", subCategory: "Accessories & Bags",  merchArea: "Scarves & Wraps",  planningGroup: "Silk Scarves", subGroup: "Silk Classic" },
];

// ─── Dynamic Field Metadata ───────────────────────────────────────────────────
export type FieldType = "text" | "number" | "dropdown" | "toggle" | "multi-select" | "tag" | "textarea";

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  section: string;
  required?: boolean;
  helperText?: string;
  options?: string[];
  appliesTo?: { categories?: string[]; subCategories?: string[]; merchAreas?: string[] };
  validation?: { type: "numeric" | "length" | "range"; min?: number; max?: number };
  placeholder?: string;
}

export const DYNAMIC_FIELDS: FieldConfig[] = [
  // ── Product Information ────────────────────────────────────────────────────
  {
    id: "countryOfOrigin", label: "Country of Origin", type: "dropdown", section: "Product Information",
    required: true, options: ["Australia", "China", "USA", "UK", "Germany", "France", "Japan", "Italy", "Taiwan", "South Korea"],
    helperText: "Primary country where the product is manufactured",
  },
  {
    id: "unitBarcode", label: "Unit Barcode / UPC", type: "text", section: "Product Information",
    required: true, validation: { type: "length", min: 12, max: 14 }, placeholder: "e.g. 012345678901",
    helperText: "12-14 digit barcode",
  },
  {
    id: "innerBarcode", label: "Inner Barcode", type: "text", section: "Product Information",
    validation: { type: "length", min: 12, max: 14 }, placeholder: "e.g. 012345678901",
  },
  {
    id: "colourway", label: "Colourway", type: "text", section: "Product Information",
    placeholder: "e.g. Midnight Black",
  },
  {
    id: "size",  label: "Size",   type: "text", section: "Product Information", placeholder: "e.g. M, L, 500ml" },
  {
    id: "tags", label: "Product Tags", type: "tag", section: "Product Information",
    helperText: "Add searchable tags for this product",
  },

  // ── Compliance ─────────────────────────────────────────────────────────────
  {
    id: "ageRestriction", label: "Age Restriction", type: "dropdown", section: "Compliance",
    required: true, options: ["18+", "21+", "None"],
    appliesTo: { categories: ["ALCOHOL"] },
    helperText: "Regulatory age gate requirement",
  },
  {
    id: "licensing", label: "Liquor Licence Category", type: "dropdown", section: "Compliance",
    required: true, options: ["Standard", "Premium", "Duty Free", "Not Applicable"],
    appliesTo: { categories: ["ALCOHOL"] },
  },
  {
    id: "dangerousGoods", label: "Dangerous Goods", type: "toggle", section: "Compliance",
    helperText: "Contains lithium battery or other hazardous materials",
    appliesTo: { categories: ["TECH"] },
  },
  {
    id: "warranty", label: "Warranty Period", type: "dropdown", section: "Compliance",
    options: ["No Warranty", "3 Months", "6 Months", "1 Year", "2 Years", "Limited Lifetime"],
    appliesTo: { categories: ["TECH"] },
  },
  {
    id: "batteryType", label: "Battery Type", type: "dropdown", section: "Compliance",
    options: ["None", "AA", "AAA", "Li-Ion", "Li-Polymer", "Built-in Rechargeable", "USB-C Rechargeable"],
    appliesTo: { categories: ["TECH"], subCategories: ["Audio", "Accessories"] },
  },
  {
    id: "allergens", label: "Allergens", type: "multi-select", section: "Compliance",
    required: true,
    options: ["Gluten", "Dairy", "Eggs", "Nuts", "Peanuts", "Soy", "Fish", "Shellfish", "None"],
    appliesTo: { categories: ["FRESH FOOD"] },
  },
  {
    id: "nutritionLabel", label: "Nutrition Label Required", type: "toggle", section: "Compliance",
    appliesTo: { categories: ["FRESH FOOD"] },
  },

  // ── Fresh Food Specifics ───────────────────────────────────────────────────
  {
    id: "shelfLife", label: "Shelf Life (days)", type: "number", section: "Product Information",
    required: true, validation: { type: "range", min: 1, max: 365 },
    appliesTo: { categories: ["FRESH FOOD"] },
    helperText: "Total shelf life from production date",
  },
  {
    id: "bestBefore", label: "Best Before Period (days)", type: "number", section: "Product Information",
    required: true, validation: { type: "range", min: 1, max: 365 },
    appliesTo: { categories: ["FRESH FOOD"] },
  },
  {
    id: "proteinType", label: "Protein Type", type: "dropdown", section: "Product Information",
    options: ["None", "Chicken", "Beef", "Pork", "Fish", "Prawn", "Egg", "Plant-Based", "Mixed", "Dairy"],
    appliesTo: { categories: ["FRESH FOOD"] },
  },
  {
    id: "temperatureControl", label: "Temperature Control", type: "dropdown", section: "Product Information",
    required: true,
    options: ["Ambient", "Chilled (0–5°C)", "Chilled (0–8°C)", "Frozen (-18°C)", "Controlled (15–20°C)"],
    appliesTo: { categories: ["FRESH FOOD"] },
  },

  // ── Vendor Details ─────────────────────────────────────────────────────────
  {
    id: "vendorStyleCode", label: "Vendor Style Code", type: "text", section: "Vendor Details",
    required: true, placeholder: "Supplier's own product code",
  },
  {
    id: "vendorColourCode", label: "Vendor Colour Code", type: "text", section: "Vendor Details",
    placeholder: "e.g. BLK, WHT",
    appliesTo: { categories: ["FASHION", "TECH"] },
  },
  {
    id: "casePack", label: "Case Pack Qty", type: "number", section: "Vendor Details",
    helperText: "Units per inner case",
  },

  // ── Retail Attributes ──────────────────────────────────────────────────────
  {
    id: "plcStatus", label: "Initial PLC Status", type: "dropdown", section: "Retail Attributes",
    required: true,
    // Clearance is intentionally managed only after the style exists.
    options: ["Current", "EOL"],
  },
  {
    id: "exclusivity", label: "Exclusivity", type: "dropdown", section: "Retail Attributes",
    options: ["Non-Exclusive", "Category Exclusive", "Retailer Exclusive", "Airport Exclusive"],
  },
  {
    id: "seasonality", label: "Seasonality", type: "dropdown", section: "Retail Attributes",
    options: ["Evergreen", "Spring/Summer", "Autumn/Winter", "Christmas", "Easter", "Summer Only"],
  },
  {
    id: "fashionSeason", label: "Fashion Season", type: "dropdown", section: "Retail Attributes",
    required: true,
    options: ["SS25", "AW25", "SS26", "AW26", "Core (Non-seasonal)"],
    appliesTo: { categories: ["FASHION"] },
  },
  {
    id: "fitType", label: "Fit Type", type: "dropdown", section: "Retail Attributes",
    options: ["Regular Fit", "Slim Fit", "Relaxed Fit", "Oversized", "Tailored"],
    appliesTo: { categories: ["FASHION"] },
    appliesTo2: { subCategories: ["Apparel"] } as any,
  },
];

// ─── Mock Existing Products (for Copy Style modal) ────────────────────────────
export interface ExistingProduct {
  styleCode: string;
  description: string;
  category: string;
  subCategory: string;
  vendor: string;
  brand: string;
  buyer: string;
  retail: number;
  hierarchy: { category: string; subCategory: string; merchArea: string; planningGroup: string; subGroup: string };
  logistics: { leadTime: number; orderMultiple: number; distributionMultiple: number; weight: number; cartonQty: number };
  planning: { replenishable: boolean; temperatureControl?: string };
  skuVariants: { colors: string[]; sizes: string[] };
}

export type PLCStatus = "Current" | "EOL" | "Clearance";

export interface ProductImage {
  id: string;
  src: string;
  filename: string;
  size?: string;
  uploadedAt?: string;
}

export interface InnerPack {
  id: string;
  packUpc: string;
  orderMultiple: number;
  unitsPerPack: number;
  status: "Active" | "Inactive";
}

export interface ProductSetupAssets {
  plcStatus: PLCStatus;
  images: ProductImage[];
  innerPacks: InnerPack[];
  primarySku: string;
}

// Front-end-only persistence for the prototype. This keeps uploaded images
// attached to the style while the user navigates away and reopens the wizard.
const MOCK_IMAGE_OVERRIDES: Record<string, ProductImage[]> = {};
const MOCK_CREATED_PRODUCTS: Record<string, ExistingProduct> = {};

export const EXISTING_PRODUCTS: ExistingProduct[] = [
  {
    styleCode: "1000007",
    description: "APPLE AIRPODS PRO GEN 3 TRUE WIRELESS IN EAR EARBUDS",
    category: "TECH", subCategory: "Audio", vendor: "INGRAM MICRO, INC.", brand: "APPLE",
    buyer: "Sarah Chen", retail: 299.99,
    hierarchy: { category: "TECH", subCategory: "Audio", merchArea: "Earbuds", planningGroup: "True Wireless", subGroup: "" },
    logistics: { leadTime: 14, orderMultiple: 6, distributionMultiple: 12, weight: 0.06, cartonQty: 24 },
    planning: { replenishable: true },
    skuVariants: { colors: ["White", "Midnight Black"], sizes: ["One Size"] },
  },
  {
    styleCode: "1000028",
    description: "SONY WH-1000XM5 WIRELESS NOISE CANCELLING OVER EAR HEADPHONES",
    category: "TECH", subCategory: "Audio", vendor: "SONY ELECTRONICS INC.", brand: "SONY",
    buyer: "Marcus Williams", retail: 349.99,
    hierarchy: { category: "TECH", subCategory: "Audio", merchArea: "Headphones", planningGroup: "Noise Cancelling", subGroup: "" },
    logistics: { leadTime: 21, orderMultiple: 4, distributionMultiple: 8, weight: 0.25, cartonQty: 16 },
    planning: { replenishable: true },
    skuVariants: { colors: ["Black", "Silver"], sizes: ["One Size"] },
  },
  {
    styleCode: "1000049",
    description: "JOHNNIE WALKER BLACK LABEL 12YR BLENDED SCOTCH WHISKY 700ML",
    category: "ALCOHOL", subCategory: "Spirits", vendor: "DIAGEO PLC", brand: "JOHNNIE WALKER",
    buyer: "Priya Patel", retail: 44.99,
    hierarchy: { category: "ALCOHOL", subCategory: "Spirits", merchArea: "Whiskey", planningGroup: "Blended", subGroup: "" },
    logistics: { leadTime: 30, orderMultiple: 12, distributionMultiple: 24, weight: 1.7, cartonQty: 12 },
    planning: { replenishable: true },
    skuVariants: { colors: ["Standard"], sizes: ["700ml"] },
  },
  {
    styleCode: "1000070",
    description: "GREENCORE FRESH MEAL DEAL CLASSIC BLT SANDWICH",
    category: "FRESH FOOD", subCategory: "Meal Solutions", vendor: "GREENCORE GROUP PLC", brand: "GREENCORE",
    buyer: "James Okafor", retail: 3.75,
    hierarchy: { category: "FRESH FOOD", subCategory: "Meal Solutions", merchArea: "Sandwiches", planningGroup: "Classic Range", subGroup: "" },
    logistics: { leadTime: 1, orderMultiple: 24, distributionMultiple: 48, weight: 0.18, cartonQty: 48 },
    planning: { replenishable: true, temperatureControl: "Chilled (0–5°C)" },
    skuVariants: { colors: ["Standard"], sizes: ["One Size"] },
  },
  {
    styleCode: "1000091",
    description: "JACOB'S CREEK CLASSIC SHIRAZ RED WINE 750ML",
    category: "ALCOHOL", subCategory: "Wine", vendor: "TREASURY WINE ESTATES", brand: "JACOB'S CREEK",
    buyer: "Emma Larsson", retail: 14.99,
    hierarchy: { category: "ALCOHOL", subCategory: "Wine", merchArea: "Red Wine", planningGroup: "Full Bodied", subGroup: "" },
    logistics: { leadTime: 45, orderMultiple: 6, distributionMultiple: 12, weight: 1.3, cartonQty: 6 },
    planning: { replenishable: true },
    skuVariants: { colors: ["Standard"], sizes: ["750ml"] },
  },
  {
    styleCode: "1000112",
    description: "ZARA RELAXED FIT LINEN BLEND TROUSERS",
    category: "FASHION", subCategory: "Apparel", vendor: "INDITEX S.A.", brand: "ZARA",
    buyer: "David Kim", retail: 59.99,
    hierarchy: { category: "FASHION", subCategory: "Apparel", merchArea: "Bottoms", planningGroup: "Trousers", subGroup: "" },
    logistics: { leadTime: 60, orderMultiple: 1, distributionMultiple: 12, weight: 0.35, cartonQty: 12 },
    planning: { replenishable: false },
    skuVariants: { colors: ["Ecru", "Black", "Navy"], sizes: ["XS", "S", "M", "L", "XL"] },
  },
  {
    styleCode: "1000133",
    description: "ANKER 737 POWER BANK 24000MAH 140W PORTABLE CHARGER",
    category: "TECH", subCategory: "Accessories", vendor: "ANKER INNOVATIONS LIMITED", brand: "ANKER",
    buyer: "Tom Nguyen", retail: 99.99,
    hierarchy: { category: "TECH", subCategory: "Accessories", merchArea: "Charging", planningGroup: "Power Banks", subGroup: "" },
    logistics: { leadTime: 28, orderMultiple: 4, distributionMultiple: 8, weight: 0.44, cartonQty: 16 },
    planning: { replenishable: true },
    skuVariants: { colors: ["Black"], sizes: ["One Size"] },
  },
  {
    styleCode: "1000154",
    description: "BAKKAVOR FRESH SALAD BOWL SUPERFOOD MIX 220G",
    category: "FRESH FOOD", subCategory: "Meal Solutions", vendor: "BAKKAVOR GROUP PLC", brand: "BAKKAVOR",
    buyer: "Fatima Al-Hassan", retail: 4.49,
    hierarchy: { category: "FRESH FOOD", subCategory: "Meal Solutions", merchArea: "Salads", planningGroup: "Bowl Salads", subGroup: "" },
    logistics: { leadTime: 1, orderMultiple: 12, distributionMultiple: 24, weight: 0.24, cartonQty: 24 },
    planning: { replenishable: true, temperatureControl: "Chilled (0–5°C)" },
    skuVariants: { colors: ["Standard"], sizes: ["220g"] },
  },
];

// ─── Product Setup enhancement fixtures ───────────────────────────────────────
// These are deliberately kept beside the existing product fixtures so the edit
// experience demonstrates the relationship between a style, its assets and
// logistics without pretending to call Aptos or an image service.
export const PRODUCT_SETUP_ASSETS: Record<string, ProductSetupAssets> = {
  "1000007": {
    plcStatus: "Current",
    primarySku: "1000007-WHT-OS",
    images: [
      { id: "1000007-front", src: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=720&q=85", filename: "airpods-front.jpg", size: "1.8 MB", uploadedAt: "18 Aug 2026" },
      { id: "1000007-case", src: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=720&q=85", filename: "airpods-case.jpg", size: "1.4 MB", uploadedAt: "18 Aug 2026" },
      { id: "1000007-detail", src: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=720&q=85", filename: "airpods-detail.jpg", size: "2.1 MB", uploadedAt: "18 Aug 2026" },
    ],
    innerPacks: [
      { id: "1000007-pack-1", packUpc: "050123456789", orderMultiple: 6, unitsPerPack: 6, status: "Active" },
    ],
  },
  "1000028": {
    plcStatus: "Current",
    primarySku: "1000028-BLK-OS",
    images: [
      { id: "1000028-front", src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=720&q=85", filename: "sony-headphones-front.jpg", size: "2.4 MB", uploadedAt: "12 Aug 2026" },
      { id: "1000028-side", src: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=720&q=85", filename: "sony-headphones-side.jpg", size: "2.0 MB", uploadedAt: "12 Aug 2026" },
    ],
    innerPacks: [],
  },
  "1000049": {
    plcStatus: "Clearance",
    primarySku: "1000049-STD-700",
    images: [
      { id: "1000049-bottle", src: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=720&q=85", filename: "black-label-bottle.jpg", size: "1.7 MB", uploadedAt: "09 Aug 2026" },
    ],
    innerPacks: [
      { id: "1000049-pack-1", packUpc: "050987654321", orderMultiple: 12, unitsPerPack: 12, status: "Active" },
      { id: "1000049-pack-2", packUpc: "050987654338", orderMultiple: 6, unitsPerPack: 6, status: "Inactive" },
    ],
  },
  "1000070": {
    plcStatus: "EOL",
    primarySku: "1000070-STD-OS",
    images: [],
    innerPacks: [],
  },
  "1000091": {
    plcStatus: "Current",
    primarySku: "1000091-STD-750",
    images: [],
    innerPacks: [
      { id: "1000091-pack-1", packUpc: "050246813579", orderMultiple: 6, unitsPerPack: 6, status: "Active" },
    ],
  },
  "1000112": {
    plcStatus: "Current",
    primarySku: "1000112-BLK-M",
    images: [
      { id: "1000112-front", src: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=720&q=85", filename: "linen-trousers-front.jpg", size: "1.9 MB", uploadedAt: "16 Aug 2026" },
      { id: "1000112-detail", src: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=720&q=85", filename: "linen-trousers-detail.jpg", size: "1.6 MB", uploadedAt: "16 Aug 2026" },
    ],
    innerPacks: [],
  },
  "1000133": {
    plcStatus: "EOL",
    primarySku: "1000133-BLK-OS",
    images: [
      { id: "1000133-front", src: "https://images.unsplash.com/photo-1609592424759-1c2e9c6f6b36?auto=format&fit=crop&w=720&q=85", filename: "power-bank-front.jpg", size: "2.2 MB", uploadedAt: "01 Aug 2026" },
    ],
    innerPacks: [],
  },
  "1000154": {
    plcStatus: "Current",
    primarySku: "1000154-STD-220",
    images: [],
    innerPacks: [],
  },
};

export function saveMockProductImages(styleCode: string, images: ProductImage[]) {
  MOCK_IMAGE_OVERRIDES[styleCode] = [...images];
}

export function registerMockCreatedProduct(product: ExistingProduct) {
  MOCK_CREATED_PRODUCTS[product.styleCode] = product;
}

export function getExistingProduct(styleCode: string): ExistingProduct | undefined {
  return EXISTING_PRODUCTS.find(product => product.styleCode === styleCode)
    ?? MOCK_CREATED_PRODUCTS[styleCode];
}

export function getProductSetupAssets(styleCode: string): ProductSetupAssets {
  const base = PRODUCT_SETUP_ASSETS[styleCode] ?? {
    plcStatus: "Current",
    primarySku: `${styleCode}-STD-OS`,
    images: [],
    innerPacks: [],
  };
  return {
    ...base,
    images: MOCK_IMAGE_OVERRIDES[styleCode] ?? base.images,
  };
}

// ─── Color & Size palettes ─────────────────────────────────────────────────────
export const COLOR_OPTIONS: Record<string, string[]> = {
  TECH:       ["Black", "White", "Silver", "Space Grey", "Midnight Black", "Rose Gold", "Navy Blue"],
  "FRESH FOOD":["Standard", "N/A"],
  ALCOHOL:    ["Standard", "N/A"],
  FASHION:    ["Black", "White", "Navy", "Grey", "Ecru", "Red", "Green", "Blue", "Pink", "Brown", "Camel"],
  DEFAULT:    ["Black", "White", "Silver", "Grey", "Navy"],
};

export const SIZE_OPTIONS: Record<string, string[]> = {
  TECH:       ["One Size"],
  "FRESH FOOD":["100g", "200g", "250g", "300g", "400g", "500g", "1kg", "One Size"],
  ALCOHOL:    ["200ml", "350ml", "500ml", "700ml", "750ml", "1L", "1.5L"],
  FASHION:    ["XS", "S", "M", "L", "XL", "XXL", "4", "6", "8", "10", "12", "14", "16"],
  DEFAULT:    ["One Size", "S", "M", "L", "XL"],
};

// ─── Validation Rules ─────────────────────────────────────────────────────────
export function validateUPC(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 12) return "UPC must be at least 12 digits";
  if (digits.length > 14) return "UPC cannot exceed 14 digits";
  return null;
}

export function validateRange(value: number, min: number, max: number): string | null {
  if (isNaN(value)) return "Must be a number";
  if (value < min) return `Must be at least ${min}`;
  if (value > max) return `Must be at most ${max}`;
  return null;
}

// ─── Step Definitions ─────────────────────────────────────────────────────────
export const STEPS = [
  { id: 1, label: "Product Context",      icon: "Package",       description: "Buyer, vendor, brand & descriptions" },
  { id: 2, label: "Hierarchy Selection",  icon: "GitBranch",     description: "Category, planning group & subgroup" },
  { id: 3, label: "Core Attributes",      icon: "Sliders",       description: "Dynamic product attributes" },
  { id: 4, label: "Planning & Logistics", icon: "Truck",         description: "Lead times, ordering & dimensions" },
  { id: 5, label: "SKU Generation",       icon: "Grid3x3",       description: "Colours, sizes & generated SKUs" },
  { id: 6, label: "Images",               icon: "FileImage",     description: "Internal product reference images" },
  { id: 7, label: "Review & Submit",      icon: "CheckCircle2",  description: "Final review and submission" },
];
