import { useState } from "react";
import { useLocation } from "wouter";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Boxes, Check, ChevronDown, ChevronUp, FileImage, Package,
  Pencil, Plus, Save, Search, Trash2, Upload, X,
} from "lucide-react";
import {
  EXISTING_PRODUCTS, getProductSetupAssets, saveMockProductImages,
  type ExistingProduct, type InnerPack, type ProductImage,
} from "./productSetupData";

type ManagementAction = "update" | "images" | "packs";

const ACTIONS: { id: ManagementAction; title: string; description: string; icon: React.ElementType }[] = [
  { id: "update", title: "Update Style Information", description: "Review and update the information currently held for this style.", icon: Pencil },
  { id: "images", title: "Manage Images", description: "Add, replace or manage product images for this style.", icon: FileImage },
  { id: "packs", title: "Manage Pack UPCs", description: "Add or update pack-level UPC information for this style.", icon: Boxes },
];

function StyleContext({ product }: { product: ExistingProduct }) {
  const assets = getProductSetupAssets(product.styleCode);
  return (
    <div className="rounded-xl border border-primary/15 bg-primary/[0.03] p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0"><Package size={17} /></div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-semibold text-primary">{product.styleCode}</span>
          <Badge className="text-[9px] h-5 bg-slate-100 text-slate-600 border-slate-200">{product.category}</Badge>
          <Badge className="text-[9px] h-5 bg-emerald-50 text-emerald-700 border-emerald-200">{assets.plcStatus}</Badge>
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-1 truncate">{product.description}</p>
        <p className="text-[11px] text-slate-500 mt-1">{product.brand} · {product.vendor} · {product.subCategory}</p>
      </div>
    </div>
  );
}

function UpdateScreen({ product, onBack }: { product: ExistingProduct; onBack: () => void }) {
  const { toast } = useToast();
  const [values, setValues] = useState({ description: product.description, brand: product.brand, vendor: product.vendor, buyer: product.buyer, retail: String(product.retail), category: product.category });
  const [savedValues, setSavedValues] = useState(values);
  const dirty = JSON.stringify(values) !== JSON.stringify(savedValues);
  const update = (key: keyof typeof values, value: string) => setValues(current => ({ ...current, [key]: value }));
  const cancel = () => { setValues(savedValues); onBack(); };
  const save = () => { setSavedValues(values); toast({ title: "Changes saved", description: `${product.styleCode} was updated in this prototype.` }); };
  return (
    <TaskShell title="Update Style Information" description="Review and update the information currently held for this style." product={product} onBack={cancel}>
      <div className="grid xl:grid-cols-2 gap-4">
        <FormSection title="Style identity">
          <Field label="Style ID"><Input value={product.styleCode} disabled className="h-9 text-sm font-mono bg-slate-50" /></Field>
          <Field label="Description"><Input value={values.description} onChange={e => update("description", e.target.value)} className="h-9 text-sm" /></Field>
          <Field label="Brand"><Input value={values.brand} onChange={e => update("brand", e.target.value)} className="h-9 text-sm" /></Field>
        </FormSection>
        <FormSection title="Ownership and classification">
          <Field label="Vendor"><Input value={values.vendor} onChange={e => update("vendor", e.target.value)} className="h-9 text-sm" /></Field>
          <Field label="Buyer"><Input value={values.buyer} onChange={e => update("buyer", e.target.value)} className="h-9 text-sm" /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="Category"><Input value={values.category} onChange={e => update("category", e.target.value)} className="h-9 text-sm" /></Field><Field label="Retail price"><Input value={values.retail} onChange={e => update("retail", e.target.value)} className="h-9 text-sm" /></Field></div>
        </FormSection>
      </div>
      <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800"><p className="text-[11px] text-slate-400">{dirty ? "You have unsaved changes." : "All changes are saved."}</p><div className="flex gap-2"><Button variant="outline" size="sm" onClick={cancel} className="text-xs">Cancel</Button><Button size="sm" onClick={save} disabled={!dirty} className="gap-1.5 text-xs"><Save size={12} /> Save Changes</Button></div></div>
    </TaskShell>
  );
}

