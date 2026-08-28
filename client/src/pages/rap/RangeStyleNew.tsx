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
  Search,
  Filter,
  Save,
  Package,
  Layers
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MERCH_AREAS = ["Electronics", "Accessories", "Stationery"];
const FORMATS = ["Flagship", "Standard", "Express", "Premium", "Core", "Local", "Travel"];
const STYLES = [
  { id: "S-1001", desc: "Wireless Noise Cancelling Headphones", pg: "Audio", spg: "Headphones", sales: 1.2, units: 8500 },
  { id: "S-1002", desc: "Bluetooth Portable Speaker", pg: "Audio", spg: "Speakers", sales: 0.8, units: 12000 },
  { id: "S-2001", desc: "NextGen Smartphone Pro", pg: "Mobile", spg: "Smartphones", sales: 4.5, units: 5000 },
  { id: "S-2002", desc: "EcoTablet 10-inch", pg: "Computing", spg: "Tablets", sales: 2.1, units: 3500 },
  { id: "S-3001", desc: "Smart Fitness Watch", pg: "Wearables", spg: "Smartphones", sales: 1.5, units: 9000 },
];

const ACTIVE_GRADES = ["S", "M", "L", "XL", "Mega"];

// Mock budget data for each format and grade
const GRADE_BUDGETS: Record<string, Record<string, number>> = {
  "Flagship": { "S": 50, "M": 100, "L": 150, "XL": 200, "Mega": 250 },
  "Standard": { "S": 30, "M": 60, "L": 90, "XL": 120, "Mega": 150 },
  "Express": { "S": 20, "M": 40, "L": 60, "XL": 80, "Mega": 100 },
  "Premium": { "S": 40, "M": 80, "L": 120, "XL": 160, "Mega": 200 },
  "Core": { "S": 25, "M": 50, "L": 75, "XL": 100, "Mega": 125 },
  "Local": { "S": 15, "M": 30, "L": 45, "XL": 60, "Mega": 75 },
  "Travel": { "S": 20, "M": 40, "L": 60, "XL": 80, "Mega": 100 },
};

