import { useState, useMemo, useRef, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useLocation, useRoute } from "wouter";
import {
  Package, GitBranch, Sliders, Truck, Grid3x3, CheckCircle2,
  ChevronRight, ChevronLeft, Save, Send, AlertCircle, Check,
  Search, X, Plus, Minus, Sparkles, Copy, ChevronDown,
  AlertTriangle, Info, Loader2, PartyPopper, FileText,
  Cpu, Wine, Leaf, Shirt, Pencil, ArrowLeft, FileImage,
  DollarSign, ShieldCheck, RefreshCcw,
} from "lucide-react";
import {
  BUYERS, VENDORS, BRANDS, HIERARCHY, CATEGORY_KEYS, DYNAMIC_FIELDS,
  EXISTING_PRODUCTS, COLOR_OPTIONS, SIZE_OPTIONS, STEPS,
  APTOS_LEAVES, ALT_LEAVES,
  validateUPC, validateRange,
  getProductSetupAssets, getExistingProduct, registerMockCreatedProduct, saveMockProductImages,
  type FieldConfig, type ExistingProduct, type HierarchyLeaf, type InnerPack, type PLCStatus, type ProductImage,
} from "./productSetupLegacyData";
import ProductSetupEnhancements, { ProductImagesSection } from "./ProductSetupLegacyEnhancements";
import {
  upsertDraft, loadDrafts, getAndClearResumedDraftId,
  type StoredDraft,
} from "./productSetupLegacyDraftStorage";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WizardState {
  buyer: string; vendor: string; brand: string;
  longDescription: string; shortDescription: string; productType: string;
  // APTOS hierarchy
  category: string; subCategory: string; merchArea: string; planningGroup: string; subGroup: string;
  // Alternate hierarchy
  altCategory: string; altSubCategory: string; altMerchArea: string; altPlanningGroup: string; altSubGroup: string;
  dynamicFields: Record<string, any>;
  leadTime: string; orderMultiple: string; distributionMultiple: string;
  replenishable: boolean; weight: string; length: string; width: string; height: string;
  cartonQty: string; upc: string;
  selectedColors: string[]; selectedSizes: string[];
}

interface SKURow { id: string; color: string; size: string; skuCode: string; upc: string; status: "active" | "inactive" }

const EMPTY_STATE: WizardState = {
  buyer: "", vendor: "", brand: "", longDescription: "", shortDescription: "", productType: "",
  category: "", subCategory: "", merchArea: "", planningGroup: "", subGroup: "",
  altCategory: "", altSubCategory: "", altMerchArea: "", altPlanningGroup: "", altSubGroup: "",
  dynamicFields: {},
  leadTime: "", orderMultiple: "", distributionMultiple: "",
  replenishable: true, weight: "", length: "", width: "", height: "",
  cartonQty: "", upc: "",
  selectedColors: [], selectedSizes: [],
};

const PRODUCT_TYPES = ["Hard Lines", "Soft Lines", "Fresh", "Consumable", "Digital", "Seasonal"];

// ─── Edit Reasons ─────────────────────────────────────────────────────────────
type EditReason = "pricing" | "legal" | "vendor" | "plc" | "hierarchy" | "logistics" | "details" | "skus";

