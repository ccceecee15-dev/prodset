import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Boxes, Check, CircleCheck, CloudUpload, Eye, FileImage, Info,
  Loader2, PackagePlus, Plus, RefreshCcw, Trash2, Upload, X,
} from "lucide-react";
import type { InnerPack, PLCStatus, ProductImage } from "./productSetupLegacyData";

const PLC_STATUSES: PLCStatus[] = ["Current", "EOL", "Clearance"];

const SAMPLE_IMAGES: ProductImage[] = [
  {
    id: "sample-front",
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=720&q=85",
    filename: "sample-product-front.jpg",
    size: "2.0 MB",
  },
  {
    id: "sample-detail",
    src: "https://images.unsplash.com/photo-1524678606370-a47ad25cb82a?auto=format&fit=crop&w=720&q=85",
    filename: "sample-product-detail.jpg",
    size: "1.6 MB",
  },
  {
    id: "sample-packaging",
    src: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=720&q=85",
    filename: "sample-packaging.jpg",
    size: "1.8 MB",
  },
];

function statusClass(status: PLCStatus) {
  if (status === "Clearance") return "bg-amber-100 text-amber-700 border-amber-200";
  if (status === "EOL") return "bg-slate-100 text-slate-600 border-slate-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

function EnhancementHeader({ icon, title, description, action }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      {action}
    </div>
  );
}

function EnhancementCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={cn(
      "rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm shadow-sm overflow-hidden",
      className,
    )}>
      {children}
    </section>
  );
}