function ImagesScreen({ product, onBack }: { product: ExistingProduct; onBack: () => void }) {
  const { toast } = useToast();
  const [images, setImages] = useState<ProductImage[]>(() => getProductSetupAssets(product.styleCode).images);
  const [savedImages, setSavedImages] = useState(images);
  const dirty = JSON.stringify(images) !== JSON.stringify(savedImages);
  const addFiles = (files: FileList | null) => { if (!files) return; setImages(current => [...current, ...Array.from(files).map((file, index) => ({ id: `upload-${Date.now()}-${index}`, src: URL.createObjectURL(file), filename: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB` }))]); };
  const replaceImage = (imageId: string, files: FileList | null) => { const file = files?.[0]; if (!file) return; setImages(current => current.map(image => image.id === imageId ? { ...image, src: URL.createObjectURL(file), filename: file.name, size: `${(file.size / 1024 / 1024).toFixed(1)} MB` } : image)); };
  const move = (index: number, direction: -1 | 1) => setImages(current => { const next = [...current]; const target = index + direction; if (target < 0 || target >= next.length) return current; [next[index], next[target]] = [next[target], next[index]]; return next; });
  const save = () => { saveMockProductImages(product.styleCode, images); setSavedImages(images); toast({ title: "Images saved", description: "The image order and selection were updated." }); };
  const cancel = () => { setImages(savedImages); onBack(); };
  return (
    <TaskShell title="Manage Images" description="Add, replace or manage product images for this style." product={product} onBack={cancel}>
      <div className="flex items-center justify-between gap-3 mb-4"><div><p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Style imagery</p><p className="text-[11px] text-slate-400 mt-0.5">The first image is used as the primary reference image.</p></div><label className="cursor-pointer"><input type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)} /><span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90"><Upload size={13} /> Add images</span></label></div>
      {images.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{images.map((image, index) => <div key={image.id} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"><div className="relative bg-slate-100 aspect-[4/3]"><img src={image.src} alt={image.filename} className="w-full h-full object-cover" />{index === 0 && <span className="absolute top-2 left-2 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-white">Primary image</span>}</div><div className="p-2.5"><p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate">{image.filename}</p><div className="flex items-center justify-between mt-2"><div className="flex gap-1"><button type="button" title="Move image left" disabled={index === 0} onClick={() => move(index, -1)} className="p-1.5 rounded-md border text-slate-500 disabled:opacity-30"><ChevronUp size={12} /></button><button type="button" title="Move image right" disabled={index === images.length - 1} onClick={() => move(index, 1)} className="p-1.5 rounded-md border text-slate-500 disabled:opacity-30"><ChevronDown size={12} /></button><label title="Replace image" className="p-1.5 rounded-md border text-primary hover:bg-primary/10 cursor-pointer"><input type="file" accept="image/*" className="hidden" onChange={e => replaceImage(image.id, e.target.files)} /><Upload size={12} /></label></div><button type="button" title="Remove image" onClick={() => setImages(current => current.filter(item => item.id !== image.id))} className="p-1.5 rounded-md text-red-500 hover:bg-red-50"><Trash2 size={13} /></button></div></div></div>)}</div> : <div className="py-14 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700"><FileImage size={28} className="mx-auto text-slate-300 mb-2" /><p className="text-xs font-semibold text-slate-600">No images added yet</p><p className="text-[11px] text-slate-400 mt-1">Add product imagery for internal reference.</p></div>}
      <TaskFooter dirty={dirty} onCancel={cancel} onSave={save} />
    </TaskShell>
  );
}

function PacksScreen({ product, onBack }: { product: ExistingProduct; onBack: () => void }) {
  const { toast } = useToast();
  const [packs, setPacks] = useState<InnerPack[]>(() => getProductSetupAssets(product.styleCode).innerPacks);
  const [draft, setDraft] = useState({ packUpc: "050123456789", orderMultiple: "6", unitsPerPack: "6" });
  const [editing, setEditing] = useState<string | null>(null);
  const [savedPacks, setSavedPacks] = useState(packs);
  const dirty = JSON.stringify(packs) !== JSON.stringify(savedPacks);
  const resetDraft = () => setDraft({ packUpc: "050123456789", orderMultiple: "6", unitsPerPack: "6" });
  const addOrUpdate = () => { if (!/^\d{12,14}$/.test(draft.packUpc)) return; const next: InnerPack = { id: editing ?? `pack-${Date.now()}`, packUpc: draft.packUpc, orderMultiple: Number(draft.orderMultiple), unitsPerPack: Number(draft.unitsPerPack), status: "Active" }; setPacks(current => editing ? current.map(pack => pack.id === editing ? next : pack) : [...current, next]); setEditing(null); resetDraft(); };
  const edit = (pack: InnerPack) => { setEditing(pack.id); setDraft({ packUpc: pack.packUpc, orderMultiple: String(pack.orderMultiple), unitsPerPack: String(pack.unitsPerPack) }); };
  const save = () => { setSavedPacks(packs); toast({ title: "Pack UPCs saved", description: "Pack-level information was updated in this prototype." }); };
  const cancel = () => { setPacks(savedPacks); onBack(); };
  return (
    <TaskShell title="Manage Pack UPCs" description="Add or update pack-level UPC information for this style." product={product} onBack={cancel}>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"><div className="grid grid-cols-[1.4fr_1fr_1fr_90px] gap-3 px-4 py-2.5 bg-slate-50/80 border-b text-[10px] font-bold uppercase tracking-wider text-slate-400"><span>Pack UPC</span><span>Order multiple</span><span>Units / pack</span><span>Actions</span></div>{packs.map(pack => <div key={pack.id} className="grid grid-cols-[1.4fr_1fr_1fr_90px] gap-3 items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0"><span className="font-mono text-xs text-slate-700 dark:text-slate-200">{pack.packUpc}</span><span className="text-xs text-slate-600">{pack.orderMultiple}</span><span className="text-xs text-slate-600">{pack.unitsPerPack}</span><div className="flex gap-1"><button type="button" title="Edit pack UPC" onClick={() => edit(pack)} className="p-1.5 rounded-md text-primary hover:bg-primary/10"><Pencil size={13} /></button><button type="button" title="Remove pack UPC" onClick={() => setPacks(current => current.filter(item => item.id !== pack.id))} className="p-1.5 rounded-md text-red-500 hover:bg-red-50"><Trash2 size={13} /></button></div></div>)}{!packs.length && <p className="px-4 py-8 text-center text-xs text-slate-400">No pack UPCs configured for this style.</p>}</div>
      <div className="mt-4 rounded-xl border border-dashed border-primary/25 bg-primary/[0.02] p-4"><p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-3">{editing ? "Edit pack UPC" : "Add pack UPC"}</p><div className="grid sm:grid-cols-3 gap-3"><Field label="Pack UPC"><Input value={draft.packUpc} onChange={e => setDraft({ ...draft, packUpc: e.target.value.replace(/\D/g, "").slice(0, 14) })} className="h-9 text-sm font-mono" /></Field><Field label="Order multiple"><Input type="number" min="1" value={draft.orderMultiple} onChange={e => setDraft({ ...draft, orderMultiple: e.target.value })} className="h-9 text-sm" /></Field><Field label="Units per pack"><Input type="number" min="1" value={draft.unitsPerPack} onChange={e => setDraft({ ...draft, unitsPerPack: e.target.value })} className="h-9 text-sm" /></Field></div><div className="flex justify-end gap-2 mt-3">{editing && <Button variant="ghost" size="sm" onClick={() => { setEditing(null); resetDraft(); }} className="text-xs">Cancel edit</Button>}<Button size="sm" onClick={addOrUpdate} disabled={!/^\d{12,14}$/.test(draft.packUpc)} className="gap-1.5 text-xs"><Plus size={12} /> {editing ? "Update pack UPC" : "Add pack UPC"}</Button></div></div>
      <TaskFooter dirty={dirty} onCancel={cancel} onSave={save} />
    </TaskShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <div><label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5">{label}</label>{children}</div>; }
function FormSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"><h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">{title}</h3>{children}</section>; }
function TaskFooter({ dirty, onCancel, onSave }: { dirty: boolean; onCancel: () => void; onSave: () => void }) { return <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-800"><p className="text-[11px] text-slate-400">{dirty ? "You have unsaved changes." : "All changes are saved."}</p><div className="flex gap-2"><Button variant="outline" size="sm" onClick={onCancel} className="text-xs">Cancel</Button><Button size="sm" onClick={onSave} disabled={!dirty} className="gap-1.5 text-xs"><Save size={12} /> Save Changes</Button></div></div>; }
function TaskShell({ title, description, product, onBack, children }: { title: string; description: string; product: ExistingProduct; onBack: () => void; children: React.ReactNode }) { return <><div className="flex items-center gap-3 mb-5"><Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-xs text-slate-500"><ArrowLeft size={13} /> Back to Manage Existing Styles</Button></div><div className="mb-5"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary mb-1.5">Product Setup / Existing Styles</p><h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1><p className="text-sm text-slate-500 mt-1">{description}</p></div><StyleContext product={product} /><section className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm p-5">{children}</section></>; }

export default function ManageExistingStyles() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [product, setProduct] = useState<ExistingProduct | null>(null);
  const [action, setAction] = useState<ManagementAction | null>(null);
  const filtered = EXISTING_PRODUCTS.filter(item => { const query = search.toLowerCase(); return !query || item.styleCode.toLowerCase().includes(query) || item.description.toLowerCase().includes(query) || item.brand.toLowerCase().includes(query); });
  const selectProduct = (item: ExistingProduct) => { setProduct(item); setAction(null); };
  if (product && action === "update") return <MainLayout><UpdateScreen product={product} onBack={() => setAction(null)} /></MainLayout>;
  if (product && action === "images") return <MainLayout><ImagesScreen product={product} onBack={() => setAction(null)} /></MainLayout>;
  if (product && action === "packs") return <MainLayout><PacksScreen product={product} onBack={() => setAction(null)} /></MainLayout>;
  return <MainLayout><div className="animate-in fade-in duration-300 max-w-5xl mx-auto space-y-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary mb-1.5">Product Setup</p><h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Manage Existing Styles</h1><p className="text-sm text-slate-500 mt-1">Update and maintain information for styles that already exist.</p></div><Button variant="outline" size="sm" onClick={() => navigate("/product-setup")} className="gap-1.5 text-xs"><X size={13} /> Exit</Button></div><section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 shadow-sm p-5"><label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">Find a style to manage</label><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by style ID, description or brand..." className="h-10 pl-9 text-sm" /></div><div className="mt-3 border border-slate-100 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">{filtered.map(item => <button type="button" key={item.styleCode} onClick={() => selectProduct(item)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-primary/5 transition-colors", product?.styleCode === item.styleCode && "bg-primary/5")}><div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center"><Package size={14} /></div><div className="min-w-0 flex-1"><p className="text-[10px] font-mono text-primary">{item.styleCode}</p><p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{item.description}</p><p className="text-[10px] text-slate-400">{item.brand} · {item.category}</p></div><span className="text-[10px] text-primary font-semibold">Select</span></button>)}{!filtered.length && <p className="p-5 text-center text-xs text-slate-400">No styles found.</p>}</div></section>{product ? <><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Selected style</p><StyleContext product={product} /></div><div><p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">What would you like to manage?</p><div className="grid md:grid-cols-3 gap-3">{ACTIONS.map(item => { const Icon = item.icon; return <button type="button" key={item.id} onClick={() => setAction(item.id)} className="group text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"><div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors"><Icon size={16} /></div><p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</p><p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{item.description}</p><span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary mt-4">Open task <ArrowLeft size={11} className="rotate-180" /></span></button>; })}</div></div></> : <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center"><Package size={26} className="mx-auto text-slate-300 mb-2" /><p className="text-xs font-semibold text-slate-600">Select a style to see available management tasks.</p></div>}</div></MainLayout>;
}