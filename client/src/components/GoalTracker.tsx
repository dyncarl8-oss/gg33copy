import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, TrendingUp, Check, Plus, Trash2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Goal {
    id: string;
    title: string;
    description?: string;
    category: string;
    bestDates: string[];
    bestMonths: number[];
    status: 'active' | 'completed' | 'paused';
    progress: number;
    createdAt: Date;
}

interface GoalTrackerProps {
    odisId: string;
    lifePathNumber: number;
}

export function GoalTracker({ odisId, lifePathNumber }: GoalTrackerProps) {
    const [showNewGoal, setShowNewGoal] = useState(false);
    const [newGoal, setNewGoal] = useState({
        title: "",
        description: "",
        category: "personal",
    });

    const queryClient = useQueryClient();

    const { data: goalsData } = useQuery({
        queryKey: [`/api/goals/${odisId}`],
        queryFn: async () => {
            const response = await fetch(`/api/goals/${odisId}?status=active`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch goals");
            return response.json();
        },
    });

    const createGoalMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await fetch("/api/goals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to create goal");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/goals/${odisId}`] });
            setShowNewGoal(false);
            setNewGoal({ title: "", description: "", category: "personal" });
        },
    });

    const updateGoalMutation = useMutation({
        mutationFn: async ({ goalId, updates }: { goalId: string; updates: any }) => {
            const response = await fetch(`/api/goal/${goalId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to update goal");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/goals/${odisId}`] });
        },
    });

    const deleteGoalMutation = useMutation({
        mutationFn: async (goalId: string) => {
            const response = await fetch(`/api/goal/${goalId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to delete goal");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/goals/${odisId}`] });
        },
    });

    // Calculate best months based on life path
    const calculateBestMonths = (category: string): number[] => {
        const baseMonths = [lifePathNumber, (lifePathNumber + 3) % 12 || 12, (lifePathNumber + 6) % 12 || 12];

        // Add category-specific boosts
        if (category === 'career') baseMonths.push(1, 9); // January (new beginnings), September (harvest)
        if (category === 'relationship') baseMonths.push(2, 6); // February (love), June (weddings)
        if (category === 'spiritual') baseMonths.push(3, 11); // March (rebirth), November (reflection)

        return [...new Set(baseMonths)].sort((a, b) => a - b);
    };

    // Calculate best dates for current month
    const calculateBestDates = (): string[] => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const bestDates: string[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateNumber = day % 9 || 9;

            // Days that match or harmonize with life path
            if (dateNumber === lifePathNumber || (dateNumber + lifePathNumber) % 9 === 0) {
                bestDates.push(date.toISOString().split('T')[0]);
            }
        }

        return bestDates.slice(0, 10); // Top 10 dates
    };

    const handleCreateGoal = () => {
        const bestMonths = calculateBestMonths(newGoal.category);
        const bestDates = calculateBestDates();

        createGoalMutation.mutate({
            odisId,
            ...newGoal,
            bestMonths,
            bestDates,
            status: 'active',
            progress: 0,
        });
    };

    const updateProgress = (goalId: string, progress: number) => {
        const updates: any = { progress };
        if (progress >= 100) {
            updates.status = 'completed';
            updates.completedAt = new Date().toISOString();
        }
        updateGoalMutation.mutate({ goalId, updates });
    };

    const goals: Goal[] = goalsData?.goals || [];

    const categories = [
        { value: "career", label: "Career", icon: "💼" },
        { value: "relationship", label: "Relationship", icon: "❤️" },
        { value: "health", label: "Health", icon: "🏃" },
        { value: "spiritual", label: "Spiritual", icon: "🧘" },
        { value: "financial", label: "Financial", icon: "💰" },
        { value: "personal", label: "Personal", icon: "🎯" },
    ];

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Target className="w-6 h-6 text-purple-400" />
                        Goal Tracker
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Set goals with numerology-powered timing for maximum success
                    </p>
                </div>
                <Dialog open={showNewGoal} onOpenChange={setShowNewGoal}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-purple-600 to-purple-500">
                            <Plus className="w-4 h-4 mr-2" />
                            New Goal
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-white">Create New Goal</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300">Goal Title</label>
                                <Input
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                    placeholder="e.g., Launch my startup"
                                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300">Category</label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setNewGoal({ ...newGoal, category: cat.value })}
                                            className={`p-3 rounded-lg border transition-all ${newGoal.category === cat.value
                                                    ? "border-purple-500 bg-purple-500/20"
                                                    : "border-slate-700 bg-slate-800 hover:border-slate-600"
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{cat.icon}</div>
                                            <div className="text-xs text-white">{cat.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-300">Description (Optional)</label>
                                <Textarea
                                    value={newGoal.description}
                                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                    placeholder="Add details about your goal..."
                                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                                    rows={3}
                                />
                            </div>
                            <Button
                                onClick={handleCreateGoal}
                                disabled={!newGoal.title.trim() || createGoalMutation.isPending}
                                className="w-full bg-gradient-to-r from-purple-600 to-purple-500"
                            >
                                {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Active Goals */}
            {goals.length === 0 ? (
                <Card className="p-12 text-center bg-slate-900/50 border-slate-700">
                    <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Active Goals</h3>
                    <p className="text-slate-400 mb-4">
                        Create your first goal and we'll find the perfect timing for success
                    </p>
                    <Button onClick={() => setShowNewGoal(true)} variant="outline">
                        Create Your First Goal
                    </Button>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {goals.map((goal) => {
                        const category = categories.find((c) => c.value === goal.category);
                        const isCompleted = goal.status === 'completed';

                        return (
                            <Card
                                key={goal.id}
                                className={`p-6 border-2 transition-all ${isCompleted
                                        ? "bg-green-500/10 border-green-500/50"
                                        : "bg-slate-900 border-slate-700 hover:border-purple-500/50"
                                    }`}
                            >
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-2xl">{category?.icon}</span>
                                                <h3 className="text-lg font-semibold text white">
                                                    {goal.title}
                                                </h3>
                                                {isCompleted && (
                                                    <Badge className="bg-green-500 text-white">
                                                        <Check className="w-3 h-3 mr-1" />
                                                        Completed
                                                    </Badge>
                                                )}
                                            </div>
                                            {goal.description && (
                                                <p className="text-sm text-slate-400 mt-1">{goal.description}</p>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteGoalMutation.mutate(goal.id)}
                                            className="text-slate-400 hover:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Progress */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-400">Progress</span>
                                            <span className="text-white font-semibold">{goal.progress}%</span>
                                        </div>
                                        <Progress value={goal.progress} className="h-2" />
                                        {!isCompleted && (
                                            <div className="flex gap-2 mt-2">
                                                {[25, 50, 75, 100].map((value) => (
                                                    <Button
                                                        key={value}
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => updateProgress(goal.id, value)}
                                                        disabled={goal.progress >= value}
                                                        className="text-xs"
                                                    >
                                                        {value}%
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Timing Info */}
                                    <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-lg">
                                        <div>
                                            <div className="flex items-center gap-2 text-purple-400 mb-2">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm font-medium">Power Months</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {goal.bestMonths.map((month) => (
                                                    <Badge key={month} variant="secondary" className="text-xs">
                                                        {monthNames[month - 1]}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 text-amber-400 mb-2">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-sm font-medium">Next Best Dates</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {goal.bestDates.slice(0, 5).map((date) => (
                                                    <Badge key={date} variant="secondary" className="text-xs">
                                                        {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
