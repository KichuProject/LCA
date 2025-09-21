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

          {/* Results Section - Only show after submit */}
          {showResults ? (
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
            </>
          )}

          {/* Reduction Suggestions - Always visible */}
          <Card className="shadow-lg border-success">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-success">Reduction Suggestions</h3>
                <Badge className="bg-success text-white">4 tips</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LCAInput;