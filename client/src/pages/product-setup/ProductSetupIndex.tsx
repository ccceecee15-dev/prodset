import { useState } from "react";
import { Link } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PackagePlus, Search, Pencil, Package,
  Cpu, Wine, Leaf, Shirt, Filter, ChevronRight,
} from "lucide-react";
import { EXISTING_PRODUCTS, CATEGORY_KEYS } from "./productSetupData";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  TECH: Cpu, ALCOHOL: Wine, "FRESH FOOD": Leaf, FASHION: Shirt,
};

const CATEGORY_COLORS: Record<string, string> = {
  TECH:         "bg-blue-100 text-blue-700 border-blue-200",
  ALCOHOL:      "bg-purple-100 text-purple-700 border-purple-200",
  "FRESH FOOD": "bg-emerald-100 text-emerald-700 border-emerald-200",
  FASHION:      "bg-rose-100 text-rose-700 border-rose-200",
};

export default function ProductSetupIndex() {
  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("All");

  const filtered = EXISTING_PRODUCTS.filter(p => {
    const matchesCat = catFilter === "All" || p.category === catFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.description.toLowerCase().includes(q) ||
      p.styleCode.includes(q) ||
      p.vendor.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const stats = [
    { label: "Total Products",  value: EXISTING_PRODUCTS.length },
    { label: "Categories",      value: CATEGORY_KEYS.length },
    { label: "Active Vendors",  value: new Set(EXISTING_PRODUCTS.map(p => p.vendor)).size },
    { label: "Buyers",          value: new Set(EXISTING_PRODUCTS.map(p => p.buyer)).size },
  ];

  return (
    <MainLayout>
      <div className="animate-in fade-in duration-300 space-y-5">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Product Setup
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage existing products or create a new style
            </p>
          </div>
          <Link href="/product-setup/new">
            <Button className="gap-2 text-sm shadow-sm">
              <PackagePlus size={15} />
              Create New Product
            </Button>
          </Link>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map(s => (
            <div
              key={s.label}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm px-5 py-4"
            >
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, style code, vendor…"
              className="pl-8 h-9 text-sm"
            />
          </div>

          {/* Category chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {["All", ...CATEGORY_KEYS].map(cat => {
              const active = catFilter === cat;
              const CatIcon = cat !== "All" ? (CATEGORY_ICONS[cat] ?? Package) : Filter;
              return (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-all duration-150",
                    active
                      ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:text-primary"
                  )}
                >
                  <CatIcon size={12} />
                  {cat}
                </button>
              );
            })}
          </div>

          <span className="text-xs text-slate-400 ml-auto">
            {filtered.length} product{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── Product table ───────────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="grid grid-cols-[56px_1fr_140px_160px_110px_90px_80px] gap-3 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/80">
            {["", "Product", "Category", "Vendor", "Brand", "Buyer", ""].map((h, i) => (
              <span key={i} className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-50 dark:divide-slate-800/60">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Package size={32} className="mx-auto mb-3 opacity-25" />
                <p className="text-sm">No products match your search</p>
              </div>
            ) : (
              filtered.map(p => {
                const CatIcon = CATEGORY_ICONS[p.category] ?? Package;
                return (
                  <div
                    key={p.styleCode}
                    className="grid grid-cols-[56px_1fr_140px_160px_110px_90px_80px] gap-3 px-4 py-3.5 items-center hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <CatIcon size={15} className="text-slate-400 group-hover:text-primary transition-colors" />
                    </div>

                    {/* Product info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-[10px] text-slate-400">{p.styleCode}</span>
                        <span className="text-[10px] text-slate-300">·</span>
                        <span className="text-[10px] text-slate-400">${p.retail.toFixed(2)}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
                        {p.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {p.subCategory}{p.hierarchy.merchArea ? ` · ${p.hierarchy.merchArea}` : ""}
                      </p>
                    </div>

                    {/* Category badge */}
                    <div>
                      <Badge className={cn(
                        "text-[10px] font-semibold border gap-1 py-0.5",
                        CATEGORY_COLORS[p.category] ?? "bg-slate-100 text-slate-600 border-slate-200"
                      )}>
                        <CatIcon size={10} />
                        {p.category}
                      </Badge>
                    </div>

                    {/* Vendor */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate">{p.vendor}</p>

                    {/* Brand */}
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{p.brand}</p>

                    {/* Buyer */}
                    <p className="text-xs text-slate-500 truncate">{p.buyer}</p>

                    {/* Action */}
                    <div className="flex justify-end">
                      <Link href={`/product-setup/edit/${p.styleCode}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-[11px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity border-primary/30 text-primary hover:bg-primary/5"
                        >
                          <Pencil size={11} /> Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Quick create CTA (bottom) ───────────────────────────────────── */}
        <Link href="/product-setup/new">
          <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/8 transition-colors cursor-pointer p-5 flex items-center gap-4 group">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <PackagePlus size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">Create New Product</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Launch the guided 6-step product setup wizard
              </p>
            </div>
            <ChevronRight size={16} className="text-primary/40 group-hover:text-primary ml-auto transition-colors" />
          </div>
        </Link>

      </div>
    </MainLayout>
  );
}
