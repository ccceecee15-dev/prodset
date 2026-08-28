import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompactFilterBar } from "@/components/filters/CompactFilterBar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  AlertCircle, 
  Plus, 
  X,
  Search,
  Filter,
  Save,
  ArrowLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const MERCH_AREAS = ["Electronics", "Accessories", "Stationery"];
const FORMATS = ["Flagship", "Standard", "Express"];
const GRADES = ["S", "M", "L", "XL", "Mega"];
const CHANNELS = ["All", "Retail", "Online"];
const REGIONS = ["All", "North", "South", "East", "West"];
const PROPERTIES = ["All", "Owned", "Leased"];
const TERMINALS = ["All", "T1", "T2", "T3"];
const ACTIONS = ["Exclude", "Force Include"];

const STYLES = [
  { id: "S-1001", desc: "Wireless Noise Cancelling Headphones", pg: "Audio" },
  { id: "S-1002", desc: "Bluetooth Portable Speaker", pg: "Audio" },
  { id: "S-2001", desc: "NextGen Smartphone Pro", pg: "Mobile" },
  { id: "S-2002", desc: "EcoTablet 10-inch", pg: "Computing" },
  { id: "S-3001", desc: "Smart Fitness Watch", pg: "Wearables" },
];

export default function StyleExceptionManagement() {
  const [, setLocation] = useLocation();
  const [merchArea, setMerchArea] = useState("electronics");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState(STYLES[0].id);
  const [exceptions, setExceptions] = useState<any[]>([
    { 
      id: 1, 
      styleId: "S-1001", 
      format: "Flagship", 
      grade: "L",
      channel: "Retail",
      region: "North",
      property: "Owned",
      terminal: "T1",
      action: "Exclude",
      status: true 
    }
  ]);

  const addException = () => {
    setExceptions(prev => [
      ...prev,
      { 
        id: Date.now(), 
        styleId: selectedStyleId, 
        format: FORMATS[0], 
        grade: "M",
        channel: "All",
        region: "All",
        property: "All",
        terminal: "All",
        action: "Exclude",
        status: true 
      }
    ]);
  };

  const removeException = (id: number) => {
    setExceptions(prev => prev.filter(e => e.id !== id));
  };

  const updateException = (id: number, field: string, value: any) => {
    setExceptions(prev => prev.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const filteredStyles = STYLES.filter(s => 
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const styleExceptions = useMemo(() => {
    return exceptions.filter(e => e.styleId === selectedStyleId);
  }, [exceptions, selectedStyleId]);

  const selectedStyle = useMemo(() => {
    return STYLES.find(s => s.id === selectedStyleId) || STYLES[0];
  }, [selectedStyleId]);

  return (
    <MainLayout>
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 -ml-2"
                onClick={() => setLocation("/rap/range-style")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Style Exception Management</h1>
            </div>
            <p className="text-sm text-slate-500">Manage style-level exceptions by format and store attributes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Save className="h-4 w-4" /> Save Changes
            </Button>
            <Button onClick={addException} className="gap-2">
              <Plus className="h-4 w-4" /> Add Exception
            </Button>
          </div>
        </div>

        <CompactFilterBar
          onApply={() => {}}
          onClear={() => setMerchArea("electronics")}
          fields={[
            { 
              id: "merch-area", 
              label: "Merchandise Area", 
              value: merchArea, 
              onChange: setMerchArea, 
              options: MERCH_AREAS.map(a => ({ value: a.toLowerCase(), label: a }))
            }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-4 rounded-xl shadow-sm h-fit">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Select Styles
              </CardTitle>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search styles..."
                  className="pl-9 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-2 space-y-1">
                  {filteredStyles.map(style => (
                    <div 
                      key={style.id}
                      onClick={() => setSelectedStyleId(style.id)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all group",
                        selectedStyleId === style.id 
                          ? "border-primary bg-primary/5 shadow-sm" 
                          : "border-transparent hover:border-primary/20 hover:bg-primary/5"
                      )}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={cn(
                          "text-[11px] font-mono font-bold",
                          selectedStyleId === style.id ? "text-primary" : "text-slate-500"
                        )}>
                          {style.id}
                        </span>
                        <Badge variant="outline" className="text-[9px] py-0 h-4">{style.pg}</Badge>
                      </div>
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2">{style.desc}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="lg:col-span-8 rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="h-4 w-4 text-primary" />
                <div>
                  <CardTitle className="text-sm font-bold">Exceptions for {selectedStyleId}</CardTitle>
                  <p className="text-[10px] text-slate-500 font-mono">{selectedStyle.desc}</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px] font-bold">
                {styleExceptions.length} Total
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="text-[10px] uppercase font-bold px-4">Style</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-4">Format</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-4">Grade</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-4">Action</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-4">Channel</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-4">Region</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-4">Property</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-4">Terminal</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-4">Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {styleExceptions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="h-40 text-center">
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <AlertCircle className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-xs italic">No exceptions for {selectedStyleId}. Click "Add Exception" to start.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      styleExceptions.map((exc) => (
                        <TableRow key={exc.id} className="group">
                          <TableCell className="px-4 py-3">
                            <span className="text-[11px] font-mono font-bold text-slate-500">{exc.styleId}</span>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Select 
                              value={exc.format} 
                              onValueChange={(v) => updateException(exc.id, "format", v)}
                            >
                              <SelectTrigger className="h-8 text-[11px] font-medium border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {FORMATS.map(f => (
                                  <SelectItem key={f} value={f} className="text-[11px]">{f}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Select 
                              value={exc.grade} 
                              onValueChange={(v) => updateException(exc.id, "grade", v)}
                            >
                              <SelectTrigger className="h-8 text-[11px] font-medium border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {GRADES.map(g => (
                                  <SelectItem key={g} value={g} className="text-[11px]">Grade {g}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Select 
                              value={exc.action} 
                              onValueChange={(v) => updateException(exc.id, "action", v)}
                            >
                              <SelectTrigger className={cn(
                                "h-8 text-[11px] font-bold border-none",
                                exc.action === "Exclude" ? "text-amber-600 bg-amber-50" : "text-emerald-600 bg-emerald-50"
                              )}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ACTIONS.map(a => (
                                  <SelectItem key={a} value={a} className={cn(
                                    "text-[11px] font-bold",
                                    a === "Exclude" ? "text-amber-600" : "text-emerald-600"
                                  )}>{a}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Select 
                              value={exc.channel} 
                              onValueChange={(v) => updateException(exc.id, "channel", v)}
                            >
                              <SelectTrigger className="h-8 text-[11px] font-medium border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CHANNELS.map(c => (
                                  <SelectItem key={c} value={c} className="text-[11px]">{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Select 
                              value={exc.region} 
                              onValueChange={(v) => updateException(exc.id, "region", v)}
                            >
                              <SelectTrigger className="h-8 text-[11px] font-medium border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {REGIONS.map(r => (
                                  <SelectItem key={r} value={r} className="text-[11px]">{r}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Select 
                              value={exc.property} 
                              onValueChange={(v) => updateException(exc.id, "property", v)}
                            >
                              <SelectTrigger className="h-8 text-[11px] font-medium border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PROPERTIES.map(p => (
                                  <SelectItem key={p} value={p} className="text-[11px]">{p}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Select 
                              value={exc.terminal} 
                              onValueChange={(v) => updateException(exc.id, "terminal", v)}
                            >
                              <SelectTrigger className="h-8 text-[11px] font-medium border-slate-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TERMINALS.map(t => (
                                  <SelectItem key={t} value={t} className="text-[11px]">{t}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Switch 
                                checked={exc.status}
                                onCheckedChange={(v) => updateException(exc.id, "status", v)}
                              />
                              <Badge className={cn(
                                "border-none text-[9px] font-bold",
                                exc.status ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                              )}>
                                {exc.status ? "ACTIVE" : "INACTIVE"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                              onClick={() => removeException(exc.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
