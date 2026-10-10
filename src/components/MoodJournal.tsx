import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Heart, Sun, Sunset, Moon, Calendar, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MoodEntry {
  id: string;
  date: string;
  morning: { mood: string; reason: string };
  afternoon: { mood: string; reason: string };
  evening: { mood: string; reason: string };
  night: { mood: string; reason: string };
}

const moodEmojis = {
  happy: "😊",
  sad: "😢",
  excited: "🤩",
  calm: "😌",
  anxious: "😰",
  angry: "😠",
  neutral: "😐",
  tired: "😴",
};

const timeOfDay = [
  { key: "morning", label: "Morning", icon: Sun, color: "text-yellow-500" },
  { key: "afternoon", label: "Afternoon", icon: Sun, color: "text-orange-500" },
  { key: "evening", label: "Evening", icon: Sunset, color: "text-red-500" },
  { key: "night", label: "Night", icon: Moon, color: "text-blue-500" },
];

const MoodJournal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentEntry, setCurrentEntry] = useState<MoodEntry>({
    id: "",
    date: selectedDate,
    morning: { mood: "", reason: "" },
    afternoon: { mood: "", reason: "" },
    evening: { mood: "", reason: "" },
    night: { mood: "", reason: "" },
  });

  useEffect(() => {
    const savedEntries = localStorage.getItem("atomTracker_moods");
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  useEffect(() => {
    const existingEntry = entries.find(entry => entry.date === selectedDate);
    if (existingEntry) {
      setCurrentEntry(existingEntry);
    } else {
      setCurrentEntry({
        id: Date.now().toString(),
        date: selectedDate,
        morning: { mood: "", reason: "" },
        afternoon: { mood: "", reason: "" },
        evening: { mood: "", reason: "" },
        night: { mood: "", reason: "" },
      });
    }
  }, [selectedDate, entries]);

  const updateMood = (timeKey: keyof Omit<MoodEntry, 'id' | 'date'>, field: 'mood' | 'reason', value: string) => {
    setCurrentEntry(prev => ({
      ...prev,
      [timeKey]: {
        ...prev[timeKey],
        [field]: value
      }
    }));
  };

  const saveEntry = () => {
    const updatedEntries = entries.filter(entry => entry.date !== currentEntry.date);
    const newEntries = [...updatedEntries, currentEntry];
    setEntries(newEntries);
    localStorage.setItem("atomTracker_moods", JSON.stringify(newEntries));
    
    toast({
      title: "Mood entry saved",
      description: `Your mood diary for ${new Date(selectedDate).toLocaleDateString()} has been saved.`,
    });
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
                <Heart className="h-5 w-5 text-mood" />
                <h1 className="text-xl font-semibold">Mood Journal</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Date Selector */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Select Date
              </CardTitle>
              <CardDescription>
                Choose a date to view or edit your mood diary entry.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
                max={new Date().toISOString().split('T')[0]}
              />
            </CardContent>
          </Card>

          {/* Mood Entry Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {timeOfDay.map((time) => (
              <Card key={time.key} className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <time.icon className={`h-5 w-5 ${time.color}`} />
                    {time.label}
                  </CardTitle>
                  <CardDescription>
                    How was your mood in the {time.label.toLowerCase()}?
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Mood Selection */}
                  <div className="space-y-2">
                    <Label>Select Mood</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(moodEmojis).map(([mood, emoji]) => (
                        <Button
                          key={mood}
                          variant={currentEntry[time.key as keyof Omit<MoodEntry, 'id' | 'date'>].mood === mood ? "default" : "outline"}
                          size="sm"
                          onClick={() => updateMood(time.key as keyof Omit<MoodEntry, 'id' | 'date'>, 'mood', mood)}
                          className="h-12 flex flex-col gap-1"
                        >
                          <span className="text-lg">{emoji}</span>
                          <span className="text-xs capitalize">{mood}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="space-y-2">
                    <Label>What happened? (Reason)</Label>
                    <Textarea
                      placeholder={`Describe what influenced your ${time.label.toLowerCase()} mood...`}
                      value={currentEntry[time.key as keyof Omit<MoodEntry, 'id' | 'date'>].reason}
                      onChange={(e) => updateMood(time.key as keyof Omit<MoodEntry, 'id' | 'date'>, 'reason', e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Save Button */}
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <Button onClick={saveEntry} className="w-full" size="lg">
                <Plus className="h-4 w-4 mr-2" />
                Save Mood Entry
              </Button>
            </CardContent>
          </Card>

          {/* Recent Entries */}
          {entries.length > 0 && (
            <Card className="shadow-card border-0">
              <CardHeader>
                <CardTitle>Recent Entries</CardTitle>
                <CardDescription>
                  Your mood journey over the past few days.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {entries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 7)
                    .map((entry) => (
                      <div key={entry.id} className="p-4 border rounded-lg bg-secondary/50">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{new Date(entry.date).toLocaleDateString()}</h4>
                          <div className="flex gap-2">
                            {timeOfDay.map((time) => {
                              const mood = entry[time.key as keyof Omit<MoodEntry, 'id' | 'date'>].mood;
                              return mood ? (
                                <span key={time.key} className="text-lg" title={`${time.label}: ${mood}`}>
                                  {moodEmojis[mood as keyof typeof moodEmojis]}
                                </span>
                              ) : null;
                            })}
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

export default MoodJournal;