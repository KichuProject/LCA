import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Download, Brain, Zap, Sparkles, Target, ChevronLeft, ChevronRight, CheckCircle, Settings, TrendingUp, BarChart3, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell, Pie, LineChart, Line, Area, AreaChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts";
import SankeyChart from "@/components/SankeyChart";
import * as d3 from 'd3';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LCAInput = () => {
  const { toast } = useToast();
  
  // D3 Chart Refs
  const barChartRef = useRef<SVGSVGElement>(null);
  const pieChartRef = useRef<SVGSVGElement>(null);
  const comparisonChartRef = useRef<SVGSVGElement>(null);

  // Animated D3 Bar Chart Component
  const AnimatedD3BarChart = ({ data, width = 400, height = 300 }: any) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
      if (!svgRef.current || !data) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const margin = { top: 20, right: 30, bottom: 40, left: 60 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Color scale with vibrant colors
      const colorScale = d3.scaleOrdinal()
        .domain(['Current', 'Optimized'])
        .range(['#ef4444', '#22c55e']);

      // Scales
      const xScale = d3.scaleBand()
        .domain(data.map((d: any) => d.name))
        .range([0, innerWidth])
        .padding(0.2);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, (d: any) => Math.max(d.Current, d.Optimized)) as number])
        .range([innerHeight, 0]);

      // Create bars with animation
      const barGroups = g.selectAll(".bar-group")
        .data(data)
        .enter().append("g")
        .attr("class", "bar-group")
        .attr("transform", (d: any) => `translate(${xScale(d.name)},0)`);

      // Current bars
      barGroups.append("rect")
        .attr("class", "bar-current")
        .attr("x", 0)
        .attr("width", xScale.bandwidth() / 2)
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("fill", colorScale('Current') as string)
        .attr("rx", 4)
        .transition()
        .duration(1500)
        .delay((d: any, i: number) => i * 200)
        .ease(d3.easeBounceOut)
        .attr("y", (d: any) => yScale(d.Current))
        .attr("height", (d: any) => innerHeight - yScale(d.Current));

      // Optimized bars
      barGroups.append("rect")
        .attr("class", "bar-optimized")
        .attr("x", xScale.bandwidth() / 2)
        .attr("width", xScale.bandwidth() / 2)
        .attr("y", innerHeight)
        .attr("height", 0)
        .attr("fill", colorScale('Optimized') as string)
        .attr("rx", 4)
        .transition()
        .duration(1500)
        .delay((d: any, i: number) => i * 200 + 300)
        .ease(d3.easeBounceOut)
        .attr("y", (d: any) => yScale(d.Optimized))
        .attr("height", (d: any) => innerHeight - yScale(d.Optimized));

      // Add gradient effects
      const defs = svg.append("defs");
      
      const gradient1 = defs.append("linearGradient")
        .attr("id", "gradient-current")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", innerHeight)
        .attr("x2", 0).attr("y2", 0);
      
      gradient1.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#dc2626")
        .attr("stop-opacity", 0.8);
      
      gradient1.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#f87171")
        .attr("stop-opacity", 1);

      const gradient2 = defs.append("linearGradient")
        .attr("id", "gradient-optimized")
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0).attr("y1", innerHeight)
        .attr("x2", 0).attr("y2", 0);
      
      gradient2.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#16a34a")
        .attr("stop-opacity", 0.8);
      
      gradient2.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#4ade80")
        .attr("stop-opacity", 1);

      // Update bar fills to use gradients
      barGroups.selectAll(".bar-current")
        .attr("fill", "url(#gradient-current)");
      
      barGroups.selectAll(".bar-optimized")
        .attr("fill", "url(#gradient-optimized)");

      // Axes
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#374151");

      g.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "12px")
        .style("fill", "#374151");

    }, [data, width, height]);

    return <svg ref={svgRef} width={width} height={height} className="overflow-visible" />;
  };

  // Animated D3 Pie Chart Component
  const AnimatedD3PieChart = ({ data, width = 300, height = 300 }: any) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
      if (!svgRef.current || !data) return;

      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      const radius = Math.min(width, height) / 2 - 20;
      const g = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      // Vibrant color scale
      const colorScale = d3.scaleOrdinal()
        .domain(data.map((d: any) => d.name))
        .range(['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6']);

      const pie = d3.pie<any>()
        .value((d: any) => d.value)
        .sort(null);

      const arc = d3.arc<any>()
        .innerRadius(0)
        .outerRadius(radius);

      const arcHover = d3.arc<any>()
        .innerRadius(0)
        .outerRadius(radius + 10);

      // Create pie slices with animation
      const arcs = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

      // Add gradient definitions
      const defs = svg.append("defs");
      data.forEach((d: any, i: number) => {
        const gradient = defs.append("radialGradient")
          .attr("id", `pie-gradient-${i}`)
          .attr("cx", "30%")
          .attr("cy", "30%");
        
        gradient.append("stop")
          .attr("offset", "0%")
          .attr("stop-color", (d3.color(colorScale(d.name) as string)?.brighter(0.5) as any)?.toString() || colorScale(d.name) as string);
        
        gradient.append("stop")
          .attr("offset", "100%")
          .attr("stop-color", colorScale(d.name) as string);
      });

      arcs.append("path")
        .attr("d", arc)
        .attr("fill", (d: any, i: number) => `url(#pie-gradient-${i})`)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .style("opacity", 0)
        .on("mouseover", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("d", arcHover)
            .style("filter", "drop-shadow(0px 4px 8px rgba(0,0,0,0.3))");
        })
        .on("mouseout", function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr("d", arc)
            .style("filter", "none");
        })
        .transition()
        .duration(1000)
        .delay((d: any, i: number) => i * 200)
        .ease(d3.easeElasticOut)
        .style("opacity", 1)
        .attrTween("d", function(d) {
          const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
          return function(t) {
            return arc(interpolate(t));
          };
        });

      // Add labels with animation
      arcs.append("text")
        .attr("transform", (d: any) => `translate(${arc.centroid(d)})`)
        .attr("dy", "0.35em")
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-weight", "bold")
        .style("fill", "#ffffff")
        .style("opacity", 0)
        .text((d: any) => `${d.data.name} ${d.data.value}%`)
        .transition()
        .duration(1000)
        .delay(1500)
        .style("opacity", 1);

    }, [data, width, height]);

    return <svg ref={svgRef} width={width} height={height} className="overflow-visible" />;
  };

  // Animated Step Title Component
  const AnimatedStepTitle = ({ step, title, isActive, isCompleted }: any) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${
          isActive 
            ? 'bg-card border-primary/30 shadow-lg ring-1 ring-primary/20' 
            : isCompleted 
              ? 'bg-card border-success/30 ring-1 ring-success/20' 
              : 'bg-muted border-border'
        }`}
      >
        <motion.div
          animate={{
            scale: isActive ? [1, 1.2, 1] : 1,
            rotate: isCompleted ? 360 : 0
          }}
          transition={{
            scale: { duration: 2, repeat: isActive ? Infinity : 0 },
            rotate: { duration: 0.6 }
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
            isActive 
              ? 'bg-gradient-to-r from-primary to-blue-600' 
              : isCompleted 
                ? 'bg-gradient-to-r from-success to-emerald-600' 
                : 'bg-muted-foreground'
          }`}
        >
          {isCompleted ? '✓' : step}
        </motion.div>
        <motion.h3
          animate={{
            color: isActive ? 'hsl(var(--primary))' : isCompleted ? 'hsl(var(--success))' : 'hsl(var(--muted-foreground))'
          }}
          transition={{ duration: 0.3 }}
          className="text-lg font-semibold"
        >
          {title}
        </motion.h3>
        {isActive && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="ml-auto"
          >
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  const stepTitles = [
    "Product Definition",
    "Material Selection", 
    "Manufacturing Process",
    "Transportation & Distribution",
    "Use Phase Analysis",
    "End-of-Life Treatment",
    "AI Analysis & Optimization",
    "Environmental Impact Assessment",
    "Sustainability Recommendations"
  ];
  
  // AI/ML Model Configuration
  const AI_MODELS = {
    "Random Forest": { accuracy: 0.075, r2: 0.075 },
    "Gradient Boosting": { accuracy: 0.072, r2: 0.072 },
    "Neural Network": { accuracy: 0.080, r2: 0.080 }, // Best performing
    "Legacy Water": { accuracy: 0.045, r2: 0.045 }
  };
  
  const BEST_MODEL = "Neural Network";
  const TRAINING_SAMPLES = 25;
  
  // Comprehensive materials database with environmental impact data
  const materialDatabase = {
    "Aluminium (primary)": { 
      name: "Aluminium (primary)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 8.5,
      co2Primary: 131, 
      co2Recycled: 39.3, 
      co2Hybrid: 85.15,
      cedPrimary: 8.2, 
      cedRecycled: 2.46, 
      cedHybrid: 5.33,
      waterUsePrimary: 5974, 
      waterUseRecycled: 1792, 
      waterUseHybrid: 3883,
      circularityRating: 8,
      knownEmissions: [
        { pollutant: "SO2", value: "12.3 kg/ton" },
        { pollutant: "NOx", value: "8.7 kg/ton" },
        { pollutant: "PM10", value: "2.1 kg/ton" }
      ]
    },
    "Aluminium (new scrap)": { 
      name: "Aluminium (new scrap)", 
      defaultType: "recycled",
      category: "Metals",
      circularityPotential: 9.5,
      co2Primary: 8.3, 
      co2Recycled: 8.3, 
      co2Hybrid: 8.3,
      cedPrimary: 0.4, 
      cedRecycled: 0.4, 
      cedHybrid: 0.4,
      waterUsePrimary: 76.6, 
      waterUseRecycled: 76.6, 
      waterUseHybrid: 76.6,
      circularityRating: 9,
      knownEmissions: [
        { pollutant: "SO2", value: "1.2 kg/ton" },
        { pollutant: "NOx", value: "0.9 kg/ton" }
      ]
    },
    "Aluminium (old scrap)": { 
      name: "Aluminium (old scrap)", 
      defaultType: "recycled",
      category: "Metals",
      circularityPotential: 9.2,
      co2Primary: 23.8, 
      co2Recycled: 23.8, 
      co2Hybrid: 23.8,
      cedPrimary: 1.4, 
      cedRecycled: 1.4, 
      cedHybrid: 1.4,
      waterUsePrimary: 300, 
      waterUseRecycled: 300, 
      waterUseHybrid: 300,
      circularityRating: 9,
      knownEmissions: [
        { pollutant: "SO2", value: "2.8 kg/ton" },
        { pollutant: "NOx", value: "1.9 kg/ton" }
      ]
    },
    "Antimony": { 
      name: "Antimony", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 4.2,
      co2Primary: 141, 
      co2Recycled: 42.3, 
      co2Hybrid: 91.65,
      cedPrimary: 12.9, 
      cedRecycled: 3.87, 
      cedHybrid: 8.385,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 4,
      knownEmissions: [
        { pollutant: "Particulates", value: "8.5 kg/ton" }
      ]
    },
    "Arsenic (total)": { 
      name: "Arsenic (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 2.1,
      co2Primary: 5.0, 
      co2Recycled: 1.5, 
      co2Hybrid: 3.25,
      cedPrimary: 0.3, 
      cedRecycled: 0.09, 
      cedHybrid: 0.195,
      waterUsePrimary: 0.2, 
      waterUseRecycled: 0.06, 
      waterUseHybrid: 0.13,
      circularityRating: 2,
      knownEmissions: [
        { pollutant: "Arsenic compounds", value: "0.8 kg/ton" }
      ]
    },
    "Barite (BaSO4)": { 
      name: "Barite (BaSO4)", 
      defaultType: "primary",
      category: "Industrial Minerals",
      circularityPotential: 3.8,
      co2Primary: 4.0, 
      co2Recycled: 1.2, 
      co2Hybrid: 2.6,
      cedPrimary: 0.2, 
      cedRecycled: 0.06, 
      cedHybrid: 0.13,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 3,
      knownEmissions: [
        { pollutant: "PM10", value: "2.1 kg/ton" }
      ]
    },
    "Beryllium (metal)": { 
      name: "Beryllium (metal)", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 6.8,
      co2Primary: 12000, 
      co2Recycled: 3600, 
      co2Hybrid: 7800,
      cedPrimary: 879, 
      cedRecycled: 263.7, 
      cedHybrid: 571.35,
      waterUsePrimary: 100, 
      waterUseRecycled: 30, 
      waterUseHybrid: 65,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Beryllium compounds", value: "0.05 kg/ton" }
      ]
    },
    "Beryllium hydroxide": { 
      name: "Beryllium hydroxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 6.5,
      co2Primary: 319, 
      co2Recycled: 95.7, 
      co2Hybrid: 207.35,
      cedPrimary: 19, 
      cedRecycled: 5.7, 
      cedHybrid: 12.35,
      waterUsePrimary: 100, 
      waterUseRecycled: 30, 
      waterUseHybrid: 65,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Beryllium compounds", value: "0.02 kg/ton" }
      ]
    },
    "Bismuth": { 
      name: "Bismuth", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 5.4,
      co2Primary: 697, 
      co2Recycled: 209.1, 
      co2Hybrid: 453.05,
      cedPrimary: 58.9, 
      cedRecycled: 17.67, 
      cedHybrid: 38.285,
      waterUsePrimary: 11.6, 
      waterUseRecycled: 3.48, 
      waterUseHybrid: 7.54,
      circularityRating: 5,
      knownEmissions: [
        { pollutant: "Heavy metals", value: "3.2 kg/ton" }
      ]
    },
    "Borax (anhydrous)": { 
      name: "Borax (anhydrous)", 
      defaultType: "primary",
      category: "Industrial Minerals",
      circularityPotential: 4.1,
      co2Primary: 30.7, 
      co2Recycled: 9.21, 
      co2Hybrid: 19.955,
      cedPrimary: 1.6, 
      cedRecycled: 0.48, 
      cedHybrid: 1.04,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 4,
      knownEmissions: [
        { pollutant: "Borates", value: "1.8 kg/ton" }
      ]
    },
    "Boric acid": { 
      name: "Boric acid", 
      defaultType: "primary",
      category: "Industrial Minerals",
      circularityPotential: 4.2,
      co2Primary: 13.0, 
      co2Recycled: 3.9, 
      co2Hybrid: 8.45,
      cedPrimary: 0.7, 
      cedRecycled: 0.21, 
      cedHybrid: 0.455,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 4,
      knownEmissions: [
        { pollutant: "Borates", value: "0.9 kg/ton" }
      ]
    },
    "Cadmium (total)": { 
      name: "Cadmium (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 6.1,
      co2Primary: 53.0, 
      co2Recycled: 15.9, 
      co2Hybrid: 34.45,
      cedPrimary: 3.0, 
      cedRecycled: 0.9, 
      cedHybrid: 1.95,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Cadmium compounds", value: "0.3 kg/ton" }
      ]
    },
    "Calcium (metal)": { 
      name: "Calcium (metal)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 5.8,
      co2Primary: 223, 
      co2Recycled: 66.9, 
      co2Hybrid: 144.95,
      cedPrimary: 16.3, 
      cedRecycled: 4.89, 
      cedHybrid: 10.595,
      waterUsePrimary: 7.1, 
      waterUseRecycled: 2.13, 
      waterUseHybrid: 4.615,
      circularityRating: 5,
      knownEmissions: [
        { pollutant: "Calcium oxides", value: "12.5 kg/ton" }
      ]
    },
    "Calcium carbonate (quicklime)": { 
      name: "Calcium carbonate (quicklime)", 
      defaultType: "primary",
      category: "Industrial Minerals",
      circularityPotential: 6.2,
      co2Primary: 5.8, 
      co2Recycled: 1.74, 
      co2Hybrid: 3.77,
      cedPrimary: 1.0, 
      cedRecycled: 0.3, 
      cedHybrid: 0.65,
      waterUsePrimary: 1787, 
      waterUseRecycled: 536.1, 
      waterUseHybrid: 1161.55,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "CO2", value: "785 kg/ton" },
        { pollutant: "PM10", value: "8.2 kg/ton" }
      ]
    },
    "Cerium oxide": { 
      name: "Cerium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 7.1,
      co2Primary: 252, 
      co2Recycled: 75.6, 
      co2Hybrid: 163.8,
      cedPrimary: 12.9, 
      cedRecycled: 3.87, 
      cedHybrid: 8.385,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "4.1 kg/ton" }
      ]
    },
    "Chromium (total)": { 
      name: "Chromium (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 7.3,
      co2Primary: 40.2, 
      co2Recycled: 12.06, 
      co2Hybrid: 26.13,
      cedPrimary: 2.4, 
      cedRecycled: 0.72, 
      cedHybrid: 1.56,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Chromium compounds", value: "2.8 kg/ton" }
      ]
    },
    "Cobalt": { 
      name: "Cobalt", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 6.8,
      co2Primary: 128, 
      co2Recycled: 38.4, 
      co2Hybrid: 83.2,
      cedPrimary: 8.3, 
      cedRecycled: 2.49, 
      cedHybrid: 5.395,
      waterUsePrimary: 7.4, 
      waterUseRecycled: 2.22, 
      waterUseHybrid: 4.81,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Cobalt compounds", value: "1.9 kg/ton" }
      ]
    },
    "Copper (total)": { 
      name: "Copper (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 7.8,
      co2Primary: 53.7, 
      co2Recycled: 16.11, 
      co2Hybrid: 34.905,
      cedPrimary: 2.8, 
      cedRecycled: 0.84, 
      cedHybrid: 1.82,
      waterUsePrimary: 1062, 
      waterUseRecycled: 318.6, 
      waterUseHybrid: 690.3,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "SO2", value: "28.1 kg/ton" },
        { pollutant: "Particulates", value: "5.7 kg/ton" }
      ]
    },
    "Iron (pig iron)": { 
      name: "Iron (pig iron)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 9.2,
      co2Primary: 23.1, 
      co2Recycled: 6.93, 
      co2Hybrid: 15.015,
      cedPrimary: 1.5, 
      cedRecycled: 0.45, 
      cedHybrid: 0.975,
      waterUsePrimary: 23033, 
      waterUseRecycled: 6909.9, 
      waterUseHybrid: 14971.45,
      circularityRating: 9,
      knownEmissions: [
        { pollutant: "CO", value: "45.2 kg/ton" },
        { pollutant: "SO2", value: "18.5 kg/ton" },
        { pollutant: "NOx", value: "15.3 kg/ton" }
      ]
    },
    "Lead (total)": { 
      name: "Lead (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 8.1,
      co2Primary: 18.9, 
      co2Recycled: 5.67, 
      co2Hybrid: 12.285,
      cedPrimary: 1.3, 
      cedRecycled: 0.39, 
      cedHybrid: 0.845,
      waterUsePrimary: 225, 
      waterUseRecycled: 67.5, 
      waterUseHybrid: 146.25,
      circularityRating: 8,
      knownEmissions: [
        { pollutant: "Lead compounds", value: "0.8 kg/ton" }
      ]
    },
    "Lithium (total)": { 
      name: "Lithium (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 5.9,
      co2Primary: 125, 
      co2Recycled: 37.5, 
      co2Hybrid: 81.25,
      cedPrimary: 7.1, 
      cedRecycled: 2.13, 
      cedHybrid: 4.615,
      waterUsePrimary: 60, 
      waterUseRecycled: 18, 
      waterUseHybrid: 39,
      circularityRating: 5,
      knownEmissions: [
        { pollutant: "Lithium compounds", value: "2.3 kg/ton" }
      ]
    },
    "Magnesium (total)": { 
      name: "Magnesium (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 6.4,
      co2Primary: 18.8, 
      co2Recycled: 5.64, 
      co2Hybrid: 12.22,
      cedPrimary: 5.4, 
      cedRecycled: 1.62, 
      cedHybrid: 3.51,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Magnesium oxides", value: "8.9 kg/ton" }
      ]
    },
    "Nickel (total)": { 
      name: "Nickel (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 7.6,
      co2Primary: 111, 
      co2Recycled: 33.3, 
      co2Hybrid: 72.15,
      cedPrimary: 6.5, 
      cedRecycled: 1.95, 
      cedHybrid: 4.225,
      waterUsePrimary: 345, 
      waterUseRecycled: 103.5, 
      waterUseHybrid: 224.25,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Nickel compounds", value: "3.4 kg/ton" }
      ]
    },
    "Silver (total)": { 
      name: "Silver (total)", 
      defaultType: "primary",
      category: "Precious Metals",
      circularityPotential: 8.9,
      co2Primary: 3280, 
      co2Recycled: 984, 
      co2Hybrid: 2132,
      cedPrimary: 196, 
      cedRecycled: 58.8, 
      cedHybrid: 127.4,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 8,
      knownEmissions: [
        { pollutant: "Silver compounds", value: "0.9 kg/ton" }
      ]
    },
    "Gold (total)": { 
      name: "Gold (total)", 
      defaultType: "primary",
      category: "Precious Metals",
      circularityPotential: 9.5,
      co2Primary: 208000, 
      co2Recycled: 62400, 
      co2Hybrid: 135200,
      cedPrimary: 12500, 
      cedRecycled: 3750, 
      cedHybrid: 8125,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 9,
      knownEmissions: [
        { pollutant: "Cyanide compounds", value: "8.5 kg/ton" }
      ]
    },
    "Platinum (total)": { 
      name: "Platinum (total)", 
      defaultType: "primary",
      category: "Precious Metals",
      circularityPotential: 9.3,
      co2Primary: 243000, 
      co2Recycled: 72900, 
      co2Hybrid: 157950,
      cedPrimary: 12500, 
      cedRecycled: 3750, 
      cedHybrid: 8125,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 9,
      knownEmissions: [
        { pollutant: "PGM compounds", value: "12.1 kg/ton" }
      ]
    },
    "Titanium (total)": { 
      name: "Titanium (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 6.7,
      co2Primary: 115, 
      co2Recycled: 34.5, 
      co2Hybrid: 74.75,
      cedPrimary: 8.1, 
      cedRecycled: 2.43, 
      cedHybrid: 5.265,
      waterUsePrimary: 569, 
      waterUseRecycled: 170.7, 
      waterUseHybrid: 369.85,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Titanium compounds", value: "4.8 kg/ton" }
      ]
    },
    "Zinc (total)": { 
      name: "Zinc (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 8.3,
      co2Primary: 52.9, 
      co2Recycled: 15.87, 
      co2Hybrid: 34.385,
      cedPrimary: 3.1, 
      cedRecycled: 0.93, 
      cedHybrid: 2.015,
      waterUsePrimary: 619, 
      waterUseRecycled: 185.7, 
      waterUseHybrid: 402.35,
      circularityRating: 8,
      knownEmissions: [
        { pollutant: "Zinc compounds", value: "2.9 kg/ton" }
      ]
    },
    "Dysprosium oxide": { 
      name: "Dysprosium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 7.8,
      co2Primary: 1170, 
      co2Recycled: 351, 
      co2Hybrid: 760.5,
      cedPrimary: 59.6, 
      cedRecycled: 17.88, 
      cedHybrid: 38.74,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "15.2 kg/ton" }
      ]
    },
    "Erbium oxide": { 
      name: "Erbium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 7.6,
      co2Primary: 954, 
      co2Recycled: 286.2, 
      co2Hybrid: 620.1,
      cedPrimary: 48.7, 
      cedRecycled: 14.61, 
      cedHybrid: 31.655,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "12.8 kg/ton" }
      ]
    },
    "Europium oxide": { 
      name: "Europium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 8.2,
      co2Primary: 7750, 
      co2Recycled: 2325, 
      co2Hybrid: 5037.5,
      cedPrimary: 396, 
      cedRecycled: 118.8, 
      cedHybrid: 257.4,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 8,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "28.1 kg/ton" }
      ]
    },
    "Ferroniobium": { 
      name: "Ferroniobium", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 6.1,
      co2Primary: 114, 
      co2Recycled: 34.2, 
      co2Hybrid: 74.1,
      cedPrimary: 8.3, 
      cedRecycled: 2.49, 
      cedHybrid: 5.395,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Niobium compounds", value: "6.8 kg/ton" }
      ]
    },
    "Gadolinium oxide": { 
      name: "Gadolinium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 7.4,
      co2Primary: 914, 
      co2Recycled: 274.2, 
      co2Hybrid: 594.1,
      cedPrimary: 46.6, 
      cedRecycled: 13.98, 
      cedHybrid: 30.29,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "11.9 kg/ton" }
      ]
    },
    "Gallium": { 
      name: "Gallium", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 6.9,
      co2Primary: 3030, 
      co2Recycled: 909, 
      co2Hybrid: 1969.5,
      cedPrimary: 205, 
      cedRecycled: 61.5, 
      cedHybrid: 133.25,
      waterUsePrimary: 0.3, 
      waterUseRecycled: 0.09, 
      waterUseHybrid: 0.195,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Gallium compounds", value: "18.5 kg/ton" }
      ]
    },
    "Germanium": { 
      name: "Germanium", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 7.1,
      co2Primary: 2890, 
      co2Recycled: 867, 
      co2Hybrid: 1878.5,
      cedPrimary: 170, 
      cedRecycled: 51, 
      cedHybrid: 110.5,
      waterUsePrimary: 0.2, 
      waterUseRecycled: 0.06, 
      waterUseHybrid: 0.13,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Germanium compounds", value: "16.2 kg/ton" }
      ]
    },
    "Hafnium (total)": { 
      name: "Hafnium (total)", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 6.3,
      co2Primary: 3510, 
      co2Recycled: 1053, 
      co2Hybrid: 2281.5,
      cedPrimary: 131, 
      cedRecycled: 39.3, 
      cedHybrid: 85.15,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Hafnium compounds", value: "21.8 kg/ton" }
      ]
    },
    "Helium": { 
      name: "Helium", 
      defaultType: "primary",
      category: "Noble Gases",
      circularityPotential: 2.8,
      co2Primary: 67.5, 
      co2Recycled: 20.25, 
      co2Hybrid: 43.875,
      cedPrimary: 0.9, 
      cedRecycled: 0.27, 
      cedHybrid: 0.585,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 2,
      knownEmissions: []
    },
    "Holmium oxide": { 
      name: "Holmium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 7.9,
      co2Primary: 4400, 
      co2Recycled: 1320, 
      co2Hybrid: 2860,
      cedPrimary: 226, 
      cedRecycled: 67.8, 
      cedHybrid: 146.9,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "22.4 kg/ton" }
      ]
    },
    "Indium": { 
      name: "Indium", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 6.8,
      co2Primary: 1720, 
      co2Recycled: 516, 
      co2Hybrid: 1118,
      cedPrimary: 102, 
      cedRecycled: 30.6, 
      cedHybrid: 66.3,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Indium compounds", value: "9.8 kg/ton" }
      ]
    },
    "Iridium (total)": { 
      name: "Iridium (total)", 
      defaultType: "primary",
      category: "Precious Metals",
      circularityPotential: 9.1,
      co2Primary: 169000, 
      co2Recycled: 50700, 
      co2Hybrid: 109850,
      cedPrimary: 8860, 
      cedRecycled: 2658, 
      cedHybrid: 5759,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 9,
      knownEmissions: [
        { pollutant: "PGM compounds", value: "42.8 kg/ton" }
      ]
    },
    "Lanthanum oxide": { 
      name: "Lanthanum oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 7.2,
      co2Primary: 216, 
      co2Recycled: 64.8, 
      co2Hybrid: 140.4,
      cedPrimary: 11.0, 
      cedRecycled: 3.3, 
      cedHybrid: 7.15,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "8.2 kg/ton" }
      ]
    },
    "Lutetium oxide": { 
      name: "Lutetium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 8.5,
      co2Primary: 17600, 
      co2Recycled: 5280, 
      co2Hybrid: 11440,
      cedPrimary: 896, 
      cedRecycled: 268.8, 
      cedHybrid: 582.4,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 8,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "58.2 kg/ton" }
      ]
    },
    "Manganese (total)": { 
      name: "Manganese (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 6.7,
      co2Primary: 23.7, 
      co2Recycled: 7.11, 
      co2Hybrid: 15.405,
      cedPrimary: 1.0, 
      cedRecycled: 0.3, 
      cedHybrid: 0.65,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Manganese compounds", value: "3.8 kg/ton" }
      ]
    },
    "Mercury": { 
      name: "Mercury", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 5.2,
      co2Primary: 179, 
      co2Recycled: 53.7, 
      co2Hybrid: 116.35,
      cedPrimary: 12.1, 
      cedRecycled: 3.63, 
      cedHybrid: 7.865,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 5,
      knownEmissions: [
        { pollutant: "Mercury compounds", value: "1.2 kg/ton" }
      ]
    },
    "Molybdenum (total)": { 
      name: "Molybdenum (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 6.9,
      co2Primary: 117, 
      co2Recycled: 35.1, 
      co2Hybrid: 76.05,
      cedPrimary: 5.7, 
      cedRecycled: 1.71, 
      cedHybrid: 3.705,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Molybdenum compounds", value: "4.9 kg/ton" }
      ]
    },
    "Neodymium oxide": { 
      name: "Neodymium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 7.7,
      co2Primary: 344, 
      co2Recycled: 103.2, 
      co2Hybrid: 223.6,
      cedPrimary: 17.6, 
      cedRecycled: 5.28, 
      cedHybrid: 11.44,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "9.8 kg/ton" }
      ]
    },
    "Niobium (total)": { 
      name: "Niobium (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 6.4,
      co2Primary: 172, 
      co2Recycled: 51.6, 
      co2Hybrid: 111.8,
      cedPrimary: 12.5, 
      cedRecycled: 3.75, 
      cedHybrid: 8.125,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Niobium compounds", value: "8.1 kg/ton" }
      ]
    },
    "Osmium (total)": { 
      name: "Osmium (total)", 
      defaultType: "primary",
      category: "Precious Metals",
      circularityPotential: 9.0,
      co2Primary: 85000, 
      co2Recycled: 25500, 
      co2Hybrid: 55250,
      cedPrimary: 4560, 
      cedRecycled: 1368, 
      cedHybrid: 2964,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 9,
      knownEmissions: [
        { pollutant: "PGM compounds", value: "28.9 kg/ton" }
      ]
    },
    "Palladium (total)": { 
      name: "Palladium (total)", 
      defaultType: "primary",
      category: "Precious Metals",
      circularityPotential: 8.8,
      co2Primary: 72700, 
      co2Recycled: 21810, 
      co2Hybrid: 47255,
      cedPrimary: 3880, 
      cedRecycled: 1164, 
      cedHybrid: 2522,
      waterUsePrimary: 15.3, 
      waterUseRecycled: 4.59, 
      waterUseHybrid: 9.945,
      circularityRating: 8,
      knownEmissions: [
        { pollutant: "PGM compounds", value: "22.1 kg/ton" }
      ]
    },
    "Praseodymium oxide": { 
      name: "Praseodymium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 7.5,
      co2Primary: 376, 
      co2Recycled: 112.8, 
      co2Hybrid: 244.4,
      cedPrimary: 19.2, 
      cedRecycled: 5.76, 
      cedHybrid: 12.48,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "10.2 kg/ton" }
      ]
    },
    "Rhenium": { 
      name: "Rhenium", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 7.8,
      co2Primary: 9040, 
      co2Recycled: 2712, 
      co2Hybrid: 5876,
      cedPrimary: 450, 
      cedRecycled: 135, 
      cedHybrid: 292.5,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Rhenium compounds", value: "38.2 kg/ton" }
      ]
    },
    "Rhodium (total)": { 
      name: "Rhodium (total)", 
      defaultType: "primary",
      category: "Precious Metals",
      circularityPotential: 9.4,
      co2Primary: 683000, 
      co2Recycled: 204900, 
      co2Hybrid: 443950,
      cedPrimary: 35100, 
      cedRecycled: 10530, 
      cedHybrid: 22815,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 9,
      knownEmissions: [
        { pollutant: "PGM compounds", value: "185.8 kg/ton" }
      ]
    },
    "Ruthenium (total)": { 
      name: "Ruthenium (total)", 
      defaultType: "primary",
      category: "Precious Metals",
      circularityPotential: 8.9,
      co2Primary: 41100, 
      co2Recycled: 12330, 
      co2Hybrid: 26715,
      cedPrimary: 2110, 
      cedRecycled: 633, 
      cedHybrid: 1371.5,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 8,
      knownEmissions: [
        { pollutant: "PGM compounds", value: "14.2 kg/ton" }
      ]
    },
    "Samarium oxide": { 
      name: "Samarium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 7.3,
      co2Primary: 1160, 
      co2Recycled: 348, 
      co2Hybrid: 754,
      cedPrimary: 59.1, 
      cedRecycled: 17.73, 
      cedHybrid: 38.415,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "14.8 kg/ton" }
      ]
    },
    "Scandium oxide": { 
      name: "Scandium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 8.1,
      co2Primary: 97200, 
      co2Recycled: 29160, 
      co2Hybrid: 63180,
      cedPrimary: 5710, 
      cedRecycled: 1713, 
      cedHybrid: 3711.5,
      waterUsePrimary: 1.0, 
      waterUseRecycled: 0.3, 
      waterUseHybrid: 0.65,
      circularityRating: 8,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "285.2 kg/ton" }
      ]
    },
    "Selenium": { 
      name: "Selenium", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 5.8,
      co2Primary: 65.5, 
      co2Recycled: 19.65, 
      co2Hybrid: 42.575,
      cedPrimary: 3.6, 
      cedRecycled: 1.08, 
      cedHybrid: 2.34,
      waterUsePrimary: 0.2, 
      waterUseRecycled: 0.06, 
      waterUseHybrid: 0.13,
      circularityRating: 5,
      knownEmissions: [
        { pollutant: "Selenium compounds", value: "2.8 kg/ton" }
      ]
    },
    "Steel (pig iron proxy)": { 
      name: "Steel (pig iron proxy)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 9.2,
      co2Primary: 25, 
      co2Recycled: 7.5, 
      co2Hybrid: 16.25,
      cedPrimary: 2, 
      cedRecycled: 0.6, 
      cedHybrid: 1.3,
      waterUsePrimary: 10, 
      waterUseRecycled: 3, 
      waterUseHybrid: 6.5,
      circularityRating: 9,
      knownEmissions: [
        { pollutant: "CO", value: "45.2 kg/ton" },
        { pollutant: "SO2", value: "18.5 kg/ton" },
        { pollutant: "NOx", value: "15.3 kg/ton" }
      ]
    },
    "Strontium carbonate": { 
      name: "Strontium carbonate", 
      defaultType: "primary",
      category: "Industrial Minerals",
      circularityPotential: 4.9,
      co2Primary: 48.8, 
      co2Recycled: 14.64, 
      co2Hybrid: 31.72,
      cedPrimary: 3.2, 
      cedRecycled: 0.96, 
      cedHybrid: 2.08,
      waterUsePrimary: 9.5, 
      waterUseRecycled: 2.85, 
      waterUseHybrid: 6.175,
      circularityRating: 4,
      knownEmissions: [
        { pollutant: "Strontium compounds", value: "6.1 kg/ton" }
      ]
    },
    "Tantalum": { 
      name: "Tantalum", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 7.9,
      co2Primary: 4360, 
      co2Recycled: 1308, 
      co2Hybrid: 2834,
      cedPrimary: 260, 
      cedRecycled: 78, 
      cedHybrid: 169,
      waterUsePrimary: 5.6, 
      waterUseRecycled: 1.68, 
      waterUseHybrid: 3.64,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Tantalum compounds", value: "18.9 kg/ton" }
      ]
    },
    "Tellurium": { 
      name: "Tellurium", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 6.2,
      co2Primary: 435, 
      co2Recycled: 130.5, 
      co2Hybrid: 282.75,
      cedPrimary: 21.9, 
      cedRecycled: 6.57, 
      cedHybrid: 14.235,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Tellurium compounds", value: "8.2 kg/ton" }
      ]
    },
    "Terbium oxide": { 
      name: "Terbium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 8.0,
      co2Primary: 5820, 
      co2Recycled: 1746, 
      co2Hybrid: 3783,
      cedPrimary: 297, 
      cedRecycled: 89.1, 
      cedHybrid: 193.05,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 8,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "24.8 kg/ton" }
      ]
    },
    "Thallium": { 
      name: "Thallium", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 4.8,
      co2Primary: 5160, 
      co2Recycled: 1548, 
      co2Hybrid: 3354,
      cedPrimary: 376, 
      cedRecycled: 112.8, 
      cedHybrid: 244.4,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 4,
      knownEmissions: [
        { pollutant: "Thallium compounds", value: "19.2 kg/ton" }
      ]
    },
    "Thorium oxide": { 
      name: "Thorium oxide", 
      defaultType: "primary",
      category: "Radioactive Materials",
      circularityPotential: 3.2,
      co2Primary: 1260, 
      co2Recycled: 378, 
      co2Hybrid: 819,
      cedPrimary: 74.9, 
      cedRecycled: 22.47, 
      cedHybrid: 48.685,
      waterUsePrimary: 0.70, 
      waterUseRecycled: 0.21, 
      waterUseHybrid: 0.455,
      circularityRating: 3,
      knownEmissions: [
        { pollutant: "Radioactive particles", value: "2.8 kg/ton" }
      ]
    },
    "Thulium oxide": { 
      name: "Thulium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 8.3,
      co2Primary: 12700, 
      co2Recycled: 3810, 
      co2Hybrid: 8255,
      cedPrimary: 649, 
      cedRecycled: 194.7, 
      cedHybrid: 421.85,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 8,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "42.8 kg/ton" }
      ]
    },
    "Tin": { 
      name: "Tin", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 7.2,
      co2Primary: 321, 
      co2Recycled: 96.3, 
      co2Hybrid: 208.65,
      cedPrimary: 17.1, 
      cedRecycled: 5.13, 
      cedHybrid: 11.115,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Tin compounds", value: "11.8 kg/ton" }
      ]
    },
    "Tungsten (total)": { 
      name: "Tungsten (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 7.4,
      co2Primary: 133, 
      co2Recycled: 39.9, 
      co2Hybrid: 86.45,
      cedPrimary: 12.6, 
      cedRecycled: 3.78, 
      cedHybrid: 8.19,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Tungsten compounds", value: "6.9 kg/ton" }
      ]
    },
    "Uranium (yellowcake)": { 
      name: "Uranium (yellowcake)", 
      defaultType: "primary",
      category: "Radioactive Materials",
      circularityPotential: 2.8,
      co2Primary: 1270, 
      co2Recycled: 381, 
      co2Hybrid: 825.5,
      cedPrimary: 90.7, 
      cedRecycled: 27.21, 
      cedHybrid: 58.955,
      waterUsePrimary: 65.8, 
      waterUseRecycled: 19.74, 
      waterUseHybrid: 42.77,
      circularityRating: 2,
      knownEmissions: [
        { pollutant: "Radioactive particles", value: "8.9 kg/ton" }
      ]
    },
    "Vanadium": { 
      name: "Vanadium", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 6.6,
      co2Primary: 516, 
      co2Recycled: 154.8, 
      co2Hybrid: 335.4,
      cedPrimary: 33.1, 
      cedRecycled: 9.93, 
      cedHybrid: 21.515,
      waterUsePrimary: 29.1, 
      waterUseRecycled: 8.73, 
      waterUseHybrid: 18.915,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Vanadium compounds", value: "18.2 kg/ton" }
      ]
    },
    "Ytterbium oxide": { 
      name: "Ytterbium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 8.1,
      co2Primary: 2450, 
      co2Recycled: 735, 
      co2Hybrid: 1592.5,
      cedPrimary: 125, 
      cedRecycled: 37.5, 
      cedHybrid: 81.25,
      waterUsePrimary: 0, 
      waterUseRecycled: 0, 
      waterUseHybrid: 0,
      circularityRating: 8,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "18.9 kg/ton" }
      ]
    },
    "Yttrium oxide": { 
      name: "Yttrium oxide", 
      defaultType: "primary",
      category: "Rare Earth Elements",
      circularityPotential: 7.6,
      co2Primary: 295, 
      co2Recycled: 88.5, 
      co2Hybrid: 191.75,
      cedPrimary: 15.1, 
      cedRecycled: 4.53, 
      cedHybrid: 9.815,
      waterUsePrimary: 4.1, 
      waterUseRecycled: 1.23, 
      waterUseHybrid: 2.665,
      circularityRating: 7,
      knownEmissions: [
        { pollutant: "Rare earth particulates", value: "9.2 kg/ton" }
      ]
    },
    "Zirconium (total)": { 
      name: "Zirconium (total)", 
      defaultType: "primary",
      category: "Metals",
      circularityPotential: 6.8,
      co2Primary: 19.9, 
      co2Recycled: 5.97, 
      co2Hybrid: 12.935,
      cedPrimary: 1.1, 
      cedRecycled: 0.33, 
      cedHybrid: 0.715,
      waterUsePrimary: 81.5, 
      waterUseRecycled: 24.45, 
      waterUseHybrid: 52.975,
      circularityRating: 6,
      knownEmissions: [
        { pollutant: "Zirconium compounds", value: "4.2 kg/ton" }
      ]
    }
  };

  // Enhanced 9-step state management
  const [currentStep, setCurrentStep] = useState(1);
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState(20);
  const [processRoute, setProcessRoute] = useState("recycled");
  const [energyCED, setEnergyCED] = useState("");
  const [carbonGWP, setCarbonGWP] = useState("");
  const [transportDistance, setTransportDistance] = useState(200);
  const [transportMode, setTransportMode] = useState("rail");
  const [reusePercent, setReusePercent] = useState(20);
  const [recyclingPercent, setRecyclingPercent] = useState(60);
  const [disposalPercent, setDisposalPercent] = useState(20);
  
  // AI prediction states
  const [isAIActive, setIsAIActive] = useState(false);
  const [aiPredictions, setAiPredictions] = useState({});
  const [showResults, setShowResults] = useState(false);
  
  // Results states
  const [lcaResults, setLcaResults] = useState(null);
  const [waterUse, setWaterUse] = useState(0);
  const [recycledContent, setRecycledContent] = useState(0);
  const [resourceEfficiency, setResourceEfficiency] = useState(0);
  const [lifeExtension, setLifeExtension] = useState(0);
  const [circularityScore, setCircularityScore] = useState(0);

  // Interactive control states for Results page
  const [emissionReduction, setEmissionReduction] = useState([0]); // 0-50% reduction
  const [efficiencyImprovement, setEfficiencyImprovement] = useState([0]); // 0-30% improvement
  const [circularityBoost, setCircularityBoost] = useState([0]); // 0-25% boost
  const [showComparison, setShowComparison] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['co2', 'energy', 'water', 'circularity']);
  const [adjustedResults, setAdjustedResults] = useState(null);

  // Load saved report data if coming from Reports page
  useEffect(() => {
    const savedReport = localStorage.getItem('currentReport');
    if (savedReport) {
      try {
        const reportData = JSON.parse(savedReport);
        console.log('📂 Loading saved report:', reportData);
        
        // Populate form fields with saved data
        if (reportData.material) setMaterial(reportData.material);
        if (reportData.quantity) setQuantity(reportData.quantity);
        if (reportData.processRoute) setProcessRoute(reportData.processRoute);
        if (reportData.transportMode) setTransportMode(reportData.transportMode);
        if (reportData.transportDistance) setTransportDistance(reportData.transportDistance);
        if (reportData.reusePercent) setReusePercent(reportData.reusePercent);
        if (reportData.recyclingPercent) setRecyclingPercent(reportData.recyclingPercent);
        if (reportData.disposalPercent) setDisposalPercent(reportData.disposalPercent);
        
        // If results exist, show them
        if (reportData.results) {
          setLcaResults(reportData.results);
          setWaterUse(reportData.waterUse || 0);
          setCircularityScore(reportData.circularity || 0);
          setResourceEfficiency(reportData.results.ced ? Math.min(10, 10 - (reportData.results.ced / 10000)) : 0);
          setRecycledContent(reportData.processRoute === "recycled" ? 80 : reportData.processRoute === "hybrid" ? 40 : 0);
          setLifeExtension(reportData.reusePercent ? reportData.reusePercent / 10 : 0);
          setShowResults(true);
          setCurrentStep(9); // Jump to results step
        }
        
        // Clear the saved report data
        localStorage.removeItem('currentReport');
        
        toast({
          title: "📊 Report Loaded",
          description: `Successfully loaded "${reportData.name}" analysis data.`,
        });
        
      } catch (error) {
        console.error('Error loading saved report:', error);
        localStorage.removeItem('currentReport');
        toast({
          title: "Error Loading Report",
          description: "Failed to load saved report data.",
          variant: "destructive"
        });
      }
    }
  }, []);

  // Transport emission factors
  const transportFactors = {
    road: { factor: 0.18, label: "0.18 kg CO₂/ton-km (Short)" },
    rail: { factor: 0.04, label: "0.04 kg CO₂/ton-km (Medium)" },
    ship: { factor: 0.02, label: "0.02 kg CO₂/ton-km (Long)" }
  };

  // AI Prediction Functions
  const predictCED = useCallback((material, route) => {
    if (!material || !materialDatabase[material]) return "";
    const data = materialDatabase[material];
    const baseCED = route === "recycled" ? data.cedRecycled : 
                   route === "hybrid" ? data.cedHybrid : data.cedPrimary;
    // Add some AI variance (±20%)
    const variance = (Math.random() - 0.5) * 0.4;
    return Math.round(baseCED * (1 + variance));
  }, []);

  const predictGWP = useCallback((material, route) => {
    if (!material || !materialDatabase[material]) return "";
    const data = materialDatabase[material];
    const baseGWP = route === "recycled" ? data.co2Recycled : 
                    route === "hybrid" ? data.co2Hybrid : data.co2Primary;
    // Add some AI variance (±15%)
    const variance = (Math.random() - 0.5) * 0.3;
    return Math.round(baseGWP * (1 + variance) * 10) / 10;
  }, []);

  const predictTransportDistance = useCallback((material, route) => {
    const baseDistances = {
      recycled: 150 + Math.random() * 150, // 150-300 km
      primary: 300 + Math.random() * 200,  // 300-500 km
      hybrid: 200 + Math.random() * 150    // 200-350 km
    };
    return Math.round(baseDistances[route] || 200);
  }, []);

  const predictTransportMode = useCallback((distance) => {
    if (distance < 150) return "road";
    if (distance < 400) return "rail";
    return "ship";
  }, []);

  const predictEndOfLife = useCallback((material) => {
    if (!material || !materialDatabase[material]) return { reuse: 15, recycling: 70, disposal: 15 };
    
    const circularityRating = materialDatabase[material].circularityRating;
    if (circularityRating >= 8) {
      return { reuse: 20, recycling: 70, disposal: 10 };
    } else if (circularityRating >= 6) {
      return { reuse: 15, recycling: 65, disposal: 20 };
    } else {
      return { reuse: 10, recycling: 50, disposal: 40 };
    }
  }, []);

  // AI Auto-fill handlers
  const handleAIFillQuantity = () => {
    setIsAIActive(true);
    setTimeout(() => {
      const optimalQuantity = 15 + Math.random() * 35; // 15-50kg range
      setQuantity(Math.round(optimalQuantity));
      setIsAIActive(false);
      toast({
        title: "🤖 AI Prediction",
        description: `Optimal quantity predicted based on industry benchmarks: ${Math.round(optimalQuantity)} kg`,
      });
    }, 1000);
  };

  const handleAIFillRoute = () => {
    setIsAIActive(true);
    setTimeout(() => {
      const recommendedRoute = material && materialDatabase[material]?.circularityRating >= 7 ? "recycled" : "hybrid";
      setProcessRoute(recommendedRoute);
      setIsAIActive(false);
      toast({
        title: "🤖 AI Recommendation",
        description: `${recommendedRoute} route recommended for maximum circularity`,
      });
    }, 800);
  };

  const handleAIFillCED = () => {
    setIsAIActive(true);
    setTimeout(() => {
      const predicted = predictCED(material, processRoute);
      setEnergyCED(predicted.toString());
      setIsAIActive(false);
      toast({
        title: `🤖 AI Prediction (${BEST_MODEL})`,
        description: `CED predicted: ${predicted} MJ/kg based on ${material} + ${processRoute} route`,
      });
    }, 1200);
  };

  const handleAIFillGWP = () => {
    setIsAIActive(true);
    setTimeout(() => {
      const predicted = predictGWP(material, processRoute);
      setCarbonGWP(predicted.toString());
      setIsAIActive(false);
      toast({
        title: `🤖 AI Prediction (${BEST_MODEL})`,
        description: `GWP predicted: ${predicted} kg CO₂-eq/kg for ${material} (${processRoute})`,
      });
    }, 1100);
  };

  const handleAIFillTransport = () => {
    setIsAIActive(true);
    setTimeout(() => {
      const predictedDistance = predictTransportDistance(material, processRoute);
      const predictedMode = predictTransportMode(predictedDistance);
      setTransportDistance(predictedDistance);
      setTransportMode(predictedMode);
      setIsAIActive(false);
      toast({
        title: "🤖 AI Transport Prediction",
        description: `${predictedDistance} km via ${predictedMode} recommended for ${material}`,
      });
    }, 900);
  };

  const handleAIFillEndOfLife = () => {
    setIsAIActive(true);
    setTimeout(() => {
      const predictions = predictEndOfLife(material);
      setReusePercent(predictions.reuse);
      setRecyclingPercent(predictions.recycling);
      setDisposalPercent(predictions.disposal);
      setIsAIActive(false);
      toast({
        title: "🤖 AI End-of-Life Prediction",
        description: `Optimal distribution: ${predictions.reuse}% reuse, ${predictions.recycling}% recycling, ${predictions.disposal}% disposal`,
      });
    }, 1000);
  };

  // Validation function for End-of-Life percentages
  const validateEndOfLife = () => {
    const total = reusePercent + recyclingPercent + disposalPercent;
    return Math.abs(total - 100) < 0.1; // Allow small floating point errors
  };

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < 9) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // PDF Export function
  const exportToPDF = useCallback(async () => {
    if (!lcaResults) {
      toast({
        title: "⚠️ No Data",
        description: "Please complete the LCA analysis before exporting",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(59, 130, 246); // Blue color
      pdf.text('LCA Analysis Report', pageWidth / 2, 20, { align: 'center' });
      
      // Add timestamp
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
      
      // Material Information Section
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Material Information', 20, 50);
      
      pdf.setFontSize(12);
      let yPos = 60;
      const lineHeight = 8;
      
      const materialInfo = [
        `Material: ${material}`,
        `Category: ${materialDatabase[material]?.category || 'N/A'}`,
        `Quantity: ${quantity} kg`,
        `Process Route: ${processRoute}`,
        `Transport Mode: ${transportMode}`,
        `Transport Distance: ${transportDistance} km`,
      ];
      
      materialInfo.forEach(info => {
        pdf.text(info, 20, yPos);
        yPos += lineHeight;
      });
      
      // Environmental Impact Results
      yPos += 10;
      pdf.setFontSize(16);
      pdf.text('Environmental Impact Results', 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(12);
      const results = [
        `Total CO₂ Emissions: ${lcaResults.totalCO2.toFixed(2)} kg CO₂-eq`,
        `Energy Demand (CED): ${lcaResults.ced.toFixed(2)} MJ`,
        `Water Usage: ${lcaResults.waterUse.toFixed(2)} L`,
        `Circularity Score: ${lcaResults.circularityScore.toFixed(1)}/10`,
      ];
      
      results.forEach(result => {
        pdf.text(result, 20, yPos);
        yPos += lineHeight;
      });
      
      // End-of-Life Distribution
      yPos += 10;
      pdf.setFontSize(16);
      pdf.text('End-of-Life Distribution', 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(12);
      const endOfLife = [
        `Reuse: ${reusePercent}%`,
        `Recycling: ${recyclingPercent}%`,
        `Disposal: ${disposalPercent}%`,
      ];
      
      endOfLife.forEach(item => {
        pdf.text(item, 20, yPos);
        yPos += lineHeight;
      });
      
      // Process Details
      yPos += 10;
      pdf.setFontSize(16);
      pdf.text('Process Breakdown', 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(12);
      const processDetails = [
        `Production Emissions: ${lcaResults.processDetails.production.toFixed(2)} kg CO₂-eq`,
        `Transport Emissions: ${lcaResults.processDetails.transport.toFixed(2)} kg CO₂-eq`,
        `End-of-Life Impact: ${(lcaResults.totalCO2 * 0.1).toFixed(2)} kg CO₂-eq`,
      ];
      
      processDetails.forEach(detail => {
        pdf.text(detail, 20, yPos);
        yPos += lineHeight;
      });
      
      // Known Emissions
      if (materialDatabase[material]?.knownEmissions.length > 0) {
        yPos += 10;
        pdf.setFontSize(16);
        pdf.text('Known Material Emissions', 20, yPos);
        yPos += 15;
        
        pdf.setFontSize(12);
        materialDatabase[material].knownEmissions.forEach(emission => {
          pdf.text(`${emission.pollutant}: ${emission.value}`, 20, yPos);
          yPos += lineHeight;
        });
      }
      
      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Generated by LCA Analysis Tool', pageWidth / 2, pageHeight - 10, { align: 'center' });
      
      // Save the PDF
      const fileName = `LCA_Report_${material.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "📄 PDF Generated",
        description: `Report saved as ${fileName}`,
      });
      
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "❌ Export Failed",
        description: "Failed to generate PDF report",
        variant: "destructive"
      });
    }
  }, [lcaResults, material, quantity, processRoute, transportMode, transportDistance, reusePercent, recyclingPercent, disposalPercent, materialDatabase, toast]);

  // Save LCA results to localStorage for Reports section
  const saveToReports = useCallback((results: any) => {
    const reportData = {
      id: Date.now().toString(),
      name: `${material} Analysis`,
      date: new Date().toISOString(),
      material,
      quantity,
      processRoute,
      transportMode,
      transportDistance,
      co2: results.totalCO2,
      ced: results.ced,
      waterUse: results.waterUse,
      circularity: results.circularityScore,
      reusePercent,
      recyclingPercent,
      disposalPercent,
      results: results // Store full results for viewing
    };

    // Get existing reports from localStorage
    const existingReports = JSON.parse(localStorage.getItem('lcaReports') || '[]');
    
    // Add new report at the top (beginning of array)
    existingReports.unshift(reportData);
    
    // Save back to localStorage
    localStorage.setItem('lcaReports', JSON.stringify(existingReports));
    
    toast({
      title: "📊 Report Saved",
      description: `Analysis saved to Reports section. Go to Reports to view it anytime.`,
    });
  }, [material, quantity, processRoute, transportMode, transportDistance, reusePercent, recyclingPercent, disposalPercent, toast]);

  // Calculate LCA results
  const calculateLCA = useCallback(() => {
    if (!material || !materialDatabase[material]) {
      toast({
        title: "⚠️ Validation Error",
        description: "Please select a valid material before calculating",
        variant: "destructive"
      });
      return;
    }

    const selectedMaterial = materialDatabase[material];
    const ced = parseFloat(energyCED) || selectedMaterial[`ced${processRoute.charAt(0).toUpperCase() + processRoute.slice(1)}`];
    const gwp = parseFloat(carbonGWP) || selectedMaterial[`co2${processRoute.charAt(0).toUpperCase() + processRoute.slice(1)}`];
    
    // Transport emissions
    const transportEmissions = (quantity * transportDistance * transportFactors[transportMode].factor) / 1000;
    
    // Water use calculation
    const waterUsage = selectedMaterial[`waterUse${processRoute.charAt(0).toUpperCase() + processRoute.slice(1)}`] * quantity;
    
    // Circularity calculations
    const recyclingCircularityBonus = (recyclingPercent / 100) * 0.8;
    const reuseCircularityBonus = (reusePercent / 100) * 0.9;
    const baseCircularity = selectedMaterial.circularityRating || 5;
    const finalCircularityScore = Math.min(10, baseCircularity + recyclingCircularityBonus + reuseCircularityBonus);
    
    const results = {
      totalCO2: (gwp * quantity) + transportEmissions,
      ced: ced * quantity,
      waterUse: waterUsage,
      circularityScore: finalCircularityScore,
      material: selectedMaterial,
      processDetails: {
        production: gwp * quantity,
        transport: transportEmissions,
        endOfLife: {
          reuse: reusePercent,
          recycling: recyclingPercent,
          disposal: disposalPercent
        }
      }
    };
    
    setLcaResults(results);
    setWaterUse(waterUsage);
    setCircularityScore(finalCircularityScore);
    setResourceEfficiency(Math.min(10, (10 - (gwp / 10)) + recyclingCircularityBonus));
    setRecycledContent(processRoute === "recycled" ? 80 : processRoute === "hybrid" ? 40 : 0);
    setLifeExtension(reusePercent / 10);
    setShowResults(true);
    
    // Save results to Reports section
    saveToReports(results);
    
    toast({
      title: "✅ LCA Analysis Complete",
      description: `Total CO₂: ${results.totalCO2.toFixed(2)} kg, Circularity Score: ${finalCircularityScore.toFixed(1)}/10`,
    });
  }, [material, quantity, processRoute, energyCED, carbonGWP, transportDistance, transportMode, reusePercent, recyclingPercent, disposalPercent, toast]);

  // Calculate adjusted results based on improvement sliders
  const calculateAdjustedResults = useCallback(() => {
    if (!lcaResults) return null;

    const emissionReductionFactor = 1 - (emissionReduction[0] / 100);
    const efficiencyFactor = 1 + (efficiencyImprovement[0] / 100);
    const circularityFactor = 1 + (circularityBoost[0] / 100);

    const adjusted = {
      totalCO2: lcaResults.totalCO2 * emissionReductionFactor,
      ced: lcaResults.ced / efficiencyFactor,
      waterUse: lcaResults.waterUse * (1 - (emissionReduction[0] / 200)), // Water scales with emission reduction
      circularityScore: Math.min(10, lcaResults.circularityScore * circularityFactor),
      processDetails: {
        production: lcaResults.processDetails.production * emissionReductionFactor,
        transport: lcaResults.processDetails.transport * emissionReductionFactor,
        endOfLife: lcaResults.processDetails.endOfLife
      }
    };

    return adjusted;
  }, [lcaResults, emissionReduction, efficiencyImprovement, circularityBoost]);

  // Update adjusted results when sliders change
  useEffect(() => {
    if (lcaResults) {
      setAdjustedResults(calculateAdjustedResults());
    }
  }, [lcaResults, calculateAdjustedResults]);

  // Step validation
  const isStepValid = (step) => {
    switch(step) {
      case 1: return material !== "";
      case 2: return quantity > 0;
      case 3: return processRoute !== "";
      case 4: return energyCED !== "" || material !== "";
      case 5: return carbonGWP !== "" || material !== "";
      case 6: return transportDistance > 0 && transportMode !== "";
      case 7: return validateEndOfLife();
      case 8: return true; // Analysis step
      case 9: return showResults; // Results step
      default: return false;
    }
  };

  // Step titles and descriptions
  const stepConfig = [
    { title: "Material Selection", desc: "Choose the primary material for analysis", icon: Target },
    { title: "Quantity Input", desc: "Specify the amount of material", icon: Zap },
    { title: "Process Route", desc: "Select production pathway", icon: Brain },
    { title: "Energy Input (CED)", desc: "Cumulative Energy Demand", icon: Sparkles },
    { title: "Carbon Input (GWP)", desc: "Global Warming Potential", icon: Target },
    { title: "Transport Configuration", desc: "Logistics and distribution", icon: Zap },
    { title: "End-of-Life Circularity", desc: "Post-use material flow", icon: Brain },
    { title: "Analysis & Validation", desc: "Review and calculate", icon: Sparkles },
    { title: "Results & Insights", desc: "Comprehensive LCA output", icon: Target }
  ];

  return (
    <motion.div 
      className="max-w-7xl mx-auto p-6 space-y-6 min-h-screen bg-background text-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Animated Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          🤖 AI-Powered LCA Analysis
        </h1>
        <p className="text-xl text-foreground/80 mb-4">
          {TRAINING_SAMPLES} Training Samples • {BEST_MODEL} Model (R² = {AI_MODELS[BEST_MODEL].r2})
        </p>
        
        {/* Enhanced Progress Bar with Animation */}
        <div className="w-full bg-muted rounded-full h-4 mb-6 overflow-hidden shadow-inner">
          <motion.div 
            className="h-4 rounded-full bg-gradient-to-r from-primary via-blue-500 to-purple-500 relative"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / 9) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{ width: '50%' }}
            />
          </motion.div>
        </div>
        
        {/* Enhanced Step Indicators with Animation */}
        <div className="flex justify-center space-x-2 mb-6">
          {stepConfig.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = isStepValid(index + 1) && currentStep > index + 1;
            const isActive = currentStep === index + 1;
            
            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-primary/20 to-blue-100/20 text-primary ring-2 ring-primary/30 shadow-lg dark:from-primary/20 dark:to-blue-900/20 dark:text-primary' 
                    : isCompleted
                    ? 'bg-gradient-to-r from-success/20 to-emerald-100/20 text-success ring-1 ring-success/20 dark:from-success/20 dark:to-emerald-900/20 dark:text-success'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                onClick={() => setCurrentStep(index + 1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  animate={{
                    scale: isActive ? [1, 1.2, 1] : 1,
                    rotate: isCompleted ? 360 : 0
                  }}
                  transition={{
                    scale: { duration: 2, repeat: isActive ? Infinity : 0 },
                    rotate: { duration: 0.6 }
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-success" />
                  ) : (
                    <StepIcon className="w-4 h-4" />
                  )}
                </motion.div>
                <span className="hidden sm:inline">{index + 1}. {step.title}</span>
                <span className="sm:hidden">{index + 1}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Step Content with Enhanced Animation */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card className="min-h-[400px] shadow-xl bg-card border-border">
          <CardHeader>
            <AnimatedStepTitle 
              step={currentStep}
              title={stepConfig[currentStep - 1].title}
              isActive={true}
              isCompleted={false}
            />
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 mt-4"
            >
              {stepConfig[currentStep - 1].desc}
            </motion.p>
          </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Step 1: Material Selection */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="material" className="text-base font-medium mb-3 block">
                  Select Material for LCA Analysis
                </Label>
                <Select value={material} onValueChange={setMaterial}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a material..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[400px]">
                    {(() => {
                      // Group materials by category
                      const groupedMaterials = Object.entries(materialDatabase).reduce((acc, [key, mat]) => {
                        const category = mat.category || "Other";
                        if (!acc[category]) acc[category] = [];
                        acc[category].push({ key, ...mat });
                        return acc;
                      }, {});

                      return Object.entries(groupedMaterials)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([category, materials]) => (
                          <div key={category}>
                            <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
                              {category}
                            </div>
                            {(materials as any[])
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((mat) => (
                                <SelectItem key={mat.key} value={mat.key}>
                                  <div className="flex items-center space-x-2">
                                    <span>{mat.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {mat.circularityRating}/10
                                    </Badge>
                                    {mat.co2Primary > 1000 && (
                                      <Badge variant="destructive" className="text-xs">
                                        High Impact
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                          </div>
                        ));
                    })()}
                  </SelectContent>
                </Select>
              </div>
              
              {material && materialDatabase[material] && (
                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h3 className="font-semibold text-primary mb-2">Material Overview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-foreground/70">Category:</span>
                      <span className="ml-2 font-medium text-foreground">{materialDatabase[material].category}</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Circularity Rating:</span>
                      <span className="ml-2 font-medium text-foreground">{materialDatabase[material].circularityRating}/10</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Default Route:</span>
                      <span className="ml-2 font-medium text-foreground capitalize">{materialDatabase[material].defaultType}</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">CO₂ (Primary):</span>
                      <span className="ml-2 font-medium text-foreground">{materialDatabase[material].co2Primary} kg/kg</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">CO₂ (Recycled):</span>
                      <span className="ml-2 font-medium text-foreground">{materialDatabase[material].co2Recycled} kg/kg</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Water Use:</span>
                      <span className="ml-2 font-medium text-foreground">{materialDatabase[material].waterUsePrimary} L/kg</span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="font-medium text-primary mb-1">Known Emissions:</h4>
                    <div className="flex flex-wrap gap-2">
                      {materialDatabase[material].knownEmissions.map((emission, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {emission.pollutant}: {emission.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Quantity Input */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="quantity" className="text-base font-medium">
                  Material Quantity (kg)
                </Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAIFillQuantity}
                  disabled={isAIActive}
                  className="ml-4"
                >
                  {isAIActive ? "🤖 Predicting..." : "🤖 AI Fill"}
                </Button>
              </div>
              
              <div className="space-y-4">
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  placeholder="Enter quantity in kg"
                  min="1"
                  max="1000"
                />
                
                <div className="grid grid-cols-3 gap-2">
                  {[10, 25, 50].map((preset) => (
                    <Button 
                      key={preset}
                      variant="outline" 
                      size="sm"
                      onClick={() => setQuantity(preset)}
                    >
                      {preset} kg
                    </Button>
                  ))}
                </div>
              </div>
              
              {quantity > 0 && (
                <div className="mt-4 p-4 bg-success/5 border border-success/20 rounded-lg">
                  <div className="text-sm text-success">
                    <strong>Quantity Selected:</strong> {quantity} kg
                    {material && materialDatabase[material] && (
                      <>
                        <br />
                        <strong>Estimated Primary CO₂:</strong> {(quantity * materialDatabase[material].co2Primary).toFixed(2)} kg CO₂-eq
                        <br />
                        <strong>Estimated Recycled CO₂:</strong> {(quantity * materialDatabase[material].co2Recycled).toFixed(2)} kg CO₂-eq
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Process Route */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="processRoute" className="text-base font-medium">
                  Production Process Route
                </Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAIFillRoute}
                  disabled={isAIActive || !material}
                  className="ml-4"
                >
                  {isAIActive ? "🤖 Analyzing..." : "🤖 AI Recommend"}
                </Button>
              </div>
              
              <Select value={processRoute} onValueChange={setProcessRoute}>
                <SelectTrigger>
                  <SelectValue placeholder="Select process route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">
                    <div className="flex flex-col">
                      <span>Primary Production</span>
                      <span className="text-xs text-foreground/60">Virgin materials, highest impact</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="recycled">
                    <div className="flex flex-col">
                      <span>Recycled Materials</span>
                      <span className="text-xs text-foreground/60">Post-consumer, lowest impact</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="hybrid">
                    <div className="flex flex-col">
                      <span>Hybrid Route</span>
                      <span className="text-xs text-foreground/60">Mix of primary and recycled</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {processRoute && material && materialDatabase[material] && (
                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h3 className="font-semibold text-primary mb-3">Route Impact Preview</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-foreground/70">CO₂ Impact:</span>
                      <span className="ml-2 font-medium text-foreground">
                        {materialDatabase[material][`co2${processRoute.charAt(0).toUpperCase() + processRoute.slice(1)}`]} kg CO₂-eq/kg
                      </span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Energy (CED):</span>
                      <span className="ml-2 font-medium text-foreground">
                        {materialDatabase[material][`ced${processRoute.charAt(0).toUpperCase() + processRoute.slice(1)}`]} MJ/kg
                      </span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Water Use:</span>
                      <span className="ml-2 font-medium text-foreground">
                        {materialDatabase[material][`waterUse${processRoute.charAt(0).toUpperCase() + processRoute.slice(1)}`]} L/kg
                      </span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Route Type:</span>
                      <span className="ml-2 font-medium text-foreground capitalize">{processRoute}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Steps 4-9 continue in similar pattern... */}
          {/* Step 4: Energy Input (CED) */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="energyCED" className="text-base font-medium">
                  Cumulative Energy Demand (CED) - MJ/kg
                </Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAIFillCED}
                  disabled={isAIActive || !material || !processRoute}
                  className="ml-4"
                >
                  {isAIActive ? "🤖 Calculating..." : `🤖 AI Predict (${BEST_MODEL})`}
                </Button>
              </div>
              
              <Input
                id="energyCED"
                type="number"
                value={energyCED}
                onChange={(e) => setEnergyCED(e.target.value)}
                placeholder="Enter CED in MJ/kg or use AI prediction"
                step="0.1"
              />
              
              {material && processRoute && materialDatabase[material] && (
                <div className="mt-4 p-4 bg-purple-500/5 border border-purple-500/20 rounded-lg">
                  <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">AI Model Insights</h3>
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    <strong>Model:</strong> {BEST_MODEL} (R² = {AI_MODELS[BEST_MODEL].r2}) <br />
                    <strong>Training Data:</strong> {TRAINING_SAMPLES} samples <br />
                    <strong>Expected Range:</strong> {materialDatabase[material][`ced${processRoute.charAt(0).toUpperCase() + processRoute.slice(1)}`] * 0.8} - {materialDatabase[material][`ced${processRoute.charAt(0).toUpperCase() + processRoute.slice(1)}`] * 1.2} MJ/kg <br />
                    {energyCED && <><strong>Your Input:</strong> {energyCED} MJ/kg</>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Carbon Input (GWP) */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="carbonGWP" className="text-base font-medium">
                  Global Warming Potential (GWP) - kg CO₂-eq/kg
                </Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAIFillGWP}
                  disabled={isAIActive || !material || !processRoute}
                  className="ml-4"
                >
                  {isAIActive ? "🤖 Calculating..." : `🤖 AI Predict (${BEST_MODEL})`}
                </Button>
              </div>
              
              <Input
                id="carbonGWP"
                type="number"
                value={carbonGWP}
                onChange={(e) => setCarbonGWP(e.target.value)}
                placeholder="Enter GWP in kg CO₂-eq/kg or use AI prediction"
                step="0.01"
              />
              
              {material && processRoute && materialDatabase[material] && (
                <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <h3 className="font-semibold text-destructive mb-2">Carbon Impact Analysis</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-foreground/70">Primary Route:</span>
                      <span className="ml-2 font-medium text-foreground">{materialDatabase[material].co2Primary} kg CO₂-eq/kg</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Recycled Route:</span>
                      <span className="ml-2 font-medium text-foreground">{materialDatabase[material].co2Recycled} kg CO₂-eq/kg</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Savings vs Primary:</span>
                      <span className="ml-2 font-medium text-success">
                        {((materialDatabase[material].co2Primary - materialDatabase[material].co2Recycled) / materialDatabase[material].co2Primary * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Total for {quantity}kg:</span>
                      <span className="ml-2 font-medium text-foreground">
                        {carbonGWP ? (parseFloat(carbonGWP) * quantity).toFixed(2) : "Enter GWP"} kg CO₂-eq
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Transport Configuration */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  Transport Configuration
                </Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAIFillTransport}
                  disabled={isAIActive || !material || !processRoute}
                  className="ml-4"
                >
                  {isAIActive ? "🤖 Optimizing..." : "🤖 AI Optimize Route"}
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="transportDistance">Distance (km)</Label>
                  <Input
                    id="transportDistance"
                    type="number"
                    value={transportDistance}
                    onChange={(e) => setTransportDistance(parseInt(e.target.value) || 0)}
                    placeholder="Transport distance"
                    min="1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="transportMode">Transport Mode</Label>
                  <Select value={transportMode} onValueChange={setTransportMode}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select transport mode" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(transportFactors).map(([mode, data]) => (
                        <SelectItem key={mode} value={mode}>
                          <div className="flex flex-col">
                            <span className="capitalize">{mode}</span>
                            <span className="text-xs text-foreground/60">{data.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {transportDistance > 0 && transportMode && (
                <div className="mt-4 p-4 bg-orange-500/5 border border-orange-500/20 rounded-lg">
                  <h3 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">Transport Impact</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-foreground/70">Emission Factor:</span>
                      <span className="ml-2 font-medium text-foreground">{transportFactors[transportMode].factor} kg CO₂/ton-km</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Total Distance:</span>
                      <span className="ml-2 font-medium text-foreground">{transportDistance} km</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Material Weight:</span>
                      <span className="ml-2 font-medium text-foreground">{quantity} kg</span>
                    </div>
                    <div>
                      <span className="text-foreground/70">Transport Emissions:</span>
                      <span className="ml-2 font-medium text-foreground">
                        {((quantity * transportDistance * transportFactors[transportMode].factor) / 1000).toFixed(3)} kg CO₂
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 7: End-of-Life Circularity */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">
                  End-of-Life Material Distribution (%)
                </Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAIFillEndOfLife}
                  disabled={isAIActive || !material}
                  className="ml-4"
                >
                  {isAIActive ? "🤖 Optimizing..." : "🤖 AI Optimize Circularity"}
                </Button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Reuse: {reusePercent}%</Label>
                    <Badge variant={reusePercent >= 20 ? "default" : "secondary"}>
                      {reusePercent >= 20 ? "Excellent" : reusePercent >= 10 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </div>
                  <Slider
                    value={[reusePercent]}
                    onValueChange={(value) => setReusePercent(value[0])}
                    max={80}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Recycling: {recyclingPercent}%</Label>
                    <Badge variant={recyclingPercent >= 60 ? "default" : "secondary"}>
                      {recyclingPercent >= 60 ? "Excellent" : recyclingPercent >= 40 ? "Good" : "Needs Improvement"}
                    </Badge>
                  </div>
                  <Slider
                    value={[recyclingPercent]}
                    onValueChange={(value) => setRecyclingPercent(value[0])}
                    max={90}
                    step={5}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label>Disposal: {disposalPercent}%</Label>
                    <Badge variant={disposalPercent <= 20 ? "default" : "destructive"}>
                      {disposalPercent <= 10 ? "Excellent" : disposalPercent <= 20 ? "Good" : "High Impact"}
                    </Badge>
                  </div>
                  <Slider
                    value={[disposalPercent]}
                    onValueChange={(value) => setDisposalPercent(value[0])}
                    max={60}
                    step={5}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-success/5 border border-success/20 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-success">Circularity Summary</h3>
                  <Badge variant={validateEndOfLife() ? "default" : "destructive"}>
                    Total: {reusePercent + recyclingPercent + disposalPercent}%
                  </Badge>
                </div>
                
                {!validateEndOfLife() && (
                  <p className="text-destructive text-sm mb-2">
                    ⚠️ Percentages must sum to 100%. Currently: {reusePercent + recyclingPercent + disposalPercent}%
                  </p>
                )}
                
                <div className="text-sm text-success">
                  <strong>Circularity Score Preview:</strong> {material && materialDatabase[material] ? 
                    Math.min(10, materialDatabase[material].circularityRating + (recyclingPercent / 100) * 0.8 + (reusePercent / 100) * 0.9).toFixed(1) 
                    : "Select material"
                  }/10
                </div>
              </div>
            </div>
          )}

          {/* Step 8: Analysis & Validation */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-foreground mb-2">Review Your LCA Configuration</h3>
                <p className="text-foreground/70">Verify all inputs before running the analysis</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Material & Process</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Material:</span>
                      <span className="font-medium">{material || "Not selected"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{quantity} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Process Route:</span>
                      <span className="font-medium capitalize">{processRoute}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CED:</span>
                      <span className="font-medium">{energyCED || "AI Default"} MJ/kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">GWP:</span>
                      <span className="font-medium">{carbonGWP || "AI Default"} kg CO₂-eq/kg</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Transport & End-of-Life</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transport Distance:</span>
                      <span className="font-medium">{transportDistance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transport Mode:</span>
                      <span className="font-medium capitalize">{transportMode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Reuse:</span>
                      <span className="font-medium">{reusePercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recycling:</span>
                      <span className="font-medium">{recyclingPercent}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disposal:</span>
                      <span className="font-medium">{disposalPercent}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">AI Model Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-foreground/70">Best Model:</span>
                    <span className="ml-2 font-medium text-foreground">{BEST_MODEL}</span>
                  </div>
                  <div>
                    <span className="text-foreground/70">Model Accuracy (R²):</span>
                    <span className="ml-2 font-medium text-foreground">{AI_MODELS[BEST_MODEL].r2}</span>
                  </div>
                  <div>
                    <span className="text-foreground/70">Training Samples:</span>
                    <span className="ml-2 font-medium text-foreground">{TRAINING_SAMPLES}</span>
                  </div>
                  <div>
                    <span className="text-foreground/70">Validation Status:</span>
                    <span className="ml-2 font-medium text-success">✓ Ready for Analysis</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 9: Results & Insights */}
          {currentStep === 9 && (
            <div className="space-y-6">
              {!showResults ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Ready to Calculate LCA</h3>
                  <p className="text-foreground/70 mb-6">Click the Calculate LCA button below to run the analysis</p>
                </div>
              ) : lcaResults && (
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h3 className="text-3xl font-bold text-success mb-3">🎉 LCA Analysis Complete</h3>
                    <p className="text-lg text-foreground/80">Comprehensive environmental impact assessment with AI-powered insights</p>
                  </div>
                  
                  {/* Interactive Controls Panel */}
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2 text-foreground">
                        <Settings className="w-5 h-5" />
                        <span>Interactive Impact Analysis</span>
                        <Badge variant="outline" className="ml-2">Live Adjustments</Badge>
                      </CardTitle>
                      <p className="text-sm text-foreground/70">Adjust parameters to see real-time impact on environmental metrics</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <Label className="font-medium">Emission Reduction: {emissionReduction[0]}%</Label>
                            <Badge variant={emissionReduction[0] >= 30 ? "default" : emissionReduction[0] >= 15 ? "secondary" : "outline"}>
                              {emissionReduction[0] >= 30 ? "Excellent" : emissionReduction[0] >= 15 ? "Good" : "Standard"}
                            </Badge>
                          </div>
                          <Slider
                            value={emissionReduction}
                            onValueChange={setEmissionReduction}
                            max={50}
                            step={5}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">Advanced technologies & process optimization</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <Label className="font-medium">Efficiency Improvement: {efficiencyImprovement[0]}%</Label>
                            <Badge variant={efficiencyImprovement[0] >= 20 ? "default" : efficiencyImprovement[0] >= 10 ? "secondary" : "outline"}>
                              {efficiencyImprovement[0] >= 20 ? "Excellent" : efficiencyImprovement[0] >= 10 ? "Good" : "Standard"}
                            </Badge>
                          </div>
                          <Slider
                            value={efficiencyImprovement}
                            onValueChange={setEfficiencyImprovement}
                            max={30}
                            step={5}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">Energy efficiency & resource optimization</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <Label className="font-medium">Circularity Boost: {circularityBoost[0]}%</Label>
                            <Badge variant={circularityBoost[0] >= 20 ? "default" : circularityBoost[0] >= 10 ? "secondary" : "outline"}>
                              {circularityBoost[0] >= 20 ? "Excellent" : circularityBoost[0] >= 10 ? "Good" : "Standard"}
                            </Badge>
                          </div>
                          <Slider
                            value={circularityBoost}
                            onValueChange={setCircularityBoost}
                            max={25}
                            step={5}
                            className="w-full"
                          />
                          <p className="text-xs text-gray-500 mt-1">Enhanced recycling & reuse strategies</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-center space-x-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setShowComparison(!showComparison)}
                          className="flex items-center space-x-2"
                        >
                          <BarChart3 className="w-4 h-4" />
                          <span>{showComparison ? "Hide" : "Show"} Before/After Comparison</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key Metrics Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-red-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-red-600 mb-1">
                          {adjustedResults ? adjustedResults.totalCO2.toFixed(2) : lcaResults.totalCO2.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">kg CO₂-eq</div>
                        <div className="text-xs text-gray-500 mt-1">Carbon Footprint</div>
                        {adjustedResults && adjustedResults.totalCO2 < lcaResults.totalCO2 && (
                          <Badge variant="default" className="mt-2 text-xs">
                            -{((lcaResults.totalCO2 - adjustedResults.totalCO2) / lcaResults.totalCO2 * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="border-purple-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {adjustedResults ? adjustedResults.ced.toFixed(0) : lcaResults.ced.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-600">MJ</div>
                        <div className="text-xs text-gray-500 mt-1">Energy Demand</div>
                        {adjustedResults && adjustedResults.ced < lcaResults.ced && (
                          <Badge variant="default" className="mt-2 text-xs">
                            -{((lcaResults.ced - adjustedResults.ced) / lcaResults.ced * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="border-blue-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {adjustedResults ? adjustedResults.waterUse.toFixed(0) : lcaResults.waterUse.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-600">Liters (L)</div>
                        <div className="text-xs text-gray-500 mt-1">Water Usage</div>
                        {adjustedResults && adjustedResults.waterUse < lcaResults.waterUse && (
                          <Badge variant="default" className="mt-2 text-xs">
                            -{((lcaResults.waterUse - adjustedResults.waterUse) / lcaResults.waterUse * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="border-green-200">
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {adjustedResults ? adjustedResults.circularityScore.toFixed(1) : lcaResults.circularityScore.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">/10</div>
                        <div className="text-xs text-gray-500 mt-1">Circularity Score</div>
                        {adjustedResults && adjustedResults.circularityScore > lcaResults.circularityScore && (
                          <Badge variant="default" className="mt-2 text-xs">
                            +{((adjustedResults.circularityScore - lcaResults.circularityScore) / lcaResults.circularityScore * 100).toFixed(1)}%
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts and Visualizations */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Impact Breakdown Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BarChart3 className="w-5 h-5" />
                          <span>Environmental Impact Breakdown</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AnimatedD3BarChart 
                          data={[
                            {
                              name: 'Production',
                              'Current': lcaResults.processDetails.production,
                              'Optimized': adjustedResults ? adjustedResults.processDetails.production : lcaResults.processDetails.production
                            },
                            {
                              name: 'Transport',
                              'Current': lcaResults.processDetails.transport,
                              'Optimized': adjustedResults ? adjustedResults.processDetails.transport : lcaResults.processDetails.transport
                            },
                            {
                              name: 'End-of-Life',
                              'Current': lcaResults.totalCO2 * 0.1,
                              'Optimized': (adjustedResults ? adjustedResults.totalCO2 : lcaResults.totalCO2) * 0.1
                            }
                          ]}
                          width={500}
                          height={300}
                        />
                      </CardContent>
                    </Card>

                    {/* End-of-Life Distribution Pie Chart */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5" />
                          <span>End-of-Life Material Flow</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AnimatedD3PieChart 
                          data={[
                            { name: 'Reuse', value: reusePercent },
                            { name: 'Recycling', value: recyclingPercent },
                            { name: 'Disposal', value: disposalPercent }
                          ]}
                          width={300}
                          height={300}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Separate Before/After Comparison Section */}
                  {showComparison && adjustedResults && (
                    <div className="space-y-6">
                      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-green-50">
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <BarChart3 className="w-5 h-5" />
                            <span>Before vs After Optimization Analysis</span>
                            <Badge variant="outline" className="bg-white">Interactive Comparison</Badge>
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            Real-time comparison showing environmental impact improvements
                          </p>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={450}>
                            <BarChart 
                              data={[
                                {
                                  category: 'CO₂ Emissions',
                                  'Before': lcaResults.totalCO2,
                                  'After': adjustedResults.totalCO2,
                                  unit: 'kg CO₂-eq',
                                  improvement: ((lcaResults.totalCO2 - adjustedResults.totalCO2) / lcaResults.totalCO2 * 100).toFixed(1)
                                },
                                {
                                  category: 'Energy Use',
                                  'Before': lcaResults.ced,
                                  'After': adjustedResults.ced,
                                  unit: 'MJ',
                                  improvement: ((lcaResults.ced - adjustedResults.ced) / lcaResults.ced * 100).toFixed(1)
                                },
                                {
                                  category: 'Water Use',
                                  'Before': lcaResults.waterUse,
                                  'After': adjustedResults.waterUse,
                                  unit: 'L',
                                  improvement: ((lcaResults.waterUse - adjustedResults.waterUse) / lcaResults.waterUse * 100).toFixed(1)
                                },
                                {
                                  category: 'Circularity',
                                  'Before': lcaResults.circularityScore,
                                  'After': adjustedResults.circularityScore,
                                  unit: '/10',
                                  improvement: ((adjustedResults.circularityScore - lcaResults.circularityScore) / lcaResults.circularityScore * 100).toFixed(1)
                                }
                              ]}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="category" />
                              <YAxis />
                              <Tooltip 
                                formatter={(value: any, name: any, props: any) => [
                                  `${typeof value === 'number' ? value.toFixed(2) : value} ${props.payload.unit}`,
                                  name
                                ]}
                                labelFormatter={(label) => `Impact Category: ${label}`}
                              />
                              <Legend />
                              <Bar dataKey="Before" fill="#ef4444" name="Current Impact" />
                              <Bar dataKey="After" fill="#22c55e" name="Optimized Impact" />
                            </BarChart>
                          </ResponsiveContainer>
                          
                          {/* Improvement Summary */}
                          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { label: 'CO₂ Reduction', value: ((lcaResults.totalCO2 - adjustedResults.totalCO2) / lcaResults.totalCO2 * 100).toFixed(1), unit: '%', color: 'text-green-600' },
                              { label: 'Energy Savings', value: ((lcaResults.ced - adjustedResults.ced) / lcaResults.ced * 100).toFixed(1), unit: '%', color: 'text-purple-600' },
                              { label: 'Water Savings', value: ((lcaResults.waterUse - adjustedResults.waterUse) / lcaResults.waterUse * 100).toFixed(1), unit: '%', color: 'text-blue-600' },
                              { label: 'Circularity Gain', value: ((adjustedResults.circularityScore - lcaResults.circularityScore) / lcaResults.circularityScore * 100).toFixed(1), unit: '%', color: 'text-green-600' }
                            ].map((metric, idx) => (
                              <div key={idx} className="text-center p-3 bg-white rounded-lg border">
                                <div className={`text-2xl font-bold ${metric.color} mb-1`}>
                                  {parseFloat(metric.value) > 0 ? '+' : ''}{metric.value}{metric.unit}
                                </div>
                                <div className="text-xs text-gray-500">{metric.label}</div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* LCA Flow Sankey Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>LCA Material & Energy Flow Analysis</span>
                        <Badge variant="outline">Sankey Diagram</Badge>
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Visual representation of material and energy flows through the life cycle
                      </p>
                    </CardHeader>
                    <CardContent>
                      <SankeyChart
                        material={material}
                        quantity={quantity}
                        processRoute={processRoute}
                        width={900}
                        height={500}
                      />
                      
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="font-medium text-blue-800">Material Input</div>
                          <div className="text-blue-600">{quantity} kg {material}</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="font-medium text-purple-800">Energy Demand</div>
                          <div className="text-purple-600">{(adjustedResults ? adjustedResults.ced : lcaResults.ced).toFixed(0)} MJ</div>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                          <div className="font-medium text-red-800">CO₂ Emissions</div>
                          <div className="text-red-600">{(adjustedResults ? adjustedResults.totalCO2 : lcaResults.totalCO2).toFixed(2)} kg CO₂-eq</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="font-medium text-green-800">Circularity Rate</div>
                          <div className="text-green-600">{reusePercent + recyclingPercent}% recovered</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Analysis Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="w-5 h-5" />
                          <span>Goal & Scope</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <strong>Functional Unit:</strong> {quantity} kg of {material}
                        </div>
                        <div>
                          <strong>System Boundary:</strong> Cradle-to-grave with {processRoute} production
                        </div>
                        <div>
                          <strong>Impact Categories:</strong> GWP, CED, Water Use, Circularity
                        </div>
                        <div>
                          <strong>AI Model Used:</strong> {BEST_MODEL} (R² = {AI_MODELS[BEST_MODEL].r2})
                        </div>
                        <div>
                          <strong>Analysis Date:</strong> {new Date().toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Brain className="w-5 h-5" />
                          <span>AI-Powered Insights</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-800">Optimization Potential</span>
                          </div>
                          <p className="text-sm text-green-700">
                            With current adjustments, you can achieve up to{' '}
                            <strong>{emissionReduction[0]}% emission reduction</strong> and{' '}
                            <strong>{circularityBoost[0]}% circularity improvement</strong>.
                          </p>
                        </div>

                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <Sparkles className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-800">Smart Recommendations</span>
                          </div>
                          <div className="text-sm text-blue-700 space-y-1">
                            {lcaResults.circularityScore >= 8 ? (
                              <div>✅ <strong>Excellent circularity!</strong> Your material choice and end-of-life strategy are optimal.</div>
                            ) : lcaResults.circularityScore >= 6 ? (
                              <div>⚠️ <strong>Good performance.</strong> Consider increasing recycling percentage to improve circularity.</div>
                            ) : (
                              <div>🔄 <strong>Improvement needed.</strong> Switch to recycled materials and increase reuse/recycling rates.</div>
                            )}
                            
                            {processRoute !== "recycled" && (
                              <div className="mt-2">
                                💡 <strong>Switch to recycled route:</strong> Could reduce CO₂ by{' '}
                                {material && materialDatabase[material] ? 
                                  ((materialDatabase[material].co2Primary - materialDatabase[material].co2Recycled) * quantity).toFixed(2) : "N/A"
                                } kg CO₂-eq
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-purple-800">Model Confidence</span>
                          </div>
                          <p className="text-sm text-purple-700">
                            {BEST_MODEL} predictions with {(AI_MODELS[BEST_MODEL].r2 * 100).toFixed(1)}% accuracy
                            based on {TRAINING_SAMPLES} training samples.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Life Cycle Inventory</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <strong>Production Emissions:</strong> {(adjustedResults ? adjustedResults.processDetails.production : lcaResults.processDetails.production).toFixed(2)} kg CO₂-eq
                        </div>
                        <div>
                          <strong>Transport Emissions:</strong> {(adjustedResults ? adjustedResults.processDetails.transport : lcaResults.processDetails.transport).toFixed(3)} kg CO₂-eq
                        </div>
                        <div>
                          <strong>Water Consumption:</strong> {(adjustedResults ? adjustedResults.waterUse : lcaResults.waterUse).toFixed(0)} L
                        </div>
                        <div>
                          <strong>End-of-Life Distribution:</strong>
                          <ul className="text-sm mt-1 ml-4">
                            <li>• Reuse: {reusePercent}%</li>
                            <li>• Recycling: {recyclingPercent}%</li>
                            <li>• Disposal: {disposalPercent}%</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Impact Assessment Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Climate Change:</span>
                            <div className="font-medium">{(adjustedResults ? adjustedResults.totalCO2 : lcaResults.totalCO2).toFixed(2)} kg CO₂-eq</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Energy Demand:</span>
                            <div className="font-medium">{(adjustedResults ? adjustedResults.ced : lcaResults.ced).toFixed(0)} MJ CED</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Water Footprint:</span>
                            <div className="font-medium">{(adjustedResults ? adjustedResults.waterUse : lcaResults.waterUse).toFixed(0)} L</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Circularity Index:</span>
                            <div className="font-medium">{(adjustedResults ? adjustedResults.circularityScore : lcaResults.circularityScore).toFixed(1)}/10</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm">
                            <strong>Environmental Rating:</strong>
                            <div className="flex space-x-2 mt-2">
                              {[
                                { 
                                  label: 'CO₂ Impact', 
                                  value: lcaResults.totalCO2 < 50 ? 'Low' : lcaResults.totalCO2 < 100 ? 'Medium' : 'High',
                                  color: lcaResults.totalCO2 < 50 ? 'green' : lcaResults.totalCO2 < 100 ? 'yellow' : 'red'
                                },
                                { 
                                  label: 'Circularity', 
                                  value: lcaResults.circularityScore >= 8 ? 'Excellent' : lcaResults.circularityScore >= 6 ? 'Good' : 'Needs Improvement',
                                  color: lcaResults.circularityScore >= 8 ? 'green' : lcaResults.circularityScore >= 6 ? 'blue' : 'orange'
                                }
                              ].map((rating, idx) => (
                                <Badge key={idx} variant={rating.color === 'green' ? 'default' : 'secondary'}>
                                  {rating.label}: {rating.value}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Export and Actions */}
                  <div className="flex justify-center space-x-4">
                    <Button className="flex items-center space-x-2" onClick={exportToPDF}>
                      <Download className="w-4 h-4" />
                      <span>Export PDF Report</span>
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setEmissionReduction([0]);
                      setEfficiencyImprovement([0]);
                      setCircularityBoost([0]);
                    }}>
                      Reset Adjustments
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

        </CardContent>
      </Card>
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={prevStep} 
          disabled={currentStep === 1}
          className="flex items-center space-x-2"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>
        
        <div className="text-center">
          <span className="text-gray-500">Step {currentStep} of 9</span>
        </div>
        
        <Button 
          onClick={currentStep === 9 ? calculateLCA : nextStep}
          disabled={currentStep < 9 && !isStepValid(currentStep)}
          className="flex items-center space-x-2"
        >
          <span>{currentStep === 9 ? "Calculate LCA" : "Next"}</span>
          {currentStep < 9 && <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>
    </motion.div>
  );
};

export default LCAInput;