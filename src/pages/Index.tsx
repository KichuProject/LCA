import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  Recycle, 
  Leaf, 
  Plus,
  Brain,
  Award,
  Target,
  Users,
  Globe
} from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

// Sample data for the dashboard
const sampleData = {
  metalBreakdown: [
    { name: "Aluminium", value: 42, color: "#22c55e" },
    { name: "Copper", value: 28, color: "#3b82f6" },
    { name: "Steel", value: 18, color: "#f59e0b" },
    { name: "Others", value: 12, color: "#ef4444" },
  ],
  monthlyTrends: [147, 152, 135, 128, 142, 156],
};

const Index = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Hero Section */}
      <div 
        className="relative overflow-hidden rounded-2xl gradient-hero p-8 text-white shadow-eco"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(34, 197, 94, 0.9) 0%, rgba(59, 130, 246, 0.8) 100%), url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold mb-4">AI-Powered Life Cycle Assessment</h1>
            <p className="text-lg opacity-90 mb-6">
              Monitor environmental impact and optimize circularity for metals production
            </p>
            <div className="flex gap-3">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={() => navigate('/lca-input')}>
                <Plus className="w-5 h-5" />
                Start New Analysis
              </Button>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={() => console.log('View Documentation clicked')}>
                View Documentation
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
        <div className="absolute top-4 right-4 opacity-20">
          <div className="w-32 h-32 rounded-full bg-white/10 flex items-center justify-center">
            <Leaf className="w-16 h-16" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gradient-card shadow-eco border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Metals Analyzed</p>
                <p className="text-3xl font-bold text-foreground">147</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+12% vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Activity className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-eco border-l-4 border-l-success">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CO₂ Equivalent Saved</p>
                <p className="text-3xl font-bold text-foreground">2,340 kg</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+8% vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <Leaf className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-eco border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Circularity Score</p>
                <p className="text-3xl font-bold text-foreground">78%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+5% vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-warning/10 rounded-full">
                <Recycle className="w-6 h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card shadow-eco border-l-4 border-l-accent">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Energy Saved</p>
                <p className="text-3xl font-bold text-foreground">45.2 MWh</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-success" />
                  <span className="text-xs text-success">+15% vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <Zap className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simple Chart Placeholders */}
        <Card className="gradient-card shadow-eco">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Recycle className="w-5 h-5 text-success" />
              Material Flow Distribution
            </CardTitle>
            <CardDescription>Circular vs linear material usage patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-primary/5 rounded-lg border border-primary/20">
              <div className="text-center">
                <div className="w-32 h-32 rounded-full border-8 border-success mx-auto mb-4 relative">
                  <div className="absolute inset-4 rounded-full bg-success/20"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="text-2xl font-bold text-success">78%</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Circularity Score</p>
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success"></div>
                <span className="text-sm">Recycled (65%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning"></div>
                <span className="text-sm">Virgin (25%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span className="text-sm">Waste (10%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metal Analysis Trends */}
        <Card className="gradient-card shadow-eco">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Metal Analysis Breakdown
            </CardTitle>
            <CardDescription>Monthly analysis volume trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2 bg-primary/5 rounded-lg border border-primary/20 p-4">
              {sampleData.monthlyTrends.map((value, index) => (
                <div key={index} className="flex flex-col items-center gap-2">
                  <div 
                    className="w-8 bg-primary rounded-t" 
                    style={{ height: `${(value / 156) * 150}px` }}
                  ></div>
                  <span className="text-xs text-muted-foreground">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][index]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Model Status */}
        <Card className="gradient-card shadow-eco border border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Model Status
            </CardTitle>
            <CardDescription>Machine learning performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Prediction Accuracy</span>
                <span className="font-semibold">99.2%</span>
              </div>
              <Progress value={99.2} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Model Training</span>
                <span className="font-semibold">Complete</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="text-xs text-muted-foreground">
              Last updated: 2 hours ago • Based on 10,000+ datasets
            </div>
            <Badge className="w-full justify-center bg-success text-success-foreground">
              All Systems Operational
            </Badge>
          </CardContent>
        </Card>

        {/* ROC Calculator Highlight */}
        <Card className="gradient-card shadow-eco border border-accent/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent" />
              ROC Calculator
            </CardTitle>
            <CardDescription>Return on Circularity insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">34%</div>
              <div className="text-sm text-muted-foreground">Average ROC Score</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CO₂ Reduction</span>
                <span className="font-semibold text-success">6.8 tons</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cost Savings</span>
                <span className="font-semibold text-primary">$2,340</span>
              </div>
            </div>
            <Badge className="w-full justify-center" variant="outline">
              ≈ 290 Trees Planted 🌱
            </Badge>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="gradient-card shadow-eco">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate('/lca-input')}>
              <Plus className="w-4 h-4" />
              New LCA Analysis
            </Button>
            <Button className="w-full justify-start gap-2 bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100" onClick={() => navigate('/geo-mapping')}>
              <Globe className="w-4 h-4" />
              Geo-Mapping Impact
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate('/ai-chatbot')}>
              <Brain className="w-4 h-4" />
              AI Auto-complete
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => navigate('/reports')}>
              <Award className="w-4 h-4" />
              Generate Report
            </Button>
            <Button className="w-full justify-start gap-2" variant="outline" onClick={() => console.log('Share Analysis clicked')}>
              <Users className="w-4 h-4" />
              Share Analysis
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="gradient-card shadow-eco">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest analyses and system updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-success/5 rounded-lg border border-success/20">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Aluminium Can Analysis Completed</p>
                <p className="text-xs text-muted-foreground">ROC Score: 28% • CO₂ Saved: 3.2 tons</p>
              </div>
              <Badge variant="secondary" className="text-xs">2 min ago</Badge>
            </div>
            <div className="flex items-center gap-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">AI Model Updated</p>
                <p className="text-xs text-muted-foreground">New training data integrated • Accuracy: 99.2%</p>
              </div>
              <Badge variant="secondary" className="text-xs">1 hour ago</Badge>
            </div>
            <div className="flex items-center gap-4 p-3 bg-warning/5 rounded-lg border border-warning/20">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Copper Wire Study Draft Ready</p>
                <p className="text-xs text-muted-foreground">Ready for review and optimization</p>
              </div>
              <Badge variant="secondary" className="text-xs">3 hours ago</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;