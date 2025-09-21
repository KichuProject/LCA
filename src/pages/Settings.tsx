import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Database, Calculator, FileBarChart, Palette, Settings as SettingsIcon, Zap, Globe, RefreshCw, BarChart3, Save, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  
  // Settings state with localStorage persistence
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('lcaSettings');
    return savedSettings ? JSON.parse(savedSettings) : {
      // Metal Database Settings
      databaseSource: 'ecoinvent',
      emissionUnits: 'kg_co2_kg',
      autoUpdateFactors: true,
      dataValidation: true,
      cacheProperties: true,
      uncertaintyTracking: false,
      
      // LCA Calculation Settings
      impactMethod: 'recipe',
      systemBoundary: 'cradle_gate',
      impactCategories: {
        climateChange: true,
        acidification: true,
        eutrophication: false,
        ozoneDepletion: false,
        photochemicalOxidation: false,
        abioticDepletion: true,
        humanToxicity: false,
        ecotoxicity: false
      },
      realtimeCalculations: true,
      showUncertainty: false,
      monteCarloSimulations: false,
      normalizeResults: true,
      
      // Report Settings
      defaultReportFormat: 'pdf',
      chartResolution: 'high',
      reportContent: {
        executiveSummary: true,
        detailedCalculations: true,
        sankeyDiagrams: true,
        impactBreakdown: true,
        dataSources: true,
        methodologyNotes: false,
        assumptionsList: false,
        recommendations: true
      },
      visualizationSettings: {
        includeComparisons: true,
        showContribution: true,
        addTrendAnalysis: false
      },
      
      // Interface Settings
      theme: 'light',
      showUnitsInCharts: true,
      animateTransitions: true,
      compactLayout: false,
      decimalPlaces: 2,
      numberFormat: 'standard',
      
      // General Settings
      defaultCurrency: 'usd',
      language: 'english',
      autoSave: true,
      enableNotifications: true,
      cacheCalculations: true,
      trackUsageAnalytics: false
    };
  });

  const [databaseStatus, setDatabaseStatus] = useState({
    metalsLoaded: 67,
    emissionFactorsValidated: true,
    lastUpdated: '2 hours ago',
    status: 'connected'
  });

  // Save settings to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('lcaSettings', JSON.stringify(settings));
    
    // Apply theme changes to document
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply other UI settings
    if (settings.compactLayout) {
      document.body.classList.add('compact-layout');
    } else {
      document.body.classList.remove('compact-layout');
    }
  }, [settings]);

  const updateSetting = (path: string, value: any) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const refreshDatabase = async () => {
    toast({
      title: "Refreshing database...",
      description: "Updating metal emission factors from selected source.",
    });
    
    // Simulate database refresh
    setTimeout(() => {
      setDatabaseStatus(prev => ({
        ...prev,
        lastUpdated: 'Just now',
        status: 'updated'
      }));
      
      toast({
        title: "Database updated",
        description: "Metal emission factors have been refreshed successfully.",
      });
    }, 2000);
  };

  const clearCache = () => {
    localStorage.removeItem('lcaCalculationCache');
    toast({
      title: "Cache cleared",
      description: "All cached calculations have been removed.",
    });
  };

  const exportAllData = () => {
    const allData = {
      settings,
      calculationHistory: localStorage.getItem('lcaCalculationHistory'),
      reports: localStorage.getItem('lcaReports')
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `lca-app-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "All application data has been exported successfully.",
    });
  };

  const resetSettings = () => {
    localStorage.removeItem('lcaSettings');
    window.location.reload();
  };

  const handleSaveSettings = () => {
    // Settings are already saved to localStorage via useEffect
    toast({
      title: "Settings saved",
      description: "Your metal LCA preferences have been saved successfully.",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
          LCA Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Configure your Life Cycle Assessment preferences and metal database settings
        </p>
      </div>

      <Tabs defaultValue="metals" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="metals">Metal Database</TabsTrigger>
          <TabsTrigger value="calculations">LCA Calculations</TabsTrigger>
          <TabsTrigger value="reports">Reports & Export</TabsTrigger>
          <TabsTrigger value="appearance">Interface</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        {/* Metal Database Settings */}
        <TabsContent value="metals" className="space-y-6">
          <Card className="gradient-card shadow-eco">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Metal Database Configuration
              </CardTitle>
              <CardDescription>Manage emission factors, data sources, and metal properties</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Database Source</Label>
                  <Select value={settings.databaseSource} onValueChange={(value) => updateSetting('databaseSource', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecoinvent">Ecoinvent Database</SelectItem>
                      <SelectItem value="uslci">US LCI Database</SelectItem>
                      <SelectItem value="gabi">GaBi Professional</SelectItem>
                      <SelectItem value="idemat">IDEMAT Database</SelectItem>
                      <SelectItem value="custom">Custom Database</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Emission Factor Units</Label>
                  <Select value={settings.emissionUnits} onValueChange={(value) => updateSetting('emissionUnits', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg_co2_kg">kg CO2-eq / kg material</SelectItem>
                      <SelectItem value="g_co2_kg">g CO2-eq / kg material</SelectItem>
                      <SelectItem value="kg_co2_ton">kg CO2-eq / ton material</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Current Metal Database Status</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm font-medium">Primary Metals</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{databaseStatus.metalsLoaded} materials loaded</Badge>
                  </div>
                  <div className="p-3 bg-success/5 rounded-lg border border-success/20">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <span className="text-sm font-medium">Emission Factors</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {databaseStatus.emissionFactorsValidated ? 'All validated' : 'Validating...'}
                    </Badge>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Last Updated</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{databaseStatus.lastUpdated}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Database Management</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-update emission factors</span>
                    <Switch checked={settings.autoUpdateFactors} onCheckedChange={(value) => updateSetting('autoUpdateFactors', value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Validate data integrity</span>
                    <Switch checked={settings.dataValidation} onCheckedChange={(value) => updateSetting('dataValidation', value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cache metal properties</span>
                    <Switch checked={settings.cacheProperties} onCheckedChange={(value) => updateSetting('cacheProperties', value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Track data uncertainty</span>
                    <Switch checked={settings.uncertaintyTracking} onCheckedChange={(value) => updateSetting('uncertaintyTracking', value)} />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={refreshDatabase}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Database
                </Button>
                <Button variant="outline">
                  <Database className="w-4 h-4 mr-2" />
                  Import Custom Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LCA Calculations */}
        <TabsContent value="calculations" className="space-y-6">
          <Card className="gradient-card shadow-eco">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                LCA Calculation Settings
              </CardTitle>
              <CardDescription>Configure impact assessment methods and calculation boundaries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Impact Assessment Method</Label>
                  <Select value={settings.impactMethod} onValueChange={(value) => updateSetting('impactMethod', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recipe">ReCiPe 2016</SelectItem>
                      <SelectItem value="cml">CML-IA Baseline</SelectItem>
                      <SelectItem value="impact2002">IMPACT 2002+</SelectItem>
                      <SelectItem value="traci">TRACI 2.1</SelectItem>
                      <SelectItem value="ipcc">IPCC 2013 GWP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>System Boundary</Label>
                  <Select value={settings.systemBoundary} onValueChange={(value) => updateSetting('systemBoundary', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cradle_gate">Cradle-to-Gate</SelectItem>
                      <SelectItem value="cradle_grave">Cradle-to-Grave</SelectItem>
                      <SelectItem value="gate_gate">Gate-to-Gate</SelectItem>
                      <SelectItem value="cradle_cradle">Cradle-to-Cradle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Impact Categories</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Climate Change (GWP)</span>
                      <Switch checked={settings.impactCategories.climateChange} onCheckedChange={(value) => updateSetting('impactCategories.climateChange', value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Acidification Potential</span>
                      <Switch checked={settings.impactCategories.acidification} onCheckedChange={(value) => updateSetting('impactCategories.acidification', value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Eutrophication Potential</span>
                      <Switch checked={settings.impactCategories.eutrophication} onCheckedChange={(value) => updateSetting('impactCategories.eutrophication', value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ozone Depletion</span>
                      <Switch checked={settings.impactCategories.ozoneDepletion} onCheckedChange={(value) => updateSetting('impactCategories.ozoneDepletion', value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Photochemical Oxidation</span>
                      <Switch checked={settings.impactCategories.photochemicalOxidation} onCheckedChange={(value) => updateSetting('impactCategories.photochemicalOxidation', value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Abiotic Depletion</span>
                      <Switch checked={settings.impactCategories.abioticDepletion} onCheckedChange={(value) => updateSetting('impactCategories.abioticDepletion', value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Human Toxicity</span>
                      <Switch checked={settings.impactCategories.humanToxicity} onCheckedChange={(value) => updateSetting('impactCategories.humanToxicity', value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Ecotoxicity</span>
                      <Switch checked={settings.impactCategories.ecotoxicity} onCheckedChange={(value) => updateSetting('impactCategories.ecotoxicity', value)} />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Calculation Preferences</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Real-time calculations</span>
                    <Switch checked={settings.realtimeCalculations} onCheckedChange={(value) => updateSetting('realtimeCalculations', value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show uncertainty ranges</span>
                    <Switch checked={settings.showUncertainty} onCheckedChange={(value) => updateSetting('showUncertainty', value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monte Carlo simulations</span>
                    <Switch checked={settings.monteCarloSimulations} onCheckedChange={(value) => updateSetting('monteCarloSimulations', value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Normalize results</span>
                    <Switch checked={settings.normalizeResults} onCheckedChange={(value) => updateSetting('normalizeResults', value)} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports & Export */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="gradient-card shadow-eco">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileBarChart className="w-5 h-5 text-primary" />
                Reports & Export Settings
              </CardTitle>
              <CardDescription>Configure report generation and export preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Report Format</Label>
                  <Select value={settings.defaultReportFormat} onValueChange={(value) => updateSetting('defaultReportFormat', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                      <SelectItem value="excel">Excel Workbook</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                      <SelectItem value="csv">CSV Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Chart Resolution</Label>
                  <Select value={settings.chartResolution} onValueChange={(value) => updateSetting('chartResolution', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (72 DPI)</SelectItem>
                      <SelectItem value="high">High (300 DPI)</SelectItem>
                      <SelectItem value="print">Print Quality (600 DPI)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Report Content</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Executive summary</span>
                      <Switch checked={settings.reportContent.executiveSummary} onCheckedChange={(value) => updateSetting('reportContent.executiveSummary', value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Detailed calculations</span>
                      <Switch checked={settings.reportContent.detailedCalculations} onCheckedChange={(value) => updateSetting('reportContent.detailedCalculations', value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Sankey diagrams</span>
                      <Switch checked={settings.reportContent.sankeyDiagrams} onCheckedChange={(value) => updateSetting('reportContent.sankeyDiagrams', value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Impact breakdown</span>
                      <Switch checked={settings.reportContent.impactBreakdown} onCheckedChange={(value) => updateSetting('reportContent.impactBreakdown', value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Data sources</span>
                      <Switch checked={settings.reportContent.dataSources} onCheckedChange={(value) => updateSetting('reportContent.dataSources', value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Methodology notes</span>
                      <Switch checked={settings.reportContent.methodologyNotes} onCheckedChange={(value) => updateSetting('reportContent.methodologyNotes', value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Assumptions list</span>
                      <Switch checked={settings.reportContent.assumptionsList} onCheckedChange={(value) => updateSetting('reportContent.assumptionsList', value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Recommendations</span>
                      <Switch checked={settings.reportContent.recommendations} onCheckedChange={(value) => updateSetting('reportContent.recommendations', value)} />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Visualization Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include comparison charts</span>
                    <Switch checked={settings.visualizationSettings.includeComparisons} onCheckedChange={(value) => updateSetting('visualizationSettings.includeComparisons', value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Show contribution analysis</span>
                    <Switch checked={settings.visualizationSettings.showContribution} onCheckedChange={(value) => updateSetting('visualizationSettings.showContribution', value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Add trend analysis</span>
                    <Switch checked={settings.visualizationSettings.addTrendAnalysis} onCheckedChange={(value) => updateSetting('visualizationSettings.addTrendAnalysis', value)} />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save Template
                </Button>
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Preview Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Interface Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="gradient-card shadow-eco">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Interface & Display
              </CardTitle>
              <CardDescription>Customize the user interface and visualization preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Appearance Mode</Label>
                  <Select value={settings.theme} onValueChange={(value) => updateSetting('theme', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">☀️ Light Mode</SelectItem>
                      <SelectItem value="dark">🌙 Dark Mode</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Switch between light and dark theme with LCA green accents</p>
                </div>
                
                {/* Theme Preview */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">Current Theme Preview:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-primary/10 border border-primary/20 rounded text-center">
                      <div className="w-3 h-3 bg-primary rounded-full mx-auto mb-1"></div>
                      <span className="text-xs text-primary font-medium">LCA Green Accent</span>
                    </div>
                    <div className="p-3 bg-muted border rounded text-center">
                      <div className="w-3 h-3 bg-foreground rounded-full mx-auto mb-1"></div>
                      <span className="text-xs text-muted-foreground">{settings.theme === 'dark' ? 'Dark Background' : 'Light Background'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Display Preferences</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show units in charts</Label>
                      <p className="text-sm text-muted-foreground">Display measurement units on all visualizations</p>
                    </div>
                    <Switch checked={settings.showUnitsInCharts} onCheckedChange={(value) => updateSetting('showUnitsInCharts', value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Animate chart transitions</Label>
                      <p className="text-sm text-muted-foreground">Enable smooth animations for data changes</p>
                    </div>
                    <Switch checked={settings.animateTransitions} onCheckedChange={(value) => updateSetting('animateTransitions', value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Compact layout</Label>
                      <p className="text-sm text-muted-foreground">Reduce spacing for more data density</p>
                    </div>
                    <Switch checked={settings.compactLayout} onCheckedChange={(value) => updateSetting('compactLayout', value)} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Data Display</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Decimal Places</Label>
                    <Select value={settings.decimalPlaces.toString()} onValueChange={(value) => updateSetting('decimalPlaces', parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 decimal place</SelectItem>
                        <SelectItem value="2">2 decimal places</SelectItem>
                        <SelectItem value="3">3 decimal places</SelectItem>
                        <SelectItem value="4">4 decimal places</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Number Format</Label>
                    <Select value={settings.numberFormat} onValueChange={(value) => updateSetting('numberFormat', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard (1,234.56)</SelectItem>
                        <SelectItem value="scientific">Scientific (1.23e+3)</SelectItem>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <Card className="gradient-card shadow-eco">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-primary" />
                General Application Settings
              </CardTitle>
              <CardDescription>Configure general application behavior and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Select value={settings.defaultCurrency} onValueChange={(value) => updateSetting('defaultCurrency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="inr">INR (₹)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Español</SelectItem>
                      <SelectItem value="french">Français</SelectItem>
                      <SelectItem value="german">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Application Behavior</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-save data</Label>
                      <p className="text-sm text-muted-foreground">Automatically save your work every 5 minutes</p>
                    </div>
                    <Switch checked={settings.autoSave} onCheckedChange={(value) => updateSetting('autoSave', value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable notifications</Label>
                      <p className="text-sm text-muted-foreground">Show system notifications and alerts</p>
                    </div>
                    <Switch checked={settings.enableNotifications} onCheckedChange={(value) => updateSetting('enableNotifications', value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Cache calculations</Label>
                      <p className="text-sm text-muted-foreground">Store calculation results for faster loading</p>
                    </div>
                    <Switch checked={settings.cacheCalculations} onCheckedChange={(value) => updateSetting('cacheCalculations', value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Track usage analytics</Label>
                      <p className="text-sm text-muted-foreground">Help improve the application with usage data</p>
                    </div>
                    <Switch checked={settings.trackUsageAnalytics} onCheckedChange={(value) => updateSetting('trackUsageAnalytics', value)} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={clearCache}>
                    <Database className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" onClick={exportAllData}>
                    <Globe className="w-4 h-4 mr-2" />
                    Export All Data
                  </Button>
                  <Button variant="outline" onClick={resetSettings}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Settings
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSettings}>
                  <Save className="w-4 h-4 mr-2" />
                  Save All Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};export default Settings;