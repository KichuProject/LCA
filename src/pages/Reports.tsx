import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Download, FileText, Calendar as CalendarIcon, Eye, Share2, TrendingUp, Award, Leaf, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const Reports = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [date, setDate] = useState<Date>();
  const [reportType, setReportType] = useState("");
  const [customization, setCustomization] = useState({
    title: "",
    description: "",
    includeCharts: true,
    includeROC: true,
    includeRecommendations: true,
  });

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    dateFrom: undefined as Date | undefined,
    dateTo: undefined as Date | undefined,
    minCO2: "",
    maxCO2: "",
    minROC: "",
    maxROC: "",
    searchText: ""
  });

  const handleGenerateReport = () => {
    // Navigate to LCA Input page to create new analysis
    navigate('/lca-input');
    toast({
      title: "New Analysis Started",
      description: "Navigate to LCA Input to create a new analysis report.",
    });
  };

  const handleExportJSON = () => {
    // Export filtered reports as JSON
    const reportsToExport = filteredReports.length > 0 ? filteredReports : reports;
    
    const jsonContent = {
      title: "LCA Reports Summary",
      exportDate: new Date().toISOString(),
      totalReports: reportsToExport.length,
      reports: reportsToExport.map(report => ({
        title: report.title,
        date: report.date,
        type: report.type,
        status: report.status,
        co2Saved: report.co2Saved,
        rocScore: report.rocScore,
        rawData: report.rawData
      })),
      filterApplied: filteredReports.length !== reports.length ? filters : null
    };

    // Create and download JSON file
    const blob = new Blob([JSON.stringify(jsonContent, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lca-reports-summary-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "JSON Export Complete",
      description: `Exported ${reportsToExport.length} reports as JSON format.`,
    });
  };

  const handleExportPDF = async () => {
    // Generate comprehensive PDF with all filtered reports
    const reportsToExport = filteredReports.length > 0 ? filteredReports : reports;
    
    const pdf = new jsPDF();
    const pageHeight = pdf.internal.pageSize.height;
    let yPosition = 20;

    // Add title
    pdf.setFontSize(20);
    pdf.text('LCA Reports Summary', 20, yPosition);
    yPosition += 20;

    // Add date
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    // Add summary
    pdf.text(`Total Reports: ${reportsToExport.length}`, 20, yPosition);
    yPosition += 20;

    // Add each report
    reportsToExport.forEach((report, index) => {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFontSize(14);
      pdf.text(`${index + 1}. ${report.title}`, 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.text(`Date: ${report.date}`, 30, yPosition);
      yPosition += 8;
      pdf.text(`Type: ${report.type}`, 30, yPosition);
      yPosition += 8;
      pdf.text(`Status: ${report.status}`, 30, yPosition);
      yPosition += 8;
      pdf.text(`CO2 Saved: ${report.co2Saved} kg`, 30, yPosition);
      yPosition += 8;
      pdf.text(`ROC Score: ${report.rocScore}%`, 30, yPosition);
      yPosition += 15;
    });

    // Save the PDF
    const fileName = `lca-reports-summary-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);

    toast({
      title: "PDF Export Complete",
      description: `Exported ${reportsToExport.length} reports to PDF format.`,
    });
  };

  const handleExportExcel = () => {
    // Generate actual Excel file with all filtered reports
    const reportsToExport = filteredReports.length > 0 ? filteredReports : reports;
    
    // Prepare data for Excel
    const excelData = reportsToExport.map(report => ({
      'Title': report.title,
      'Date': report.date,
      'Type': report.type,
      'Status': report.status,
      'CO2 Saved (kg)': report.co2Saved,
      'ROC Score (%)': report.rocScore
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 30 }, // Title
      { wch: 12 }, // Date
      { wch: 15 }, // Type
      { wch: 12 }, // Status
      { wch: 15 }, // CO2 Saved
      { wch: 15 }  // ROC Score
    ];
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LCA Reports');

    // Generate and download Excel file
    const fileName = `lca-reports-data-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Excel Export Complete",
      description: `Exported ${reportsToExport.length} reports to Excel format.`,
    });
  };

  const downloadReportPDF = async (report: any) => {
    // Download individual report as actual PDF
    const pdf = new jsPDF();
    
    // Add title
    pdf.setFontSize(18);
    pdf.text(`LCA Report: ${report.title}`, 20, 30);
    
    // Add report details
    pdf.setFontSize(12);
    let yPos = 60;
    
    pdf.text(`Generated Date: ${report.date}`, 20, yPos);
    yPos += 15;
    pdf.text(`Report Type: ${report.type}`, 20, yPos);
    yPos += 15;
    pdf.text(`Status: ${report.status}`, 20, yPos);
    yPos += 20;
    
    // Add metrics section
    pdf.setFontSize(14);
    pdf.text('Metrics:', 20, yPos);
    yPos += 15;
    
    pdf.setFontSize(12);
    pdf.text(`CO2 Saved: ${report.co2Saved} kg`, 30, yPos);
    yPos += 15;
    pdf.text(`ROC Score: ${report.rocScore}%`, 30, yPos);
    yPos += 20;
    
    // Add raw data if available
    if (report.rawData) {
      pdf.setFontSize(14);
      pdf.text('Raw Data:', 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(10);
      const rawDataText = JSON.stringify(report.rawData, null, 2);
      const lines = rawDataText.split('\n');
      lines.forEach(line => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(line.substring(0, 90), 20, yPos);
        yPos += 6;
      });
    }

    // Save the PDF
    const fileName = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${report.date}.pdf`;
    pdf.save(fileName);

    toast({
      title: "Report Downloaded",
      description: `"${report.title}" has been downloaded as PDF.`,
    });
  };

  const downloadReportExcel = (report: any) => {
    // Download individual report as actual Excel file
    const reportData = [
      { Field: 'Title', Value: report.title },
      { Field: 'Date', Value: report.date },
      { Field: 'Type', Value: report.type },
      { Field: 'Status', Value: report.status },
      { Field: 'CO2 Saved (kg)', Value: report.co2Saved },
      { Field: 'ROC Score (%)', Value: report.rocScore }
    ];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(reportData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 }, // Field
      { wch: 30 }  // Value
    ];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Details');

    // Generate and download Excel file
    const fileName = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${report.date}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Report Downloaded",
      description: `"${report.title}" has been downloaded as Excel format.`,
    });
  };

  // Load saved reports from localStorage
  const [reports, setReports] = useState(() => {
    const savedReports = localStorage.getItem('lcaReports');
    if (savedReports) {
      try {
        const parsedReports = JSON.parse(savedReports);
        return parsedReports.map((report: any) => ({
          id: report.id,
          title: report.name,
          date: new Date(report.date).toISOString().split('T')[0],
          type: "LCA Analysis",
          status: "Complete",
          co2Saved: `${(5000 - report.co2) / 1000} tons`,
          rocScore: `${report.circularity}%`,
          rawData: report // Store the full data for viewing
        }));
      } catch (e) {
        console.error("Error parsing saved reports:", e);
        return [];
      }
    }
    
    // Return empty array if no saved reports found
    return [];
  });

  // Filter reports based on current filter settings
  const filteredReports = reports.filter(report => {
    // Status filter
    if (filters.status && filters.status !== "all" && report.status !== filters.status) return false;
    
    // Type filter
    if (filters.type && filters.type !== "all" && report.type !== filters.type) return false;
    
    // Date range filter
    if (filters.dateFrom) {
      const reportDate = new Date(report.date);
      if (reportDate < filters.dateFrom) return false;
    }
    if (filters.dateTo) {
      const reportDate = new Date(report.date);
      if (reportDate > filters.dateTo) return false;
    }
    
    // CO2 range filter (extract number from co2Saved string)
    if (filters.minCO2 || filters.maxCO2) {
      const co2Value = parseFloat(report.co2Saved.replace(/[^\d.-]/g, ''));
      if (filters.minCO2 && co2Value < parseFloat(filters.minCO2)) return false;
      if (filters.maxCO2 && co2Value > parseFloat(filters.maxCO2)) return false;
    }
    
    // ROC score range filter
    if (filters.minROC || filters.maxROC) {
      const rocValue = parseInt(report.rocScore.replace('%', ''));
      if (filters.minROC && rocValue < parseInt(filters.minROC)) return false;
      if (filters.maxROC && rocValue > parseInt(filters.maxROC)) return false;
    }
    
    // Search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      return report.title.toLowerCase().includes(searchLower) ||
             report.type.toLowerCase().includes(searchLower) ||
             report.status.toLowerCase().includes(searchLower);
    }
    
    return true;
  });

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: "all",
      type: "all",
      dateFrom: undefined,
      dateTo: undefined,
      minCO2: "",
      maxCO2: "",
      minROC: "",
      maxROC: "",
      searchText: ""
    });
  };
  
  // Function to view a report (redirect to LCAInput with saved data)
  const viewReport = (report: any) => {
    console.log('🔍 viewReport called with:', report);
    
    if (report.rawData && report.rawData.results) {
      console.log('📁 Found rawData with results, loading real report...');
      // Store the report data to be loaded in LCAInput
      localStorage.setItem('currentReport', JSON.stringify(report.rawData));
      // Navigate to LCA Input page
      navigate('/lca-input');
      
      toast({
        title: "Loading Report",
        description: `Loading "${report.title}" analysis data into the form...`,
      });
    } else {
      console.log('📋 No rawData found, creating demo data...');
      // For demo reports without rawData, create sample data based on the report info
      const demoData = {
        id: report.id,
        name: report.title,
        date: new Date().toISOString(),
        co2: report.id === 1 ? 85000 : report.id === 2 ? 92000 : 125000, // Different values based on report
        circularity: parseInt(report.rocScore.replace('%', '')),
        energy: report.id === 1 ? 120000 : report.id === 2 ? 135000 : 180000,
        inputs: {
          metalType: report.id === 1 ? "aluminium" : report.id === 2 ? "copper" : "steel",
          recycledContent: report.id === 1 ? 45 : report.id === 2 ? 60 : 35,
          sourceRegion: "EU",
          energyPerTon: "",
          processMethod: report.id === 1 ? "smelting" : report.id === 2 ? "recycling" : "smelting",
          plantType: "integrated",
          plantLocation: "germany",
          transportDistance: 800,
          transportMode: "truck",
          transportWeight: 10,
          lifespan: 15,
          efficiencyFactor: 0.9,
          recyclingPercent: parseInt(report.rocScore.replace('%', '')),
          landfillPercent: 40,
          reusePercent: 15,
          recoveryMethod: "downcycling",
          emissionControl: [report.id === 1 ? 35 : report.id === 2 ? 25 : 60],
          adjustment: 30
        }
      };
      
      console.log('📊 Demo data created:', demoData);
      localStorage.setItem('currentReport', JSON.stringify(demoData));
      console.log('💾 Data saved to localStorage');
      
      console.log('🚀 Attempting to navigate to /lca-input...');
      navigate('/lca-input');
      
      toast({
        title: "Loading Demo Report",
        description: "Loading sample analysis data for demonstration...",
      });
    }
  };
  
  // Function to share a report
  const shareReport = (reportId: number) => {
    // In a real app, this would generate a shareable link
    const shareableLink = `https://lovlca.app/shared-report/${reportId}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink).then(() => {
      toast({
        title: "Link Copied",
        description: "Shareable link has been copied to clipboard.",
      });
    });
  };

  // Function to delete a single report
  const deleteReport = (reportId: number) => {
    const reportToDelete = reports.find(report => report.id === reportId);
    
    if (window.confirm(`Are you sure you want to delete "${reportToDelete?.title}"? This action cannot be undone.`)) {
      // Update local state
      const updatedReports = reports.filter(report => report.id !== reportId);
      setReports(updatedReports);
      
      // Update localStorage for saved reports
      const savedReports = localStorage.getItem('lcaReports');
      if (savedReports) {
        try {
          const parsedReports = JSON.parse(savedReports);
          const updatedSavedReports = parsedReports.filter((report: any) => report.id !== reportId);
          localStorage.setItem('lcaReports', JSON.stringify(updatedSavedReports));
        } catch (e) {
          console.error("Error updating localStorage:", e);
        }
      }
      
      toast({
        title: "Report Deleted",
        description: `"${reportToDelete?.title}" has been deleted successfully.`,
        variant: "destructive"
      });
    }
  };

  // Function to delete all reports
  const deleteAllReports = () => {
    if (reports.length === 0) {
      toast({
        title: "No Reports",
        description: "There are no reports to delete.",
      });
      return;
    }

    if (window.confirm(`Are you sure you want to delete ALL ${reports.length} reports? This action cannot be undone.`)) {
      // Clear local state
      setReports([]);
      
      // Clear localStorage
      localStorage.removeItem('lcaReports');
      
      toast({
        title: "All Reports Deleted",
        description: `${reports.length} reports have been deleted successfully.`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground">Generate and manage LCA reports</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={deleteAllReports}
            className="gap-2 text-destructive hover:text-destructive"
            disabled={reports.length === 0}
          >
            <Trash2 className="w-4 h-4" />
            Delete All ({reports.length})
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportJSON}
            className="gap-2"
            disabled={reports.length === 0}
          >
            <Download className="w-4 h-4" />
            Export JSON
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportPDF}
            className="gap-2"
            disabled={reports.length === 0}
          >
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportExcel}
            className="gap-2"
            disabled={reports.length === 0}
          >
            <Download className="w-4 h-4" />
            Export Excel
          </Button>
          <Button onClick={handleGenerateReport} className="gap-2">
            <FileText className="w-4 h-4" />
            New Analysis
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Filters & Configuration */}
        <Card className="lg:col-span-1 gradient-card shadow-eco">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Filter Reports
            </CardTitle>
            <CardDescription>Filter and search through your reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Text */}
            <div className="space-y-2">
              <Label htmlFor="search">Search Reports</Label>
              <Input
                id="search"
                placeholder="Search by title, type, or status..."
                value={filters.searchText}
                onChange={(e) => setFilters({ ...filters, searchText: e.target.value })}
              />
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Complete">Complete</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="type-filter">Report Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="LCA Analysis">LCA Analysis</SelectItem>
                  <SelectItem value="Comprehensive">Comprehensive</SelectItem>
                  <SelectItem value="Circularity Focus">Circularity Focus</SelectItem>
                  <SelectItem value="Process Analysis">Process Analysis</SelectItem>
                  <SelectItem value="Comparative Analysis">Comparative Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal text-xs",
                        !filters.dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {filters.dateFrom ? format(filters.dateFrom, "MMM dd") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal text-xs",
                        !filters.dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {filters.dateTo ? format(filters.dateTo, "MMM dd") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* CO2 Range Filter */}
            <div className="space-y-2">
              <Label>CO₂ Saved (tons)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.minCO2}
                  onChange={(e) => setFilters({ ...filters, minCO2: e.target.value })}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.maxCO2}
                  onChange={(e) => setFilters({ ...filters, maxCO2: e.target.value })}
                />
              </div>
            </div>

            {/* ROC Score Range Filter */}
            <div className="space-y-2">
              <Label>ROC Score (%)</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min %"
                  type="number"
                  min="0"
                  max="100"
                  value={filters.minROC}
                  onChange={(e) => setFilters({ ...filters, minROC: e.target.value })}
                />
                <Input
                  placeholder="Max %"
                  type="number"
                  min="0"
                  max="100"
                  value={filters.maxROC}
                  onChange={(e) => setFilters({ ...filters, maxROC: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            {/* Filter Actions */}
            <div className="flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
              <div className="text-xs text-muted-foreground text-center">
                Showing {filteredReports.length} of {reports.length} reports
              </div>
            </div>

            <Separator />

            {/* Quick Report Generation */}
            <div className="space-y-3">
              <Label>Quick Actions</Label>
              <div className="flex gap-2">
                <Button onClick={handleExportPDF} size="sm" className="flex-1 gap-1" disabled={reports.length === 0}>
                  <Download className="w-3 h-3" />
                  PDF
                </Button>
                <Button onClick={handleExportExcel} size="sm" variant="outline" className="flex-1 gap-1" disabled={reports.length === 0}>
                  <Download className="w-3 h-3" />
                  Excel
                </Button>
              </div>
              <Button onClick={handleGenerateReport} size="sm" className="w-full gap-1" variant="outline">
                <FileText className="w-3 h-3" />
                New Analysis
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card className="lg:col-span-2 gradient-card shadow-eco">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Recent Reports
            </CardTitle>
            <CardDescription>Your generated LCA reports and analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No reports found</h3>
                  <p className="text-muted-foreground mb-4">
                    {reports.length === 0 
                      ? "Complete an LCA analysis to generate your first report. Use the LCA Input tool to get started." 
                      : "No reports match your current filters. Try adjusting your search criteria."
                    }
                  </p>
                  {reports.length > 0 && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                filteredReports.map((report) => (
                <div key={report.id} className="p-4 border border-border rounded-lg bg-card/50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{report.title}</h4>
                      <p className="text-sm text-muted-foreground">Generated on {report.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={report.status === "Complete" ? "default" : "secondary"}
                        className={report.status === "Complete" ? "bg-success text-success-foreground" : ""}
                      >
                        {report.status}
                      </Badge>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center p-2 bg-primary/5 rounded border border-primary/20">
                      <div className="text-sm font-semibold text-primary">{report.co2Saved}</div>
                      <div className="text-xs text-muted-foreground">CO₂ Saved</div>
                    </div>
                    <div className="text-center p-2 bg-success/5 rounded border border-success/20">
                      <div className="text-sm font-semibold text-success">{report.rocScore}</div>
                      <div className="text-xs text-muted-foreground">ROC Score</div>
                    </div>
                    <div className="text-center p-2 bg-accent/5 rounded border border-accent/20">
                      <div className="text-sm font-semibold text-accent">High</div>
                      <div className="text-xs text-muted-foreground">Impact</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                      console.log('🔘 View button clicked for report:', report);
                      viewReport(report);
                    }}>
                      <Eye className="w-3 h-3" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => downloadReportPDF(report)}>
                      <Download className="w-3 h-3" />
                      PDF
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => downloadReportExcel(report)}>
                      <Download className="w-3 h-3" />
                      Excel
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => shareReport(report.id)}>
                      <Share2 className="w-3 h-3" />
                      Share
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="gap-1 text-destructive hover:text-destructive hover:border-destructive" 
                      onClick={() => deleteReport(report.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policy Benchmarks */}
      <Card className="gradient-card shadow-eco border border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            Policy Benchmarks & Standards
          </CardTitle>
          <CardDescription>Compare your results with industry standards and regulations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-success/5 rounded-lg border border-success/20">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-4 h-4 text-success" />
                <span className="font-semibold">EU Circular Economy</span>
              </div>
              <div className="text-2xl font-bold text-success mb-1">+18%</div>
              <div className="text-sm text-muted-foreground">Above EU average for circular practices</div>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="font-semibold">ISO 14040 Compliance</span>
              </div>
              <div className="text-2xl font-bold text-primary mb-1">98%</div>
              <div className="text-sm text-muted-foreground">Standards compliance score</div>
            </div>

            <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-warning" />
                <span className="font-semibold">Industry Ranking</span>
              </div>
              <div className="text-2xl font-bold text-warning mb-1">Top 15%</div>
              <div className="text-sm text-muted-foreground">Among global metal producers</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;