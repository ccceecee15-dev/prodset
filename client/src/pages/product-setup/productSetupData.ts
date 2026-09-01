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
  CONSUMABLES: {
    label: "Consumables",
    children: [
      { label: "Candy" },
      {
        label: "Fresh Food",
        children: [
          { label: "Salads" },
          { label: "Sandwiches & Wraps" },
        ],
      },
      { label: "Health & Beauty" },
      { label: "Snacking" },
      { label: "Tobacco" },
      {
        label: "Drinks",
        children: [{ label: "Alcohol" }],
      },
    ],
  },
  DESTINATION: {
    label: "Destination",
    children: [
      {
        label: "Hardlines",
        children: [
          { label: "Licensed hardline" },
          { label: "Resort Drinkware" },
          { label: "Resort Souvenirs" },
        ],
      },
      {
        label: "Kids",
        children: [{ label: "Plush" }],
      },
      {
        label: "Softlines",
        children: [
          { label: "LICD APPAREL&ACCS" },
          { label: "Resort Tees" },
          { label: "Resorts Outerwear" },
        ],
      },
    ],
  },
  FASHION: {
    label: "Fashion",
    children: [
      { label: "Accessories" },
      { label: "Apparel" },
      { label: "Handbags" },
    ],
  },
  LOCAL: {
    label: "Local",
    children: [
      {
        label: "Gift",
        children: [
          { label: "Gift Local" },
          { label: "Gift National" },
        ],
      },
      {
        label: "Local Food",
        children: [{ label: "Packaged Foods" }],
      },
    ],
  },
  SPECIALTY: {
    label: "Specialty",
    children: [
      {
        label: "Beauty & Frag",
        children: [{ label: "ESG" }],
      },
      {
        label: "Licensed",
        children: [{ label: "Harley" }],
      },
      {
        label: "Café/Restaurants",
        children: [
          { label: "Lees Donuts" },
          { label: "Pink Door" },
        ],
      },
      { label: "Publications" },
      {
        label: "Sports",
        children: [
          { label: "Sports Events" },
          { label: "Sports Core" },
        ],
      },
    ],
  },
  "TECH & TRAVEL": {
    label: "Tech & Travel",
    children: [
      { label: "Accessories" },
      { label: "Audio" },
      {
        label: "Travel",
        children: [{ label: "Travel Pillows" }],
      },
    ],
  },
};

export const CATEGORY_KEYS = Object.keys(HIERARCHY);

// ─── Aptos Hierarchy Leaf (4-level) ───────────────────────────────────────────
export interface AptosHierarchyLeaf {
  division: string;
  department: string;
  class: string;
  subClass: string;
}

// ─── Flat Hierarchy Leaves (5-level, for cascading dropdowns) ─────────────────
export interface HierarchyLeaf {
  category: string;
  subCategory: string;
  merchArea: string;
  planningGroup: string;
  subGroup: string;
}

