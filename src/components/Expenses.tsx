import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus,
  Calculator,
  ArrowLeft,
  Calendar,
  Tag,
  Trash2,
  TrendingUp,
  IndianRupee,
  PieChart,
  Receipt
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  createdAt: string;
}

const categories = [
  { value: "food", label: "Food & Dining", color: "bg-red-500" },
  { value: "transport", label: "Transportation", color: "bg-blue-500" },
  { value: "shopping", label: "Shopping", color: "bg-purple-500" },
  { value: "entertainment", label: "Entertainment", color: "bg-pink-500" },
  { value: "bills", label: "Bills & Utilities", color: "bg-orange-500" },
  { value: "healthcare", label: "Healthcare", color: "bg-green-500" },
  { value: "education", label: "Education", color: "bg-indigo-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
];

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpense, setNewExpense] = useState({
    amount: "",
    category: "",
    note: "",
    date: new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem("atomTracker_isLoggedIn");
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    // Load expenses from localStorage
    const storedExpenses = localStorage.getItem("atomTracker_expenses");
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    }
  }, [navigate]);

  const saveExpenses = (updatedExpenses: Expense[]) => {
    localStorage.setItem("atomTracker_expenses", JSON.stringify(updatedExpenses));
    setExpenses(updatedExpenses);
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.category) return;

    setIsLoading(true);

    const expense: Expense = {
      id: Date.now().toString(),
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      note: newExpense.note.trim(),
      date: newExpense.date,
      createdAt: new Date().toISOString(),
    };

    const updatedExpenses = [expense, ...expenses];
    saveExpenses(updatedExpenses);

    setNewExpense({
      amount: "",
      category: "",
      note: "",
      date: new Date().toISOString().split('T')[0],
    });

    toast({
      title: "Expense added!",
      description: `₹${expense.amount.toFixed(2)} expense has been recorded.`,
    });

    setIsLoading(false);
  };

  const handleDeleteExpense = (expenseId: string) => {
    const updatedExpenses = expenses.filter(expense => expense.id !== expenseId);
    saveExpenses(updatedExpenses);

    toast({
      title: "Expense deleted",
      description: "Expense has been removed from your records.",
    });
  };

  const getCategoryInfo = (categoryValue: string) => {
    return categories.find(cat => cat.value === categoryValue) || categories[categories.length - 1];
  };

  // Calculate statistics
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const thisMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const now = new Date();
    return expenseDate.getMonth() === now.getMonth() && expenseDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  const todayExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const today = new Date();
    return expenseDate.toDateString() === today.toDateString();
  });
  const todayTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Category breakdown for this month
  const categoryTotals = thisMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryTotals)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-expense" />
              <h1 className="text-xl font-semibold">Smart Expenses</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-expense/10 rounded-lg p-3">
                  <IndianRupee className="h-6 w-6 text-expense" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{totalSpent.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 rounded-lg p-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{thisMonthTotal.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">This month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-accent/10 rounded-lg p-3">
                  <Receipt className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{todayTotal.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-mood/10 rounded-lg p-3">
                  <PieChart className="h-6 w-6 text-mood" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{expenses.length}</p>
                  <p className="text-sm text-muted-foreground">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Categories This Month */}
        {topCategories.length > 0 && (
          <Card className="shadow-card border-0 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Top Categories This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topCategories.map(([category, amount], index) => {
                  const categoryInfo = getCategoryInfo(category);
                  const percentage = thisMonthTotal > 0 ? (amount / thisMonthTotal) * 100 : 0;
                  
                  return (
                    <div key={category} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className={`w-3 h-3 rounded-full ${categoryInfo.color}`} />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{categoryInfo.label}</p>
                        <p className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{amount.toFixed(2)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Add Expense Form */}
          <div className="lg:col-span-1">
            <Card className="shadow-card border-0 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Expense
                </CardTitle>
                <CardDescription>
                  Track your spending with intelligent categorization.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddExpense} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={newExpense.category} 
                      onValueChange={(value) => 
                        setNewExpense({ ...newExpense, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${category.color}`} />
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="note">Note (Optional)</Label>
                    <Textarea
                      id="note"
                      placeholder="What was this expense for?"
                      value={newExpense.note}
                      onChange={(e) => setNewExpense({ ...newExpense, note: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    variant="hero" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Adding..." : "Add Expense"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Expenses List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Expenses</h2>
              <p className="text-sm text-muted-foreground">
                {expenses.length} transactions • ₹{totalSpent.toFixed(2)} total
              </p>
            </div>

            {expenses.length === 0 ? (
              <Card className="shadow-card border-0">
                <CardContent className="p-12 text-center">
                  <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No expenses yet</h3>
                  <p className="text-muted-foreground">
                    Start tracking your expenses to get insights into your spending habits!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {expenses.map((expense) => {
                  const categoryInfo = getCategoryInfo(expense.category);
                  
                  return (
                    <Card 
                      key={expense.id} 
                      className="shadow-card border-0 transition-all duration-200 hover:shadow-soft"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-lg ${categoryInfo.color} flex items-center justify-center shrink-0`}>
                            <Tag className="h-5 w-5 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">₹{expense.amount.toFixed(2)}</h3>
                                <p className="text-sm text-muted-foreground">{categoryInfo.label}</p>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="text-muted-foreground hover:text-destructive shrink-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {expense.note && (
                              <p className="text-sm text-muted-foreground mb-2">{expense.note}</p>
                            )}
                            
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(expense.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;