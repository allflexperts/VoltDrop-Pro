import { useState, useEffect } from "react";
import { Zap, FileText, Download, X, History, Trash2, Clock, FolderOpen, Plus, Edit2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { jsPDF } from "jspdf";
import { usePWA } from "@/hooks/use-pwa";
import iconImage from "@assets/generated_images/Yellow_lightning_bolt_app_icon_2d72ab5f.png";

const WIRE_SIZES = [
  { awg: "14", area: 2.08, copperOhms: 3.07, aluminumOhms: 5.06, conduitArea: 0.0135 },
  { awg: "12", area: 3.31, copperOhms: 1.93, aluminumOhms: 3.18, conduitArea: 0.0172 },
  { awg: "10", area: 5.26, copperOhms: 1.21, aluminumOhms: 1.99, conduitArea: 0.0211 },
  { awg: "8", area: 8.37, copperOhms: 0.764, aluminumOhms: 1.26, conduitArea: 0.0366 },
  { awg: "6", area: 13.3, copperOhms: 0.491, aluminumOhms: 0.808, conduitArea: 0.0507 },
  { awg: "4", area: 21.2, copperOhms: 0.308, aluminumOhms: 0.508, conduitArea: 0.0824 },
  { awg: "3", area: 26.7, copperOhms: 0.245, aluminumOhms: 0.403, conduitArea: 0.0973 },
  { awg: "2", area: 33.6, copperOhms: 0.194, aluminumOhms: 0.319, conduitArea: 0.1158 },
  { awg: "1", area: 42.4, copperOhms: 0.154, aluminumOhms: 0.253, conduitArea: 0.1562 },
  { awg: "1/0", area: 53.5, copperOhms: 0.122, aluminumOhms: 0.201, conduitArea: 0.1855 },
  { awg: "2/0", area: 67.4, copperOhms: 0.0967, aluminumOhms: 0.159, conduitArea: 0.2223 },
  { awg: "3/0", area: 85.0, copperOhms: 0.0766, aluminumOhms: 0.126, conduitArea: 0.2679 },
  { awg: "4/0", area: 107, copperOhms: 0.0608, aluminumOhms: 0.100, conduitArea: 0.3237 },
];

const CONDUIT_TYPES = [
  { type: "EMT", name: "EMT (Electrical Metallic Tubing)", sizes: [
    { size: "1/2", area: 0.304 },
    { size: "3/4", area: 0.533 },
    { size: "1", area: 0.864 },
    { size: "1-1/4", area: 1.496 },
    { size: "1-1/2", area: 2.036 },
    { size: "2", area: 3.356 },
  ]},
  { type: "PVC", name: "PVC Schedule 40", sizes: [
    { size: "1/2", area: 0.285 },
    { size: "3/4", area: 0.508 },
    { size: "1", area: 0.832 },
    { size: "1-1/4", area: 1.453 },
    { size: "1-1/2", area: 1.986 },
    { size: "2", area: 3.291 },
  ]},
  { type: "RMC", name: "RMC (Rigid Metal Conduit)", sizes: [
    { size: "1/2", area: 0.314 },
    { size: "3/4", area: 0.549 },
    { size: "1", area: 0.887 },
    { size: "1-1/4", area: 1.526 },
    { size: "1-1/2", area: 2.071 },
    { size: "2", area: 3.408 },
  ]},
];

interface CalculationResult {
  voltageDrop: number;
  voltageDropPercent: number;
  passes: boolean;
  recommendedGauge?: string;
}

interface HistoryItem {
  id: string;
  timestamp: number;
  projectId?: string;
  name?: string;
  inputs: {
    amps: string;
    distance: string;
    wireSize: string;
    voltage: string;
    phase: "1" | "3";
    material: "copper" | "aluminum";
  };
  result: CalculationResult;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
}

const HISTORY_KEY = "voltdrop_history";
const PROJECTS_KEY = "voltdrop_projects";

const saveToHistory = (item: HistoryItem) => {
  const history = getHistory();
  history.unshift(item);
  const trimmedHistory = history.slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
};

const getHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const deleteHistoryItem = (id: string) => {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
};

const clearHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
};