// ─── NEW Aptos 4-Level Hierarchy ──────────────────────────────────────────────
export const APTOS_LEAVES: AptosHierarchyLeaf[] = [
  // Divisional Merchandise — Apparel
  { division: "Divisional Merchandise", department: "Apparel", class: "Men's Casual", subClass: "T-Shirts & Basics" },
  { division: "Divisional Merchandise", department: "Apparel", class: "Men's Casual", subClass: "Jeans & Bottoms" },
  { division: "Divisional Merchandise", department: "Apparel", class: "Men's Outerwear", subClass: "Jackets & Coats" },
  { division: "Divisional Merchandise", department: "Apparel", class: "Men's Outerwear", subClass: "Fleece & Sweaters" },
  { division: "Divisional Merchandise", department: "Apparel", class: "Women's Casual", subClass: "Tops & Blouses" },
  { division: "Divisional Merchandise", department: "Apparel", class: "Women's Casual", subClass: "Bottoms & Skirts" },
  { division: "Divisional Merchandise", department: "Apparel", class: "Women's Outerwear", subClass: "Jackets & Coats" },
  { division: "Divisional Merchandise", department: "Apparel", class: "Women's Outerwear", subClass: "Dresses & Rompers" },
  // Divisional Merchandise — Accessories
  { division: "Divisional Merchandise", department: "Accessories", class: "Bags", subClass: "Handbags & Totes" },
  { division: "Divisional Merchandise", department: "Accessories", class: "Bags", subClass: "Backpacks & Travel" },
  { division: "Divisional Merchandise", department: "Accessories", class: "Footwear", subClass: "Dress Shoes" },
  { division: "Divisional Merchandise", department: "Accessories", class: "Footwear", subClass: "Casual Shoes" },
  { division: "Divisional Merchandise", department: "Accessories", class: "Jewelry", subClass: "Rings & Bracelets" },
  { division: "Divisional Merchandise", department: "Accessories", class: "Jewelry", subClass: "Necklaces & Pendants" },
  // Divisional Merchandise — Home
  { division: "Divisional Merchandise", department: "Home", class: "Bedding", subClass: "Sheets & Bedding Sets" },
  { division: "Divisional Merchandise", department: "Home", class: "Bedding", subClass: "Comforters & Pillows" },
  { division: "Divisional Merchandise", department: "Home", class: "Kitchen", subClass: "Cookware & Bakeware" },
  { division: "Divisional Merchandise", department: "Home", class: "Kitchen", subClass: "Dinnerware & Glassware" },
  // Tech & Electronics
  { division: "Tech & Electronics", department: "Audio", class: "Headphones", subClass: "Over-Ear Headphones" },
  { division: "Tech & Electronics", department: "Audio", class: "Headphones", subClass: "In-Ear Earbuds" },
  { division: "Tech & Electronics", department: "Audio", class: "Speakers", subClass: "Portable Speakers" },
  { division: "Tech & Electronics", department: "Audio", class: "Speakers", subClass: "Home Theater Speakers" },
  { division: "Tech & Electronics", department: "Computing", class: "Laptops", subClass: "Gaming Laptops" },
  { division: "Tech & Electronics", department: "Computing", class: "Laptops", subClass: "Business Laptops" },
  { division: "Tech & Electronics", department: "Computing", class: "Tablets", subClass: "Standard Tablets" },
  { division: "Tech & Electronics", department: "Computing", class: "Tablets", subClass: "Premium Tablets" },
  // Tech & Electronics — Mobile
  { division: "Tech & Electronics", department: "Mobile", class: "Smartphones", subClass: "Flagship Devices" },
  { division: "Tech & Electronics", department: "Mobile", class: "Smartphones", subClass: "Mid-Range Devices" },
  { division: "Tech & Electronics", department: "Mobile", class: "Accessories", subClass: "Cases & Protection" },
  { division: "Tech & Electronics", department: "Mobile", class: "Accessories", subClass: "Chargers & Cables" },
  // Grocery & Fresh
  { division: "Grocery & Fresh", department: "Fresh Produce", class: "Vegetables", subClass: "Leafy Greens" },
  { division: "Grocery & Fresh", department: "Fresh Produce", class: "Vegetables", subClass: "Root Vegetables" },
  { division: "Grocery & Fresh", department: "Fresh Produce", class: "Fruits", subClass: "Tropical Fruits" },
  { division: "Grocery & Fresh", department: "Fresh Produce", class: "Fruits", subClass: "Berries & Stone Fruit" },
  // Grocery & Fresh — Dairy & Chilled
  { division: "Grocery & Fresh", department: "Dairy & Chilled", class: "Dairy", subClass: "Milk & Milk Alternatives" },
  { division: "Grocery & Fresh", department: "Dairy & Chilled", class: "Dairy", subClass: "Cheese & Spreads" },
  { division: "Grocery & Fresh", department: "Dairy & Chilled", class: "Ready Meals", subClass: "Chilled Sandwiches" },
  { division: "Grocery & Fresh", department: "Dairy & Chilled", class: "Ready Meals", subClass: "Meal Kits" },
  // Grocery & Fresh — Beverages
  { division: "Grocery & Fresh", department: "Beverages", class: "Hot Drinks", subClass: "Coffee & Espresso" },
  { division: "Grocery & Fresh", department: "Beverages", class: "Hot Drinks", subClass: "Tea & Infusions" },
  { division: "Grocery & Fresh", department: "Beverages", class: "Cold Drinks", subClass: "Juices & Smoothies" },
  { division: "Grocery & Fresh", department: "Beverages", class: "Cold Drinks", subClass: "Soft Drinks & Mixers" },
];