export default function RangeStyleNew() {
  const [merchArea, setMerchArea] = useState("electronics");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyleId, setSelectedStyleId] = useState(STYLES[0].id);
  const [styleData, setStyleData] = useState<Record<string, Record<string, string>>>(
    STYLES.reduce((acc, style) => {
      acc[style.id] = FORMATS.reduce((fAcc, format) => {
        fAcc[format] = "M"; // Default grade
        return fAcc;
      }, {} as Record<string, string>);
      return acc;
    }, {} as Record<string, Record<string, string>>)
  );

  const selectedStyle = STYLES.find(s => s.id === selectedStyleId) || STYLES[0];

  const filteredStyles = STYLES.filter(s => 
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGradeChange = (format: string, grade: string) => {
    setStyleData(prev => ({
      ...prev,
      [selectedStyleId]: {
        ...prev[selectedStyleId],
        [format]: grade
      }
    }));
  };

  const counts = useMemo(() => {
    return STYLES.reduce((acc, style) => {
      const hasGrades = Object.values(styleData[style.id]).some(g => g !== "None");
      if (hasGrades) {
        acc.graded++;
      } else {
        acc.pending++;
      }
      return acc;
    }, { graded: 0, pending: 0 });
  }, [styleData]);

  return (
    <MainLayout>
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Range Style New</h1>
            <p className="text-sm text-slate-500">Configure style grades across all store formats</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Styles Configured</p>
              <p className="text-xl font-black tabular-nums text-slate-900 dark:text-slate-100">
                {counts.graded} <span className="text-xs font-medium text-slate-400">/ {STYLES.length}</span>
              </p>
            </div>
            <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending</p>
              <p className="text-xl font-black tabular-nums text-amber-500">
                {counts.pending}
              </p>
            </div>
            <Button variant="outline" className="gap-2 ml-2">
              <Save className="h-4 w-4" /> Save Configuration
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
          {/* Left Column: Style Selection */}
          <Card className="lg:col-span-4 rounded-xl shadow-sm h-fit">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                Select Style
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
              <ScrollArea className="h-[600px]">
                <div className="p-2 space-y-1">
                  {filteredStyles.map(style => (
                    <div 
                      key={style.id}
                      onClick={() => setSelectedStyleId(style.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all group ${
                        selectedStyleId === style.id 
                          ? "border-primary bg-primary/5 shadow-sm" 
                          : "border-transparent hover:border-primary/20 hover:bg-primary/5"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[11px] font-mono font-bold ${selectedStyleId === style.id ? "text-primary" : "text-slate-500"}`}>
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

          {/* Right Column: Format Matrix */}
          <Card className="lg:col-span-8 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedStyle.desc}</h3>
                    <p className="text-[11px] text-slate-500 font-mono">{selectedStyle.id} • {selectedStyle.pg} • {selectedStyle.spg}</p>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">
                  7 FORMATS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <ScrollArea className="h-[600px]">
                <Table>
                  <TableHeader className="bg-muted/30 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="text-[10px] uppercase font-bold px-6 h-10">Store Format</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-6 h-10 text-center">Current Grade</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-6 h-10 text-center">New Grade</TableHead>
                      <TableHead className="text-[10px] uppercase font-bold px-6 h-10 text-center">Allocated Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {FORMATS.map((format) => {
                      const currentGrade = styleData[selectedStyleId][format];
                      const budget = GRADE_BUDGETS[format]?.[currentGrade] || 0;
                      const allocatedCount = STYLES.filter(s => styleData[s.id][format] === currentGrade).length;
                      const isOverBudget = allocatedCount > budget && currentGrade !== "None";
                      const isAtBudget = allocatedCount === budget && currentGrade !== "None";

                      return (
                        <TableRow key={format} className="group hover:bg-muted/10 border-b">
                          <TableCell className="px-6 py-4">
                            <div className="font-bold text-sm text-slate-700">{format}</div>
                            <p className="text-[10px] text-slate-400">Apply range settings for {format} stores</p>
                          </TableCell>
                          <TableCell className="px-6 py-4 text-center">
                            <Badge variant="outline" className="font-mono text-[11px] bg-slate-50">
                              {currentGrade}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex justify-center">
                              <Select 
                                value={currentGrade} 
                                onValueChange={(v) => handleGradeChange(format, v)}
                              >
                                <SelectTrigger className="h-9 w-32 text-xs font-bold border-slate-200 focus:ring-primary shadow-sm bg-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ACTIVE_GRADES.map(grade => {
                                    const styleCount = STYLES.filter(s => styleData[s.id][format] === grade).length;
                                    const gradeBudget = GRADE_BUDGETS[format]?.[grade] || 0;
                                    return (
                                      <SelectItem key={grade} value={grade} className="text-xs font-bold">
                                        <div className="flex items-center justify-between w-full gap-2">
                                          <span>Grade {grade}</span>
                                          <div className="flex items-center gap-1 ml-auto">
                                            <Badge variant="secondary" className="text-[9px] h-3.5 px-1 bg-slate-100 text-slate-500 border-none">
                                              {styleCount}/{gradeBudget}
                                            </Badge>
                                          </div>
                                        </div>
                                      </SelectItem>
                                    );
                                  })}
                                  <SelectItem value="None" className="text-xs font-bold text-slate-400">
                                    Not Ranged
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-sm font-black tabular-nums",
                                  isOverBudget ? "text-red-500" : isAtBudget ? "text-emerald-600" : "text-slate-700"
                                )}>
                                  {currentGrade === "None" ? "-" : `${allocatedCount} / ${budget}`}
                                </span>
                              </div>
                              {currentGrade !== "None" && (
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-[9px] font-bold px-1.5 h-4 border-none",
                                    isOverBudget ? "bg-red-100 text-red-700" : isAtBudget ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                                  )}
                                >
                                  {isOverBudget ? "ABOVE BUDGET" : isAtBudget ? "AT BUDGET" : "WITHIN BUDGET"}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                
                <div className="p-6 bg-slate-50/50 border-t mt-auto">
                  <div className="flex gap-4 items-start">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 mb-1">Configuration Rule</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">
                        Setting a grade here will apply it as the default for all stores within the format. 
                        Individual store exceptions can still be managed in the Style Exceptions screen.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
