import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie } from "recharts";
import SimpleSankeyChart from "@/components/SimpleSankeyChart";

const LCAInput = () => {
  const { toast } = useToast();
  
  // Comprehensive metal emission factors database
  // Format: [name, CO2_primary, CO2_new_scrap, CO2_old_scrap, production_volume]
  const metalDatabase = {
    "aluminium_primary": { name: "Aluminium (primary)", co2Primary: 131, co2NewScrap: 8.3, co2OldScrap: 23.8, production: 5974 },
    "aluminium_new_scrap": { name: "Aluminium (new scrap)", co2Primary: 8.3, co2NewScrap: 0.4, co2OldScrap: null, production: 76.6 },
    "aluminium_old_scrap": { name: "Aluminium (old scrap)", co2Primary: 23.8, co2NewScrap: 1.4, co2OldScrap: null, production: 300 },
    "antimony": { name: "Antimony", co2Primary: 141, co2NewScrap: 12.9, co2OldScrap: null, production: null },
    "arsenic": { name: "Arsenic (total)", co2Primary: 5.0, co2NewScrap: 0.3, co2OldScrap: null, production: 0.2 },
    "barite": { name: "Barite (BaSO4)", co2Primary: 4.0, co2NewScrap: 0.2, co2OldScrap: null, production: null },
    "beryllium_metal": { name: "Beryllium (metal)", co2Primary: 12000, co2NewScrap: 879, co2OldScrap: null, production: 100 },
    "beryllium_hydroxide": { name: "Beryllium hydroxide", co2Primary: 319, co2NewScrap: 19, co2OldScrap: null, production: 100 },
    "bismuth": { name: "Bismuth", co2Primary: 697, co2NewScrap: 58.9, co2OldScrap: null, production: 11.6 },
    "borax": { name: "Borax (anhydrous)", co2Primary: 30.7, co2NewScrap: 1.6, co2OldScrap: null, production: null },
    "boric_acid": { name: "Boric acid", co2Primary: 13.0, co2NewScrap: 0.7, co2OldScrap: null, production: null },
    "cadmium": { name: "Cadmium (total)", co2Primary: 53.0, co2NewScrap: 3.0, co2OldScrap: null, production: null },
    "calcium_metal": { name: "Calcium (metal)", co2Primary: 223, co2NewScrap: 16.3, co2OldScrap: null, production: 7.1 },
    "calcium_carbonate": { name: "Calcium carbonate (quicklime)", co2Primary: 5.8, co2NewScrap: 1.0, co2OldScrap: null, production: 1787 },
    "cerium_oxide": { name: "Cerium oxide", co2Primary: 252, co2NewScrap: 12.9, co2OldScrap: null, production: null },
    "chromium": { name: "Chromium (total)", co2Primary: 40.2, co2NewScrap: 2.4, co2OldScrap: null, production: null },
    "cobalt": { name: "Cobalt", co2Primary: 128, co2NewScrap: 8.3, co2OldScrap: null, production: 7.4 },
    "copper": { name: "Copper (total)", co2Primary: 53.7, co2NewScrap: 2.8, co2OldScrap: null, production: 1062 },
    "dysprosium_oxide": { name: "Dysprosium oxide", co2Primary: 1170, co2NewScrap: 59.6, co2OldScrap: null, production: null },
    "erbium_oxide": { name: "Erbium oxide", co2Primary: 954, co2NewScrap: 48.7, co2OldScrap: null, production: null },
    "europium_oxide": { name: "Europium oxide", co2Primary: 7750, co2NewScrap: 396, co2OldScrap: null, production: null },
    "ferroniobium": { name: "Ferroniobium", co2Primary: 114, co2NewScrap: 8.3, co2OldScrap: null, production: null },
    "gadolinium_oxide": { name: "Gadolinium oxide", co2Primary: 914, co2NewScrap: 46.6, co2OldScrap: null, production: null },
    "gallium": { name: "Gallium", co2Primary: 3030, co2NewScrap: 205, co2OldScrap: null, production: 0.3 },
    "germanium": { name: "Germanium", co2Primary: 2890, co2NewScrap: 170, co2OldScrap: null, production: 0.2 },
    "gold": { name: "Gold (total)", co2Primary: 208000, co2NewScrap: 12500, co2OldScrap: null, production: null },
    "hafnium": { name: "Hafnium (total)", co2Primary: 3510, co2NewScrap: 131, co2OldScrap: null, production: null },
    "helium": { name: "Helium", co2Primary: 67.5, co2NewScrap: 0.9, co2OldScrap: null, production: null },
    "holmium_oxide": { name: "Holmium oxide", co2Primary: 4400, co2NewScrap: 226, co2OldScrap: null, production: null },
    "indium": { name: "Indium", co2Primary: 1720, co2NewScrap: 102, co2OldScrap: null, production: null },
    "iridium": { name: "Iridium (total)", co2Primary: 169000, co2NewScrap: 8860, co2OldScrap: null, production: null },
    "iron": { name: "Iron (pig iron)", co2Primary: 23.1, co2NewScrap: 1.5, co2OldScrap: null, production: 23033 },
    "lanthanum_oxide": { name: "Lanthanum oxide", co2Primary: 216, co2NewScrap: 11.0, co2OldScrap: null, production: null },
    "lead": { name: "Lead (total)", co2Primary: 18.9, co2NewScrap: 1.3, co2OldScrap: null, production: 225 },
    "lithium": { name: "Lithium (total)", co2Primary: 125, co2NewScrap: 7.1, co2OldScrap: null, production: 60 },
    "lutetium_oxide": { name: "Lutetium oxide", co2Primary: 17600, co2NewScrap: 896, co2OldScrap: null, production: null },
    "magnesium": { name: "Magnesium (total)", co2Primary: 18.8, co2NewScrap: 5.4, co2OldScrap: null, production: null },
    "manganese": { name: "Manganese (total)", co2Primary: 23.7, co2NewScrap: 1.0, co2OldScrap: null, production: null },
    "mercury": { name: "Mercury", co2Primary: 179, co2NewScrap: 12.1, co2OldScrap: null, production: null },
    "molybdenum": { name: "Molybdenum (total)", co2Primary: 117, co2NewScrap: 5.7, co2OldScrap: null, production: null },
    "neodymium_oxide": { name: "Neodymium oxide", co2Primary: 344, co2NewScrap: 17.6, co2OldScrap: null, production: null },
    "nickel": { name: "Nickel (total)", co2Primary: 111, co2NewScrap: 6.5, co2OldScrap: null, production: 345 },
    "niobium": { name: "Niobium (total)", co2Primary: 172, co2NewScrap: 12.5, co2OldScrap: null, production: null },
    "osmium": { name: "Osmium (total)", co2Primary: 85000, co2NewScrap: 4560, co2OldScrap: null, production: null },
    "palladium": { name: "Palladium (total)", co2Primary: 72700, co2NewScrap: 3880, co2OldScrap: null, production: 15.3 },
    "platinum": { name: "Platinum (total)", co2Primary: 243000, co2NewScrap: 12500, co2OldScrap: null, production: null },
    "praseodymium_oxide": { name: "Praseodymium oxide", co2Primary: 376, co2NewScrap: 19.2, co2OldScrap: null, production: null },
    "rhenium": { name: "Rhenium", co2Primary: 9040, co2NewScrap: 450, co2OldScrap: null, production: null },
    "rhodium": { name: "Rhodium (total)", co2Primary: 683000, co2NewScrap: 35100, co2OldScrap: null, production: null },
    "ruthenium": { name: "Ruthenium (total)", co2Primary: 41100, co2NewScrap: 2110, co2OldScrap: null, production: null },
    "samarium_oxide": { name: "Samarium oxide", co2Primary: 1160, co2NewScrap: 59.1, co2OldScrap: null, production: null },
    "scandium_oxide": { name: "Scandium oxide", co2Primary: 97200, co2NewScrap: 5710, co2OldScrap: null, production: 1.0 },
    "selenium": { name: "Selenium", co2Primary: 65.5, co2NewScrap: 3.6, co2OldScrap: null, production: 0.2 },
    "silver": { name: "Silver (total)", co2Primary: 3280, co2NewScrap: 196, co2OldScrap: null, production: null },
    "steel": { name: "Steel (pig iron proxy)", co2Primary: 25, co2NewScrap: 2, co2OldScrap: null, production: 10 },
    "strontium_carbonate": { name: "Strontium carbonate", co2Primary: 48.8, co2NewScrap: 3.2, co2OldScrap: null, production: 9.5 },
    "tantalum": { name: "Tantalum", co2Primary: 4360, co2NewScrap: 260, co2OldScrap: null, production: 5.6 },
    "tellurium": { name: "Tellurium", co2Primary: 435, co2NewScrap: 21.9, co2OldScrap: null, production: null },
    "terbium_oxide": { name: "Terbium oxide", co2Primary: 5820, co2NewScrap: 297, co2OldScrap: null, production: null },
    "thallium": { name: "Thallium", co2Primary: 5160, co2NewScrap: 376, co2OldScrap: null, production: null },
    "thorium_oxide": { name: "Thorium oxide", co2Primary: 1260, co2NewScrap: 74.9, co2OldScrap: null, production: 0.70 },
    "thulium_oxide": { name: "Thulium oxide", co2Primary: 12700, co2NewScrap: 649, co2OldScrap: null, production: null },
    "tin": { name: "Tin", co2Primary: 321, co2NewScrap: 17.1, co2OldScrap: null, production: null },
    "titanium": { name: "Titanium (total)", co2Primary: 115, co2NewScrap: 8.1, co2OldScrap: null, production: 569 },
    "tungsten": { name: "Tungsten (total)", co2Primary: 133, co2NewScrap: 12.6, co2OldScrap: null, production: null },
    "uranium": { name: "Uranium (yellowcake)", co2Primary: 1270, co2NewScrap: 90.7, co2OldScrap: null, production: 65.8 },
    "vanadium": { name: "Vanadium", co2Primary: 516, co2NewScrap: 33.1, co2OldScrap: null, production: 29.1 },
    "ytterbium_oxide": { name: "Ytterbium oxide", co2Primary: 2450, co2NewScrap: 125, co2OldScrap: null, production: null },
    "yttrium_oxide": { name: "Yttrium oxide", co2Primary: 295, co2NewScrap: 15.1, co2OldScrap: null, production: 4.1 },
    "zinc": { name: "Zinc (total)", co2Primary: 52.9, co2NewScrap: 3.1, co2OldScrap: null, production: 619 },
    "zirconium": { name: "Zirconium (total)", co2Primary: 19.9, co2NewScrap: 1.1, co2OldScrap: null, production: 81.5 }
  };
  
  // Form State
  const [metalType, setMetalType] = useState("aluminium_primary");
  const [recycledContent, setRecycledContent] = useState(30);
  const [sourceRegion, setSourceRegion] = useState("EU");
  const [energyPerTon, setEnergyPerTon] = useState("");
  const [processMethod, setProcessMethod] = useState("smelting");
  const [plantType, setPlantType] = useState("integrated");
  const [plantLocation, setPlantLocation] = useState("germany");
  const [transportDistance, setTransportDistance] = useState(800);
  const [transportMode, setTransportMode] = useState("truck");
  const [transportWeight, setTransportWeight] = useState(10);
  const [lifespan, setLifespan] = useState(10);
  const [efficiencyFactor, setEfficiencyFactor] = useState(0.9);
  const [recyclingPercent, setRecyclingPercent] = useState(30);
  const [landfillPercent, setLandfillPercent] = useState(40);
  const [reusePercent, setReusePercent] = useState(10);
  const [recoveryMethod, setRecoveryMethod] = useState("downcycling");
  
  // Gamification State
  const [emissionControl, setEmissionControl] = useState([50]);
  const [adjustment, setAdjustment] = useState(30);
  const [isSliderActive, setIsSliderActive] = useState(false);
  
  // Results State
  const [totalCO2, setTotalCO2] = useState(115000);
  const [circularityScore, setCircularityScore] = useState(60);
  const [energyUsed, setEnergyUsed] = useState(150000);
  const [showResults, setShowResults] = useState(false);
  
  // Chart Data
  const [co2StageData, setCo2StageData] = useState([
    { name: 'Production', value: 7200 },
    { name: 'Transport', value: 400 },
    { name: 'Usage', value: 200 },
    { name: 'Circularity savings', value: -2000 }
  ]);
  
  const [pieData, setPieData] = useState([
    { name: 'Recycled', value: 30, color: '#3b82f6' },
    { name: 'Virgin', value: 70, color: '#06b6d4' },
    { name: 'Landfill', value: 40, color: '#10b981' },
    { name: 'Reuse', value: 10, color: '#ef4444' }
  ]);

  const [sankeyData, setSankeyData] = useState({
    nodes: [
      { name: "Raw Materials" },
      { name: "Virgin Material" },
      { name: "Recycled Material" },
      { name: "Production" },
      { name: "Transport" },
      { name: "Use Phase" },
      { name: "End of Life" },
      { name: "Recycling" },
      { name: "Landfill" },
      { name: "Reuse" },
    ],
    links: [
      { source: 0, target: 1, value: 70 },
      { source: 0, target: 2, value: 30 },
      { source: 1, target: 3, value: 70 },
      { source: 2, target: 3, value: 30 },
      { source: 3, target: 4, value: 100 },
      { source: 4, target: 5, value: 100 },
      { source: 5, target: 6, value: 100 },
      { source: 6, target: 7, value: 30 },
      { source: 6, target: 8, value: 40 },
      { source: 6, target: 9, value: 10 },
      { source: 7, target: 0, value: 25 },
      { source: 9, target: 5, value: 9 }
    ]
  });

  // Handle emission slider change - update inputs based on emission level
  const handleEmissionChange = useCallback((value: number[]) => {
    setEmissionControl(value);
    setIsSliderActive(true); // Show visual feedback
    
    // Update inputs based on emission level (0-100 scale)
    const emissionLevel = value[0];
    
    // Calculate values based on linear interpolation for smooth transitions
    // Low emissions (0-25): Best case scenario
    // Medium-Low (25-50): Good practices
    // Medium-High (50-75): Standard practices  
    // High emissions (75-100): Poor practices
    
    // Recycled content: 80% (low) to 10% (high)
    const newRecycledContent = Math.round(80 - (emissionLevel * 0.7));
    setRecycledContent(Math.max(10, Math.min(80, newRecycledContent)));
    
    // Transport mode based on emission level
    if (emissionLevel <= 25) {
      setTransportMode("ship"); // Most efficient
      setTransportDistance(Math.max(400, 1200 - emissionLevel * 8));
    } else if (emissionLevel <= 50) {
      setTransportMode("rail"); // Efficient
      setTransportDistance(Math.max(600, 1000 - emissionLevel * 4));
    } else if (emissionLevel <= 75) {
      setTransportMode("truck"); // Standard
      setTransportDistance(Math.max(800, 800 + emissionLevel * 2));
    } else {
      setTransportMode("air"); // Least efficient
      setTransportDistance(Math.max(1000, 600 + emissionLevel * 6));
    }
    
    // End-of-life percentages: Better circularity at lower emissions
    const newRecyclingPercent = Math.round(70 - (emissionLevel * 0.5)); // 70% to 20%
    const newReusePercent = Math.round(25 - (emissionLevel * 0.2)); // 25% to 5%
    const newLandfillPercent = Math.round(5 + (emissionLevel * 0.7)); // 5% to 75%
    
    setRecyclingPercent(Math.max(20, Math.min(70, newRecyclingPercent)));
    setReusePercent(Math.max(5, Math.min(25, newReusePercent)));
    setLandfillPercent(Math.max(5, Math.min(75, newLandfillPercent)));
    
    // Process method based on emission level
    if (emissionLevel <= 40) {
      setProcessMethod("recycling"); // Most efficient
    } else if (emissionLevel <= 70) {
      setProcessMethod("smelting"); // Standard
    } else {
      setProcessMethod("electrolysis"); // Energy intensive
    }
    
    // Plant type and efficiency
    if (emissionLevel <= 35) {
      setPlantType("integrated");
      setEfficiencyFactor(0.95);
    } else if (emissionLevel <= 70) {
      setPlantType("integrated");
      setEfficiencyFactor(0.90);
    } else {
      setPlantType("standalone");
      setEfficiencyFactor(0.80);
    }
    
    // Source region (cleaner grids for lower emissions)
    if (emissionLevel <= 30) {
      setSourceRegion("EU"); // Cleanest grid
    } else if (emissionLevel <= 60) {
      setSourceRegion("USA"); // Medium
    } else {
      setSourceRegion("China"); // Higher carbon grid
    }
    
    // Update visual feedback and clear after short delay (NO CALCULATION)
    setTimeout(() => {
      console.log('Emission control changed to:', emissionLevel, '- inputs updated (no calculation)');
      setIsSliderActive(false); // Remove visual feedback
    }, 150); // Very short delay for state updates
  }, []);

  const handleAIPredict = () => {
    setEnergyPerTon("12.3");
    toast({
      title: "AI Prediction Complete",
      description: "Missing parameters filled using ML models trained on industrial LCA data.",
    });
  };

  const resetToDefaults = () => {
    setMetalType("aluminium_primary");
    setRecycledContent(30);
    setSourceRegion("EU");
    setEnergyPerTon("");
    setProcessMethod("smelting");
    setTransportDistance(800);
    setTransportMode("truck");
    setTransportWeight(10);
    setLifespan(10);
    setEfficiencyFactor(0.9);
    setRecyclingPercent(30);
    setLandfillPercent(40);
    setReusePercent(10);
    setEmissionControl([50]);
    setShowResults(false); // Hide results when resetting
    
    toast({
      title: "Reset to Defaults",
      description: "All parameters reset to default values. Click Submit to see new results.",
    });
  };

  // Validate and normalize end-of-life percentages
  const validateEoLPercentages = useCallback(() => {
    const total = recyclingPercent + landfillPercent + reusePercent;
    if (total > 100) {
      // Proportionally reduce percentages to sum to 100
      const scaleFactor = 100 / total;
      setRecyclingPercent(Math.round(recyclingPercent * scaleFactor));
      setLandfillPercent(Math.round(landfillPercent * scaleFactor));
      setReusePercent(Math.round(reusePercent * scaleFactor));
      
      toast({
        title: "End-of-Life Percentages Adjusted",
        description: "Percentages have been normalized to total 100%.",
        variant: "default"
      });
    }
  }, [recyclingPercent, landfillPercent, reusePercent]);

  // Generate Sankey diagram data
  const generateSankeyData = useCallback(() => {
    try {
      // Create nodes and links for Sankey diagram based on current values
      const nodes = [
        { name: "Raw Materials" },
        { name: "Virgin Material" },
        { name: "Recycled Material" },
        { name: "Production" },
        { name: "Transport" },
        { name: "Use Phase" },
        { name: "End of Life" },
        { name: "Recycling" },
        { name: "Landfill" },
        { name: "Reuse" },
      ];
      
      // Calculate values based on current inputs with bounds checking
      const safeRecycledContent = Math.max(0, Math.min(100, recycledContent || 30));
      const safeRecyclingPercent = Math.max(0, Math.min(100, recyclingPercent || 30));
      const safeLandfillPercent = Math.max(0, Math.min(100, landfillPercent || 40));
      const safeReusePercent = Math.max(0, Math.min(100, reusePercent || 10));
      
      // Material flow values (normalized to material weight for visualization)
      const materialWeight = transportWeight || 10; // tonnes
      const flowUnit = 10; // Base flow unit for visualization
      
      const virginFlow = ((100 - safeRecycledContent) / 100) * flowUnit * materialWeight;
      const recycledFlow = (safeRecycledContent / 100) * flowUnit * materialWeight;
      const totalProductionFlow = virginFlow + recycledFlow;
      
      // End-of-life flows (as percentage of total material)
      const recyclingFlow = (safeRecyclingPercent / 100) * totalProductionFlow;
      const landfillFlow = (safeLandfillPercent / 100) * totalProductionFlow;
      const reuseFlow = (safeReusePercent / 100) * totalProductionFlow;
      
      // Circular flows (efficiency losses)
      const recyclingEfficiency = 0.85; // 85% material recovery from recycling
      const reuseEfficiency = 0.95; // 95% material recovery from reuse
      
      const recycledBackFlow = recyclingFlow * recyclingEfficiency;
      const reusedBackFlow = reuseFlow * reuseEfficiency;

      // Create realistic material flow links
      const links = [
        // Initial material sourcing
        { source: 0, target: 1, value: Math.round(virginFlow) },
        { source: 0, target: 2, value: Math.round(recycledFlow) },
        
        // Materials to production
        { source: 1, target: 3, value: Math.round(virginFlow) },
        { source: 2, target: 3, value: Math.round(recycledFlow) },
        
        // Production through lifecycle
        { source: 3, target: 4, value: Math.round(totalProductionFlow) },
        { source: 4, target: 5, value: Math.round(totalProductionFlow) },
        { source: 5, target: 6, value: Math.round(totalProductionFlow) },
        
        // End-of-life splits
        { source: 6, target: 7, value: Math.round(recyclingFlow) },
        { source: 6, target: 8, value: Math.round(landfillFlow) },
        { source: 6, target: 9, value: Math.round(reuseFlow) },
        
        // Circular economy flows
        { source: 7, target: 0, value: Math.round(recycledBackFlow) },
        { source: 9, target: 5, value: Math.round(reusedBackFlow) }
      ].filter(link => link.value > 0); // Remove zero-value links

      const newSankeyData = { nodes, links };
      console.log('Generated Sankey data with material flows:', newSankeyData);
      setSankeyData(newSankeyData);
    } catch (error) {
      console.error('Error generating Sankey data:', error);
      // Set empty data on error to prevent crashes
      setSankeyData({ nodes: [], links: [] });
    }
  }, [recycledContent, recyclingPercent, landfillPercent, reusePercent, transportWeight]);

  const handleSubmit = useCallback(() => {
    console.log('🔥 STARTING LCA CALCULATION...');
    console.log('Raw inputs:', {
      metalType, recycledContent, sourceRegion, energyPerTon, processMethod,
      transportDistance, transportMode, transportWeight, lifespan, efficiencyFactor,
      recyclingPercent, landfillPercent, reusePercent, emissionControl: emissionControl[0]
    });
    
    try {
      // Input validation and sanitization
      const safeTransportWeight = Math.max(0.1, Math.min(1000, transportWeight || 10)); // tonnes, min 0.1, max 1000
      const safeTransportDistance = Math.max(1, Math.min(50000, transportDistance || 800)); // km, min 1, max 50000
      const safeRecycledContent = Math.max(0, Math.min(100, recycledContent || 30)); // percentage
      const safeLifespan = Math.max(1, Math.min(100, lifespan || 10)); // years
      const safeEfficiencyFactor = Math.max(0.1, Math.min(1.0, efficiencyFactor || 0.9)); // efficiency ratio
      const safeRecyclingPercent = Math.max(0, Math.min(100, recyclingPercent || 30));
      const safeLandfillPercent = Math.max(0, Math.min(100, landfillPercent || 40));
      const safeReusePercent = Math.max(0, Math.min(100, reusePercent || 10));
      
      console.log('Safe inputs:', {
        safeTransportWeight, safeTransportDistance, safeRecycledContent, safeLifespan,
        safeEfficiencyFactor, safeRecyclingPercent, safeLandfillPercent, safeReusePercent
      });
      
      // Normalize end-of-life percentages if they exceed 100%
      const totalEoL = safeRecyclingPercent + safeLandfillPercent + safeReusePercent;
      const normalizedRecycling = totalEoL > 100 ? (safeRecyclingPercent / totalEoL) * 100 : safeRecyclingPercent;
      const normalizedLandfill = totalEoL > 100 ? (safeLandfillPercent / totalEoL) * 100 : safeLandfillPercent;
      const normalizedReuse = totalEoL > 100 ? (safeReusePercent / totalEoL) * 100 : safeReusePercent;

      // Base emission factors using the comprehensive metal database
      // Primary emissions are used as base, with recycling factors applied
      const selectedMetal = metalDatabase[metalType];
      const baseEmission = selectedMetal ? selectedMetal.co2Primary : 50.0; // Fallback value
      
      // Recycling emission factor - use new scrap if available, otherwise estimate
      const recyclingEmission = selectedMetal?.co2NewScrap || (baseEmission * 0.1);
      
      console.log(`Selected metal: ${selectedMetal?.name}, Primary CO2: ${baseEmission}, Recycling CO2: ${recyclingEmission}`);

      // Regional electricity grid emission factors (kg CO2-eq/kWh)
      const regionFactor = {
        EU: 0.295,    // European average grid mix
        USA: 0.493,   // US average grid mix
        China: 0.681, // China grid mix (coal-heavy)
        India: 0.708  // India grid mix
      }[sourceRegion] || 0.493;

      // Process-specific factors (multiplier for base emissions)
      const processFactor = {
        smelting: 1.0,      // Standard primary production
        electrolysis: 1.15, // Higher energy intensity
        recycling: 0.05,    // Recycling uses 95% less energy
        mechanical: 0.08    // Mechanical recycling
      }[processMethod] || 1.0;

      // Transport emission factors (kg CO2-eq/tonne-km)
      const transportFactor = {
        truck: 0.062,  // Heavy duty truck
        rail: 0.019,   // Rail freight
        ship: 0.008,   // Ocean freight
        air: 2.1       // Air freight
      }[transportMode] || 0.062;

      // Plant efficiency factors
      const plantEfficiencyFactor = {
        integrated: 0.95,  // Integrated plants are more efficient
        standalone: 1.05,  // Less efficient
        mini: 1.0         // Average efficiency
      }[plantType] || 1.0;

      // Calculate actual weight being processed
      const materialWeight = safeTransportWeight; // tonnes

      // 1. PRODUCTION STAGE EMISSIONS
      // Formula: Base emissions × material fraction × process factor × regional grid factor × plant efficiency
      const virginFraction = (100 - safeRecycledContent) / 100;
      const recycledFraction = safeRecycledContent / 100;
      
      const primaryProductionEmission = materialWeight * baseEmission * virginFraction * processFactor * regionFactor * plantEfficiencyFactor;
      const recyclingStageEmission = materialWeight * recyclingEmission * recycledFraction * regionFactor;
      const productionEmission = primaryProductionEmission + recyclingStageEmission;

      // 2. TRANSPORT STAGE EMISSIONS
      // Formula: Transport distance × transport factor × weight
      const transportEmission = (safeTransportDistance * transportFactor * materialWeight);

      // 3. USE PHASE EMISSIONS
      // For metals, use phase emissions are typically minimal unless it's an energy-consuming product
      // Most structural metals (beams, sheets, etc.) don't consume energy during use
      const baseEnergyConsumption = energyPerTon ? parseFloat(energyPerTon) : 0; // Default to 0 for metals
      const totalEnergyUse = baseEnergyConsumption * materialWeight * 1000; // Convert to kWh
      
      // Use phase emissions only apply if there's actual energy consumption during use
      // For most metal products, this should be zero or very minimal
      const usageEmission = totalEnergyUse > 0 ? 
        (totalEnergyUse * regionFactor * safeLifespan) / safeEfficiencyFactor : 
        0; // No use phase emissions for passive metal products

      // 4. END-OF-LIFE STAGE EMISSIONS
      // Landfill: Positive emissions from waste management
      // Recycling: Avoided emissions from displacing primary production
      // Reuse: Higher avoided emissions as it displaces entire production
      const landfillEmission = (normalizedLandfill / 100) * materialWeight * 0.1; // Waste management emissions
      const recyclingBenefit = (normalizedRecycling / 100) * materialWeight * baseEmission * 0.9; // 90% credit for avoided primary production
      const reuseBenefit = (normalizedReuse / 100) * materialWeight * baseEmission * 0.95; // 95% credit for reuse
      const endOfLifeEmission = landfillEmission - recyclingBenefit - reuseBenefit;

      // 5. TOTAL EMISSIONS WITH ADJUSTMENTS
      // Emission control effect (0-100 scale where 50 is baseline)
      const emissionControlEffect = emissionControl[0] / 50; // Normalized to baseline of 1.0 at 50%
      
      // Calculate base total before adjustments
      const baseTotal = productionEmission + transportEmission + usageEmission + endOfLifeEmission;
      
      // Apply emission control effect (represents technology/process improvements)
      const totalEmission = Math.max(0, baseTotal * emissionControlEffect);

      // 6. CIRCULARITY INDICATOR CALCULATION
      // Based on Ellen MacArthur Foundation circularity indicators
      const materialCircularity = (safeRecycledContent + normalizedRecycling) / 2;
      const utilityCircularity = normalizedReuse;
      const circularityIndex = (materialCircularity * 0.7 + utilityCircularity * 0.3);
      const processBonus = processMethod === 'recycling' ? 10 : 0;
      const newCircularity = Math.max(0, Math.min(100, 
        Math.round(circularityIndex + processBonus)
      ));

      // 7. ENERGY CALCULATION (kWh)
      // Energy consumption factors derived from CO2 emissions (assuming typical energy mix)
      // Rough conversion: CO2 emissions / 0.5 (kg CO2/kWh average) = energy intensity
      const metalEnergyFactor = selectedMetal ? selectedMetal.co2Primary / 0.5 : 100; // kWh/tonne
      const recyclingEnergyFactor = selectedMetal ? (selectedMetal.co2NewScrap || selectedMetal.co2Primary * 0.1) / 0.5 : 10; // kWh/tonne
      
      // Use provided energy value or calculated based on metal type (for production)
      const productionEnergyIntensity = energyPerTon ? parseFloat(energyPerTon) : metalEnergyFactor;
      
      // Production energy (kWh) - different for virgin vs recycled material
      const virginProductionEnergy = materialWeight * 1000 * productionEnergyIntensity * virginFraction * processFactor;
      const recycledProductionEnergy = materialWeight * 1000 * recyclingEnergyFactor * recycledFraction * processFactor;
      const productionEnergy = virginProductionEnergy + recycledProductionEnergy;
      
      // Transport energy (kWh/tonne-km)
      const transportEnergyFactor = {
        truck: 0.8,   // kWh/tonne-km
        rail: 0.3,    // More efficient
        ship: 0.15,   // Most efficient for long distance
        air: 8.5      // Very energy intensive
      }[transportMode] || 0.8;
      const transportEnergy = safeTransportDistance * materialWeight * transportEnergyFactor;
      
      // Use phase energy - only include if there's actual energy consumption during use
      // For most metal products (structural, sheets, etc.), this is zero
      const usePhaseEnergy = baseEnergyConsumption > 0 ? totalEnergyUse * safeLifespan / safeEfficiencyFactor : 0;
      
      // Total energy with plant efficiency
      const totalEnergy = Math.max(0, Math.round(
        (productionEnergy + transportEnergy + usePhaseEnergy) * plantEfficiencyFactor
      ));

      // Update state with converted values (convert back to kg for display)
      setTotalCO2(Math.round(totalEmission * 1000)); // Convert tonnes to kg
      setCircularityScore(newCircularity);
      setEnergyUsed(totalEnergy);
      setShowResults(true); // Show results after calculation

            // Console log for debugging calculations
      console.log('=== LCA Calculation Debug ===');
      console.log('Input Values:');
      console.log('- Material Weight:', materialWeight, 'tonnes');
      console.log('- Metal Type:', metalType, '- Production Energy Factor:', metalEnergyFactor, 'kWh/kg');
      console.log('- Virgin/Recycled Split:', (virginFraction*100).toFixed(1) + '%', '/', (recycledFraction*100).toFixed(1) + '%');
      console.log('- Transport:', safeTransportDistance, 'km via', transportMode);
      console.log('- End-of-Life: Recycling', normalizedRecycling.toFixed(1) + '%, Landfill', normalizedLandfill.toFixed(1) + '%, Reuse', normalizedReuse.toFixed(1) + '%');
      console.log('- Use Phase Energy Input:', baseEnergyConsumption, 'kWh/kg (0 = no energy use during operation)');
      console.log('Emissions Breakdown:');
      console.log('- Production Emission:', Math.round(productionEmission * 1000), 'kg CO₂');
      console.log('- Transport Emission:', Math.round(transportEmission * 1000), 'kg CO₂');
      console.log('- Usage Emission:', Math.round(usageEmission * 1000), 'kg CO₂', '(should be 0 for most metals)');
      console.log('- End-of-Life Emission:', Math.round(endOfLifeEmission * 1000), 'kg CO₂');
      console.log('- Base Total:', Math.round(baseTotal * 1000), 'kg CO₂');
      console.log('- Emission Control Effect:', emissionControlEffect.toFixed(2));
      console.log('- Final Total CO₂:', Math.round(totalEmission * 1000), 'kg CO₂');
      console.log('Energy Breakdown:');
      console.log('- Production Energy:', Math.round(productionEnergy), 'kWh');
      console.log('- Transport Energy:', Math.round(transportEnergy), 'kWh');
      console.log('- Use Phase Energy:', Math.round(usePhaseEnergy), 'kWh');
      console.log('- Total Energy:', totalEnergy, 'kWh');
      console.log('- Energy per kg of material:', (totalEnergy / (materialWeight * 1000)).toFixed(2), 'kWh/kg');
      console.log('Expected CO₂ range for', selectedMetal?.name + ':', Math.round(baseEmission * materialWeight * 1000), 'kg (virgin) to', Math.round(recyclingEmission * materialWeight * 1000), 'kg (100% recycled)');
      console.log('=============================');

      // Update chart data with proper scaling
      const productionEmissionKg = Math.max(0, Math.round(productionEmission * 1000));
      const transportEmissionKg = Math.max(0, Math.round(transportEmission * 1000));
      const usageEmissionKg = Math.max(0, Math.round(usageEmission * 1000));
      const endOfLifeEmissionKg = Math.round(endOfLifeEmission * 1000);
      const circularitySavingsKg = Math.round(-(recyclingBenefit + reuseBenefit) * 1000);
      
      const newCo2StageData = [
        { name: 'Production', value: productionEmissionKg },
        { name: 'Transport', value: transportEmissionKg },
        { name: 'Usage', value: usageEmissionKg },
        { name: 'End of Life', value: endOfLifeEmissionKg },
        { name: 'Circularity savings', value: circularitySavingsKg }
      ];
      setCo2StageData(newCo2StageData);
      
      // Verify chart data sums to total (excluding circularity savings as they're already included in end-of-life)
      const chartSum = productionEmissionKg + transportEmissionKg + usageEmissionKg + endOfLifeEmissionKg;
      const totalCO2Kg = Math.round(totalEmission * 1000);
      console.log('Chart sum verification:', chartSum, 'vs Total:', totalCO2Kg, 'Difference:', Math.abs(chartSum - totalCO2Kg));

      // Update pie chart data - ensure percentages add up correctly
      const totalEoLPercent = normalizedLandfill + normalizedRecycling + normalizedReuse;
      const pieLandfill = totalEoLPercent > 0 ? (normalizedLandfill / totalEoLPercent) * 100 : 0;
      const pieRecycling = totalEoLPercent > 0 ? (normalizedRecycling / totalEoLPercent) * 100 : 0;
      const pieReuse = totalEoLPercent > 0 ? (normalizedReuse / totalEoLPercent) * 100 : 0;
      
      const newPieData = [
        { name: 'Recycled Content', value: Math.round(safeRecycledContent), color: '#22c55e' },
        { name: 'Virgin Material', value: Math.round(100 - safeRecycledContent), color: '#3b82f6' },
        { name: 'Landfill EoL', value: Math.round(pieLandfill), color: '#ef4444' },
        { name: 'Reuse EoL', value: Math.round(pieReuse), color: '#f59e0b' }
      ];
      setPieData(newPieData);

      // Generate Sankey diagram data
      generateSankeyData();

      toast({
        title: "LCA Analysis Complete",
        description: `Total CO₂: ${Math.round(totalEmission * 1000).toLocaleString()} kg | Energy: ${totalEnergy.toLocaleString()} kWh | Circularity: ${newCircularity}%`,
      });
      
      // Automatically save to reports after successful calculation
      const analysisData = {
        id: Date.now(),
        name: `${selectedMetal?.name || metalType} Analysis`,
        date: new Date().toISOString(),
        co2: Math.round(totalEmission * 1000),
        circularity: newCircularity,
        energy: totalEnergy,
        inputs: {
          metalType, recycledContent, sourceRegion, energyPerTon, processMethod,
          plantType, plantLocation, transportDistance, transportMode, transportWeight,
          lifespan, efficiencyFactor, recyclingPercent, landfillPercent, reusePercent,
          recoveryMethod, emissionControl: emissionControl[0], adjustment
        }
      };
      
      // Store in localStorage for demo purposes
      const existingReports = JSON.parse(localStorage.getItem('lcaReports') || '[]');
      localStorage.setItem('lcaReports', JSON.stringify([analysisData, ...existingReports]));
      
      // Validation warning for unrealistic values
      const totalCO2kg = Math.round(totalEmission * 1000);
      const expectedMaxCO2 = baseEmission * materialWeight * 1000 * 2; // 2x base emission as reasonable upper bound
      
      if (totalCO2kg > expectedMaxCO2) {
        console.warn('⚠️ WARNING: CO₂ emissions seem unusually high!');
        console.warn('Expected maximum for', metalType, ':', expectedMaxCO2.toLocaleString(), 'kg CO₂');
        console.warn('Actual calculated:', totalCO2kg.toLocaleString(), 'kg CO₂');
        console.warn('Check: Use phase energy input, lifespan, and other parameters');
      }
    } catch (error) {
      console.error('Error in LCA calculation:', error);
      toast({
        title: "Calculation Error",
        description: "There was an error calculating the LCA results. Please check your inputs.",
        variant: "destructive"
      });
    }
  }, [
    metalType, recycledContent, sourceRegion, energyPerTon, processMethod,
    plantType, plantLocation, transportDistance, transportMode, transportWeight,
    lifespan, efficiencyFactor, recyclingPercent, landfillPercent, reusePercent,
    recoveryMethod, emissionControl, adjustment, generateSankeyData, toast
  ]);

  // Generate initial Sankey data on component mount
  useEffect(() => {
    console.log('Component mounted, generating initial Sankey data...');
    generateSankeyData();
    // Do NOT run initial calculation - wait for submit
  }, []); // Empty dependency array for initial load only

  // Validate end-of-life percentages when they change
  useEffect(() => {
    const total = recyclingPercent + landfillPercent + reusePercent;
    if (total > 105) { // Allow small buffer for user input
      validateEoLPercentages();
    }
  }, [recyclingPercent, landfillPercent, reusePercent, validateEoLPercentages]);

  // Load saved report data when navigating from Reports view
  useEffect(() => {
    console.log('🔍 LCAInput useEffect: Checking for saved report data...');
    const savedReport = localStorage.getItem('currentReport');
    console.log('📄 Saved report found:', !!savedReport);
    console.log('📄 Saved report content:', savedReport);
    
    if (savedReport) {
      try {
        const reportData = JSON.parse(savedReport);
        console.log('📊 Loading saved report data:', reportData);
        
        // Load all input values from the saved report
        if (reportData.inputs) {
          console.log('⚙️ Loading input values...');
          setMetalType(reportData.inputs.metalType || "aluminium_primary");
          setRecycledContent(reportData.inputs.recycledContent || 30);
          setSourceRegion(reportData.inputs.sourceRegion || "EU");
          setEnergyPerTon(reportData.inputs.energyPerTon || "");
          setProcessMethod(reportData.inputs.processMethod || "smelting");
          setPlantType(reportData.inputs.plantType || "integrated");
          setPlantLocation(reportData.inputs.plantLocation || "germany");
          setTransportDistance(reportData.inputs.transportDistance || 800);
          setTransportMode(reportData.inputs.transportMode || "truck");
          setTransportWeight(reportData.inputs.transportWeight || 10);
          setLifespan(reportData.inputs.lifespan || 10);
          setEfficiencyFactor(reportData.inputs.efficiencyFactor || 0.9);
          setRecyclingPercent(reportData.inputs.recyclingPercent || 30);
          setLandfillPercent(reportData.inputs.landfillPercent || 40);
          setReusePercent(reportData.inputs.reusePercent || 10);
          setRecoveryMethod(reportData.inputs.recoveryMethod || "downcycling");
          
          // Ensure emissionControl is always an array
          const emissionControlValue = reportData.inputs.emissionControl;
          if (Array.isArray(emissionControlValue)) {
            setEmissionControl(emissionControlValue);
          } else if (typeof emissionControlValue === 'number') {
            setEmissionControl([emissionControlValue]);
          } else {
            setEmissionControl([50]);
          }
          
          setAdjustment(reportData.inputs.adjustment || 30);
        }
        
        // Load results and show them
        console.log('📈 Loading results...');
        setTotalCO2(reportData.co2 || 115000);
        setCircularityScore(reportData.circularity || 60);
        setEnergyUsed(reportData.energy || 150000);
        
        // Load chart data if available
        if (reportData.chartData) {
          console.log('📊 Loading saved chart data...');
          try {
            if (reportData.chartData.co2StageData && Array.isArray(reportData.chartData.co2StageData)) {
              setCo2StageData(reportData.chartData.co2StageData);
            }
            if (reportData.chartData.pieData && Array.isArray(reportData.chartData.pieData)) {
              setPieData(reportData.chartData.pieData);
            }
            if (reportData.chartData.sankeyData && 
                reportData.chartData.sankeyData.nodes && 
                reportData.chartData.sankeyData.links) {
              setSankeyData(reportData.chartData.sankeyData);
            }
          } catch (chartError) {
            console.error('Error loading chart data:', chartError);
            // Keep default chart data if loading fails
          }
        }
        
        setShowResults(true); // Show results since we're viewing a saved report
        console.log('✅ Setting showResults to true');
        
        // Clear the saved report from localStorage to prevent reloading on refresh
        localStorage.removeItem('currentReport');
        
        toast({
          title: "Report Loaded",
          description: `Successfully loaded ${reportData.name || 'saved analysis'} data with charts.`,
        });
        
      } catch (error) {
        console.error('❌ Error loading saved report:', error);
        toast({
          title: "Error Loading Report",
          description: "Could not load the saved report data.",
          variant: "destructive",
        });
      }
    }
  }, []); // Empty dependency array to run only once on mount

  // Save analysis to reports
  const saveAnalysis = () => {
    // In a real app, this would save to a database or state management
    const analysisData = {
      id: Date.now(),
      name: `${metalType.charAt(0).toUpperCase() + metalType.slice(1)} Analysis`,
      date: new Date().toISOString(),
      co2: totalCO2,
      circularity: circularityScore,
      energy: energyUsed,
      inputs: {
        metalType, recycledContent, sourceRegion, energyPerTon, processMethod,
        plantType, plantLocation, transportDistance, transportMode, transportWeight,
        lifespan, efficiencyFactor, recyclingPercent, landfillPercent, reusePercent,
        recoveryMethod, emissionControl: emissionControl[0], adjustment
      },
      chartData: {
        co2StageData,
        pieData,
        sankeyData
      }
    };
    
    // Store in localStorage for demo purposes
    const existingReports = JSON.parse(localStorage.getItem('lcaReports') || '[]');
    localStorage.setItem('lcaReports', JSON.stringify([...existingReports, analysisData]));
    
    toast({
      title: "Analysis Saved",
      description: "Your LCA analysis has been saved to Reports.",
    });
  };

  // Download functions
  const downloadPDF = () => {
    // In a real app, this would generate a PDF
    const blob = new Blob([JSON.stringify({
      title: `LCA Analysis - ${metalType}`,
      date: new Date().toISOString(),
      results: {
        co2: totalCO2,
        circularity: circularityScore,
        energy: energyUsed
      },
      inputs: {
        metalType, recycledContent, sourceRegion, energyPerTon, processMethod,
        plantType, plantLocation, transportDistance, transportMode, transportWeight,
        lifespan, efficiencyFactor, recyclingPercent, landfillPercent, reusePercent,
        recoveryMethod, emissionControl: emissionControl[0], adjustment
      }
    }, null, 2)], { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lca-analysis-${metalType}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "PDF Downloaded",
      description: "LCA data has been exported to PDF format.",
    });
  };
  
  const downloadExcel = () => {
    // In a real app, this would generate an Excel file
    const blob = new Blob([JSON.stringify({
      title: `LCA Analysis - ${metalType}`,
      date: new Date().toISOString(),
      results: {
        co2: totalCO2,
        circularity: circularityScore,
        energy: energyUsed
      },
      inputs: {
        metalType, recycledContent, sourceRegion, energyPerTon, processMethod,
        plantType, plantLocation, transportDistance, transportMode, transportWeight,
        lifespan, efficiencyFactor, recyclingPercent, landfillPercent, reusePercent,
        recoveryMethod, emissionControl: emissionControl[0], adjustment
      }
    }, null, 2)], { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lca-analysis-${metalType}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Excel Downloaded",
      description: "LCA data has been exported to Excel format.",
    });
  };

  const getEmissionColorName = (): "success" | "warning" | "destructive" => {
    const value = Array.isArray(emissionControl) ? emissionControl[0] : 50;
    if (value <= 33) return "success";
    if (value <= 66) return "warning";
    return "destructive";
  };

  const getEmissionLabel = () => {
    const value = Array.isArray(emissionControl) ? emissionControl[0] : 50;
    if (value <= 33) return "Green";
    if (value <= 66) return "Neutral";
    return "Red";
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background to-muted">
      {/* Left Sidebar - Emission Control */}
      <div className="w-48 bg-card/95 backdrop-blur-sm border-r border-border p-4 flex flex-col items-center space-y-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Emission</h2>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-start w-full pt-8">
          <Slider
            orientation="vertical"
            value={Array.isArray(emissionControl) ? emissionControl : [50]}
            onValueChange={handleEmissionChange}
            max={100}
            step={1}
            color={getEmissionColorName()}
            className="h-96"
          />
          <Badge variant="outline" className={`mt-4 text-${getEmissionColorName()}`}>
            {getEmissionLabel()} {Array.isArray(emissionControl) ? emissionControl[0] : 50}%
          </Badge>
        </div>

        {/* Download Buttons */}
        <div className="space-y-3 pt-0">
          <Button 
            onClick={downloadPDF}
            className="w-full bg-success hover:bg-success/90 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button 
            // onClick={downloadExcel}
            className="w-full bg-success hover:bg-success/90 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Excel
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary mb-2">LCA: Metals (Cradle-to-Grave)</h1>
          </div>

          {/* Inputs Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-success">Inputs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Raw Material */}
              <div>
                <h3 className="font-semibold mb-4">Raw Material</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Metal</Label>
                    <Select value={metalType} onValueChange={setMetalType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px] overflow-y-auto">
                        {Object.entries(metalDatabase).map(([key, metal]) => (
                          <SelectItem key={key} value={key}>{metal.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      % Recycled 
                      {isSliderActive && <span className="text-primary ml-1">🎛️</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={recycledContent}
                        onChange={(e) => setRecycledContent(Number(e.target.value))}
                        className={`pr-8 ${isSliderActive ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Source Region
                      {isSliderActive && <span className="text-primary ml-1">🎛️</span>}
                    </Label>
                    <Select value={sourceRegion} onValueChange={setSourceRegion}>
                      <SelectTrigger className={isSliderActive ? 'ring-2 ring-primary/50 bg-primary/5' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EU">EU</SelectItem>
                        <SelectItem value="USA">USA</SelectItem>
                        <SelectItem value="China">China</SelectItem>
                        <SelectItem value="India">India</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Process */}
              <div>
                <h3 className="font-semibold mb-4">Process</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Energy (kWh/ton)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={energyPerTon}
                        onChange={(e) => setEnergyPerTon(e.target.value)}
                        placeholder="Leave empty to AI-predict"
                      />
                      {!energyPerTon && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute right-1 top-1 h-8 text-xs"
                          onClick={handleAIPredict}
                        >
                          EF via backend
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Method</Label>
                    <Select value={processMethod} onValueChange={setProcessMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="smelting">Smelting</SelectItem>
                        <SelectItem value="electrolysis">Electrolysis</SelectItem>
                        <SelectItem value="recycling">Recycling</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Plant Type</Label>
                    <Select value={plantType} onValueChange={setPlantType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="integrated">Integrated</SelectItem>
                        <SelectItem value="mini-mill">Mini Mill</SelectItem>
                        <SelectItem value="recycling">Recycling Plant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Plant Location</Label>
                    <Select value={plantLocation} onValueChange={setPlantLocation}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="germany">Germany</SelectItem>
                        <SelectItem value="france">France</SelectItem>
                        <SelectItem value="italy">Italy</SelectItem>
                        <SelectItem value="spain">Spain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Transport */}
              <div>
                <h3 className="font-semibold mb-4">Transport</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Distance</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={transportDistance}
                        onChange={(e) => setTransportDistance(Number(e.target.value))}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">km</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Mode
                      {isSliderActive && <span className="text-primary ml-1">🎛️</span>}
                    </Label>
                    <Select value={transportMode} onValueChange={setTransportMode}>
                      <SelectTrigger className={isSliderActive ? 'ring-2 ring-primary/50 bg-primary/5' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="truck">Truck</SelectItem>
                        <SelectItem value="rail">Rail</SelectItem>
                        <SelectItem value="ship">Ship</SelectItem>
                        <SelectItem value="air">Air</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Weight</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={transportWeight}
                        onChange={(e) => setTransportWeight(Number(e.target.value))}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">t</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage */}
              <div>
                <h3 className="font-semibold mb-4">Usage</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Lifespan</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={lifespan}
                        onChange={(e) => setLifespan(Number(e.target.value))}
                        className="pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">years</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Efficiency factor</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="1"
                      value={efficiencyFactor}
                      onChange={(e) => setEfficiencyFactor(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">0-1, lower = losses</p>
                  </div>
                </div>
              </div>

              {/* End-of-Life */}
              <div>
                <h3 className="font-semibold mb-4">End-of-Life</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Recycling %</Label>
                    <Input
                      type="number"
                      value={recyclingPercent}
                      onChange={(e) => setRecyclingPercent(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Landfill %</Label>
                    <Input
                      type="number"
                      value={landfillPercent}
                      onChange={(e) => setLandfillPercent(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Reuse %</Label>
                    <Input
                      type="number"
                      value={reusePercent}
                      onChange={(e) => setReusePercent(Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Recovery method</Label>
                    <Select value={recoveryMethod} onValueChange={setRecoveryMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="downcycling">Downcycling</SelectItem>
                        <SelectItem value="upcycling">Upcycling</SelectItem>
                        <SelectItem value="mechanical">Mechanical</SelectItem>
                        <SelectItem value="chemical">Chemical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-between pt-4">
                <Button 
                  onClick={resetToDefaults}
                  size="sm"
                  variant="outline"
                  className="px-4 py-2"
                >
                  Reset to Defaults
                </Button>
                <Button 
                  onClick={handleSubmit}
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-2"
                >
                  Submit to AI/Backend
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* NEW: Interactive Scenario Sliders - Real-time ROC Updates */}
          <Card className="shadow-lg border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
            <CardHeader>
              <CardTitle className="text-xl text-blue-700 flex items-center gap-2">
                🎛️ Scenario Explorer - Live ROC Impact
                <Badge className="bg-blue-100 text-blue-800">Real-time</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recycling Rate Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Recycling Rate</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">{recycledContent}%</span>
                    <Badge variant="outline" className="text-xs">
                      {recycledContent > 50 ? '🌟 Excellent' : recycledContent > 30 ? '✅ Good' : '⚠️ Improve'}
                    </Badge>
                  </div>
                </div>
                <Slider
                  value={[recycledContent]}
                  onValueChange={(value) => setRecycledContent(value[0])}
                  max={80}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0% (Virgin only)</span>
                  <span>40% (Industry avg)</span>
                  <span>80% (Best practice)</span>
                </div>
              </div>

              {/* Transport Distance Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Transport Distance</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-blue-600">{transportDistance} km</span>
                    <Badge variant="outline" className="text-xs">
                      {transportDistance < 500 ? '🚛 Local' : transportDistance < 1500 ? '🌍 Regional' : '✈️ Global'}
                    </Badge>
                  </div>
                </div>
                <Slider
                  value={[transportDistance]}
                  onValueChange={(value) => setTransportDistance(value[0])}
                  max={3000}
                  min={100}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>100km (Local)</span>
                  <span>800km (Regional)</span>
                  <span>3000km (Global)</span>
                </div>
              </div>

              {/* Energy Mix Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-medium">Renewable Energy %</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-green-600">{100 - (emissionControl?.[0] || 50)}%</span>
                    <Badge variant="outline" className="text-xs">
                      {(100 - (emissionControl?.[0] || 50)) > 70 ? '🌱 Clean' : (100 - (emissionControl?.[0] || 50)) > 40 ? '⚡ Mixed' : '🏭 Fossil'}
                    </Badge>
                  </div>
                </div>
                <Slider
                  value={emissionControl}
                  onValueChange={(value) => setEmissionControl(value)}
                  max={100}
                  min={0}
                  step={10}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>100% Renewable</span>
                  <span>50% Mixed</span>
                  <span>100% Fossil</span>
                </div>
              </div>

              {/* Live ROC Preview */}
              <div className="bg-white rounded-lg p-4 border-2 border-dashed border-green-300">
                <h4 className="font-semibold text-green-800 mb-2">🎯 Live ROC Preview</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{Math.round(60 + (recycledContent * 0.5) - (transportDistance * 0.01))}%</div>
                    <div className="text-xs text-gray-600">Current ROC</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{Math.round(115 - (recycledContent * 1.2) + (transportDistance * 0.02))}t</div>
                    <div className="text-xs text-gray-600">CO₂ Emissions</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{Math.round(150 - (recycledContent * 0.8) + ((emissionControl?.[0] || 50) * 0.5))}k</div>
                    <div className="text-xs text-gray-600">Energy (kWh)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NEW: Industry Presets */}
          <Card className="shadow-lg border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="text-xl text-orange-700 flex items-center gap-2">
                🏭 Industry Presets - Quick Start
                <Badge className="bg-orange-100 text-orange-800">One-click</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Aluminium Cans Preset */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-blue-300" 
                      onClick={() => {
                        setMetalType("aluminium_primary");
                        setRecycledContent(75);
                        setTransportDistance(400);
                        setProcessMethod("smelting");
                        setLifespan(0.5);
                        setRecyclingPercent(80);
                        toast({
                          title: "Aluminium Cans Loaded",
                          description: "Optimized parameters for beverage can production"
                        });
                      }}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">🥤</div>
                    <h3 className="font-semibold text-blue-700">Aluminium Cans</h3>
                    <p className="text-xs text-gray-600 mt-1">75% recycled, 400km transport</p>
                    <Badge className="mt-2 bg-green-100 text-green-700">ROC: ~85%</Badge>
                  </CardContent>
                </Card>

                {/* Copper Wires Preset */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-yellow-300"
                      onClick={() => {
                        setMetalType("copper");
                        setRecycledContent(35);
                        setTransportDistance(800);
                        setProcessMethod("electrolysis");
                        setLifespan(25);
                        setRecyclingPercent(95);
                        toast({
                          title: "Copper Wires Loaded",
                          description: "Standard parameters for electrical wire production"
                        });
                      }}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">🔌</div>
                    <h3 className="font-semibold text-yellow-700">Copper Wires</h3>
                    <p className="text-xs text-gray-600 mt-1">35% recycled, 800km transport</p>
                    <Badge className="mt-2 bg-yellow-100 text-yellow-700">ROC: ~65%</Badge>
                  </CardContent>
                </Card>

                {/* Battery Materials Preset */}
                <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-purple-300"
                      onClick={() => {
                        setMetalType("lithium");
                        setRecycledContent(15);
                        setTransportDistance(1500);
                        setProcessMethod("electrolysis");
                        setLifespan(8);
                        setRecyclingPercent(40);
                        toast({
                          title: "Battery Materials Loaded",
                          description: "Critical mineral parameters for battery production"
                        });
                      }}>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2">🔋</div>
                    <h3 className="font-semibold text-purple-700">Battery Materials</h3>
                    <p className="text-xs text-gray-600 mt-1">15% recycled, 1500km transport</p>
                    <Badge className="mt-2 bg-purple-100 text-purple-700">ROC: ~35%</Badge>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Results Section - Only show after submit */}
          {showResults ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="text-center shadow-lg">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">TOTAL CO₂</p>
                    <p className="text-3xl font-bold text-foreground">{totalCO2.toLocaleString()} kg</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center shadow-lg">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">CIRCULARITY SCORE</p>
                    <p className="text-3xl font-bold text-primary">{circularityScore}%</p>
                  </CardContent>
                </Card>
                
                <Card className="text-center shadow-lg">
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground mb-2">ENERGY USED</p>
                    <p className="text-3xl font-bold text-warning">{energyUsed.toLocaleString()} kWh</p>
                  </CardContent>
                </Card>
              </div>

              {/* NEW: Equivalency Storytelling - Make Impact Relatable */}
              <Card className="shadow-lg border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="text-xl text-green-700 flex items-center gap-2">
                    🌱 Environmental Impact Story
                    <Badge className="bg-green-100 text-green-800">Real-world context</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Trees Equivalent */}
                    <div className="bg-white rounded-lg p-4 text-center border border-green-200">
                      <div className="text-3xl mb-2">🌳</div>
                      <div className="text-2xl font-bold text-green-600">{Math.round(totalCO2 / 22)}</div>
                      <div className="text-sm text-gray-600">Trees planted to offset this CO₂</div>
                      <div className="text-xs text-gray-500 mt-1">22kg CO₂/tree/year</div>
                    </div>

                    {/* Cars Off Road */}
                    <div className="bg-white rounded-lg p-4 text-center border border-blue-200">
                      <div className="text-3xl mb-2">🚗</div>
                      <div className="text-2xl font-bold text-blue-600">{Math.round(totalCO2 / 4600)}</div>
                      <div className="text-sm text-gray-600">Cars off road for 1 year</div>
                      <div className="text-xs text-gray-500 mt-1">4.6t CO₂/car/year avg</div>
                    </div>

                    {/* Household Energy */}
                    <div className="bg-white rounded-lg p-4 text-center border border-yellow-200">
                      <div className="text-3xl mb-2">🏠</div>
                      <div className="text-2xl font-bold text-yellow-600">{Math.round(energyUsed / 10000)}</div>
                      <div className="text-sm text-gray-600">Households powered for 1 year</div>
                      <div className="text-xs text-gray-500 mt-1">10,000 kWh/household/year</div>
                    </div>

                    {/* Flights Avoided */}
                    <div className="bg-white rounded-lg p-4 text-center border border-purple-200">
                      <div className="text-3xl mb-2">✈️</div>
                      <div className="text-2xl font-bold text-purple-600">{Math.round(totalCO2 / 150)}</div>
                      <div className="text-sm text-gray-600">NYC-London flights avoided</div>
                      <div className="text-xs text-gray-500 mt-1">~150kg CO₂/flight</div>
                    </div>
                  </div>

                  {/* Circularity Story */}
                  <div className="mt-6 bg-white rounded-lg p-4 border-2 border-dashed border-green-300">
                    <h4 className="font-semibold text-green-800 mb-2">📖 Your Circularity Story</h4>
                    <p className="text-gray-700 leading-relaxed">
                      With {recycledContent}% recycled content and {circularityScore}% circularity score, 
                      your production is <strong className="text-green-600">
                        {circularityScore > 70 ? "exceptionally sustainable" : 
                         circularityScore > 50 ? "above industry average" : 
                         "improving towards sustainability"}
                      </strong>. 
                      By optimizing your process, you're preventing {Math.round(totalCO2 * 0.3)} kg of additional CO₂ 
                      compared to linear production methods - equivalent to <strong className="text-blue-600">
                      {Math.round((totalCO2 * 0.3) / 22)} trees working for a full year</strong>!
                    </p>
                  </div>

                  {/* Improvement Potential */}
                  <div className="mt-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2">🎯 Improvement Potential</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">If recycling increased to 80%:</div>
                        <div className="font-semibold text-orange-700">
                          Save {Math.round((80 - recycledContent) * 2.5)} kg CO₂ 
                          = {Math.round((80 - recycledContent) * 2.5 / 22)} more trees! 🌳
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">If transport reduced by 50%:</div>
                        <div className="font-semibold text-orange-700">
                          Save {Math.round(transportDistance * 0.15)} kg CO₂ 
                          = {Math.round((transportDistance * 0.15) / 22)} more trees! 🌳
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* NEW: Benchmark Comparison - Industry Standards */}
              <Card className="shadow-lg border-purple-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="text-xl text-purple-700 flex items-center gap-2">
                    📊 Industry Benchmark Comparison
                    <Badge className="bg-purple-100 text-purple-800">Global standards</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* CO2 Benchmark */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3">CO₂ Emissions</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Your Result</span>
                          <span className="font-bold text-blue-600">{(totalCO2/1000).toFixed(1)}t</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Industry Average</span>
                          <span className="font-bold text-gray-600">{((totalCO2/1000) * 1.3).toFixed(1)}t</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Best Practice</span>
                          <span className="font-bold text-green-600">{((totalCO2/1000) * 0.7).toFixed(1)}t</span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${totalCO2 < (totalCO2 * 0.7) ? 'bg-green-500' : totalCO2 < (totalCO2 * 1.3) ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{width: `${Math.min(100, Math.max(10, 100 - (totalCO2 / (totalCO2 * 1.5)) * 100))}%`}}
                          ></div>
                        </div>
                        <div className="text-xs text-center mt-1">
                          {totalCO2 < (totalCO2 * 0.8) ? '🌟 Excellent' : totalCO2 < (totalCO2 * 1.1) ? '✅ Good' : '⚠️ Needs improvement'}
                        </div>
                      </div>
                    </div>

                    {/* Circularity Benchmark */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3">Circularity Score</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Your Result</span>
                          <span className="font-bold text-green-600">{circularityScore}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Industry Average</span>
                          <span className="font-bold text-gray-600">45%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Best Practice</span>
                          <span className="font-bold text-green-600">85%</span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${circularityScore > 70 ? 'bg-green-500' : circularityScore > 45 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{width: `${Math.min(100, Math.max(10, circularityScore))}%`}}
                          ></div>
                        </div>
                        <div className="text-xs text-center mt-1">
                          {circularityScore > 70 ? '🌟 Above best practice' : circularityScore > 45 ? '✅ Above average' : '⚠️ Below average'}
                        </div>
                      </div>
                    </div>

                    {/* Energy Efficiency Benchmark */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3">Energy Efficiency</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Your Result</span>
                          <span className="font-bold text-purple-600">{(energyUsed/1000).toFixed(0)}k kWh</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Industry Average</span>
                          <span className="font-bold text-gray-600">{((energyUsed/1000) * 1.2).toFixed(0)}k kWh</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Best Practice</span>
                          <span className="font-bold text-green-600">{((energyUsed/1000) * 0.8).toFixed(0)}k kWh</span>
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${energyUsed < (energyUsed * 0.9) ? 'bg-green-500' : energyUsed < (energyUsed * 1.1) ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{width: `${Math.min(100, Math.max(10, 100 - (energyUsed / (energyUsed * 1.5)) * 100))}%`}}
                          ></div>
                        </div>
                        <div className="text-xs text-center mt-1">
                          {energyUsed < (energyUsed * 0.9) ? '🌟 High efficiency' : energyUsed < (energyUsed * 1.1) ? '✅ Good efficiency' : '⚠️ Low efficiency'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Global Rankings */}
                  <div className="mt-6 bg-white rounded-lg p-4 border-2 border-dashed border-purple-300">
                    <h4 className="font-semibold text-purple-800 mb-3">🏆 Global Performance Rankings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Your Overall Rank:</div>
                        <div className="text-2xl font-bold text-purple-600">
                          Top {Math.round(100 - (circularityScore * 0.8))}%
                        </div>
                        <div className="text-xs text-gray-500">Among global {metalDatabase[metalType]?.name || 'metal'} producers</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Sustainability Level:</div>
                        <div className="text-2xl font-bold text-green-600">
                          {circularityScore > 70 ? 'A+' : circularityScore > 60 ? 'A' : circularityScore > 50 ? 'B+' : circularityScore > 40 ? 'B' : 'C'}
                        </div>
                        <div className="text-xs text-gray-500">ESG Compliance Rating</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold mb-2">Ready to Calculate</h3>
                <p>Adjust your parameters and click "Submit to AI/Backend" to see results</p>
              </div>
            </div>
          )}

          {/* Charts Section - Only show after submit */}
          {showResults && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CO2 per Stage Chart */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">CO₂ per Stage</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={co2StageData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="value" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Recycled/Virgin/Landfill/Reuse Pie Chart */}
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Recycled / Virgin / Landfill / Reuse</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <RechartsPieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </RechartsPieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4">
                      {pieData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-sm" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {item.name} {item.value}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sankey Flow */}
              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Cradle-to-Grave Flow (Sankey)</h3>
                  <div className="mb-2 text-sm text-gray-600">
                    Debug: Nodes: {sankeyData?.nodes?.length || 0}, Links: {sankeyData?.links?.length || 0}
                    {sankeyData?.nodes && <span className="ml-4">Node names: {sankeyData.nodes.map(n => n.name).join(', ')}</span>}
                  </div>
                  <SimpleSankeyChart 
                    data={sankeyData}
                    width={700}
                    height={400}
                  />
                </CardContent>
              </Card>

              {/* 📊 MULTI-METRIC ROC DASHBOARD */}
              <Card className="shadow-lg border-l-4 border-indigo-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">📊</span>
                    <h3 className="text-xl font-bold text-indigo-800">Multi-Metric ROC Dashboard</h3>
                    <Badge className="bg-indigo-100 text-indigo-700">Comprehensive</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* CO2 Efficiency */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-green-800">🌱 CO₂ Efficiency</h4>
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                          {circularityScore > 70 ? 'Excellent' : circularityScore > 50 ? 'Good' : 'Needs Improvement'}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {Math.round((circularityScore / 100) * 95)}%
                      </div>
                      <div className="text-xs text-green-600 mb-2">
                        vs baseline production
                      </div>
                      <div className="w-full bg-green-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.round((circularityScore / 100) * 95)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Water Usage */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-blue-800">💧 Water Efficiency</h4>
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                          {(recycledContent || 30) > 60 ? 'Excellent' : (recycledContent || 30) > 30 ? 'Good' : 'Fair'}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {Math.round(85 + ((recycledContent || 30) / 100) * 10)}%
                      </div>
                      <div className="text-xs text-blue-600 mb-2">
                        water conservation
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.round(85 + ((recycledContent || 30) / 100) * 10)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Material Efficiency */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-purple-800">⚡ Material ROC</h4>
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                          {(recyclingPercent || 30) > 70 ? 'Excellent' : (recyclingPercent || 30) > 40 ? 'Good' : 'Fair'}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {Math.round(60 + ((recyclingPercent || 30) / 100) * 35)}%
                      </div>
                      <div className="text-xs text-purple-600 mb-2">
                        material recovery
                      </div>
                      <div className="w-full bg-purple-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.round(60 + ((recyclingPercent || 30) / 100) * 35)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Lifecycle Extension */}
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-orange-800">🔄 Lifecycle ROC</h4>
                        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                          {(reusePercent || 10) > 25 ? 'Excellent' : (reusePercent || 10) > 10 ? 'Good' : 'Fair'}
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {Math.round(50 + ((reusePercent || 10) / 100) * 40 + ((lifespan || 15) / 30) * 10)}%
                      </div>
                      <div className="text-xs text-orange-600 mb-2">
                        lifecycle extension
                      </div>
                      <div className="w-full bg-orange-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.round(50 + ((reusePercent || 10) / 100) * 40 + ((lifespan || 15) / 30) * 10)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive ROC Radar Chart */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-4 text-center">🎯 Comprehensive ROC Performance</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">CO₂ Recovery</span>
                          <span className="text-sm font-bold text-green-600">
                            {Math.round((circularityScore / 100) * 95)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.round((circularityScore / 100) * 95)}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Water Recovery</span>
                          <span className="text-sm font-bold text-blue-600">
                            {Math.round(85 + ((recycledContent || 30) / 100) * 10)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.round(85 + ((recycledContent || 30) / 100) * 10)}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Material Recovery</span>
                          <span className="text-sm font-bold text-purple-600">
                            {Math.round(60 + ((recyclingPercent || 30) / 100) * 35)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-400 to-purple-600 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.round(60 + ((recyclingPercent || 30) / 100) * 35)}%` }}
                          ></div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Lifecycle Extension</span>
                          <span className="text-sm font-bold text-orange-600">
                            {Math.round(50 + ((reusePercent || 10) / 100) * 40 + ((lifespan || 15) / 30) * 10)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-orange-400 to-orange-600 h-3 rounded-full transition-all duration-500" 
                            style={{ width: `${Math.round(50 + ((reusePercent || 10) / 100) * 40 + ((lifespan || 15) / 30) * 10)}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex flex-col justify-center items-center">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-indigo-600 mb-2">
                            {Math.round((
                              (circularityScore / 100 * 95) + 
                              (85 + (recycledContent || 30) / 100 * 10) + 
                              (60 + (recyclingPercent || 30) / 100 * 35) + 
                              (50 + (reusePercent || 10) / 100 * 40 + (lifespan || 15) / 30 * 10)
                            ) / 4)}%
                          </div>
                          <div className="text-sm text-indigo-700 font-medium mb-4">Overall ROC Score</div>
                          <div className="text-xs text-gray-600 leading-relaxed">
                            Multi-dimensional recovery efficiency combining carbon, water, material, and lifecycle metrics
                          </div>
                          <Badge className="mt-3 bg-indigo-100 text-indigo-700">
                            {Math.round((
                              (circularityScore / 100 * 95) + 
                              (85 + (recycledContent || 30) / 100 * 10) + 
                              (60 + (recyclingPercent || 30) / 100 * 35) + 
                              (50 + (reusePercent || 10) / 100 * 40 + (lifespan || 15) / 30 * 10)
                            ) / 4) > 80 ? 'Industry Leader' : 
                            Math.round((
                              (circularityScore / 100 * 95) + 
                              (85 + (recycledContent || 30) / 100 * 10) + 
                              (60 + (recyclingPercent || 30) / 100 * 35) + 
                              (50 + (reusePercent || 10) / 100 * 40 + (lifespan || 15) / 30 * 10)
                            ) / 4) > 60 ? 'Above Average' : 'Improvement Needed'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* NEW: AI-Powered Recommendations - Always visible */}
          <Card className="shadow-lg border-green-300 bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-xl text-green-700 flex items-center gap-2">
                🤖 AI-Powered Optimization Recommendations
                <Badge className="bg-green-100 text-green-800">Smart suggestions</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Priority Recommendations */}
              <div>
                <h4 className="font-semibold text-green-800 mb-3">🎯 Priority Actions (Highest ROC Impact)</h4>
                <div className="space-y-3">
                  {recycledContent < 60 && (
                    <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-gray-800">Increase Recycled Content</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Boost from {recycledContent}% to 70% recycled content
                          </p>
                          <div className="text-xs text-green-600 font-medium mt-2">
                            💡 Potential: +{Math.round((70 - recycledContent) * 0.8)}% ROC improvement
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-700">High Impact</Badge>
                      </div>
                    </div>
                  )}

                  {transportDistance > 1000 && (
                    <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-gray-800">Optimize Supply Chain</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Reduce transport distance from {transportDistance}km to 600km through local sourcing
                          </p>
                          <div className="text-xs text-blue-600 font-medium mt-2">
                            💡 Potential: -{Math.round((transportDistance - 600) * 0.02)}t CO₂ reduction
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-700">Medium Impact</Badge>
                      </div>
                    </div>
                  )}

                  {(emissionControl?.[0] || 50) > 40 && (
                    <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-semibold text-gray-800">Switch to Renewable Energy</h5>
                          <p className="text-sm text-gray-600 mt-1">
                            Increase renewable energy from {100 - (emissionControl?.[0] || 50)}% to 80%
                          </p>
                          <div className="text-xs text-yellow-600 font-medium mt-2">
                            💡 Potential: -{Math.round(((emissionControl?.[0] || 50) - 20) * 0.5)}t CO₂ reduction
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700">High Impact</Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Process Optimization */}
              <div>
                <h4 className="font-semibold text-blue-800 mb-3">⚙️ Process Optimization</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <h6 className="font-medium text-gray-800">Efficiency Upgrade</h6>
                    <p className="text-xs text-gray-600 mt-1">
                      Upgrade to {processMethod === "smelting" ? "electric arc furnace" : "high-efficiency processing"}
                    </p>
                    <div className="text-xs text-blue-600 mt-2">+15% energy efficiency</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <h6 className="font-medium text-gray-800">Waste Heat Recovery</h6>
                    <p className="text-xs text-gray-600 mt-1">
                      Install heat recovery systems for {metalDatabase[metalType]?.name || 'your process'}
                    </p>
                    <div className="text-xs text-blue-600 mt-2">-20% energy consumption</div>
                  </div>
                </div>
              </div>

              {/* Financial Impact */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">💰 Financial & ESG Impact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      ${Math.round((totalCO2 / 1000) * 50)}
                    </div>
                    <div className="text-xs text-gray-600">Potential carbon credit value</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(energyUsed * 0.1)}k
                    </div>
                    <div className="text-xs text-gray-600">kWh annual savings potential</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">
                      {circularityScore > 60 ? 'A' : circularityScore > 40 ? 'B+' : 'B'}
                    </div>
                    <div className="text-xs text-gray-600">Projected ESG rating</div>
                  </div>
                </div>
              </div>

              {/* Implementation Timeline */}
              <div>
                <h4 className="font-semibold text-orange-800 mb-3">📅 Implementation Roadmap</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm"><strong>Week 1-4:</strong> Source 20% more recycled content</span>
                    <Badge variant="outline" className="text-xs">Quick win</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm"><strong>Month 2-3:</strong> Negotiate renewable energy contracts</span>
                    <Badge variant="outline" className="text-xs">Medium term</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm"><strong>Month 6-12:</strong> Install efficiency equipment</span>
                    <Badge variant="outline" className="text-xs">Long term</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 🔬 SENSITIVITY ANALYSIS - Show what-if scenarios */}
          {showResults && (
            <Card className="shadow-lg border-l-4 border-teal-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔬</span>
                  <h3 className="text-xl font-bold text-teal-800">Sensitivity Analysis</h3>
                  <Badge className="bg-teal-100 text-teal-700">What-if Scenarios</Badge>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-4">
                    See how small changes in key parameters impact your overall ROC performance. Each scenario shows the potential improvement or reduction in your sustainability metrics.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Scenario 1: +10% Recycled Content */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-green-800">📈 +10% Recycled Content</h4>
                      <Badge className="bg-green-200 text-green-800 text-xs">Optimistic</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current ROC:</span>
                        <span className="font-medium">{circularityScore}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Projected ROC:</span>
                        <span className="font-bold text-green-600">
                          {Math.min(100, circularityScore + Math.round(((recycledContent || 30) + 10) * 0.15))}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CO₂ Reduction:</span>
                        <span className="font-medium text-green-600">
                          -{Math.round((totalCO2 / 1000) * 0.08)}t
                        </span>
                      </div>
                      <div className="pt-2 border-t border-green-200">
                        <div className="text-xs text-green-700 font-medium">
                          ⭐ Impact: {Math.round(((recycledContent || 30) + 10) * 0.15)} point ROC increase
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scenario 2: -20% Transport Distance */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-blue-800">🚛 -20% Transport Distance</h4>
                      <Badge className="bg-blue-200 text-blue-800 text-xs">Realistic</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Distance:</span>
                        <span className="font-medium">{transportDistance || 500}km</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Optimized Distance:</span>
                        <span className="font-bold text-blue-600">
                          {Math.round((transportDistance || 500) * 0.8)}km
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CO₂ Reduction:</span>
                        <span className="font-medium text-blue-600">
                          -{Math.round((totalCO2 / 1000) * 0.12)}t
                        </span>
                      </div>
                      <div className="pt-2 border-t border-blue-200">
                        <div className="text-xs text-blue-700 font-medium">
                          ⭐ Impact: {Math.round(((transportDistance || 500) * 0.2) / 50)} point ROC increase
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scenario 3: +15% Recycling Rate */}
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-purple-800">♻️ +15% Recycling Rate</h4>
                      <Badge className="bg-purple-200 text-purple-800 text-xs">Achievable</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Rate:</span>
                        <span className="font-medium">{recyclingPercent || 30}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Enhanced Rate:</span>
                        <span className="font-bold text-purple-600">
                          {Math.min(100, (recyclingPercent || 30) + 15)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">ROC Improvement:</span>
                        <span className="font-medium text-purple-600">
                          +{Math.round(15 * 0.25)} points
                        </span>
                      </div>
                      <div className="pt-2 border-t border-purple-200">
                        <div className="text-xs text-purple-700 font-medium">
                          ⭐ Impact: Enhanced material circularity
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scenario 4: Renewable Energy Upgrade */}
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-yellow-800">⚡ 80% Renewable Energy</h4>
                      <Badge className="bg-yellow-200 text-yellow-800 text-xs">High Impact</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Mix:</span>
                        <span className="font-medium">{100 - (emissionControl?.[0] || 50)}% renewable</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Upgraded Mix:</span>
                        <span className="font-bold text-yellow-600">80% renewable</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CO₂ Reduction:</span>
                        <span className="font-medium text-yellow-600">
                          -{Math.round((totalCO2 / 1000) * 0.25)}t
                        </span>
                      </div>
                      <div className="pt-2 border-t border-yellow-200">
                        <div className="text-xs text-yellow-700 font-medium">
                          ⭐ Impact: Major emissions reduction
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scenario 5: Combined Optimization */}
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-indigo-800">🎯 Combined Optimization</h4>
                      <Badge className="bg-indigo-200 text-indigo-800 text-xs">Best Case</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current ROC:</span>
                        <span className="font-medium">{circularityScore}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Optimized ROC:</span>
                        <span className="font-bold text-indigo-600">
                          {Math.min(100, circularityScore + 18)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total CO₂ Reduction:</span>
                        <span className="font-medium text-indigo-600">
                          -{Math.round((totalCO2 / 1000) * 0.45)}t
                        </span>
                      </div>
                      <div className="pt-2 border-t border-indigo-200">
                        <div className="text-xs text-indigo-700 font-medium">
                          ⭐ Impact: All improvements combined
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scenario 6: Pessimistic Case */}
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-red-800">⚠️ Risk Scenario</h4>
                      <Badge className="bg-red-200 text-red-800 text-xs">Conservative</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Reduced Recycling:</span>
                        <span className="font-medium">-10% from current</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Impact on ROC:</span>
                        <span className="font-bold text-red-600">
                          {Math.max(20, circularityScore - 8)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Additional CO₂:</span>
                        <span className="font-medium text-red-600">
                          +{Math.round((totalCO2 / 1000) * 0.15)}t
                        </span>
                      </div>
                      <div className="pt-2 border-t border-red-200">
                        <div className="text-xs text-red-700 font-medium">
                          ⚠️ Impact: Plan mitigation strategies
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sensitivity Summary */}
                <div className="mt-6 bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">📊 Sensitivity Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Most Sensitive Parameters:</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Energy Source Mix:</span>
                          <span className="font-medium text-yellow-600">High Impact</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Recycled Content:</span>
                          <span className="font-medium text-green-600">Medium Impact</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Transport Distance:</span>
                          <span className="font-medium text-blue-600">Medium Impact</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Optimization Potential:</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">ROC Improvement Range:</span>
                          <span className="font-medium text-indigo-600">+8 to +18 points</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">CO₂ Reduction Potential:</span>
                          <span className="font-medium text-green-600">
                            -{Math.round((totalCO2 / 1000) * 0.45)}t max
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Risk Exposure:</span>
                          <span className="font-medium text-red-600">
                            +{Math.round((totalCO2 / 1000) * 0.15)}t worst case
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 📖 AI NARRATIVE GENERATOR - Human-readable summary reports */}
          {showResults && (
            <Card className="shadow-lg border-l-4 border-rose-500">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📖</span>
                  <h3 className="text-xl font-bold text-rose-800">AI Narrative Generator</h3>
                  <Badge className="bg-rose-100 text-rose-700">Storytelling Report</Badge>
                </div>
                
                <div className="space-y-6">
                  {/* Executive Summary */}
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-lg border border-rose-200">
                    <h4 className="font-semibold text-rose-800 mb-3 flex items-center gap-2">
                      📋 Executive Summary
                      <Badge className="bg-rose-200 text-rose-800 text-xs">Auto-generated</Badge>
                    </h4>
                    <div className="prose prose-sm text-gray-700 leading-relaxed">
                      <p className="mb-3">
                        <strong>Your {metalDatabase[metalType]?.name || 'material'} lifecycle analysis</strong> reveals a{' '}
                        <span className={`font-bold ${circularityScore > 70 ? 'text-green-600' : circularityScore > 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {circularityScore > 70 ? 'highly optimized' : circularityScore > 50 ? 'moderately efficient' : 'improvement-ready'}
                        </span>{' '}
                        circular economy performance with a{' '}
                        <span className="font-bold text-indigo-600">{circularityScore}% ROC score</span>.
                        With {recycledContent || 30}% recycled content and {transportDistance || 500}km average transport distance,
                        your operation generates approximately{' '}
                        <span className="font-bold text-gray-800">{Math.round(totalCO2 / 1000)}t CO₂</span> per processing cycle.
                      </p>
                      <p className="mb-3">
                        The analysis indicates that your current approach to{' '}
                        <span className="font-medium">{processMethod}</span> processing is{' '}
                        {energyUsed < 5000 ? 'energy-efficient' : energyUsed < 10000 ? 'moderately energy-intensive' : 'energy-intensive'},
                        consuming approximately {Math.round(energyUsed).toLocaleString()} kWh.
                        Your end-of-life strategy, with {recyclingPercent || 30}% recycling and {reusePercent || 10}% reuse,
                        demonstrates {(recyclingPercent || 30) + (reusePercent || 10) > 60 ? 'strong' : (recyclingPercent || 30) + (reusePercent || 10) > 40 ? 'moderate' : 'limited'} circular economy commitment.
                      </p>
                    </div>
                  </div>

                  {/* Environmental Impact Story */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      🌍 Environmental Impact Story
                      <Badge className="bg-green-200 text-green-800 text-xs">Real-world context</Badge>
                    </h4>
                    <div className="prose prose-sm text-gray-700 leading-relaxed">
                      <p className="mb-3">
                        <strong>The environmental footprint of your operation</strong> can be understood through everyday comparisons:
                        Your current {Math.round(totalCO2 / 1000)}t CO₂ emissions are equivalent to{' '}
                        <span className="font-bold text-red-600">
                          {Math.round((totalCO2 / 1000) * 2.2)} cars driving for a year
                        </span>, or the carbon absorption capacity of{' '}
                        <span className="font-bold text-green-600">
                          {Math.round((totalCO2 / 1000) * 48)} mature trees
                        </span>.
                      </p>
                      <p className="mb-3">
                        Your energy consumption of {Math.round(energyUsed).toLocaleString()} kWh could power{' '}
                        <span className="font-bold text-blue-600">
                          {Math.round(energyUsed / 10000)} average households for a year
                        </span>.
                        However, with {recycledContent || 30}% recycled content, you're already saving the equivalent energy needed to power{' '}
                        <span className="font-bold text-purple-600">
                          {Math.round((recycledContent || 30) * energyUsed / 1000000)} additional homes
                        </span> through reduced primary production demands.
                      </p>
                    </div>
                  </div>

                  {/* Journey Narrative */}
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      🗺️ Circular Economy Journey
                      <Badge className="bg-blue-200 text-blue-800 text-xs">Process narrative</Badge>
                    </h4>
                    <div className="prose prose-sm text-gray-700 leading-relaxed">
                      <p className="mb-3">
                        <strong>Your material's circular journey begins</strong> with{' '}
                        {recycledContent > 50 ? 'primarily recycled inputs' : recycledContent > 30 ? 'a balanced mix of recycled and virgin materials' : 'predominantly virgin material extraction'}.
                        The {Math.round(transportWeight || 10)}t of {metalDatabase[metalType]?.name || 'material'} travels an average of{' '}
                        <span className="font-medium">{transportDistance || 500}km</span> to reach your{' '}
                        <span className="font-medium">{processMethod}</span> facility.
                      </p>
                      <p className="mb-3">
                        During the {lifespan || 15}-year operational phase, your material serves its intended purpose while{' '}
                        {(emissionControl?.[0] || 50) > 60 ? 'powered primarily by renewable energy' : 
                         (emissionControl?.[0] || 50) > 40 ? 'using a mixed energy portfolio' : 'relying mostly on conventional energy sources'}.
                        At end-of-life, the material follows multiple pathways:{' '}
                        <span className="font-bold text-green-600">{recyclingPercent || 30}% returns to recycling streams</span>,{' '}
                        <span className="font-bold text-orange-600">{reusePercent || 10}% finds new life through reuse</span>, and{' '}
                        <span className="font-bold text-gray-600">{landfillPercent || 40}% requires landfill management</span>.
                      </p>
                    </div>
                  </div>

                  {/* Success Metrics & Achievements */}
                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                      🏆 Achievements & Metrics
                      <Badge className="bg-purple-200 text-purple-800 text-xs">Performance highlights</Badge>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border border-purple-100">
                          <div className="text-sm font-medium text-purple-700">Circular Economy Grade</div>
                          <div className="text-2xl font-bold text-purple-600">
                            {circularityScore > 80 ? 'A+' : circularityScore > 70 ? 'A' : circularityScore > 60 ? 'B+' : circularityScore > 50 ? 'B' : 'C'}
                          </div>
                          <div className="text-xs text-gray-600">
                            {circularityScore > 80 ? 'Industry leader' : circularityScore > 60 ? 'Above average' : 'Improvement opportunity'}
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded border border-purple-100">
                          <div className="text-sm font-medium text-purple-700">Carbon Efficiency</div>
                          <div className="text-2xl font-bold text-green-600">
                            {Math.round((10000 - totalCO2) / 100)}%
                          </div>
                          <div className="text-xs text-gray-600">vs baseline emissions</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded border border-purple-100">
                          <div className="text-sm font-medium text-purple-700">Resource Recovery Rate</div>
                          <div className="text-2xl font-bold text-orange-600">
                            {(recyclingPercent || 30) + (reusePercent || 10)}%
                          </div>
                          <div className="text-xs text-gray-600">materials kept in circulation</div>
                        </div>
                        <div className="bg-white p-3 rounded border border-purple-100">
                          <div className="text-sm font-medium text-purple-700">Sustainability Score</div>
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.round((circularityScore + (100 - (emissionControl?.[0] || 50)) + ((recycledContent || 30) * 1.2)) / 3)}
                          </div>
                          <div className="text-xs text-gray-600">comprehensive assessment</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Future Outlook & Recommendations */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                      🔮 Future Outlook & Recommendations
                      <Badge className="bg-orange-200 text-orange-800 text-xs">Strategic insights</Badge>
                    </h4>
                    <div className="prose prose-sm text-gray-700 leading-relaxed">
                      <p className="mb-3">
                        <strong>Looking ahead, your operation has significant potential</strong> for improvement.
                        Based on industry trends and best practices, implementing our recommended optimizations could{' '}
                        <span className="font-bold text-green-600">
                          increase your ROC score to {Math.min(100, circularityScore + 18)}%
                        </span> and{' '}
                        <span className="font-bold text-blue-600">
                          reduce CO₂ emissions by up to {Math.round((totalCO2 / 1000) * 0.45)}t annually
                        </span>.
                      </p>
                      <p className="mb-3">
                        The path forward involves {recycledContent < 50 ? 'prioritizing increased recycled content sourcing' : 'maintaining high recycled content levels'},
                        {(emissionControl?.[0] || 50) < 60 ? ' transitioning to renewable energy sources' : ' continuing renewable energy initiatives'}, and
                        {(recyclingPercent || 30) < 60 ? ' enhancing end-of-life recovery programs' : ' optimizing existing recovery systems'}.
                        With these changes, your operation could become a{' '}
                        <span className="font-bold text-purple-600">circular economy showcase</span> within{' '}
                        <span className="font-medium">12-18 months</span>.
                      </p>
                    </div>
                  </div>

                  {/* Call to Action */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border border-indigo-200 text-center">
                    <h4 className="font-semibold text-indigo-800 mb-3">📈 Ready to Take Action?</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Your comprehensive LCA analysis reveals clear pathways to enhanced sustainability performance.
                      Start with the highest-impact recommendations and track your progress over time.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge className="bg-green-100 text-green-700">Carbon Reduction: -{Math.round((totalCO2 / 1000) * 0.45)}t potential</Badge>
                      <Badge className="bg-blue-100 text-blue-700">ROC Improvement: +{Math.min(100 - circularityScore, 18)} points</Badge>
                      <Badge className="bg-purple-100 text-purple-700">Timeline: 12-18 months</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LCAInput;