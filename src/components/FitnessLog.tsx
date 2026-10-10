import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Exercise {
  id: string;
  name: string;
  type: string;
  duration: number;
  notes: string;
  completed: boolean;
  dateAdded: string;
  dateCompleted?: string;
  daysDelayed: number;
}

interface WorkoutSession {
  id: string;
  date: string;
  exercises: Exercise[];
  waterIntake: number;
  notes: string;
}

const FitnessLog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [newExercise, setNewExercise] = useState({
    name: "",
    type: "",
    duration: "",
    notes: "",
  });
  const [todaySession, setTodaySession] = useState<WorkoutSession | null>(null);
  const [waterIntake, setWaterIntake] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const savedSessions = localStorage.getItem("atomTracker_fitness");
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions);
      setSessions(sessions);
      const todaySession = sessions.find((s: WorkoutSession) => s.date === today);
      if (todaySession) {
        setTodaySession(todaySession);
        setWaterIntake(todaySession.waterIntake);
      } else {
        setTodaySession({
          id: Date.now().toString(),
          date: today,
          exercises: [],
          waterIntake: 0,
          notes: "",
        });
      }
    } else {
      setTodaySession({
        id: Date.now().toString(),
        date: today,
        exercises: [],
        waterIntake: 0,
        notes: "",
      });
    }
  }, [today]);

  const addExercise = () => {
    if (!newExercise.name || !newExercise.type || !newExercise.duration) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const exercise: Exercise = {
      id: Date.now().toString(),
      name: newExercise.name,
      type: newExercise.type,
      duration: parseInt(newExercise.duration),
      notes: newExercise.notes,
      completed: false,
      dateAdded: today,
      daysDelayed: 0,
    };

    if (todaySession) {
      const updatedSession = {
        ...todaySession,
        exercises: [...todaySession.exercises, exercise],
      };
      setTodaySession(updatedSession);
      updateSession(updatedSession);
    }

    setNewExercise({ name: "", type: "", duration: "", notes: "" });
    toast({
      title: "Exercise added",
      description: `${exercise.name} has been added to your workout plan.`,
    });
  };

  const toggleExerciseCompletion = (exerciseId: string) => {
    if (!todaySession) return;

    const updatedExercises = todaySession.exercises.map(exercise => {
      if (exercise.id === exerciseId) {
        const completed = !exercise.completed;
        const dateCompleted = completed ? today : undefined;
        
        // Calculate days delayed if completing late
        let daysDelayed = 0;
        if (completed && exercise.dateAdded !== today) {
          const addedDate = new Date(exercise.dateAdded);
          const completedDate = new Date(today);
          daysDelayed = Math.floor((completedDate.getTime() - addedDate.getTime()) / (1000 * 60 * 60 * 24));
        }

        return {
          ...exercise,
          completed,
          dateCompleted,
          daysDelayed,
        };
      }
      return exercise;
    });

    const updatedSession = {
      ...todaySession,
      exercises: updatedExercises,
    };

    setTodaySession(updatedSession);
    updateSession(updatedSession);

    const exercise = updatedExercises.find(e => e.id === exerciseId);
    if (exercise?.completed) {
      toast({
        title: "Exercise completed! 🎉",
        description: exercise.daysDelayed > 0 
          ? `${exercise.name} completed (${exercise.daysDelayed} days late)`
          : `${exercise.name} completed on time!`,
      });
    }
  };

  const updateWaterIntake = (amount: number) => {
    const newAmount = Math.max(0, waterIntake + amount);
    setWaterIntake(newAmount);
    
    if (todaySession) {
      const updatedSession = {
        ...todaySession,
        waterIntake: newAmount,
      };
      setTodaySession(updatedSession);
      updateSession(updatedSession);
    }
  };

  const updateSession = (session: WorkoutSession) => {
    const updatedSessions = sessions.filter(s => s.date !== session.date);
    const newSessions = [...updatedSessions, session];
    setSessions(newSessions);
    localStorage.setItem("atomTracker_fitness", JSON.stringify(newSessions));
  };

  const getExerciseStatus = (exercise: Exercise) => {
    if (exercise.completed) {
      return exercise.daysDelayed > 0 ? "delayed" : "completed";
    }
    
    const daysOverdue = Math.floor((new Date().getTime() - new Date(exercise.dateAdded).getTime()) / (1000 * 60 * 60 * 24));
    return daysOverdue > 0 ? "overdue" : "pending";
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
                <Activity className="h-5 w-5 text-fitness" />
                <h1 className="text-xl font-semibold">Fitness Log</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Water Intake Tracker */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                💧 Water Intake
              </CardTitle>
              <CardDescription>
                Track your daily water consumption (glasses)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="bg-secondary rounded-full h-4 relative overflow-hidden">
                    <div 
                      className="bg-fitness h-full transition-all duration-300"
                      style={{ width: `${Math.min((waterIntake / 8) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {waterIntake} / 8 glasses today
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateWaterIntake(-1)}
                    disabled={waterIntake <= 0}
                  >
                    -1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateWaterIntake(1)}
                  >
                    +1
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add New Exercise */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Exercise
              </CardTitle>
              <CardDescription>
                Plan your workout exercises for today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exercise-name">Exercise Name</Label>
                  <Input
                    id="exercise-name"
                    placeholder="Push-ups, Running, etc."
                    value={newExercise.name}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exercise-type">Type</Label>
                  <Input
                    id="exercise-type"
                    placeholder="Cardio, Strength, Flexibility"
                    value={newExercise.type}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, type: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="30"
                  value={newExercise.duration}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, duration: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Sets, reps, or other details..."
                  value={newExercise.notes}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                />
              </div>
              
              <Button onClick={addExercise} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Exercise
              </Button>
            </CardContent>
          </Card>

          {/* Today's Exercises */}
          {todaySession && todaySession.exercises.length > 0 && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Today's Workout Plan
                </CardTitle>
                <CardDescription>
                  Track your exercise completion and delays
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaySession.exercises.map((exercise) => {
                    const status = getExerciseStatus(exercise);
                    return (
                      <div key={exercise.id} className="flex items-center gap-4 p-4 border rounded-lg bg-secondary/50">
                        <Checkbox
                          checked={exercise.completed}
                          onCheckedChange={() => toggleExerciseCompletion(exercise.id)}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${exercise.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {exercise.name}
                            </h4>
                            <Badge variant={
                              status === "completed" ? "default" :
                              status === "delayed" ? "secondary" :
                              status === "overdue" ? "destructive" : "outline"
                            }>
                              {status === "delayed" ? `Completed (${exercise.daysDelayed}d late)` : status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {exercise.duration} min
                            </span>
                            <span>{exercise.type}</span>
                          </div>
                          
                          {exercise.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{exercise.notes}</p>
                          )}
                        </div>
                        
                        {status === "overdue" && (
                          <AlertCircle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weekly Summary */}
          {sessions.length > 0 && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
                <CardDescription>
                  Your fitness activity over the past 7 days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions
                    .filter(session => {
                      const sessionDate = new Date(session.date);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return sessionDate >= weekAgo;
                    })
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((session) => (
                      <div key={session.id} className="p-3 border rounded-lg bg-secondary/30">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{new Date(session.date).toLocaleDateString()}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{session.exercises.filter(e => e.completed).length}/{session.exercises.length} exercises</span>
                            <span>💧 {session.waterIntake}L</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FitnessLog;