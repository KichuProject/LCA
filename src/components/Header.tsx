import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Download, Plus, Home, Calculator, FileText, Settings, Leaf, MessageCircle, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

// Brighter, more vibrant colors for icons
const navItems = [
  { title: "Dashboard", url: "/", icon: Home, color: "#00C853" },
  { title: "LCA Input", url: "/lca-input", icon: Calculator, color: "#2979FF" },
  { title: "Reports", url: "/reports", icon: FileText, color: "#FF6D00" },
  { title: "AI Chatbot", url: "/ai-chatbot", icon: MessageCircle, color: "#D500F9" },
  { title: "Settings", url: "/settings", icon: Settings, color: "#455A64" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentPath = location.pathname;
  const [isMobile, setIsMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Check if screen is mobile size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Handle Export Data button
  const handleExportData = () => {
    // Get saved reports from localStorage
    const savedReports = localStorage.getItem('lcaReports');
    if (!savedReports) {
      toast({
        title: "No Data Available",
        description: "No reports found to export. Create some reports first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const reports = JSON.parse(savedReports);
      const exportData = {
        title: "LCA Data Export",
        exportDate: new Date().toISOString(),
        totalReports: reports.length,
        reports: reports
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lca-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Data Exported",
        description: `Successfully exported ${reports.length} reports as JSON.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle New Analysis button
  const handleNewAnalysis = () => {
    navigate('/lca-input');
    toast({
      title: "New Analysis Started",
      description: "Navigate to LCA Input to create a new analysis.",
    });
  };

  // Custom navigation class that preserves icon colors
  const getNavCls = (path: string) => {
    const isActive = currentPath === path;
    return isActive
      ? "bg-gray-100 dark:bg-gray-800 font-semibold"
      : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-foreground";
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">EcoLCA</span>
        </div>

        {/* Mobile menu button */}
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleMenu} className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Desktop Navigation */}
        <nav className={`md:flex items-center gap-4 ${isMobile ? 'hidden' : 'flex'}`}>
          {navItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${getNavCls(item.url)}`}
            >
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>

        {/* Mobile Navigation (Dropdown) */}
        {isMobile && menuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background border-b border-border z-50 shadow-lg">
            <nav className="flex flex-col p-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${getNavCls(item.url)}`}
                  onClick={() => setMenuOpen(false)}
                  style={{ 
                    borderLeft: currentPath === item.url ? `4px solid ${item.color}` : '4px solid transparent'
                  }}
                >
                  <item.icon 
                    className="w-6 h-6" 
                    style={{ color: item.color, filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.1))" }} 
                  />
                  <span>{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}

        {/* Action Buttons - Hide on mobile */}
        <div className={`items-center gap-2 ${isMobile ? 'hidden' : 'flex'}`}>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleExportData}>
            <Download className="w-4 h-4" />
            Export Data
          </Button>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90" onClick={handleNewAnalysis}>
            <Plus className="w-4 h-4" />
            New Analysis
          </Button>
        </div>
      </div>
    </header>
  );
}