// ─── OLD Aptos 5-Level Hierarchy (now used for Alternate) ──────────────────────
export const APTOS_OLD_AS_ALTERNATE: HierarchyLeaf[] = [
  { category: "CONSUMABLES", subCategory: "Candy", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "CONSUMABLES", subCategory: "Fresh Food", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "CONSUMABLES", subCategory: "Fresh Food", merchArea: "Salads", planningGroup: "", subGroup: "" },
  { category: "CONSUMABLES", subCategory: "Fresh Food", merchArea: "Sandwiches & Wraps", planningGroup: "", subGroup: "" },
  { category: "CONSUMABLES", subCategory: "Health & Beauty", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "CONSUMABLES", subCategory: "Snacking", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "CONSUMABLES", subCategory: "Tobacco", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "CONSUMABLES", subCategory: "Drinks", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "CONSUMABLES", subCategory: "Drinks", merchArea: "Alcohol", planningGroup: "", subGroup: "" },

  { category: "DESTINATION", subCategory: "Hardlines", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "DESTINATION", subCategory: "Hardlines", merchArea: "Licensed hardline", planningGroup: "", subGroup: "" },
  { category: "DESTINATION", subCategory: "Hardlines", merchArea: "Resort Drinkware", planningGroup: "", subGroup: "" },
  { category: "DESTINATION", subCategory: "Hardlines", merchArea: "Resort Souvenirs", planningGroup: "", subGroup: "" },
  { category: "DESTINATION", subCategory: "Kids", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "DESTINATION", subCategory: "Kids", merchArea: "Plush", planningGroup: "", subGroup: "" },
  { category: "DESTINATION", subCategory: "Softlines", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "DESTINATION", subCategory: "Softlines", merchArea: "LICD APPAREL&ACCS", planningGroup: "", subGroup: "" },
  { category: "DESTINATION", subCategory: "Softlines", merchArea: "Resort Tees", planningGroup: "", subGroup: "" },
  { category: "DESTINATION", subCategory: "Softlines", merchArea: "Resorts Outerwear", planningGroup: "", subGroup: "" },

  { category: "FASHION", subCategory: "Accessories", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "FASHION", subCategory: "Apparel", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "FASHION", subCategory: "Handbags", merchArea: "", planningGroup: "", subGroup: "" },

  { category: "LOCAL", subCategory: "Gift", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "LOCAL", subCategory: "Gift", merchArea: "Gift Local", planningGroup: "", subGroup: "" },
  { category: "LOCAL", subCategory: "Gift", merchArea: "Gift National", planningGroup: "", subGroup: "" },
  { category: "LOCAL", subCategory: "Local Food", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "LOCAL", subCategory: "Local Food", merchArea: "Packaged Foods", planningGroup: "", subGroup: "" },

  { category: "SPECIALTY", subCategory: "Beauty & Frag", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "SPECIALTY", subCategory: "Beauty & Frag", merchArea: "ESG", planningGroup: "", subGroup: "" },
  { category: "SPECIALTY", subCategory: "Licensed", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "SPECIALTY", subCategory: "Licensed", merchArea: "Harley", planningGroup: "", subGroup: "" },
  { category: "SPECIALTY", subCategory: "Café/Restaurants", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "SPECIALTY", subCategory: "Café/Restaurants", merchArea: "Lees Donuts", planningGroup: "", subGroup: "" },
  { category: "SPECIALTY", subCategory: "Café/Restaurants", merchArea: "Pink Door", planningGroup: "", subGroup: "" },
  { category: "SPECIALTY", subCategory: "Publications", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "SPECIALTY", subCategory: "Sports", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "SPECIALTY", subCategory: "Sports", merchArea: "Sports Events", planningGroup: "", subGroup: "" },
  { category: "SPECIALTY", subCategory: "Sports", merchArea: "Sports Core", planningGroup: "", subGroup: "" },

  { category: "TECH & TRAVEL", subCategory: "Accessories", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "TECH & TRAVEL", subCategory: "Audio", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "TECH & TRAVEL", subCategory: "Travel", merchArea: "", planningGroup: "", subGroup: "" },
  { category: "TECH & TRAVEL", subCategory: "Travel", merchArea: "Travel Pillows", planningGroup: "", subGroup: "" },
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

// ─── Field specification by category and merch area ────────────────────────
export const DYNAMIC_FIELDS: FieldConfig[] = [
  // Universals
  {
    id: "merchandiseType", label: "Merchandise / Style Type", type: "text", section: "Universal Information",
    helperText: "Type or classification of merchandise",
  },
  {
    id: "vendorStyle", label: "Primary Vendor Style", type: "text", section: "Universal Information",
    placeholder: "Supplier's style code",
  },
  {
    id: "preDistributionType", label: "Pre-distribution Type", type: "dropdown", section: "Universal Information",
    options: ["Bulk", "Individual", "Mixed"],
  },
  {
    id: "currentCost", label: "Current Cost", type: "number", section: "Universal Information",
    placeholder: "0.00",
  },
  {
    id: "jurisdiction", label: "Jurisdiction", type: "dropdown", section: "Universal Information",
    options: ["USA", "CAD", "MEX"],
  },
  {
    id: "priceStatus", label: "Price Status", type: "dropdown", section: "Universal Information",
    options: ["Active", "Inactive", "Pending"],
  },
  {
    id: "season", label: "Season", type: "dropdown", section: "Universal Information",
    options: ["Spring", "Summer", "Fall", "Winter", "Year-Round"],
  },
  {
    id: "ticketFormat", label: "Ticket Format", type: "text", section: "Universal Information",
    placeholder: "e.g. Standard, Premium",
  },
  {
    id: "orderMultiple", label: "Order Multiple", type: "number", section: "Universal Information",
    helperText: "Minimum qty increment for orders",
  },
  {
    id: "minimumOrder", label: "Minimum Order", type: "number", section: "Universal Information",
  },
  {
    id: "distributionMultiple", label: "Distribution Multiple", type: "number", section: "Universal Information",
    helperText: "DC dispatch increment",
  },
  {
    id: "replenishable", label: "Replenishable", type: "toggle", section: "Universal Information",
  },
  {
    id: "fashionFlag", label: "Fashion Flag", type: "toggle", section: "Universal Information",
  },
  {
    id: "promoFlag", label: "Promo Flag", type: "toggle", section: "Universal Information",
  },
  {
    id: "reorderFlag", label: "Reorder Flag", type: "toggle", section: "Universal Information",
  },
  {
    id: "inHouseUpcFlag", label: "In-house UPC Flag", type: "toggle", section: "Universal Information",
  },
  {
    id: "vendorUpcFlag", label: "Vendor UPC Flag", type: "toggle", section: "Universal Information",
  },
  {
    id: "consignmentFlag", label: "Consignment Flag", type: "toggle", section: "Universal Information",
  },
  {
    id: "serialNumberFlag", label: "Serial Number Flag", type: "toggle", section: "Universal Information",
  },
  {
    id: "countryOfOrigin", label: "Country of Origin", type: "dropdown", section: "Universal Information",
    options: ["Australia", "China", "USA", "UK", "Germany", "France", "Japan", "Italy", "Taiwan", "South Korea"],
  },

  // Consumables
  {
    id: "consumablesDeals1", label: "Deals 1", type: "text", section: "Consumables Requirements",
    appliesTo: { categories: ["CONSUMABLES"] },
  },
  {
    id: "consumablesCalendar", label: "Calendar", type: "dropdown", section: "Consumables Requirements",
    options: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    appliesTo: { categories: ["CONSUMABLES"] },
  },
  {
    id: "consumablesSizeCategory", label: "Size Category", type: "text", section: "Consumables Requirements",
    appliesTo: { categories: ["CONSUMABLES"] },
  },
  {
    id: "consumablesAllowCustomerOrder", label: "Allow Customer Order", type: "toggle", section: "Consumables Requirements",
    appliesTo: { categories: ["CONSUMABLES"] },
  },
  {
    id: "consumablesCandyLeadTime", label: "Lead Time", type: "number", section: "Consumables Requirements",
    appliesTo: { categories: ["CONSUMABLES"], subCategories: ["Candy"] },
  },
  {
    id: "consumablesFreshFoodShelfLife", label: "Shelf Life", type: "number", section: "Consumables Requirements",
    appliesTo: { categories: ["CONSUMABLES"], subCategories: ["Fresh Food"] },
  },
  {
    id: "consumablesTobaccoNonDiscountable", label: "Non-Discountable Items", type: "toggle", section: "Consumables Requirements",
    appliesTo: { categories: ["CONSUMABLES"], subCategories: ["Tobacco"] },
  },
  {
    id: "proteinType", label: "Protein Type", type: "dropdown", section: "Consumables Requirements",
    options: ["None", "Chicken", "Beef", "Pork", "Fish", "Prawn", "Egg", "Plant-Based", "Dairy"],
    appliesTo: { categories: ["CONSUMABLES"], merchAreas: ["Salads", "Sandwiches & Wraps"] },
  },
  {
    id: "consumablesDrinksAlcoholNonDiscountable", label: "Non-Discountable Items", type: "toggle", section: "Consumables Requirements",
    appliesTo: { categories: ["CONSUMABLES"], subCategories: ["Drinks"], merchAreas: ["Alcohol"] },
  },
  {
    id: "consumablesDrinksAlcoholType", label: "Type", type: "text", section: "Consumables Requirements",
    appliesTo: { categories: ["CONSUMABLES"], subCategories: ["Drinks"], merchAreas: ["Alcohol"] },
  },
  {
    id: "consumablesDrinksAlcoholLeadTime", label: "Lead Time", type: "number", section: "Consumables Requirements",
    appliesTo: { categories: ["CONSUMABLES"], subCategories: ["Drinks"], merchAreas: ["Alcohol"] },
  },

  // Destination
  {
    id: "destinationDeals1", label: "Deals 1", type: "text", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"] },
  },
  {
    id: "destinationImport", label: "Import", type: "toggle", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"] },
  },
  {
    id: "destinationHsTariffCode", label: "HS Tariff Code", type: "text", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"] },
  },
  {
    id: "destinationLeadTime", label: "Lead Time", type: "number", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"] },
  },
  {
    id: "destinationSupplierIncome", label: "Supplier Income", type: "number", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"] },
  },
  {
    id: "destinationCalendar", label: "Calendar", type: "dropdown", section: "Destination Requirements",
    options: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    appliesTo: { categories: ["DESTINATION"] },
  },
  {
    id: "destinationSizeCategory", label: "Size Category", type: "text", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"] },
  },
  {
    id: "destinationAllowCustomerOrder", label: "Allow Customer Order", type: "toggle", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"] },
  },
  {
    id: "destinationHardlinesEntertainmentLicenses", label: "Entertainment Licenses", type: "text", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"], merchAreas: ["Licensed hardline", "LICD APPAREL&ACCS"] },
  },
  {
    id: "destinationHardlinesGeneralLicensed2", label: "General Licensed 2", type: "text", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"], merchAreas: ["Licensed hardline", "LICD APPAREL&ACCS"] },
  },
  {
    id: "destinationResortDrinkwarePromos", label: "Promos", type: "text", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"], merchAreas: ["Resort Drinkware", "Resort Souvenirs"] },
  },
  {
    id: "destinationResortDrinkwareTicketColorCode", label: "Ticket Color Code", type: "text", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"], merchAreas: ["Resort Drinkware", "Resort Souvenirs"] },
  },
  {
    id: "destinationKidsPlushWholesaleCostCanaa", label: "Wholesale Cost CANAA", type: "number", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"], merchAreas: ["Plush"] },
  },
  {
    id: "destinationSoftlinesThemes", label: "Themes", type: "text", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"], merchAreas: ["Resort Tees"] },
  },
  {
    id: "destinationSoftlinesCompareAtRetail", label: "Compare at Retail", type: "number", section: "Destination Requirements",
    appliesTo: { categories: ["DESTINATION"], merchAreas: ["Resorts Outerwear"] },
  },

  // Fashion
  {
    id: "fashionLeadTime", label: "Lead Time", type: "number", section: "Fashion Requirements",
    appliesTo: { categories: ["FASHION"] },
  },
  {
    id: "fashionCalendar", label: "Calendar", type: "dropdown", section: "Fashion Requirements",
    options: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    appliesTo: { categories: ["FASHION"] },
  },
  {
    id: "fashionSizeCategory", label: "Size Category", type: "text", section: "Fashion Requirements",
    appliesTo: { categories: ["FASHION"] },
  },
  {
    id: "fashionAllowCustomerOrder", label: "Allow Customer Order", type: "toggle", section: "Fashion Requirements",
    appliesTo: { categories: ["FASHION"] },
  },
  {
    id: "handbagShapes", label: "Handbag Shapes", type: "text", section: "Fashion Requirements",
    appliesTo: { categories: ["FASHION"], subCategories: ["Handbags"] },
  },

  // Local
  {
    id: "localLeadTime", label: "Lead Time", type: "number", section: "Local Requirements",
    appliesTo: { categories: ["LOCAL"] },
  },
  {
    id: "localCalendar", label: "Calendar", type: "dropdown", section: "Local Requirements",
    options: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    appliesTo: { categories: ["LOCAL"] },
  },
  {
    id: "localAllowCustomerOrder", label: "Allow Customer Order", type: "toggle", section: "Local Requirements",
    appliesTo: { categories: ["LOCAL"] },
  },
  {
    id: "localFoodHeight", label: "Height", type: "number", section: "Local Requirements",
    appliesTo: { categories: ["LOCAL"], merchAreas: ["Packaged Foods"] },
  },
  {
    id: "localFoodWidth", label: "Width", type: "number", section: "Local Requirements",
    appliesTo: { categories: ["LOCAL"], merchAreas: ["Packaged Foods"] },
  },
  {
    id: "localFoodDepth", label: "Depth", type: "number", section: "Local Requirements",
    appliesTo: { categories: ["LOCAL"], merchAreas: ["Packaged Foods"] },
  },
  {
    id: "localGiftNationalSizeCategory", label: "Size Category", type: "text", section: "Local Requirements",
    appliesTo: { categories: ["LOCAL"], merchAreas: ["Gift National"] },
  },

  // Specialty
  {
    id: "specialtyLeadTime", label: "Lead Time", type: "number", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"] },
  },
  {
    id: "specialtyCalendar", label: "Calendar", type: "dropdown", section: "Specialty Requirements",
    options: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    appliesTo: { categories: ["SPECIALTY"] },
  },
  {
    id: "specialtySizeCategory", label: "Size Category", type: "text", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"] },
  },
  {
    id: "specialtyAllowCustomerOrder", label: "Allow Customer Order", type: "toggle", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"] },
  },
  {
    id: "specialtySportsDeals1", label: "Deals 1", type: "text", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"], subCategories: ["Sports"] },
  },
  {
    id: "specialtySportsLicenses", label: "Sport Licenses", type: "text", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"], subCategories: ["Sports"] },
  },
  {
    id: "specialtyBeautyFragDesignerBrands", label: "Designer Brands", type: "text", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"], merchAreas: ["ESG"] },
  },
  {
    id: "specialtyBeautyFragHandbagShapes", label: "Handbag Shapes", type: "text", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"], merchAreas: ["ESG"] },
  },
  {
    id: "specialtyBeautyFragNonDiscountableItems", label: "Non-Discountable Items", type: "toggle", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"], merchAreas: ["ESG"] },
  },
  {
    id: "specialtyLicensedHarley", label: "Harley", type: "text", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"], merchAreas: ["Harley"] },
  },
  {
    id: "specialtyLicensedTShirtType", label: "T-Shirt Type", type: "text", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"], merchAreas: ["Harley"] },
  },
  {
    id: "specialtyCafeLeesDonutsDeals1", label: "Deals 1", type: "text", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"], merchAreas: ["Lees Donuts"] },
  },
  {
    id: "specialtyCafeLeesDonutsDeals2", label: "Deals 2", type: "text", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"], merchAreas: ["Lees Donuts"] },
  },
  {
    id: "specialtyCafePinkDoorShelfLife", label: "Shelf Life", type: "number", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"], merchAreas: ["Pink Door"] },
  },
  {
    id: "specialtySportsEventsFifa", label: "FIFA", type: "text", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"], merchAreas: ["Sports Events"] },
  },
  {
    id: "specialtySportsEventsFormulaOne", label: "Formula One", type: "text", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"], merchAreas: ["Sports Events"] },
  },
  {
    id: "specialtySportsCoreSupplierIncome", label: "Supplier Income", type: "number", section: "Specialty Requirements",
    appliesTo: { categories: ["SPECIALTY"], merchAreas: ["Sports Core"] },
  },

  // Tech & Travel
  {
    id: "techTravelImegRtv", label: "IMEG RTV", type: "text", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"] },
  },
  {
    id: "techTravelWarranties", label: "Warranties", type: "dropdown", section: "Tech & Travel Requirements",
    options: ["None", "Limited", "1 Year", "2 Years", "3 Years", "Lifetime"],
    appliesTo: { categories: ["TECH & TRAVEL"] },
  },
  {
    id: "techTravelHsTariffCode", label: "HS Tariff Code", type: "text", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"] },
  },
  {
    id: "techTravelLeadTime", label: "Lead Time", type: "number", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"] },
  },
  {
    id: "techTravelWholesaleCostCanaa", label: "Wholesale Cost CANAA", type: "number", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"] },
  },
  {
    id: "techTravelCalendar", label: "Calendar", type: "dropdown", section: "Tech & Travel Requirements",
    options: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    appliesTo: { categories: ["TECH & TRAVEL"] },
  },
  {
    id: "techTravelWeight", label: "Weight", type: "number", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"] },
  },
  {
    id: "techTravelHeight", label: "Height", type: "number", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"] },
  },
  {
    id: "techTravelWidth", label: "Width", type: "number", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"] },
  },
  {
    id: "techTravelDepth", label: "Depth", type: "number", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"] },
  },
  {
    id: "techTravelAllowCustomerOrder", label: "Allow Customer Order", type: "toggle", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"] },
  },
  {
    id: "techTravelAccessoriesHazardousMaterials", label: "Hazardous Materials", type: "toggle", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"], subCategories: ["Accessories"] },
  },
  {
    id: "techTravelAccessoriesNonDiscountableItems", label: "Non-Discountable Items", type: "toggle", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"], subCategories: ["Accessories"] },
  },
  {
    id: "techTravelAudioDeals1", label: "Deals 1", type: "text", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"], subCategories: ["Audio"] },
  },
  {
    id: "techTravelAudioHazardousMaterials", label: "Hazardous Materials", type: "toggle", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"], subCategories: ["Audio"] },
  },
  {
    id: "techTravelAudioNonDiscountableItems", label: "Non-Discountable Items", type: "toggle", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"], subCategories: ["Audio"] },
  },
  {
    id: "techTravelAudioCompareAtRetail", label: "Compare at Retail", type: "number", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"], subCategories: ["Audio"] },
  },
  {
    id: "techTravelTravelSizeCategory", label: "Size Category", type: "text", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"], subCategories: ["Travel"] },
  },
  {
    id: "techTravelTravelPillowsCustomsDescription", label: "Customs Description", type: "text", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"], merchAreas: ["Travel Pillows"] },
  },
  {
    id: "techTravelTravelPillowsImport", label: "Import", type: "toggle", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"], merchAreas: ["Travel Pillows"] },
  },
  {
    id: "techTravelTravelPillowsMaterialContent", label: "Material Content", type: "text", section: "Tech & Travel Requirements",
    appliesTo: { categories: ["TECH & TRAVEL"], merchAreas: ["Travel Pillows"] },
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
