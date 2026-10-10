import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calculator, 
  CheckSquare, 
  Target, 
  Heart, 
  Activity,
  Settings as SettingsIcon,
  LogOut,
  User,
  TrendingUp,
  Clock,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Settings from "./Settings";

interface User {
  name: string;
  email: string;
  password: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [weeklySpending, setWeeklySpending] = useState(0);
  const [activeHabits, setActiveHabits] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const refreshCounts = () => {
    // Calculate weekly spending
    const expenses = JSON.parse(localStorage.getItem("atomTracker_expenses") || "[]");
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyTotal = expenses
      .filter((expense: any) => new Date(expense.date) >= weekAgo)
      .reduce((total: number, expense: any) => total + expense.amount, 0);
    
    setWeeklySpending(weeklyTotal);

    // Load active habits count
    const savedHabits = JSON.parse(localStorage.getItem("atomTracker_habits") || "[]");
    setActiveHabits(savedHabits.length);

    // Load completed tasks count
    const savedTasks = JSON.parse(localStorage.getItem("atomTracker_tasks") || "[]");
    setCompletedTasks(savedTasks.filter((task: any) => task.completed).length);
  };

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("atomTracker_isLoggedIn");
    const userData = localStorage.getItem("atomTracker_user");
    
    if (!isLoggedIn || !userData) {
      navigate("/login");
      return;
    }
    
    setUser(JSON.parse(userData));
    refreshCounts();

    // Listen for cross-page count updates
    window.addEventListener("atomTracker_habitsUpdated", refreshCounts);
    window.addEventListener("atomTracker_tasksUpdated", refreshCounts);
    window.addEventListener("storage", refreshCounts);

    return () => {
      window.removeEventListener("atomTracker_habitsUpdated", refreshCounts);
      window.removeEventListener("atomTracker_tasksUpdated", refreshCounts);
      window.removeEventListener("storage", refreshCounts);
    };
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("atomTracker_isLoggedIn");
    toast({
      title: "Logged out successfully",
      description: "Thanks for using Atom Tracker!",
    });
    navigate("/");
  };

  const modules = [
    {
      title: "Expenses",
      description: "Track your spending and manage budgets",
      icon: Calculator,
      color: "expense",
      stats: "3 transactions today",
      path: "/expenses",
    },
    {
      title: "Tasks",
      description: "Manage your to-dos and stay productive",
      icon: CheckSquare,
      color: "task",
      stats: "5 tasks pending",
      path: "/tasks",
    },
    {
      title: "Habits",
      description: "Build and maintain healthy habits",
      icon: Target,
      color: "habit",
      stats: "7 day streak",
      path: "/habits",
    },
    {
      title: "Mood Journal",
      description: "Track your emotional wellness",
      icon: Heart,
      color: "mood",
      stats: "Last entry: Today",
      path: "/mood",
    },
    {
      title: "Fitness Log",
      description: "Monitor your health and workouts",
      icon: Activity,
      color: "fitness",
      stats: "2L water today",
      path: "/fitness",
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-3 py-1">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Atom Tracker</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </div>
              
              <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
                <SettingsIcon className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's what's happening with your life tracking today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-lg p-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeHabits}</p>
                  <p className="text-sm text-muted-foreground">Active habits</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-task/10 rounded-lg p-3">
                  <CheckSquare className="h-6 w-6 text-task" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completedTasks}</p>
                  <p className="text-sm text-muted-foreground">Tasks completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-expense/10 rounded-lg p-3">
                  <Calculator className="h-6 w-6 text-expense" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{weeklySpending.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Spent this week</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Card 
              key={module.title}
              className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-0 shadow-card cursor-pointer"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(module.path)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-${module.color}/10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <module.icon className={`h-6 w-6 text-${module.color}`} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{module.stats}</span>
                  </div>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {module.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {module.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <Card className="mt-8 bg-gradient-hero text-white border-0 shadow-soft">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-2">More Features Coming Soon</h3>
            <p className="text-white/80 mb-6">
              We're working hard to bring you even more ways to organize and track your life. 
              Stay tuned for exciting updates!
            </p>
            <Button variant="glass" size="lg">
              Learn More
            </Button>
          </CardContent>
        </Card>
      </div>

      <Settings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
};

export default Dashboard;