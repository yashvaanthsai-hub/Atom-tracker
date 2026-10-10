import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calculator, 
  CheckSquare, 
  Target, 
  Heart, 
  Activity,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-dashboard.jpg";

const features = [
  {
    icon: Calculator,
    title: "Smart Expenses",
    description: "Track spending with intelligent categorization and budget insights.",
    color: "expense",
  },
  {
    icon: CheckSquare,
    title: "Task Management",
    description: "Stay productive with prioritized tasks and deadline tracking.",
    color: "task",
  },
  {
    icon: Target,
    title: "Habit Tracking",
    description: "Build lasting habits with streak counters and daily reminders.",
    color: "habit",
  },
  {
    icon: Heart,
    title: "Mood Journal",
    description: "Reflect on your emotions and track your mental wellness.",
    color: "mood",
  },
  {
    icon: Activity,
    title: "Fitness Log",
    description: "Monitor workouts, water intake, and overall health metrics.",
    color: "fitness",
  },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Your Personal Life Manager</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent leading-tight">
                Atom Tracker
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground mb-4 font-light">
                Simplify Your Life, All in One Place
              </p>
              
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                Track your expenses, habits, tasks, moods, and fitness seamlessly. 
                Everything you need to organize your daily life in one beautiful app.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild variant="hero" size="xl" className="animate-glow">
                  <Link to="/login">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="glass" size="xl">
                  <Link to="#features">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="relative lg:block animate-scale-in">
              <div className="relative rounded-2xl overflow-hidden shadow-soft">
                <img 
                  src={heroImage} 
                  alt="Atom Tracker Dashboard Preview" 
                  className="w-full h-auto transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything You Need to Stay Organized
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Five powerful modules working together to help you track, organize, and improve every aspect of your daily life.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="group hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-0 shadow-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-${feature.color}/10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-3xl lg:text-4xl font-bold mb-6">
            Ready to Transform Your Daily Life?
          </h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who have simplified their lives with Atom Tracker. 
            Start your journey to better organization today.
          </p>
          
          <Button asChild variant="gradient" size="xl">
            <Link to="/login">
              Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto max-w-7xl text-center">
          <p className="text-muted-foreground">
            © 2024 Atom Tracker. Built with care for your productivity.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;