const getProjects = (): Project[] => {
  try {
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveProject = (project: Project) => {
  const projects = getProjects();
  const existingIndex = projects.findIndex(p => p.id === project.id);
  if (existingIndex >= 0) {
    projects[existingIndex] = project;
  } else {
    projects.push(project);
  }
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
};

const deleteProject = (projectId: string) => {
  const projects = getProjects().filter(p => p.id !== projectId);
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  
  const history = getHistory().filter(item => item.projectId !== projectId);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
};

export default function Calculator() {
  const [amps, setAmps] = useState("");
  const [distance, setDistance] = useState("");
  const [wireSize, setWireSize] = useState("");
  const [voltage, setVoltage] = useState("");
  const [phase, setPhase] = useState<"1" | "3">("1");
  const [material, setMaterial] = useState<"copper" | "aluminum">("copper");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showProjects, setShowProjects] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [showConduitFill, setShowConduitFill] = useState(false);
  const [conduitType, setConduitType] = useState("EMT");
  const [conduitSize, setConduitSize] = useState("");
  const [conductorCount, setConductorCount] = useState("");
  const [conduitFillResult, setConduitFillResult] = useState<{fillPercent: number; passes: boolean; recommendedSize?: string} | null>(null);
  
  const { isInstallable, isOnline, install } = usePWA();

  useEffect(() => {
    setHistory(getHistory());
    setProjects(getProjects());
  }, []);

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      setShowInstallBanner(false);
    }
  };

  const calculateVoltageDrop = (auto = false) => {
    if (!amps || !distance || !wireSize || !voltage) return;

    const wire = WIRE_SIZES.find((w) => w.awg === wireSize);
    if (!wire) return;

    const current = parseFloat(amps);
    const length = parseFloat(distance);
    const systemVoltage = parseFloat(voltage);
    const resistance = material === "copper" ? wire.copperOhms : wire.aluminumOhms;

    const K = phase === "1" ? 2 : 1.732;
    const vd = (K * current * resistance * length) / 1000;
    const vdPercent = (vd / systemVoltage) * 100;
    const passes = vdPercent <= 3;

    let recommendedGauge: string | undefined;
    if (!passes) {
      for (const w of WIRE_SIZES) {
        const r = material === "copper" ? w.copperOhms : w.aluminumOhms;
        const testVd = (K * current * r * length) / 1000;
        const testVdPercent = (testVd / systemVoltage) * 100;
        if (testVdPercent <= 3) {
          recommendedGauge = w.awg;
          break;
        }
      }
    }

    const calculationResult = {
      voltageDrop: vd,
      voltageDropPercent: vdPercent,
      passes,
      recommendedGauge,
    };

    setResult(calculationResult);

    if (!auto) {
      const historyItem: HistoryItem = {
        id: `calc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        projectId: currentProjectId || undefined,
        inputs: { amps, distance, wireSize, voltage, phase, material },
        result: calculationResult,
      };
      saveToHistory(historyItem);
      setHistory(getHistory());
    }
  };

  const restoreFromHistory = (item: HistoryItem) => {
    setAmps(item.inputs.amps);
    setDistance(item.inputs.distance);
    setWireSize(item.inputs.wireSize);
    setVoltage(item.inputs.voltage);
    setPhase(item.inputs.phase);
    setMaterial(item.inputs.material);
    setResult(item.result);
    setShowHistory(false);
    if (item.projectId) {
      setCurrentProjectId(item.projectId);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    deleteHistoryItem(id);
    setHistory(getHistory());
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    const project: Project = {
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newProjectName.trim(),
      createdAt: Date.now(),
    };
    saveProject(project);
    setProjects(getProjects());
    setCurrentProjectId(project.id);
    setNewProjectName("");
  };

  const handleRenameProject = (projectId: string) => {
    if (!editingProjectName.trim()) return;
    const project = projects.find(p => p.id === projectId);
    if (project) {
      saveProject({ ...project, name: editingProjectName.trim() });
      setProjects(getProjects());
    }
    setEditingProjectId(null);
    setEditingProjectName("");
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProject(projectId);
    setProjects(getProjects());
    setHistory(getHistory());
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
    }
  };

  const getProjectCalculations = (projectId: string) => {
    return history.filter(item => item.projectId === projectId);
  };

  const getCurrentProject = () => {
    return projects.find(p => p.id === currentProjectId);
  };

  const calculateConduitFill = () => {
    if (!wireSize || !conduitSize || !conductorCount) return;
    
    const wire = WIRE_SIZES.find(w => w.awg === wireSize);
    const conduitTypeData = CONDUIT_TYPES.find(ct => ct.type === conduitType);
    const conduitData = conduitTypeData?.sizes.find(s => s.size === conduitSize);
    
    if (!wire || !conduitData) return;
    
    const count = parseFloat(conductorCount);
    const totalWireArea = wire.conduitArea * count;
    const fillPercent = (totalWireArea / conduitData.area) * 100;
    const passes = fillPercent <= 40;
    
    let recommendedSize: string | undefined;
    if (!passes && conduitTypeData) {
      for (const size of conduitTypeData.sizes) {
        const testFill = (totalWireArea / size.area) * 100;
        if (testFill <= 40) {
          recommendedSize = size.size;
          break;
        }
      }
    }
    
    setConduitFillResult({ fillPercent, passes, recommendedSize });
  };

  useEffect(() => {
    if (amps && distance && wireSize && voltage) {
      calculateVoltageDrop(true);
    }
  }, [amps, distance, wireSize, voltage, phase, material]);

  const exportToPDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    
    doc.setFillColor(255, 255, 0);
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("VoltDrop Pro", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Professional Voltage Drop Calculation", 105, 28, { align: "center" });
    doc.text("VoltDrop Pro", 190, 35, { align: "right" });
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Calculation Results", 20, 55);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const wire = WIRE_SIZES.find((w) => w.awg === wireSize);
    
    doc.text(`Wire Size: ${wireSize} AWG`, 20, 70);
    doc.text(`Material: ${material.charAt(0).toUpperCase() + material.slice(1)}`, 20, 78);
    doc.text(`Current: ${amps} Amps`, 20, 86);
    doc.text(`Distance: ${distance} feet`, 20, 94);
    doc.text(`Voltage: ${voltage}V`, 20, 102);
    doc.text(`Phase: ${phase === "1" ? "Single Phase" : "Three Phase"}`, 20, 110);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Results", 20, 130);
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Voltage Drop: ${result.voltageDrop.toFixed(2)} V`, 20, 142);
    doc.text(`Voltage Drop: ${result.voltageDropPercent.toFixed(2)}%`, 20, 150);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    if (result.passes) {
      doc.setTextColor(16, 185, 129);
      doc.text("✓ NEC 310.16 COMPLIANT (≤3%)", 20, 165);
    } else {
      doc.setTextColor(239, 68, 68);
      doc.text("✗ NEC 310.16 NON-COMPLIANT (>3%)", 20, 165);
      if (result.recommendedGauge) {
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.text(`Recommended Wire Size: ${result.recommendedGauge} AWG`, 20, 175);
      }
    }
    
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 280);
    doc.text("VoltDrop Pro - Professional Electrical Calculations", 105, 287, { align: "center" });
    
    doc.save(`voltage-drop-calculation-${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-background">
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-primary text-primary-foreground px-4 py-2 text-center text-sm font-medium z-50 shadow-lg" data-testid="banner-offline">
          <Zap className="inline-block w-4 h-4 mr-1 -mt-1" />
          Offline Mode - All features available
        </div>
      )}

      {isInstallable && showInstallBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground px-4 py-3 shadow-2xl z-50 border-t-4 border-black" data-testid="banner-install">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Zap className="w-5 h-5 flex-shrink-0" fill="currentColor" />
              <span className="font-medium text-sm sm:text-base">Install VoltDrop Pro for offline access</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-black text-primary hover:bg-black/90 font-bold"
                data-testid="button-install-pwa"
              >
                Install
              </Button>
              <Button
                onClick={() => setShowInstallBanner(false)}
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary-foreground hover:bg-black/20"
                data-testid="button-dismiss-install"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-primary border-b-4 border-black shadow-xl">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" fill="currentColor" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-primary-foreground tracking-tight" data-testid="text-app-title">
                VoltDrop Pro
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowProjects(!showProjects)}
              size="icon"
              variant="ghost"
              className="text-primary-foreground hover:bg-black/20"
              data-testid="button-toggle-projects"
            >
              <FolderOpen className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setShowHistory(!showHistory)}
              size="icon"
              variant="ghost"
              className="text-primary-foreground hover:bg-black/20"
              data-testid="button-toggle-history"
            >
              <History className="w-5 h-5" />
            </Button>
            <div className="hidden sm:block text-xs sm:text-sm font-medium text-primary-foreground" data-testid="text-branding">
              VoltDrop Pro
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Card className="border-l-4 border-l-primary shadow-2xl">
          <div className="p-6 sm:p-8">
            <div className="mb-6">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground mb-1">Voltage Drop Calculator</h2>
                  <p className="text-sm text-muted-foreground">
                    Calculate voltage drop and verify NEC 310.16 compliance
                  </p>
                </div>
                {currentProjectId && getCurrentProject() && (
                  <Badge className="bg-primary text-primary-foreground text-xs px-2 py-1" data-testid="badge-current-project">
                    <FolderOpen className="w-3 h-3 mr-1" />
                    {getCurrentProject()?.name}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amps" className="text-sm font-medium uppercase tracking-wide">
                    Current (Amps) <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="amps"
                    type="number"
                    placeholder="Enter amps"
                    value={amps}
                    onChange={(e) => setAmps(e.target.value)}
                    className="h-12 text-lg bg-input border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    data-testid="input-amps"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="distance" className="text-sm font-medium uppercase tracking-wide">
                    Distance (feet) <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="distance"
                    type="number"
                    placeholder="Enter distance"
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="h-12 text-lg bg-input border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    data-testid="input-distance"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voltage" className="text-sm font-medium uppercase tracking-wide">
                    Voltage (V) <span className="text-primary">*</span>
                  </Label>
                  <Input
                    id="voltage"
                    type="number"
                    placeholder="e.g., 120, 240"
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                    className="h-12 text-lg bg-input border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                    data-testid="input-voltage"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wireSize" className="text-sm font-medium uppercase tracking-wide">
                    Wire Size (AWG) <span className="text-primary">*</span>
                  </Label>
                  <Select value={wireSize} onValueChange={setWireSize}>
                    <SelectTrigger
                      id="wireSize"
                      className="h-12 text-lg bg-input border-2 border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                      data-testid="select-wire-size"
                    >
                      <SelectValue placeholder="Select wire size" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-2 border-popover-border">
                      {WIRE_SIZES.map((wire) => (
                        <SelectItem
                          key={wire.awg}
                          value={wire.awg}
                          className="text-lg hover:bg-accent focus:bg-accent"
                          data-testid={`option-wire-${wire.awg}`}
                        >
                          {wire.awg} AWG
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium uppercase tracking-wide">
                    Phase <span className="text-primary">*</span>
                  </Label>
                  <div className="flex gap-2 border-2 border-primary rounded-lg p-1">
                    <Button
                      type="button"
                      variant={phase === "1" ? "default" : "secondary"}
                      className={`flex-1 h-12 text-lg font-bold ${
                        phase === "1"
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-foreground hover:bg-secondary"
                      }`}
                      onClick={() => setPhase("1")}
                      data-testid="button-phase-1"
                    >
                      Single Phase
                    </Button>
                    <Button
                      type="button"
                      variant={phase === "3" ? "default" : "secondary"}
                      className={`flex-1 h-12 text-lg font-bold ${
                        phase === "3"
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-foreground hover:bg-secondary"
                      }`}
                      onClick={() => setPhase("3")}
                      data-testid="button-phase-3"
                    >
                      Three Phase
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium uppercase tracking-wide">
                    Material <span className="text-primary">*</span>
                  </Label>
                  <div className="flex gap-2 border-2 border-primary rounded-lg p-1">
                    <Button
                      type="button"
                      variant={material === "copper" ? "default" : "secondary"}
                      className={`flex-1 h-12 text-lg font-bold ${
                        material === "copper"
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-foreground hover:bg-secondary"
                      }`}
                      onClick={() => setMaterial("copper")}
                      data-testid="button-material-copper"
                    >
                      Copper
                    </Button>
                    <Button
                      type="button"
                      variant={material === "aluminum" ? "default" : "secondary"}
                      className={`flex-1 h-12 text-lg font-bold ${
                        material === "aluminum"
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-foreground hover:bg-secondary"
                      }`}
                      onClick={() => setMaterial("aluminum")}
                      data-testid="button-material-aluminum"
                    >
                      Aluminum
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => calculateVoltageDrop(false)}
                disabled={!amps || !distance || !wireSize || !voltage}
                className="w-full h-14 text-lg font-bold uppercase tracking-wide bg-gradient-to-r from-primary to-yellow-400 text-primary-foreground hover:scale-105 active:scale-95 transition-transform shadow-lg"
                data-testid="button-calculate"
              >
                <Zap className="w-5 h-5 mr-2" fill="currentColor" />
                Calculate Voltage Drop
              </Button>
            </div>
          </div>
        </Card>

        <Card className="mt-6 border-l-4 border-l-border shadow-xl">
          <div className="p-4 sm:p-6">
            <Button
              onClick={() => setShowConduitFill(!showConduitFill)}
              variant="ghost"
              className="w-full flex items-center justify-between hover:bg-accent"
              data-testid="button-toggle-conduit-fill"
            >
              <span className="font-semibold">Conduit Fill Calculator</span>
              {showConduitFill ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
            
            {showConduitFill && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase">Conduit Type</Label>
                    <Select value={conduitType} onValueChange={setConduitType}>
                      <SelectTrigger className="h-10 border-2" data-testid="select-conduit-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDUIT_TYPES.map(ct => (
                          <SelectItem key={ct.type} value={ct.type} data-testid={`option-conduit-type-${ct.type}`}>{ct.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase">Conduit Size</Label>
                    <Select value={conduitSize} onValueChange={setConduitSize}>
                      <SelectTrigger className="h-10 border-2" data-testid="select-conduit-size">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {CONDUIT_TYPES.find(ct => ct.type === conduitType)?.sizes.map(s => (
                          <SelectItem key={s.size} value={s.size} data-testid={`option-conduit-size-${s.size}`}>{s.size}"</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs uppercase">Conductors</Label>
                    <Input
                      type="number"
                      value={conductorCount}
                      onChange={e => setConductorCount(e.target.value)}
                      className="h-10 border-2"
                      placeholder="#"
                      data-testid="input-conductor-count"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={calculateConduitFill} className="w-full h-10 bg-primary" data-testid="button-calculate-conduit">
                      Calculate
                    </Button>
                  </div>
                </div>
                {conduitFillResult && (
                  <div className={`p-3 rounded border-2 ${conduitFillResult.passes ? 'bg-success/10 border-success' : 'bg-destructive/10 border-destructive'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{conduitFillResult.fillPercent.toFixed(1)}% Fill</span>
                      <Badge variant={conduitFillResult.passes ? 'default' : 'destructive'} className={conduitFillResult.passes ? 'bg-success' : ''} data-testid={conduitFillResult.passes ? 'badge-conduit-pass' : 'badge-conduit-fail'}>
                        {conduitFillResult.passes ? '✓ PASS (≤40%)' : '✗ FAIL (>40%)'}
                      </Badge>
                    </div>
                    {conduitFillResult.recommendedSize && (
                      <p className="text-sm mt-2">Recommended: {conduitFillResult.recommendedSize}" conduit</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {result && (
          <Card className="mt-6 border-l-4 border-l-primary shadow-2xl animate-in fade-in duration-300">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-center mb-6">
                <Badge
                  variant={result.passes ? "default" : "destructive"}
                  className={`text-xl font-bold uppercase px-6 py-3 rounded-full ${
                    result.passes
                      ? "bg-success text-success-foreground"
                      : "bg-destructive text-destructive-foreground"
                  }`}
                  data-testid={result.passes ? "badge-pass" : "badge-fail"}
                >
                  {result.passes ? "✓ NEC PASS" : "✗ NEC FAIL"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="bg-accent border-accent-border">
                  <div className="p-4 text-center">
                    <div className="text-4xl font-mono font-bold text-foreground" data-testid="text-voltage-drop-v">
                      {result.voltageDrop.toFixed(2)}
                    </div>
                    <div className="text-sm uppercase text-muted-foreground mt-1">Volts</div>
                  </div>
                </Card>

                <Card className="bg-accent border-accent-border">
                  <div className="p-4 text-center">
                    <div className="text-4xl font-mono font-bold text-foreground" data-testid="text-voltage-drop-percent">
                      {result.voltageDropPercent.toFixed(2)}%
                    </div>
                    <div className="text-sm uppercase text-muted-foreground mt-1">Drop</div>
                  </div>
                </Card>
              </div>

              {!result.passes && result.recommendedGauge && (
                <div
                  className="bg-primary/10 border-2 border-primary rounded-lg p-4 mb-6"
                  data-testid="alert-recommendation"
                >
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground mb-1">Recommended Wire Size</p>
                      <p className="text-foreground">
                        Use <span className="font-bold text-primary text-lg" data-testid="text-recommended-gauge">{result.recommendedGauge} AWG</span> or larger to
                        meet NEC 310.16 requirements (≤3% voltage drop)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={exportToPDF}
                variant="outline"
                className="w-full h-12 text-lg font-medium bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                data-testid="button-export-pdf"
              >
                <FileText className="w-5 h-5 mr-2" />
                Export PDF Quote
              </Button>
            </div>
          </Card>
        )}
      </main>

      <footer className="max-w-2xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-muted-foreground">
        <p>VoltDrop Pro - Professional Voltage Drop Calculator</p>
        <p className="mt-1">NEC 310.16 Compliance Verification</p>
      </footer>

      {showProjects && (
        <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" onClick={() => setShowProjects(false)} data-testid="overlay-projects">
          <div
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-background border-l-4 border-primary shadow-2xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
            data-testid="panel-projects"
          >
            <div className="flex flex-col h-full">
              <div className="bg-primary p-4 border-b-4 border-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-primary-foreground" />
                    <h2 className="text-xl font-bold text-primary-foreground">Projects</h2>
                  </div>
                  <Button
                    onClick={() => setShowProjects(false)}
                    size="icon"
                    variant="ghost"
                    className="text-primary-foreground hover:bg-black/20"
                    data-testid="button-close-projects"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="p-4 border-b border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="New project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateProject();
                      }
                    }}
                    className="flex-1 border-2 border-border"
                    data-testid="input-new-project"
                  />
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim()}
                    className="bg-primary text-primary-foreground"
                    data-testid="button-create-project"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-8 text-center">
                  <div>
                    <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No projects yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Create a project to organize your calculations</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-border">
                    <Button
                      onClick={() => setCurrentProjectId(null)}
                      variant={currentProjectId === null ? "default" : "outline"}
                      className={`w-full justify-start ${
                        currentProjectId === null
                          ? "bg-primary text-primary-foreground"
                          : "border-2 border-border hover:bg-accent"
                      }`}
                      data-testid="button-select-all"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      All Calculations
                      <Badge variant="secondary" className="ml-auto">
                        {history.filter(h => !h.projectId).length}
                      </Badge>
                    </Button>
                  </div>

                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-2">
                      {projects.map((project) => (
                        <Card
                          key={project.id}
                          className={`border-l-4 ${
                            currentProjectId === project.id
                              ? "border-l-primary bg-accent"
                              : "border-l-border hover-elevate"
                          }`}
                          data-testid={`project-${project.id}`}
                        >
                          <div className="p-3">
                            {editingProjectId === project.id ? (
                              <div className="flex gap-2">
                                <Input
                                  value={editingProjectName}
                                  onChange={(e) => setEditingProjectName(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleRenameProject(project.id);
                                    } else if (e.key === "Escape") {
                                      setEditingProjectId(null);
                                      setEditingProjectName("");
                                    }
                                  }}
                                  className="flex-1 h-8 border-2 border-border"
                                  autoFocus
                                  data-testid={`input-rename-${project.id}`}
                                />
                                <Button
                                  onClick={() => handleRenameProject(project.id)}
                                  size="icon"
                                  className="h-8 w-8 bg-primary text-primary-foreground"
                                  data-testid={`button-save-rename-${project.id}`}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(project.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Badge variant="secondary" className="text-xs">
                                    {getProjectCalculations(project.id).length}
                                  </Badge>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    onClick={() => setCurrentProjectId(project.id)}
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 h-8 text-xs border-2 border-border"
                                    data-testid={`button-select-${project.id}`}
                                  >
                                    {currentProjectId === project.id ? "Selected" : "Select"}
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      setEditingProjectId(project.id);
                                      setEditingProjectName(project.name);
                                    }}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground"
                                    data-testid={`button-edit-${project.id}`}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    onClick={() => handleDeleteProject(project.id)}
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    data-testid={`button-delete-project-${project.id}`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" onClick={() => setShowHistory(false)} data-testid="overlay-history">
          <div
            className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-background border-l-4 border-primary shadow-2xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
            data-testid="panel-history"
          >
            <div className="flex flex-col h-full">
              <div className="bg-primary p-4 border-b-4 border-black">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-foreground" />
                    <h2 className="text-xl font-bold text-primary-foreground">Calculation History</h2>
                  </div>
                  <Button
                    onClick={() => setShowHistory(false)}
                    size="icon"
                    variant="ghost"
                    className="text-primary-foreground hover:bg-black/20"
                    data-testid="button-close-history"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {(() => {
                const filteredHistory = currentProjectId 
                  ? history.filter(item => item.projectId === currentProjectId)
                  : history.filter(item => !item.projectId);
                
                return filteredHistory.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center p-8 text-center">
                    <div>
                      <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">No calculations yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {currentProjectId 
                          ? "No calculations in this project yet"
                          : "Your calculation history will appear here"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <ScrollArea className="flex-1">
                      <div className="p-4 space-y-3">
                        {filteredHistory.map((item) => {
                          const itemProject = item.projectId ? projects.find(p => p.id === item.projectId) : null;
                          return (
                          <Card
                            key={item.id}
                            className="border-l-4 border-l-primary hover-elevate cursor-pointer"
                            onClick={() => restoreFromHistory(item)}
                            data-testid={`history-item-${item.id}`}
                          >
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString()}
                                  </div>
                                  {itemProject && (
                                    <Badge variant="secondary" className="text-xs">
                                      <FolderOpen className="w-2 h-2 mr-1" />
                                      {itemProject.name}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant={item.result.passes ? "default" : "destructive"}
                                    className={`text-xs ${
                                      item.result.passes
                                        ? "bg-success text-success-foreground"
                                        : "bg-destructive text-destructive-foreground"
                                    }`}
                                  >
                                    {item.result.passes ? "✓ PASS" : "✗ FAIL"}
                                  </Badge>
                                  <span className="text-sm font-mono font-bold">
                                    {item.result.voltageDropPercent.toFixed(2)}%
                                  </span>
                                </div>
                              </div>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteHistoryItem(item.id);
                                }}
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                data-testid={`button-delete-${item.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Amps:</span> <span className="font-medium">{item.inputs.amps}A</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Distance:</span> <span className="font-medium">{item.inputs.distance}ft</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Wire:</span> <span className="font-medium">{item.inputs.wireSize} AWG</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Voltage:</span> <span className="font-medium">{item.inputs.voltage}V</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Phase:</span>{" "}
                                <span className="font-medium">{item.inputs.phase === "1" ? "1Ø" : "3Ø"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Material:</span>{" "}
                                <span className="font-medium">{item.inputs.material === "copper" ? "Cu" : "Al"}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                      })}
                    </div>
                  </ScrollArea>

                  <div className="p-4 border-t border-border">
                    <Button
                      onClick={handleClearHistory}
                      variant="outline"
                      className="w-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                      data-testid="button-clear-history"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear All History
                    </Button>
                  </div>
                </>
              );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