function ChangeStatusDialog({ open, onOpenChange, styleCode, sku, currentStatus, onUpdate }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  styleCode: string;
  sku: string;
  currentStatus: PLCStatus;
  onUpdate: (status: PLCStatus) => void;
}) {
  const [newStatus, setNewStatus] = useState<PLCStatus>(currentStatus);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setNewStatus(currentStatus);
      setSaving(false);
      setSaved(false);
    }
  }, [open, currentStatus]);

  const handleUpdate = async () => {
    if (newStatus === currentStatus) return;
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 700));
    onUpdate(newStatus);
    setSaving(false);
    setSaved(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <RefreshCcw className="h-4 w-4 text-violet-600" />
            Change PLC Status
          </DialogTitle>
          <DialogDescription className="text-xs">
            Update the Style Master lifecycle state for this existing product.
          </DialogDescription>
        </DialogHeader>

        {saved ? (
          <div className="py-6 text-center">
            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CircleCheck size={23} />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">PLC status updated</p>
            <p className="text-xs text-slate-500 mt-1">The Style Master now shows {newStatus}.</p>
            <Button size="sm" className="mt-5 text-xs" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">Style / Product</span>
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">{styleCode}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">SKU</span>
                <span className="font-mono text-xs text-slate-600 dark:text-slate-300">{sku}</span>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400">Current PLC Status</span>
                <Badge className={cn("text-[10px] border", statusClass(currentStatus))}>{currentStatus}</Badge>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">New PLC Status</label>
              <Select value={newStatus} onValueChange={value => setNewStatus(value as PLCStatus)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLC_STATUSES.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-slate-400 mt-1.5">This is a mocked future Style Master status API action.</p>
            </div>

            <DialogFooter className="gap-2 sm:justify-end">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button size="sm" className="text-xs gap-1.5" disabled={saving || newStatus === currentStatus} onClick={handleUpdate}>
                {saving ? <><Loader2 size={12} className="animate-spin" /> Updating…</> : <><Check size={12} /> Update Status</>}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function UploadImagesDialog({ open, onOpenChange, onUpload }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (images: ProductImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    if (open) {
      setSelected([]);
      setUploading(false);
      setUploaded(false);
    }
  }, [open]);

  const addImages = (images: ProductImage[]) => {
    setSelected(prev => [...prev, ...images.filter(image => !prev.some(existing => existing.filename === image.filename))]);
    setUploaded(false);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    addImages(Array.from(files).map((file, index) => ({
      id: `upload-${Date.now()}-${index}`,
      src: URL.createObjectURL(file),
      filename: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    })));
  };

  const handleUpload = async () => {
    if (!selected.length) return;
    setUploading(true);
    await new Promise(resolve => setTimeout(resolve, 950));
    onUpload(selected.map(image => ({ ...image, uploadedAt: "Today" })));
    setUploading(false);
    setUploaded(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CloudUpload className="h-4 w-4 text-primary" />
            Upload product images
          </DialogTitle>
          <DialogDescription className="text-xs">
            Add internal reference images for buyers and merchandise teams. These are not ecommerce publishing assets.
          </DialogDescription>
        </DialogHeader>

        {uploaded ? (
          <div className="py-7 text-center">
            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CircleCheck size={23} />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{selected.length} image{selected.length !== 1 ? "s" : ""} added</p>
            <p className="text-xs text-slate-500 mt-1">Images are ready for internal product reference.</p>
            <Button size="sm" className="mt-5 text-xs" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        ) : (
          <>
            <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={event => handleFiles(event.target.files)} />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full py-6 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/25 bg-primary/5 hover:bg-primary/10 hover:border-primary/45 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-sm text-primary flex items-center justify-center">
                <Upload size={18} />
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Select images</span>
              <span className="text-[11px] text-slate-400">Choose one or more files from your device</span>
            </button>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Preview selected</p>
                <p className="text-[10px] text-slate-400">{selected.length} selected</p>
              </div>
              {selected.length > 0 ? (
                <div className="grid grid-cols-4 gap-2">
                  {selected.map(image => (
                    <div key={image.id} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50">
                      <img src={image.src} alt={image.filename} className="w-full h-20 object-cover" />
                      <button type="button" onClick={() => setSelected(prev => prev.filter(item => item.id !== image.id))} className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80">
                        <X size={10} />
                      </button>
                      <p className="px-1.5 py-1 text-[9px] text-slate-500 truncate">{image.filename}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-700 py-5 text-center">
                  <FileImage size={19} className="mx-auto text-slate-300 mb-1" />
                  <p className="text-[11px] text-slate-400">Your image previews will appear here</p>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Or use mock product images</span>
                <div className="h-px bg-slate-100 dark:bg-slate-800 flex-1" />
              </div>
              <div className="flex gap-2">
                {SAMPLE_IMAGES.map(image => (
                  <button key={image.id} type="button" onClick={() => addImages([{ ...image, id: `${image.id}-${Date.now()}` }])} className="flex-1 group text-left">
                    <img src={image.src} alt="" className="w-full h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700 group-hover:border-primary/50 transition-colors" />
                    <span className="text-[9px] text-slate-400 group-hover:text-primary flex items-center gap-1 mt-1"><Plus size={9} /> Add sample</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-[10px] text-slate-500">
              <Info size={13} className="text-primary mt-0.5 flex-shrink-0" />
              <span>Images are automatically optimized for internal product reference. No strict resolution or file-size standard is required for this prototype.</span>
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <span className="text-[10px] text-slate-400 italic">Mock image storage action</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button size="sm" className="text-xs gap-1.5" disabled={!selected.length || uploading} onClick={handleUpload}>
                  {uploading ? <><Loader2 size={12} className="animate-spin" /> Optimizing…</> : <><CloudUpload size={12} /> Upload {selected.length ? `(${selected.length})` : ""}</>}
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AddPackDialog({ open, onOpenChange, styleCode, sku, onCreate }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  styleCode: string;
  sku: string;
  onCreate: (pack: InnerPack) => void;
}) {
  const [packUpc, setPackUpc] = useState("050123456789");
  const [orderMultiple, setOrderMultiple] = useState("6");
  const [unitsPerPack, setUnitsPerPack] = useState("6");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (open) {
      setPackUpc("050123456789");
      setOrderMultiple("6");
      setUnitsPerPack("6");
      setSaving(false);
      setSaved(false);
    }
  }, [open]);

  const valid = /^\d{12,14}$/.test(packUpc) && Number(orderMultiple) > 0 && Number(unitsPerPack) > 0;

  const handleCreate = async () => {
    if (!valid) return;
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 750));
    onCreate({
      id: `pack-${Date.now()}`,
      packUpc,
      orderMultiple: Number(orderMultiple),
      unitsPerPack: Number(unitsPerPack),
      status: "Active",
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <PackagePlus className="h-4 w-4 text-orange-600" />
            Add Inner Pack
          </DialogTitle>
          <DialogDescription className="text-xs">
            Create a separate Pack UPC relationship against this existing SKU.
          </DialogDescription>
        </DialogHeader>
        {saved ? (
          <div className="py-6 text-center">
            <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CircleCheck size={23} />
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Pack UPC created</p>
            <p className="text-xs text-slate-500 mt-1">{packUpc} is now active for {sku}.</p>
            <Button size="sm" className="mt-5 text-xs" onClick={() => onOpenChange(false)}>Done</Button>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-3 space-y-2">
              <div className="flex items-center justify-between"><span className="text-[11px] text-slate-400">Style</span><span className="font-mono text-xs text-slate-700 dark:text-slate-200">{styleCode}</span></div>
              <div className="flex items-center justify-between"><span className="text-[11px] text-slate-400">SKU</span><span className="font-mono text-xs text-slate-700 dark:text-slate-200">{sku}</span></div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Pack UPC</label>
                <Input value={packUpc} onChange={event => setPackUpc(event.target.value.replace(/\D/g, "").slice(0, 14))} className="h-9 text-sm font-mono" placeholder="050123456789" />
                <p className="text-[11px] text-slate-400 mt-1">12–14 digit pack barcode</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Order Multiple</label>
                  <Input type="number" min="1" value={orderMultiple} onChange={event => setOrderMultiple(event.target.value)} className="h-9 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">Units per Pack</label>
                  <Input type="number" min="1" value={unitsPerPack} onChange={event => setUnitsPerPack(event.target.value)} className="h-9 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 text-[10px] text-orange-700 dark:text-orange-300">
              <Info size={13} className="mt-0.5 flex-shrink-0" />
              <span>This represents a separate future Pack UPC API operation; it is not part of initial SKU creation.</span>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button size="sm" className="text-xs gap-1.5" disabled={!valid || saving} onClick={handleCreate}>
                {saving ? <><Loader2 size={12} className="animate-spin" /> Creating…</> : <><Check size={12} /> Create Pack UPC</>}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function ProductImagesSection({
  images, onImagesChange,
}: {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}) {
  const { toast } = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<ProductImage | null>(null);

  const handleImagesChange = (newImages: ProductImage[]) => {
    onImagesChange([...images, ...newImages]);
    toast({ title: "Product images uploaded.", description: "Images are available for internal product reference." });
  };

  return (
    <>
      <EnhancementCard>
        <EnhancementHeader
          icon={<FileImage size={15} />}
          title="Images"
          description="Add product images for internal product reference. Images are automatically optimized for storage."
          action={<Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setUploadOpen(true)}><Plus size={13} /> Upload Images</Button>}
        />
        <div className="p-5">
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map(image => (
                <div key={image.id} className="group rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800/50">
                  <div className="relative">
                    <img src={image.src} alt={image.filename} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/35 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                      <button type="button" onClick={() => setPreviewImage(image)} className="p-2 rounded-full bg-white text-slate-700 shadow-sm hover:text-primary" title="Preview"><Eye size={14} /></button>
                      <button type="button" onClick={() => onImagesChange(images.filter(item => item.id !== image.id))} className="p-2 rounded-full bg-white text-red-600 shadow-sm hover:bg-red-50" title="Remove"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <div className="px-2.5 py-2">
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-200 truncate">{image.filename}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{image.size ?? "Optimized"}{image.uploadedAt ? ` · ${image.uploadedAt}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-7 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
              <FileImage size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-500">No images added yet.</p>
              <p className="text-[11px] text-slate-400 mt-1">Add reference images to support buying and ranging decisions.</p>
            </div>
          )}
          <p className="text-[10px] text-slate-400 mt-3 flex items-center gap-1"><Info size={11} /> Stored in the application image layer, separate from Aptos.</p>
        </div>
      </EnhancementCard>

      <UploadImagesDialog open={uploadOpen} onOpenChange={setUploadOpen} onUpload={handleImagesChange} />
      <Dialog open={!!previewImage} onOpenChange={open => !open && setPreviewImage(null)}>
        <DialogContent className="sm:max-w-2xl glass-card">
          <DialogHeader>
            <DialogTitle className="text-base">{previewImage?.filename}</DialogTitle>
            <DialogDescription className="text-xs">Internal product reference preview</DialogDescription>
          </DialogHeader>
          {previewImage && <img src={previewImage.src} alt={previewImage.filename} className="max-h-[65vh] w-full object-contain rounded-xl bg-slate-100 dark:bg-slate-800" />}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ProductSetupEnhancements({
  styleCode, sku, plcStatus, images, innerPacks, onStatusChange, onImagesChange, onPacksChange, showImages = true,
}: {
  styleCode: string;
  sku: string;
  plcStatus: PLCStatus;
  images: ProductImage[];
  innerPacks: InnerPack[];
  onStatusChange: (status: PLCStatus) => void;
  onImagesChange: (images: ProductImage[]) => void;
  onPacksChange: (packs: InnerPack[]) => void;
  showImages?: boolean;
}) {
  const { toast } = useToast();
  const [statusOpen, setStatusOpen] = useState(false);
  const [packOpen, setPackOpen] = useState(false);

  const handleStatusChange = (status: PLCStatus) => {
    onStatusChange(status);
    toast({ title: "PLC status updated successfully.", description: `${styleCode} is now ${status}.` });
  };

  const handlePackCreate = (pack: InnerPack) => {
    onPacksChange([...innerPacks, pack]);
    toast({ title: "Pack UPC created successfully.", description: `${pack.packUpc} is now linked to ${sku}.` });
  };

  return (
    <div className="space-y-4 mb-5 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-500">Existing style controls</span>
        <div className="h-px bg-violet-100 dark:bg-violet-900/40 flex-1" />
        <span className="text-[10px] text-slate-400">Style Master source of truth</span>
      </div>

      <EnhancementCard>
        <EnhancementHeader
          icon={<RefreshCcw size={15} />}
          title="PLC Status"
          description="Lifecycle status is managed after the style/SKU exists. Aptos Price Status is not used as the PLC source of truth."
          action={<Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50" onClick={() => setStatusOpen(true)}>Change Status</Button>}
        />
        <div className="p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Current PLC Status</p>
            <Badge className={cn("text-xs border px-2.5 py-1", statusClass(plcStatus))}>{plcStatus}</Badge>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-400">Style / SKU</p>
            <p className="font-mono text-xs text-slate-600 dark:text-slate-300">{styleCode} · {sku}</p>
          </div>
        </div>
      </EnhancementCard>

      {showImages && <ProductImagesSection images={images} onImagesChange={onImagesChange} />}

      <EnhancementCard>
        <EnhancementHeader
          icon={<Boxes size={15} />}
          title="Logistics · Inner Packs"
          description="Pack configurations can be added after the existing SKU/style is created."
          action={<Button size="sm" className="h-8 text-xs gap-1.5 bg-orange-600 hover:bg-orange-700" onClick={() => setPackOpen(true)}><Plus size={13} /> Add Pack UPC</Button>}
        />
        <div className="p-5">
          {innerPacks.length > 0 ? (
            <div className="space-y-2">
              {innerPacks.map(pack => (
                <div key={pack.id} className="grid grid-cols-[1.4fr_1fr_1fr_80px] gap-3 items-center px-3.5 py-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                  <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">Pack UPC</p><p className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{pack.packUpc}</p></div>
                  <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">Order Multiple</p><p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{pack.orderMultiple}</p></div>
                  <div><p className="text-[10px] text-slate-400 uppercase tracking-wider">Units / Pack</p><p className="text-xs font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{pack.unitsPerPack}</p></div>
                  <Badge className={cn("text-[10px] border justify-center", pack.status === "Active" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200")}>{pack.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-7 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
              <Boxes size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium text-slate-500">No pack UPCs have been configured for this SKU.</p>
              <p className="text-[11px] text-slate-400 mt-1">The product can still be sold as individual units.</p>
            </div>
          )}
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400"><Info size={11} /> Future Pack UPC API → Aptos · SKU {sku}</div>
        </div>
      </EnhancementCard>

      <ChangeStatusDialog open={statusOpen} onOpenChange={setStatusOpen} styleCode={styleCode} sku={sku} currentStatus={plcStatus} onUpdate={handleStatusChange} />
      <AddPackDialog open={packOpen} onOpenChange={setPackOpen} styleCode={styleCode} sku={sku} onCreate={handlePackCreate} />
    </div>
  );
}