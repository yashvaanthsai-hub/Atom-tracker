import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Target, Plus, Flame, Calendar, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HabitCompletion {
  date: string;
  completed: boolean;
}

interface Habit {
  id: string;
  name: string;
  frequency: "daily" | "weekly";
  createdAt: string;
  completions: HabitCompletion[];
  streak: number;
  bestStreak: number;
}

const Habits = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState({
    name: "",
    frequency: "daily" as "daily" | "weekly",
  });

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const savedHabits = localStorage.getItem("atomTracker_habits");
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  const saveHabits = (updatedHabits: Habit[]) => {
    setHabits(updatedHabits);
    localStorage.setItem("atomTracker_habits", JSON.stringify(updatedHabits));
    window.dispatchEvent(new CustomEvent("atomTracker_habitsUpdated"));
  };

  const addHabit = () => {
    if (!newHabit.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a habit name.",
        variant: "destructive",
      });
      return;
    }

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.name.trim(),
      frequency: newHabit.frequency,
      createdAt: today,
      completions: [],
      streak: 0,
      bestStreak: 0,
    };

    const updatedHabits = [...habits, habit];
    saveHabits(updatedHabits);
    setNewHabit({ name: "", frequency: "daily" });

    toast({
      title: "Habit added! 🎯",
      description: `${habit.name} has been added to your habit tracker.`,
    });
  };

  const calculateStreak = (completions: HabitCompletion[]): number => {
    if (completions.length === 0) return 0;

    const sortedCompletions = completions
      .filter(c => c.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedCompletions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < sortedCompletions.length; i++) {
      const completionDate = new Date(sortedCompletions[i].date);
      const daysDiff = Math.floor((currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (i === 0 && daysDiff <= 1) {
        streak = 1;
        currentDate = completionDate;
      } else if (daysDiff === 1) {
        streak++;
        currentDate = completionDate;
      } else {
        break;
      }
    }

    return streak;
  };

  const toggleHabitCompletion = (habitId: string) => {
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const existingCompletion = habit.completions.find(c => c.date === today);
        let updatedCompletions;

        if (existingCompletion) {
          updatedCompletions = habit.completions.map(c =>
            c.date === today ? { ...c, completed: !c.completed } : c
          );
        } else {
          updatedCompletions = [
            ...habit.completions,
            { date: today, completed: true }
          ];
        }

        const newStreak = calculateStreak(updatedCompletions);
        const newBestStreak = Math.max(habit.bestStreak, newStreak);

        return {
          ...habit,
          completions: updatedCompletions,
          streak: newStreak,
          bestStreak: newBestStreak,
        };
      }
      return habit;
    });

    saveHabits(updatedHabits);

    const habit = updatedHabits.find(h => h.id === habitId);
    const completion = habit?.completions.find(c => c.date === today);
    
    if (completion?.completed) {
      toast({
        title: "Great job! 🌟",
        description: `${habit?.name} completed for today. Current streak: ${habit?.streak} days!`,
      });
    }
  };

  const isHabitCompletedToday = (habit: Habit): boolean => {
    const todayCompletion = habit.completions.find(c => c.date === today);
    return todayCompletion?.completed || false;
  };

  const getCompletionRate = (habit: Habit): number => {
    const totalDays = Math.floor(
      (new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
    const completedDays = habit.completions.filter(c => c.completed).length;
    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-habit" />
                <h1 className="text-xl font-semibold">Habits Tracker</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Add New Habit */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Habit
              </CardTitle>
              <CardDescription>
                Create a new habit to track daily or weekly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="habit-name">Habit Name</Label>
                <Input
                  id="habit-name"
                  placeholder="Read for 30 minutes, Exercise, Meditate..."
                  value={newHabit.name}
                  onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={newHabit.frequency} onValueChange={(value: "daily" | "weekly") => setNewHabit(prev => ({ ...prev, frequency: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={addHabit} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
            </CardContent>
          </Card>

          {/* Today's Habits */}
          {habits.length > 0 && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Today's Habits
                </CardTitle>
                <CardDescription>
                  Mark your habits as completed for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {habits.map((habit) => (
                    <div key={habit.id} className="flex items-center gap-4 p-4 border rounded-lg bg-secondary/50">
                      <Checkbox
                        checked={isHabitCompletedToday(habit)}
                        onCheckedChange={() => toggleHabitCompletion(habit.id)}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`font-medium ${isHabitCompletedToday(habit) ? 'line-through text-muted-foreground' : ''}`}>
                            {habit.name}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {habit.frequency}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-orange-500" />
                            {habit.streak} day streak
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {getCompletionRate(habit)}% completion rate
                          </span>
                        </div>
                        
                        {/* Last 7 days visualization */}
                        <div className="flex gap-1 mt-2">
                          {getLast7Days().map((date) => {
                            const completion = habit.completions.find(c => c.date === date);
                            const isCompleted = completion?.completed || false;
                            return (
                              <div
                                key={date}
                                className={`w-3 h-3 rounded-sm ${
                                  isCompleted ? 'bg-habit' : 'bg-secondary'
                                }`}
                                title={`${new Date(date).toLocaleDateString()}: ${isCompleted ? 'Completed' : 'Not completed'}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-habit">{habit.streak}</div>
                        <div className="text-xs text-muted-foreground">best: {habit.bestStreak}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Habit Statistics */}
          {habits.length > 0 && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Habit Statistics</CardTitle>
                <CardDescription>
                  Your overall habit tracking performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg bg-secondary/30">
                    <div className="text-2xl font-bold text-habit">{habits.length}</div>
                    <div className="text-sm text-muted-foreground">Active Habits</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg bg-secondary/30">
                    <div className="text-2xl font-bold text-habit">
                      {habits.filter(h => isHabitCompletedToday(h)).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed Today</div>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg bg-secondary/30">
                    <div className="text-2xl font-bold text-habit">
                      {Math.max(...habits.map(h => h.bestStreak), 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Best Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {habits.length === 0 && (
            <Card className="shadow-card border-0">
              <CardContent className="p-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No habits yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start building better habits by adding your first one above.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Habits;