const EDIT_REASONS: {
  id: EditReason; label: string; desc: string;
  Icon: React.ElementType; color: string; bg: string; border: string;
}[] = [
  { id: "pricing",   label: "Pricing & Cost Update",        desc: "Update RRP, cost price or margin targets",                    Icon: DollarSign,  color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/40",  border: "border-emerald-200 dark:border-emerald-800/50" },
  { id: "legal",     label: "Legal & Compliance",           desc: "Regulatory requirements, age restrictions or certifications", Icon: ShieldCheck, color: "text-red-500 dark:text-red-400",        bg: "bg-red-100 dark:bg-red-900/40",          border: "border-red-200 dark:border-red-800/50" },
  { id: "vendor",    label: "Supplier / Vendor Changes",    desc: "Change vendor, buyer or sourcing details",                    Icon: Truck,       color: "text-blue-600 dark:text-blue-400",      bg: "bg-blue-100 dark:bg-blue-900/40",        border: "border-blue-200 dark:border-blue-800/50" },
  { id: "plc",       label: "Product Lifecycle (PLC)",      desc: "Update PLC status, phase or discontinuation",                 Icon: RefreshCcw,  color: "text-violet-600 dark:text-violet-400",  bg: "bg-violet-100 dark:bg-violet-900/40",    border: "border-violet-200 dark:border-violet-800/50" },
  { id: "hierarchy", label: "Hierarchy / Classification",   desc: "Reclassify division, department, class or sub class",         Icon: GitBranch,   color: "text-indigo-600 dark:text-indigo-400",  bg: "bg-indigo-100 dark:bg-indigo-900/40",    border: "border-indigo-200 dark:border-indigo-800/50" },
  { id: "logistics", label: "Packaging & Logistics",        desc: "Lead times, order quantities or dimensions",                  Icon: Package,     color: "text-orange-600 dark:text-orange-400",  bg: "bg-orange-100 dark:bg-orange-900/40",    border: "border-orange-200 dark:border-orange-800/50" },
  { id: "details",   label: "Product Details & Description",desc: "Descriptions, brand, product type or identity",               Icon: FileText,    color: "text-slate-600 dark:text-slate-400",    bg: "bg-slate-100 dark:bg-slate-800/60",      border: "border-slate-200 dark:border-slate-700" },
  { id: "skus",      label: "SKU / Variant Changes",        desc: "Add or modify colour and size variants",                      Icon: Grid3x3,     color: "text-pink-600 dark:text-pink-400",      bg: "bg-pink-100 dark:bg-pink-900/40",        border: "border-pink-200 dark:border-pink-800/50" },
];

// Which wizard steps to highlight for each reason
const REASON_STEP_MAP: Record<EditReason, number[]> = {
  pricing:   [4],
  legal:     [3],
  vendor:    [1],
  plc:       [3],
  hierarchy: [2],
  logistics: [4],
  details:   [1, 3],
  skus:      [5],
};

// ─── Helper: get hierarchy options ───────────────────────────────────────────
function getSubCategories(category: string) {
  return HIERARCHY[category]?.children?.map(c => c.label) ?? [];
}
function getMerchAreas(category: string, subCat: string) {
  return HIERARCHY[category]?.children?.find(c => c.label === subCat)?.children?.map(c => c.label) ?? [];
}
function getPlanningGroups(category: string, subCat: string, area: string) {
  return HIERARCHY[category]?.children?.find(c => c.label === subCat)
    ?.children?.find(c => c.label === area)?.children?.map(c => c.label) ?? [];
}

// ─── Helper: filter dynamic fields for current hierarchy ─────────────────────
function getVisibleFields(state: WizardState): FieldConfig[] {
  return DYNAMIC_FIELDS.filter(f => {
    if (!f.appliesTo) return true;
    const { categories, subCategories, merchAreas } = f.appliesTo;
    if (categories && !categories.includes(state.category)) return false;
    if (subCategories && !subCategories.includes(state.subCategory)) return false;
    if (merchAreas && !merchAreas.includes(state.merchArea)) return false;
    return true;
  });
}

// ─── Validation ───────────────────────────────────────────────────────────────
function getMissingFields(state: WizardState): string[] {
  const missing: string[] = [];
  if (!state.buyer)           missing.push("Buyer");
  if (!state.vendor)          missing.push("Vendor");
  if (!state.brand)           missing.push("Brand");
  if (!state.longDescription) missing.push("Long Description");
  if (!state.category)        missing.push("Category");
  if (!state.subCategory)     missing.push("Subcategory");
  if (!state.leadTime)        missing.push("Lead Time");
  if (!state.orderMultiple)   missing.push("Order Multiple");

  const visibleFields = getVisibleFields(state);
  for (const f of visibleFields) {
    if (f.required && !state.dynamicFields[f.id]) missing.push(f.label);
  }
  return missing;
}

// ─── SKU Generation ───────────────────────────────────────────────────────────
function generateSKUs(state: WizardState, baseCode: string): SKURow[] {
  const colors = state.selectedColors.length ? state.selectedColors : ["Standard"];
  const sizes  = state.selectedSizes.length  ? state.selectedSizes  : ["One Size"];
  const rows: SKURow[] = [];
  let seq = 1;
  for (const color of colors) {
    for (const size of sizes) {
      const skuCode = `${baseCode}-${String(seq).padStart(3, "0")}`;
      const upc = String(Math.floor(Math.random() * 9e11) + 1e11);
      rows.push({ id: `${color}-${size}`, color, size, skuCode, upc, status: "active" });
      seq++;
    }
  }
  return rows;
}

// ─── Step Icons map ───────────────────────────────────────────────────────────
const STEP_ICONS = [Package, GitBranch, Sliders, Truck, Grid3x3, FileImage, CheckCircle2];

// ─── Wizard Sidebar ───────────────────────────────────────────────────────────
function WizardSidebar({
  currentStep, completedSteps, invalidSteps, highlightedSteps, onStepClick,
}: {
  currentStep: number;
  completedSteps: Set<number>;
  invalidSteps: Set<number>;
  highlightedSteps?: Set<number>;
  onStepClick: (s: number) => void;
}) {
  const hasHighlights = highlightedSteps && highlightedSteps.size > 0;

  return (
    <div className="sticky top-0">
      {/* Focus mode banner */}
      {hasHighlights && (
        <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
          <Sparkles size={11} className="text-amber-500 flex-shrink-0" />
          <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium leading-tight">
            Focus mode — highlighted steps match your update reasons
          </p>
        </div>
      )}

      <div className="space-y-1">
        {STEPS.map((step, idx) => {
          const Icon = STEP_ICONS[idx];
          const isActive      = currentStep === step.id;
          const isDone        = completedSteps.has(step.id);
          const hasWarning    = invalidSteps.has(step.id);
          const isHighlighted = !isActive && hasHighlights && highlightedSteps!.has(step.id);
          const isDimmed      = hasHighlights && !highlightedSteps!.has(step.id) && !isActive;
          const isReachable   = step.id <= currentStep + 1;

          return (
            <button
              key={step.id}
              onClick={() => isReachable && onStepClick(step.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 group relative",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : isHighlighted
                  ? "bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700 text-slate-700 dark:text-slate-200 hover:bg-amber-100 dark:hover:bg-amber-950/50"
                  : isDone
                  ? cn("bg-primary/8 text-slate-700 hover:bg-primary/12 dark:text-slate-200 dark:bg-primary/10", isDimmed && "opacity-50")
                  : cn("text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60", isDimmed && "opacity-40"),
                !isReachable && "opacity-40 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all",
                isActive      ? "bg-white/20" :
                isHighlighted ? "bg-amber-200 dark:bg-amber-800/60" :
                isDone        ? "bg-primary/15 dark:bg-primary/20" :
                hasWarning    ? "bg-amber-100 dark:bg-amber-900/30" :
                                "bg-slate-100 dark:bg-slate-800"
              )}>
                {isDone && !isActive
                  ? <Check size={13} className={isHighlighted ? "text-amber-600" : "text-primary"} />
                  : hasWarning && !isActive
                  ? <AlertTriangle size={13} className="text-amber-500" />
                  : <Icon size={13} className={
                      isActive      ? "text-white"
                    : isHighlighted ? "text-amber-600 dark:text-amber-400"
                    : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
                    } />
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-xs font-semibold leading-tight",
                  isActive ? "text-white" : isHighlighted ? "text-amber-800 dark:text-amber-300" : ""
                )}>
                  {step.label}
                </p>
                <p className={cn("text-[10px] leading-tight mt-0.5 truncate",
                  isActive ? "text-white/70" : isHighlighted ? "text-amber-600/70 dark:text-amber-500/70" : "text-slate-400 dark:text-slate-500"
                )}>
                  {step.description}
                </p>
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white/80 ml-auto flex-shrink-0" />}
              {isHighlighted && !isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-auto flex-shrink-0 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-6 px-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-slate-400 font-medium">Progress</span>
          <span className="text-[10px] text-slate-500 font-bold">{completedSteps.size} / {STEPS.length}</span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(completedSteps.size / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Style Info Card (sidebar) ────────────────────────────────────────────────
function StyleInfoCard({
  isEditMode, styleCode, state,
}: {
  isEditMode: boolean;
  styleCode: string;
  state: WizardState;
}) {
  const hasDetails = state.buyer || state.vendor || state.brand || state.category || state.longDescription;

  return (
    <div className={cn(
      "rounded-xl border p-3 mb-3 transition-all duration-300",
      isEditMode
        ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/50"
        : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
    )}>
      {/* Status badge + style code */}
      <div className="flex items-center justify-between mb-2.5">
        <span className={cn(
          "inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
          isEditMode
            ? "bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-300"
            : "bg-primary/12 text-primary"
        )}>
          {isEditMode ? <><Pencil size={8} /> Editing</> : <><Plus size={8} /> New Product</>}
        </span>
        <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 truncate max-w-[90px]">{styleCode}</span>
      </div>

      {/* Description preview */}
      <p className={cn(
        "text-[10px] font-semibold leading-tight mb-2 line-clamp-2",
        state.longDescription ? "text-slate-800 dark:text-slate-100" : "text-slate-400 italic"
      )}>
        {state.longDescription || "No description yet"}
      </p>

      {/* Detail rows */}
      {hasDetails && (
        <div className="space-y-1">
          {state.buyer && (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-400 w-10 flex-shrink-0">Buyer</span>
              <span className="text-[9px] font-medium text-slate-600 dark:text-slate-300 truncate">{state.buyer}</span>
            </div>
          )}
          {state.vendor && (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-400 w-10 flex-shrink-0">Vendor</span>
              <span className="text-[9px] font-medium text-slate-600 dark:text-slate-300 truncate">{state.vendor}</span>
            </div>
          )}
          {state.brand && (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-400 w-10 flex-shrink-0">Brand</span>
              <span className="text-[9px] font-medium text-slate-600 dark:text-slate-300 truncate">{state.brand}</span>
            </div>
          )}
          {state.category && (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-400 w-10 flex-shrink-0">Cat.</span>
              <span className="text-[9px] font-medium text-slate-600 dark:text-slate-300 truncate">{state.category}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Chip selector ─────────────────────────────────────────────────────────────
function ChipSelector({ options, selected, onChange, colorDots = false }: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void; colorDots?: boolean;
}) {
  const toggle = (v: string) => {
    onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150",
              active
                ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:text-primary"
            )}
          >
            {active ? <Check size={11} /> : <Plus size={11} className="opacity-50" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Dynamic Field Renderer ───────────────────────────────────────────────────
function DynamicField({ field, value, onChange, error }: {
  field: FieldConfig; value: any; onChange: (v: any) => void; error?: string;
}) {
  const base = "h-9 text-sm border-slate-200 dark:border-slate-700";

  if (field.type === "toggle") {
    return (
      <div className="flex items-center gap-3">
        <Switch checked={!!value} onCheckedChange={onChange} />
        <span className="text-sm text-slate-600 dark:text-slate-300">{value ? "Yes" : "No"}</span>
      </div>
    );
  }
  if (field.type === "dropdown") {
    return (
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className={cn(base, "w-full")}>
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  }
  if (field.type === "multi-select") {
    const arr: string[] = Array.isArray(value) ? value : [];
    return (
      <div className="flex flex-wrap gap-1.5">
        {field.options?.map(o => {
          const checked = arr.includes(o);
          return (
            <button
              key={o} type="button"
              onClick={() => onChange(checked ? arr.filter(x => x !== o) : [...arr, o])}
              className={cn(
                "px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all",
                checked
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-300"
              )}
            >
              {o}
            </button>
          );
        })}
      </div>
    );
  }
  if (field.type === "tag") {
    const tags: string[] = Array.isArray(value) ? value : [];
    const [input, setInput] = useState("");
    return (
      <div>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
              {tag}
              <button type="button" onClick={() => onChange(tags.filter(t => t !== tag))} className="text-slate-400 hover:text-slate-600 ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <Input
          value={input} onChange={e => setInput(e.target.value)} placeholder="Type and press Enter"
          className={cn(base, "w-full")}
          onKeyDown={e => {
            if (e.key === "Enter" && input.trim()) {
              e.preventDefault();
              if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
              setInput("");
            }
          }}
        />
      </div>
    );
  }
  if (field.type === "textarea") {
    return <Textarea value={value || ""} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} className="text-sm min-h-[80px]" />;
  }
  return (
    <Input
      type={field.type === "number" ? "number" : "text"}
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={cn(base, "w-full", error && "border-red-400 focus-visible:ring-red-300")}
    />
  );
}

// ─── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({ title, children, badge }: { title: string; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-900/80">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</h3>
        {badge}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

function FieldRow({ label, required, helper, error, children }: {
  label: string; required?: boolean; helper?: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error  && <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{error}</p>}
      {helper && !error && <p className="text-[11px] text-slate-400 mt-1">{helper}</p>}
    </div>
  );
}

// ─── Unified Style Search Modal (Copy or Edit) ────────────────────────────────
function StyleSearchModal({
  mode, onClose, onSelect,
}: {
  mode: "copy" | "edit";
  onClose: () => void;
  onSelect: (p: ExistingProduct, reasons?: EditReason[]) => void;
}) {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  // Edit mode is 2-step; copy mode stays 1-step
  const [modalStep, setModalStep] = useState<1 | 2>(1);
  const [chosenProduct, setChosenProduct] = useState<ExistingProduct | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<Set<EditReason>>(new Set());

  const filtered = EXISTING_PRODUCTS.filter(p => {
    const matchesCat = catFilter === "All" || p.category === catFilter;
    const q = search.toLowerCase();
    return matchesCat && (!q || p.description.toLowerCase().includes(q) || p.styleCode.includes(q) || p.vendor.toLowerCase().includes(q));
  });

  const isCopy = mode === "copy";

  const handleProductSelect = (p: ExistingProduct) => {
    if (isCopy) { onSelect(p); return; }
    setChosenProduct(p);
    setModalStep(2);
  };

  const toggleReason = (id: EditReason) => {
    setSelectedReasons(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirmEdit = () => {
    if (!chosenProduct) return;
     onSelect(chosenProduct, Array.from(selectedReasons));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        "relative z-10 w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200",
        modalStep === 2 ? "max-w-2xl" : "max-w-2xl"
      )}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {modalStep === 2 && (
              <button onClick={() => setModalStep(1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors mr-1">
                <ChevronLeft size={15} />
              </button>
            )}
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              isCopy ? "bg-primary/10" : "bg-amber-100 dark:bg-amber-900/30"
            )}>
              {isCopy ? <Copy size={14} className="text-primary" /> : <Pencil size={14} className="text-amber-600" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isCopy ? "Copy Existing Style" : "Edit Existing Style"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isCopy
                  ? "Select a style to prefill the wizard as a new product"
                  : modalStep === 1
                  ? "Step 1 of 2 — Select the style you want to edit"
                  : "Step 2 of 2 — What are you updating?"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isCopy && (
              <div className="flex gap-1">
                {[1, 2].map(s => (
                  <div key={s} className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    s === modalStep ? "w-5 bg-amber-500" : s < modalStep ? "w-2 bg-amber-300" : "w-2 bg-slate-200 dark:bg-slate-700"
                  )} />
                ))}
              </div>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Step 1: Product Search ── */}
        {modalStep === 1 && (
          <>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, code or vendor…" className="pl-8 h-8 text-xs" />
              </div>
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {CATEGORY_KEYS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="overflow-y-auto max-h-[360px] divide-y divide-slate-50 dark:divide-slate-800">
              {filtered.map(p => (
                <button
                  key={p.styleCode}
                  onClick={() => handleProductSelect(p)}
                  className={cn(
                    "w-full flex items-start gap-4 px-6 py-4 text-left transition-colors group",
                    isCopy ? "hover:bg-primary/5" : "hover:bg-amber-50 dark:hover:bg-amber-950/20"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                    isCopy
                      ? "bg-slate-100 dark:bg-slate-800 group-hover:bg-primary/10"
                      : "bg-slate-100 dark:bg-slate-800 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30"
                  )}>
                    <Package size={16} className={cn(
                      "transition-colors",
                      isCopy ? "text-slate-400 group-hover:text-primary" : "text-slate-400 group-hover:text-amber-600"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-mono text-slate-400">{p.styleCode}</span>
                       <Badge className="text-[9px] h-4 px-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 border-none">{p.category}</Badge>
                       <Badge className={cn(
                         "text-[9px] h-4 px-1.5 border",
                         getProductSetupAssets(p.styleCode).plcStatus === "Clearance"
                           ? "bg-amber-50 text-amber-700 border-amber-200"
                           : getProductSetupAssets(p.styleCode).plcStatus === "EOL"
                           ? "bg-slate-50 text-slate-500 border-slate-200"
                           : "bg-emerald-50 text-emerald-700 border-emerald-200"
                       )}>
                         {getProductSetupAssets(p.styleCode).plcStatus}
                       </Badge>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{p.description}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{p.vendor} · {p.brand} · ${p.retail.toFixed(2)}</p>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold mt-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all",
                    isCopy
                      ? "bg-primary/10 text-primary"
                      : "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400"
                  )}>
                    {isCopy ? <><Copy size={10} /> Copy</> : <><ChevronRight size={10} /> Select</>}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-sm">No styles found</div>
              )}
            </div>
          </>
        )}

        {/* ── Step 2: Reason Selection ── */}
        {modalStep === 2 && chosenProduct && (
          <div className="flex flex-col">
            {/* Selected product banner */}
            <div className="flex items-center gap-3 px-6 py-3 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/30">
              <button onClick={() => setModalStep(1)} className="p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors text-amber-600">
                <ChevronLeft size={13} />
              </button>
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400">{chosenProduct.styleCode}</span>
              <span className="text-xs font-semibold text-amber-900 dark:text-amber-200 truncate flex-1">{chosenProduct.description}</span>
              <Badge className="text-[9px] h-4 px-1.5 bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 border-none flex-shrink-0">{chosenProduct.category}</Badge>
            </div>

            {/* Instruction */}
            <div className="px-6 pt-4 pb-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Select what you intend to update — the wizard will rearrange to help you focus on the right steps
              </p>
            </div>

            {/* Reason grid */}
            <div className="px-6 pb-4 grid grid-cols-2 gap-2.5 overflow-y-auto max-h-[340px]">
              {EDIT_REASONS.map(r => {
                const isSelected = selectedReasons.has(r.id);
                return (
                  <button
                    key={r.id}
                    onClick={() => toggleReason(r.id)}
                    className={cn(
                      "flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all duration-150",
                      isSelected
                        ? `${r.border} ${r.bg} shadow-sm`
                        : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    )}
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", isSelected ? r.bg : "bg-slate-100 dark:bg-slate-800")}>
                      <r.Icon size={14} className={isSelected ? r.color : "text-slate-400"} />
                    </div>
                    <div className="min-w-0">
                      <p className={cn("text-xs font-semibold leading-tight", isSelected ? r.color : "text-slate-700 dark:text-slate-200")}>{r.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{r.desc}</p>
                    </div>
                    {isSelected && <Check size={12} className={cn("ml-auto flex-shrink-0 mt-1", r.color)} />}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {selectedReasons.size === 0
                  ? "Select at least one reason, or proceed to edit all fields"
                  : `${selectedReasons.size} reason${selectedReasons.size > 1 ? "s" : ""} selected`}
              </span>
              <Button
                size="sm"
                onClick={handleConfirmEdit}
                className="gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white border-none"
              >
                <Pencil size={11} />
                {selectedReasons.size === 0 ? "Edit All Fields" : "Start Editing"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper: build WizardState from an existing product ──────────────────────
function stateFromProduct(p: ExistingProduct): WizardState {
  const assets = getProductSetupAssets(p.styleCode);
  return {
    buyer: p.buyer,
    vendor: p.vendor,
    brand: p.brand,
    longDescription: p.description,
    shortDescription: p.description.slice(0, 50),
    productType: "",
    category: p.hierarchy.category,
    subCategory: p.hierarchy.subCategory,
    merchArea: p.hierarchy.merchArea,
    planningGroup: p.hierarchy.planningGroup,
    subGroup: p.hierarchy.subGroup,
    altCategory: "", altSubCategory: "", altMerchArea: "", altPlanningGroup: "", altSubGroup: "",
    dynamicFields: {
      plcStatus: assets.plcStatus === "Clearance" ? "Current" : assets.plcStatus,
      ...(p.planning.temperatureControl ? { temperatureControl: p.planning.temperatureControl } : {}),
    },
    leadTime: String(p.logistics.leadTime),
    orderMultiple: String(p.logistics.orderMultiple),
    distributionMultiple: String(p.logistics.distributionMultiple),
    replenishable: p.planning.replenishable,
    weight: String(p.logistics.weight),
    length: "", width: "", height: "",
    cartonQty: String(p.logistics.cartonQty),
    upc: "",
    selectedColors: p.skuVariants.colors,
    selectedSizes: p.skuVariants.sizes,
  };
}

// ─── Hierarchy Cascade Component ─────────────────────────────────────────────
type HierarchyValue = { category: string; subCategory: string; merchArea: string; planningGroup: string; subGroup: string };

function HierarchyCascade({
  leaves, value, onChange, title, accent = "primary",
}: {
  leaves: HierarchyLeaf[];
  value: HierarchyValue;
  onChange: (v: HierarchyValue) => void;
  title: string;
  accent?: "primary" | "amber";
}) {
  const uniq = (arr: string[]) => Array.from(new Set(arr));

  // Filter helpers — each level shows options consistent with selections above it
  const categories   = uniq(leaves.map(l => l.category));
  const subCategories = uniq(leaves.filter(l => !value.category || l.category === value.category).map(l => l.subCategory));
  const merchAreas    = uniq(leaves.filter(l =>
    (!value.category    || l.category    === value.category) &&
    (!value.subCategory || l.subCategory === value.subCategory)
  ).map(l => l.merchArea).filter(Boolean));
  const planGroups    = uniq(leaves.filter(l =>
    (!value.category    || l.category    === value.category) &&
    (!value.subCategory || l.subCategory === value.subCategory) &&
    (!value.merchArea   || l.merchArea   === value.merchArea)
  ).map(l => l.planningGroup).filter(Boolean));
  // Sub-group: always show all groups (no parent filter) so user can pick from the full list to auto-fill upward
  const subGroups     = uniq(leaves.map(l => l.subGroup).filter(Boolean));

  const handleSubGroup = (sg: string) => {
    const match = leaves.find(l => l.subGroup === sg);
    if (match) onChange({ category: match.category, subCategory: match.subCategory, merchArea: match.merchArea, planningGroup: match.planningGroup, subGroup: sg });
  };
  const handlePlanGroup  = (v: string) => onChange({ ...value, planningGroup: v, subGroup: "" });
  const handleMerchArea  = (v: string) => onChange({ ...value, merchArea: v, planningGroup: "", subGroup: "" });
  const handleSubCat     = (v: string) => onChange({ ...value, subCategory: v, merchArea: "", planningGroup: "", subGroup: "" });
  const handleCategory   = (v: string) => onChange({ category: v, subCategory: "", merchArea: "", planningGroup: "", subGroup: "" });

  const accentClass = accent === "amber" ? "text-amber-600 dark:text-amber-400" : "text-primary";
  const accentBg    = accent === "amber" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300" : "bg-primary/10 text-primary";

  // Breadcrumb trail
  const crumbs = [value.category, value.subCategory, value.merchArea, value.planningGroup, value.subGroup].filter(Boolean);

  return (
    <div className={cn(
      "rounded-xl border-2 p-4 space-y-3 transition-all duration-200",
      accent === "amber"
        ? "border-amber-200 dark:border-amber-800/50 bg-amber-50/30 dark:bg-amber-950/10"
        : "border-primary/20 bg-primary/5 dark:bg-primary/5"
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <GitBranch size={13} className={accentClass} />
        <span className={cn("text-xs font-bold uppercase tracking-wider", accentClass)}>{title}</span>
      </div>

      {/* Breadcrumb trail */}
      {crumbs.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap text-[10px] text-slate-400">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={9} />}
              <span className={i === crumbs.length - 1 ? "font-semibold text-slate-700 dark:text-slate-200" : ""}>{c}</span>
            </span>
          ))}
        </div>
      )}

      {/* Dropdowns — 5 levels */}
      <div className="grid grid-cols-1 gap-2.5">
        {/* Category */}
        <FieldRow label="Category" required>
          <Select value={value.category} onValueChange={handleCategory}>
            <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select category…" /></SelectTrigger>
            <SelectContent>{categories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
          </Select>
        </FieldRow>

        {/* Sub Category */}
        <FieldRow label="Sub Category">
          <Select value={value.subCategory} disabled={!value.category} onValueChange={handleSubCat}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={value.category ? "Select sub category…" : "Select category first"} />
            </SelectTrigger>
            <SelectContent>{subCategories.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
          </Select>
        </FieldRow>

        {/* Merch Area */}
        <FieldRow label="Merch Area">
          <Select value={value.merchArea} disabled={!value.subCategory} onValueChange={handleMerchArea}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={value.subCategory ? "Select merch area…" : "Select sub category first"} />
            </SelectTrigger>
            <SelectContent>{merchAreas.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
          </Select>
        </FieldRow>

        {/* Planning Group */}
        <FieldRow label="Planning Group">
          <Select value={value.planningGroup} disabled={!value.merchArea} onValueChange={handlePlanGroup}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder={value.merchArea ? "Select planning group…" : "Select merch area first"} />
            </SelectTrigger>
            <SelectContent>{planGroups.map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
          </Select>
        </FieldRow>

        {/* Sub Planning Group — selecting this auto-populates all levels above */}
        <FieldRow label="Sub Planning Group" helper="Selecting this auto-fills all levels above">
          <Select value={value.subGroup} onValueChange={handleSubGroup}>
            <SelectTrigger className={cn("h-8 text-xs", value.subGroup && "ring-1 ring-emerald-400")}>
              <SelectValue placeholder="Select or pick to auto-fill…" />
            </SelectTrigger>
            <SelectContent className="max-h-52">
              {subGroups.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </FieldRow>
      </div>

      {/* Completion indicator */}
      {value.subGroup && (
        <div className={cn("flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-lg", accentBg)}>
          <Check size={10} /> Hierarchy complete
        </div>
      )}
    </div>
  );
}

const ALL_STEPS_DONE = new Set([1, 2, 3, 4, 5, 6, 7]);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductSetupWizard() {
  const [, navigate] = useLocation();
  const [, editRouteParams] = useRoute("/product-setup-legacy/edit/:styleCode");

  // ── Edit mode (state-driven, activated by "Edit Existing Style" modal) ──
  const [editedProduct, setEditedProduct]   = useState<ExistingProduct | null>(null);
  const [editReasons, setEditReasons]       = useState<EditReason[]>([]);
  const [draftId, setDraftId]               = useState<string | undefined>(undefined);
  const isEditMode = !!editedProduct;

  // ── Generated style code for new products ──
  const [generatedStyleCode] = useState(() => `STY${String(Math.floor(Math.random() * 900000) + 100000)}`);
  const styleCode = isEditMode && editedProduct ? editedProduct.styleCode : generatedStyleCode;

  const [step, setStep]     = useState(1);
  const [state, setState]   = useState<WizardState>(EMPTY_STATE);
  const [skus, setSkus]     = useState<SKURow[]>([]);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showCopyModal, setShowCopyModal]   = useState(false);
  const [showEditModal, setShowEditModal]   = useState(false);
  const [fieldErrors, setFieldErrors]       = useState<Record<string, string>>({});
  const [submitState, setSubmitState]       = useState<"idle" | "loading" | "success">("idle");
  const [plcStatus, setPlcStatus]           = useState<PLCStatus>("Current");
  const [productImages, setProductImages]   = useState<ProductImage[]>([]);
  const [innerPacks, setInnerPacks]         = useState<InnerPack[]>([]);
  const [recentDrafts, setRecentDrafts]     = useState<StoredDraft[]>(() => loadDrafts().slice(0, 5));
  const [vendorSearch, setVendorSearch]     = useState("");
  const [showVendorDD, setShowVendorDD]     = useState(false);
  const vendorRef = useRef<HTMLDivElement>(null);

  const missing  = useMemo(() => getMissingFields(state), [state]);
  const isReady  = missing.length === 0;
  const visibleFields = useMemo(() => getVisibleFields(state), [state]);

  // Highlighted steps derived from chosen edit reasons
  const highlightedSteps = useMemo(() => {
    if (editReasons.length === 0) return new Set<number>();
    const steps = editReasons.flatMap(r => REASON_STEP_MAP[r]);
    return new Set(steps);
  }, [editReasons]);

  // Group visible fields by section
  const fieldsBySection = useMemo(() => {
    const map: Record<string, FieldConfig[]> = {};
    // Existing styles use the dedicated PLC Status control above. Keep the
    // initial-creation field in the new-product flow, but avoid presenting a
    // second lifecycle editor inside edit mode.
    const fieldsForWizard = isEditMode
      ? visibleFields.filter(field => field.id !== "plcStatus")
      : visibleFields;
    for (const f of fieldsForWizard) {
      if (!map[f.section]) map[f.section] = [];
      map[f.section].push(f);
    }
    return map;
  }, [visibleFields, isEditMode]);

  const colorOptions = COLOR_OPTIONS[state.category] ?? COLOR_OPTIONS.DEFAULT;
  const sizeOptions  = SIZE_OPTIONS[state.category]  ?? SIZE_OPTIONS.DEFAULT;

  // Resume a draft if navigated from the Drafts page
  useEffect(() => {
    const id = getAndClearResumedDraftId();
    if (!id) return;
    const all = loadDrafts();
    const d = all.find(x => x.id === id);
    if (!d) return;
    setDraftId(id);
    setState(d.state as WizardState);
    setVendorSearch((d.state as WizardState).vendor ?? "");
    setCompletedSteps(new Set(d.completedStepNumbers));
    setStep(Math.max(1, d.completedStepNumbers.length > 0 ? Math.max(...d.completedStepNumbers) : 1));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regenerate SKUs when colors/sizes change
  useEffect(() => {
    if (step === 5 || (state.selectedColors.length > 0 || state.selectedSizes.length > 0)) {
      setSkus(generateSKUs(state, styleCode));
    }
  }, [state.selectedColors, state.selectedSizes, styleCode]);

  // Close vendor dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (vendorRef.current && !vendorRef.current.contains(e.target as Node)) setShowVendorDD(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const set = (key: keyof WizardState, value: any) => setState(p => ({ ...p, [key]: value }));
  const setDynamic = (key: string, value: any) => setState(p => ({ ...p, dynamicFields: { ...p.dynamicFields, [key]: value } }));

  const markCompleted = (s: number) => setCompletedSteps(prev => new Set(Array.from(prev).concat(s)));

  const goNext = () => {
    markCompleted(step);
    setStep(s => Math.min(s + 1, 7));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goPrev = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveDraft = () => {
    const saved = upsertDraft(state as Record<string, any>, completedSteps, draftId);
    setDraftId(saved.id);
    setRecentDrafts(loadDrafts().slice(0, 5));
  };

  const handleCopyStyle = (p: ExistingProduct) => {
    setState({
      ...EMPTY_STATE,
      buyer: p.buyer,
      vendor: p.vendor,
      brand: p.brand,
      longDescription: p.description,
      shortDescription: p.description.slice(0, 40),
      productType: "",
      category: p.hierarchy.category,
      subCategory: p.hierarchy.subCategory,
      merchArea: p.hierarchy.merchArea,
      planningGroup: p.hierarchy.planningGroup,
      subGroup: p.hierarchy.subGroup,
      leadTime: String(p.logistics.leadTime),
      orderMultiple: String(p.logistics.orderMultiple),
      distributionMultiple: String(p.logistics.distributionMultiple),
      weight: String(p.logistics.weight),
      cartonQty: String(p.logistics.cartonQty),
      replenishable: p.planning.replenishable,
       // New products always begin as Current; lifecycle changes belong to the
       // existing-style experience below, not the initial creation sequence.
       dynamicFields: {
         plcStatus: "Current",
         ...(p.planning.temperatureControl ? { temperatureControl: p.planning.temperatureControl } : {}),
       },
      selectedColors: p.skuVariants.colors,
      selectedSizes: p.skuVariants.sizes,
      length: "", width: "", height: "", upc: "",
    });
    setVendorSearch(p.vendor);
    setPlcStatus("Current");
    setProductImages([]);
    setInnerPacks([]);
    setCompletedSteps(new Set([1, 2]));
    setShowCopyModal(false);
    setStep(3);
  };

  const handleEditStyle = (p: ExistingProduct, reasons?: EditReason[]) => {
    const resolvedReasons = reasons ?? [];
    const assets = getProductSetupAssets(p.styleCode);
    setEditedProduct(p);
    setEditReasons(resolvedReasons);
    setState(stateFromProduct(p));
    setVendorSearch(p.vendor);
    setPlcStatus(assets.plcStatus);
    setProductImages(assets.images);
    setInnerPacks(assets.innerPacks);
    setCompletedSteps(new Set(ALL_STEPS_DONE));
    setSubmitState("idle");
    setShowEditModal(false);
    // Jump to first highlighted step (if any reasons selected), else step 1
    if (resolvedReasons.length > 0) {
      const stepsForReasons = resolvedReasons.flatMap(r => REASON_STEP_MAP[r]);
      const firstStep = Math.min(...stepsForReasons);
      setStep(firstStep);
    } else {
      setStep(1);
    }
  };

  const handleClearEdit = () => {
    setEditedProduct(null);
    setEditReasons([]);
    setState(EMPTY_STATE);
    setVendorSearch("");
    setPlcStatus("Current");
    setProductImages([]);
    setInnerPacks([]);
    setCompletedSteps(new Set());
    setSubmitState("idle");
    setStep(1);
  };

  const handleSubmit = async () => {
    setSubmitState("loading");
    await new Promise(r => setTimeout(r, 2200));
    if (!isEditMode) {
      registerMockCreatedProduct({
        styleCode,
        description: state.longDescription || "New Product Style",
        category: state.category,
        subCategory: state.subCategory,
        vendor: state.vendor,
        brand: state.brand,
        buyer: state.buyer,
        retail: 0,
        hierarchy: {
          category: state.category,
          subCategory: state.subCategory,
          merchArea: state.merchArea,
          planningGroup: state.planningGroup,
          subGroup: state.subGroup,
        },
        logistics: {
          leadTime: Number(state.leadTime) || 0,
          orderMultiple: Number(state.orderMultiple) || 0,
          distributionMultiple: Number(state.distributionMultiple) || 0,
          weight: Number(state.weight) || 0,
          cartonQty: Number(state.cartonQty) || 0,
        },
        planning: { replenishable: state.replenishable },
        skuVariants: { colors: state.selectedColors, sizes: state.selectedSizes },
      });
    }
    saveMockProductImages(styleCode, productImages);
    setSubmitState("success");
    markCompleted(7);
  };

  const handleProductImagesChange = (images: ProductImage[]) => {
    setProductImages(images);
    saveMockProductImages(styleCode, images);
  };

  // The product list links directly into the same edit experience. The
  // enhancement controls intentionally only activate once a style exists.
  useEffect(() => {
    const routeStyleCode = editRouteParams?.styleCode;
    if (!routeStyleCode || editedProduct) return;
    const product = getExistingProduct(routeStyleCode);
    if (product) handleEditStyle(product);
  }, [editRouteParams?.styleCode]);

  const filteredVendors = VENDORS.filter(v => {
    const matchesCat = !state.category || v.categories.includes(state.category);
    const q = vendorSearch.toLowerCase();
    return matchesCat && (!q || v.name.toLowerCase().includes(q) || v.code.includes(q));
  });

  // ── Step renderers ────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Product Context</h2>
        <p className="text-xs text-slate-500 mt-0.5">Set up the key stakeholders and product identity</p>
      </div>

      <SectionCard title="Stakeholders">
        <div className="grid grid-cols-2 gap-4">
          <FieldRow label="Buyer" required>
            <Select value={state.buyer} onValueChange={v => set("buyer", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select buyer…" /></SelectTrigger>
              <SelectContent>{BUYERS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
            </Select>
          </FieldRow>

          <FieldRow label="Vendor" required>
            <div ref={vendorRef} className="relative">
              <Input
                value={vendorSearch}
                onChange={e => { setVendorSearch(e.target.value); setShowVendorDD(true); set("vendor", ""); }}
                onFocus={() => setShowVendorDD(true)}
                placeholder="Search vendor…"
                className="h-9 text-sm pr-8"
              />
              {state.vendor && <Check size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-500" />}
              {showVendorDD && (
                <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-48 overflow-y-auto">
                  {filteredVendors.length === 0
                    ? <p className="px-3 py-2 text-xs text-slate-400">No vendors found</p>
                    : filteredVendors.map(v => (
                      <button key={v.code} type="button"
                        onClick={() => { set("vendor", v.name); setVendorSearch(v.name); setShowVendorDD(false); }}
                        className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group"
                      >
                        <div>
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-100">{v.name}</p>
                          <p className="text-[10px] text-slate-400">{v.code}</p>
                        </div>
                        <ChevronRight size={12} className="text-slate-300 group-hover:text-primary" />
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard title="Product Identity">
        <div className="grid grid-cols-2 gap-4">
          <FieldRow label="Brand" required>
            <Select value={state.brand} onValueChange={v => set("brand", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select brand…" /></SelectTrigger>
              <SelectContent>
                {(BRANDS[state.category] ?? Object.values(BRANDS).flat()).map(b => (
                  <SelectItem key={b} value={b}>{b}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldRow>
          <FieldRow label="Product Type">
            <Select value={state.productType} onValueChange={v => set("productType", v)}>
              <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type…" /></SelectTrigger>
              <SelectContent>{PRODUCT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </FieldRow>
        </div>
        <FieldRow label="Long Description" required>
          <Textarea
            value={state.longDescription}
            onChange={e => set("longDescription", e.target.value)}
            placeholder="Full product description as it will appear on labels and reports"
            className="text-sm min-h-[72px]"
          />
        </FieldRow>
        <FieldRow label="Short Description" helper="Used in compact views and mobile displays">
          <Input value={state.shortDescription} onChange={e => set("shortDescription", e.target.value)}
            placeholder="e.g. SONY WH-1000XM5 HEADPHONES" className="h-9 text-sm" />
        </FieldRow>
      </SectionCard>

      {recentDrafts.length > 0 && (
        <SectionCard title="Recent Drafts" badge={
          <button
            onClick={() => navigate("/product-setup-legacy/drafts")}
            className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
          >
            View all <ChevronRight size={10} />
          </button>
        }>
          <div className="space-y-2">
            {recentDrafts.map((d) => (
              <button
                key={d.id}
                onClick={() => {
                  setDraftId(d.id);
                  setState(d.state as WizardState);
                  setVendorSearch((d.state as WizardState).vendor ?? "");
                  setCompletedSteps(new Set(d.completedStepNumbers));
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
              >
                <FileText size={14} className="text-slate-400 group-hover:text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{d.label}</p>
                  <p className="text-[10px] text-slate-400">{d.savedAtDisplay}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="flex gap-0.5">
                    {Array.from({ length: d.totalSteps }, (_, i) => (
                      <div key={i} className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        d.completedStepNumbers.includes(i + 1) ? "bg-amber-400" : "bg-slate-100 dark:bg-slate-700"
                      )} />
                    ))}
                  </div>
                  <Badge className="text-[9px] bg-amber-50 text-amber-600 border-amber-200 border h-4 px-1.5">Draft</Badge>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );

  const renderStep2 = () => {
    const aptosValue: HierarchyValue = {
      category: state.category, subCategory: state.subCategory,
      merchArea: state.merchArea, planningGroup: state.planningGroup, subGroup: state.subGroup,
    };
    const altValue: HierarchyValue = {
      category: state.altCategory, subCategory: state.altSubCategory,
      merchArea: state.altMerchArea, planningGroup: state.altPlanningGroup, subGroup: state.altSubGroup,
    };

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Hierarchy Selection</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Map the product to both the APTOS and Alternate planning hierarchies — selecting the lowest level auto-fills all levels above
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* APTOS Hierarchy */}
          <HierarchyCascade
            leaves={APTOS_LEAVES}
            value={aptosValue}
            title="APTOS Hierarchy"
            accent="primary"
            onChange={v => setState(p => ({
              ...p,
              category: v.category, subCategory: v.subCategory,
              merchArea: v.merchArea, planningGroup: v.planningGroup, subGroup: v.subGroup,
              // Reset brand when category changes
              ...(v.category !== p.category ? { brand: "" } : {}),
            }))}
          />

          {/* Alternate Hierarchy */}
          <HierarchyCascade
            leaves={ALT_LEAVES}
            value={altValue}
            title="Alternate Hierarchy"
            accent="amber"
            onChange={v => setState(p => ({
              ...p,
              altCategory: v.category, altSubCategory: v.subCategory,
              altMerchArea: v.merchArea, altPlanningGroup: v.planningGroup, altSubGroup: v.subGroup,
            }))}
          />
        </div>

        {/* Dynamic fields hint */}
        {state.category && (
          <div className="animate-in fade-in duration-300 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5">
            <div className="flex items-start gap-3">
              <Sparkles size={15} className="text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-primary">Dynamic fields activated</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {visibleFields.length} attribute{visibleFields.length !== 1 ? "s" : ""} will be shown in Step 3 based on your APTOS hierarchy selection
                  {state.category === "ALCOHOL" && " — including age restriction and licensing fields"}
                  {state.category === "FRESH FOOD" && " — including shelf life, temperature control and allergen fields"}
                  {state.category === "FASHION" && " — including fashion season, fit type and colourway fields"}
                  {state.category === "TECH" && " — including warranty, battery type and dangerous goods fields"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Core Attributes</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {visibleFields.length} fields for <strong>{state.category || "your product"}</strong>
          {state.subCategory ? ` · ${state.subCategory}` : ""}
          {state.merchArea ? ` · ${state.merchArea}` : ""}
        </p>
      </div>
      {Object.keys(fieldsBySection).length === 0
        ? (
          <div className="text-center py-16 text-slate-400">
            <Sliders size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select a hierarchy in Step 2 to unlock dynamic attributes</p>
          </div>
        )
        : Object.entries(fieldsBySection).map(([section, fields]) => (
          <SectionCard key={section} title={section}>
            <div className="grid grid-cols-2 gap-4">
              {fields.map(field => {
                const val   = state.dynamicFields[field.id];
                const err   = fieldErrors[field.id];
                return (
                  <div key={field.id} className={cn(
                    field.type === "multi-select" || field.type === "tag" || field.type === "textarea" ? "col-span-2" : ""
                  )}>
                    <FieldRow label={field.label} required={field.required} helper={field.helperText} error={err}>
                      <DynamicField field={field} value={val} error={err}
                        onChange={v => {
                          setDynamic(field.id, v);
                          if (err) setFieldErrors(p => { const n = { ...p }; delete n[field.id]; return n; });
                        }}
                      />
                    </FieldRow>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        ))
      }
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Planning & Logistics</h2>
        <p className="text-xs text-slate-500 mt-0.5">Ordering parameters, dimensions and supply chain setup</p>
      </div>

      <SectionCard title="Ordering Parameters">
        <div className="grid grid-cols-3 gap-4">
          <FieldRow label="Lead Time (days)" required helper="Days from PO to store delivery">
            <Input type="number" value={state.leadTime} onChange={e => set("leadTime", e.target.value)}
              placeholder="e.g. 14" className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Order Multiple" required helper="Minimum qty increment for orders">
            <Input type="number" value={state.orderMultiple} onChange={e => set("orderMultiple", e.target.value)}
              placeholder="e.g. 6" className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Distribution Multiple" helper="DC dispatch increment">
            <Input type="number" value={state.distributionMultiple} onChange={e => set("distributionMultiple", e.target.value)}
              placeholder="e.g. 12" className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Carton Quantity" helper="Units per outer carton">
            <Input type="number" value={state.cartonQty} onChange={e => set("cartonQty", e.target.value)}
              placeholder="e.g. 24" className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Unit Barcode / UPC" helper="12–14 digit EAN/UPC">
            <Input value={state.upc} onChange={e => {
              set("upc", e.target.value);
              const err = validateUPC(e.target.value);
              setFieldErrors(p => err ? { ...p, upc: err } : (({ upc: _, ...rest }) => rest)(p));
            }}
            placeholder="012345678901" className={cn("h-9 text-sm font-mono", fieldErrors.upc && "border-red-400")} />
            {fieldErrors.upc && <p className="text-[11px] text-red-500 mt-1">{fieldErrors.upc}</p>}
          </FieldRow>
          <FieldRow label="Replenishable">
            <div className="flex items-center gap-3 h-9">
              <Switch checked={state.replenishable} onCheckedChange={v => set("replenishable", v)} />
              <span className="text-sm text-slate-600 dark:text-slate-300">{state.replenishable ? "Yes" : "No"}</span>
            </div>
          </FieldRow>
        </div>
      </SectionCard>

      <SectionCard title="Dimensions & Weight">
        <div className="grid grid-cols-4 gap-4">
          <FieldRow label="Weight (kg)">
            <Input type="number" step="0.01" value={state.weight} onChange={e => set("weight", e.target.value)}
              placeholder="0.00" className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Length (cm)">
            <Input type="number" value={state.length} onChange={e => set("length", e.target.value)}
              placeholder="0" className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Width (cm)">
            <Input type="number" value={state.width} onChange={e => set("width", e.target.value)}
              placeholder="0" className="h-9 text-sm" />
          </FieldRow>
          <FieldRow label="Height (cm)">
            <Input type="number" value={state.height} onChange={e => set("height", e.target.value)}
              placeholder="0" className="h-9 text-sm" />
          </FieldRow>
        </div>
      </SectionCard>

      {state.category === "FRESH FOOD" && (
        <div className="animate-in fade-in duration-200">
          <SectionCard title="Temperature & Storage" badge={<Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 border text-[10px]">Fresh Food</Badge>}>
            <div className="grid grid-cols-2 gap-4">
              <FieldRow label="Temperature Control" required>
                <Select value={state.dynamicFields.temperatureControl || ""}
                  onValueChange={v => setDynamic("temperatureControl", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {["Ambient", "Chilled (0–5°C)", "Chilled (0–8°C)", "Frozen (-18°C)", "Controlled (15–20°C)"].map(o =>
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FieldRow>
              <FieldRow label="Shelf Life (days)" required>
                <Input type="number" value={state.dynamicFields.shelfLife || ""}
                  onChange={e => setDynamic("shelfLife", e.target.value)}
                  placeholder="e.g. 5" className="h-9 text-sm" />
              </FieldRow>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Soft validation warnings */}
      {state.leadTime && Number(state.leadTime) > 90 && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-xs">
          <AlertTriangle size={14} className="flex-shrink-0" />
          Lead time of {state.leadTime} days is unusually high — please verify with the vendor
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">SKU Generation</h2>
        <p className="text-xs text-slate-500 mt-0.5">Select colour and size variants — SKUs are generated automatically</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SectionCard title="Colours" badge={
          <span className="text-[10px] font-semibold text-slate-400">{state.selectedColors.length} selected</span>
        }>
          <ChipSelector options={colorOptions} selected={state.selectedColors}
            onChange={v => set("selectedColors", v)} />
        </SectionCard>

        <SectionCard title="Sizes" badge={
          <span className="text-[10px] font-semibold text-slate-400">{state.selectedSizes.length} selected</span>
        }>
          <ChipSelector options={sizeOptions} selected={state.selectedSizes}
            onChange={v => set("selectedSizes", v)} />
        </SectionCard>
      </div>

      {skus.length > 0 && (
        <SectionCard title="Generated SKUs" badge={
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 border text-[10px]">
            {skus.length} SKU{skus.length !== 1 ? "s" : ""}
          </Badge>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  {["SKU Code", "Colour", "Size", "UPC (Preview)", "Status"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {skus.map((sku, i) => (
                  <tr key={sku.id} className={cn("border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors", i === 0 && "rounded-t-lg")}>
                    <td className="py-2.5 px-3 font-mono font-semibold text-primary">{sku.skuCode}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">{sku.color}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-200">{sku.size}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{sku.upc}</td>
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => setSkus(prev => prev.map(s => s.id === sku.id
                          ? { ...s, status: s.status === "active" ? "inactive" : "active" }
                          : s
                        ))}
                        className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors",
                          sku.status === "active"
                            ? "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
                        )}
                      >
                        {sku.status === "active" ? "Active" : "Inactive"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {(state.selectedColors.length === 0 && state.selectedSizes.length === 0) && (
        <div className="text-center py-10 text-slate-400">
          <Grid3x3 size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Select colours and sizes above to generate SKUs</p>
        </div>
      )}
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Images</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Add internal product reference images before completing this style setup. Images are managed at the product/style level, not per SKU.
        </p>
      </div>
      <ProductImagesSection images={productImages} onImagesChange={handleProductImagesChange} />
      <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[10px] text-slate-500">
        <Info size={13} className="text-primary mt-0.5 flex-shrink-0" />
        <span>Images are used for internal product reference and automatically optimized for storage. They are not ecommerce publishing assets.</span>
      </div>
    </div>
  );

  const renderStep7 = () => {
    if (submitState === "success") {
      const activeSKUs = skus.filter(s => s.status === "active");
      return (
        <div className="animate-in fade-in zoom-in-95 duration-300 text-center py-12 space-y-4">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center mx-auto",
            isEditMode
              ? "bg-blue-100 dark:bg-blue-900/30"
              : "bg-emerald-100 dark:bg-emerald-900/30"
          )}>
            {isEditMode
              ? <CheckCircle2 className="text-blue-600" size={28} />
              : <PartyPopper className="text-emerald-600" size={28} />
            }
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
              {isEditMode ? "Changes Saved!" : "Product Submitted!"}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditMode
                ? "Your changes have been saved successfully"
                : "Your product has been created and sent for review"}
            </p>
          </div>
          <div className="inline-flex flex-col gap-2 items-center">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl px-5 py-3 border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500">Style ID</span>
              <span className="font-mono font-bold text-primary text-base">{styleCode}</span>
            </div>
            {!isEditMode && (
              <div className="flex flex-wrap gap-1.5 justify-center">
                {activeSKUs.map(s => (
                  <span key={s.id} className="font-mono text-[10px] bg-primary/8 text-primary rounded-lg px-2 py-1">{s.skuCode}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Button variant="outline" onClick={handleClearEdit} className="mt-2">
              {isEditMode ? "Back to New Product" : "Create Another Product"}
            </Button>
            {!isEditMode && (
              <Button onClick={() => navigate("/sip/allocation")} className="mt-2">
                Go to Allocation View
              </Button>
            )}
          </div>
        </div>
      );
    }

    const activeSKUs = skus.filter(s => s.status === "active");
    const sections = [
      { title: "Product Info", items: [
        { label: "Buyer",            value: state.buyer },
        { label: "Vendor",           value: state.vendor },
        { label: "Brand",            value: state.brand },
        { label: "Long Description", value: state.longDescription },
      ]},
      { title: "Hierarchy", items: [
        { label: "Category",       value: state.category },
        { label: "Subcategory",    value: state.subCategory },
        { label: "Merch Area",     value: state.merchArea },
        { label: "Planning Group", value: state.planningGroup },
      ]},
      { title: "Logistics", items: [
        { label: "Lead Time",            value: state.leadTime ? `${state.leadTime} days` : "" },
        { label: "Order Multiple",       value: state.orderMultiple },
        { label: "Distribution Multiple",value: state.distributionMultiple },
        { label: "Carton Qty",           value: state.cartonQty },
        { label: "Replenishable",        value: state.replenishable ? "Yes" : "No" },
      ]},
    ];

    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {isEditMode ? "Review & Save" : "Review & Submit"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEditMode ? "Review your changes before saving" : "Review your product before submission"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {sections.map(sec => (
            <SectionCard key={sec.title} title={sec.title}>
              <dl className="space-y-2.5">
                {sec.items.map(item => (
                  <div key={item.label} className="flex items-start gap-2">
                    <dt className="text-[11px] text-slate-400 w-[130px] flex-shrink-0 pt-0.5">{item.label}</dt>
                    <dd className="text-[11px] font-medium text-slate-700 dark:text-slate-200 break-words min-w-0">
                      {item.value || <span className="text-slate-300">—</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </SectionCard>
          ))}

          {/* Attributes summary */}
          <SectionCard title="Attributes">
            <dl className="space-y-2.5">
              {Object.entries(state.dynamicFields)
                .filter(([k, v]) => k !== "plcStatus" && v !== "" && v !== undefined && v !== null)
                .map(([k, v]) => {
                const field = DYNAMIC_FIELDS.find(f => f.id === k);
                const displayVal = Array.isArray(v) ? v.join(", ") : String(v);
                return (
                  <div key={k} className="flex items-start gap-2">
                    <dt className="text-[11px] text-slate-400 w-[130px] flex-shrink-0 pt-0.5">{field?.label ?? k}</dt>
                    <dd className="text-[11px] font-medium text-slate-700 dark:text-slate-200">{displayVal}</dd>
                  </div>
                );
              })}
              {Object.keys(state.dynamicFields).length === 0 && <p className="text-[11px] text-slate-400">No attributes set</p>}
            </dl>
          </SectionCard>

          {/* SKU summary */}
          <SectionCard title="SKUs" badge={
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 border text-[10px]">{activeSKUs.length} active</Badge>
          }>
            <div className="space-y-1.5">
              {activeSKUs.length === 0
                ? <p className="text-[11px] text-slate-400">No active SKUs</p>
                : activeSKUs.map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-primary font-semibold">{s.skuCode}</span>
                    <span className="text-[11px] text-slate-500">{s.color} / {s.size}</span>
                  </div>
                ))
              }
            </div>
          </SectionCard>
        </div>

        {/* Validation panel */}
        {missing.length > 0 && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-amber-600" />
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">{missing.length} Missing Field{missing.length !== 1 ? "s" : ""}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {missing.map(m => (
                <span key={m} className="text-[10px] px-2 py-0.5 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg border border-amber-200 dark:border-amber-800 font-medium">{m}</span>
              ))}
            </div>
          </div>
        )}

        {isReady && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs">
            <CheckCircle2 size={14} />
            All required fields are complete — {isEditMode ? "ready to save" : "ready to submit"}
          </div>
        )}

        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!isReady || submitState === "loading"}
            className="gap-2 min-w-[160px]"
          >
            {submitState === "loading"
              ? <><Loader2 size={15} className="animate-spin" /> {isEditMode ? "Saving…" : "Submitting…"}</>
              : isEditMode
              ? <><Pencil size={15} /> Save Changes</>
              : <><Send size={15} /> Submit Product</>
            }
          </Button>
        </div>
      </div>
    );
  };

  const stepRenderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6, renderStep7];

  return (
    <MainLayout>
      <div className="animate-in fade-in duration-300">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            {isEditMode && (
              <button
                onClick={handleClearEdit}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                title="Back to New Product"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {isEditMode ? "Edit Product" : "Product Setup"}
                </h1>
                {isEditMode && (
                  <Badge className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 gap-1">
                    <Pencil size={9} /> {styleCode}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                {isEditMode
                  ? `Editing ${editedProduct?.description.slice(0, 48)}…`
                  : "Create and configure new product styles and SKUs"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Validation badge */}
            {isReady
              ? <Badge className="gap-1 bg-emerald-100 text-emerald-700 border border-emerald-300 font-semibold">
                  <Check size={11} /> {isEditMode ? "Ready to Save" : "Ready to Submit"}
                </Badge>
              : <Badge className="gap-1 bg-amber-100 text-amber-700 border border-amber-200 font-semibold">
                  <AlertCircle size={11} /> {missing.length} Missing Field{missing.length !== 1 ? "s" : ""}
                </Badge>
            }
            {!isEditMode && (
              <>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={saveDraft}>
                  <Save size={13} /> Save Draft
                </Button>
                <Button
                  variant="outline" size="sm"
                  className="gap-1.5 text-xs text-slate-500 border-dashed"
                  onClick={() => navigate("/product-setup-legacy/drafts")}
                >
                  <FileText size={13} />
                  {recentDrafts.length > 0 ? `${recentDrafts.length} Draft${recentDrafts.length !== 1 ? "s" : ""}` : "Drafts"}
                </Button>
              </>
            )}
            <Button size="sm" className="gap-1.5 text-xs" disabled={!isReady} onClick={() => setStep(7)}>
              {isEditMode ? <><Pencil size={13} /> Save Changes</> : <><Send size={13} /> Submit Product</>}
            </Button>
          </div>
        </div>

        {/* Two-column layout: wizard nav + content */}
        <div className="flex gap-6 items-start">
          <div className="w-[220px] flex-shrink-0">
            {/* Style summary card */}
            <StyleInfoCard
              isEditMode={isEditMode}
              styleCode={styleCode}
              state={state}
            />

            {/* Step navigation */}
            <WizardSidebar
              currentStep={step}
              completedSteps={completedSteps}
              invalidSteps={new Set()}
              highlightedSteps={highlightedSteps}
              onStepClick={setStep}
            />

            {/* Edit reasons chips */}
            {isEditMode && editReasons.length > 0 && (
              <div className="mt-3 space-y-1.5">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider px-1">Updating</p>
                <div className="flex flex-wrap gap-1">
                  {editReasons.map(rid => {
                    const r = EDIT_REASONS.find(x => x.id === rid)!;
                    return (
                      <span key={rid} className={cn(
                        "inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-lg border",
                        r.bg, r.color, r.border
                      )}>
                        <r.Icon size={8} />
                        {r.label.split(" ").slice(0, 2).join(" ")}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Persistent style shortcuts */}
            <div className="mt-4 space-y-1.5">
              <button
                onClick={() => setShowCopyModal(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-primary border border-dashed border-primary/30 hover:bg-primary/5 transition-colors"
              >
                <Copy size={12} /> Copy Existing Style
              </button>
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-600 border border-dashed border-amber-400/40 hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors"
              >
                <Pencil size={12} /> Edit Existing Style
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {isEditMode && (
              <ProductSetupEnhancements
                styleCode={styleCode}
                sku={getProductSetupAssets(styleCode).primarySku}
                plcStatus={plcStatus}
                images={productImages}
                innerPacks={innerPacks}
                onStatusChange={setPlcStatus}
                onImagesChange={handleProductImagesChange}
                onPacksChange={setInnerPacks}
                showImages={step !== 6}
              />
            )}
            {stepRenderers[step - 1]?.()}

            {/* Navigation buttons */}
            {submitState !== "success" && (
              <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" size="sm" onClick={goPrev} disabled={step === 1} className="gap-1.5 text-xs">
                  <ChevronLeft size={13} /> Previous
                </Button>
                <span className="text-[11px] text-slate-400">Step {step} of {STEPS.length}</span>
                {step < 7
                  ? <Button size="sm" onClick={goNext} className="gap-1.5 text-xs">
                      Next <ChevronRight size={13} />
                    </Button>
                  : <Button size="sm" onClick={handleSubmit} disabled={!isReady || submitState === "loading"} className="gap-1.5 text-xs">
                      {submitState === "loading"
                        ? <><Loader2 size={13} className="animate-spin" /> {isEditMode ? "Saving…" : "Submitting…"}</>
                        : isEditMode
                        ? <><Pencil size={13} /> Save Changes</>
                        : <><Send size={13} /> Submit</>
                      }
                    </Button>
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {showCopyModal && <StyleSearchModal mode="copy" onClose={() => setShowCopyModal(false)} onSelect={handleCopyStyle} />}
      {showEditModal && <StyleSearchModal mode="edit" onClose={() => setShowEditModal(false)} onSelect={handleEditStyle} />}
    </MainLayout>
  );
}
