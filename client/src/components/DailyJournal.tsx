import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookmarkPlus, TrendingUp, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DailyJournalProps {
    odisId: string;
    date: string;
    personalDayNumber: number;
    predictionData?: {
        theme: string;
        description: string;
        dos: string[];
        donts: string[];
    };
}

export function DailyJournal({ odisId, date, personalDayNumber, predictionData }: DailyJournalProps) {
    const [mood, setMood] = useState<number>(3);
    const [energyLevel, setEnergyLevel] = useState<number>(3);
    const [activities, setActivities] = useState<string[]>([]);
    const [newActivity, setNewActivity] = useState("");
    const [notes, setNotes] = useState("");
    const [showSaveConfirm, setShowSaveConfirm] = useState(false);

    const queryClient = useQueryClient();

    const saveJournalMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await fetch("/api/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to save journal");
            return response.json();
        },
        onSuccess: () => {
            setShowSaveConfirm(true);
            setTimeout(() => setShowSaveConfirm(false), 3000);
            queryClient.invalidateQueries({ queryKey: [`/api/journal/${odisId}`] });
        },
    });

    const addActivity = () => {
        if (newActivity.trim()) {
            setActivities([...activities, newActivity.trim()]);
            setNewActivity("");
        }
    };

    const removeActivity = (index: number) => {
        setActivities(activities.filter((_, i) => i !== index));
    };

    const calculateAccuracy = (): number => {
        // Simple accuracy calculation based on mood/energy vs prediction quality
        if (!predictionData) return 0;
        const avgFeeling = (mood + energyLevel) / 2;
        // If feeling good (4-5), prediction was accurate. If feeling bad (1-2), less accurate
        return avgFeeling >= 4 ? 85 : avgFeeling >= 3 ? 70 : 50;
    };

    const handleSave = () => {
        saveJournalMutation.mutate({
            odisId,
            date,
            mood,
            energyLevel,
            activities,
            notes,
            personalDayNumber,
            predictionAccuracy: calculateAccuracy(),
        });
    };

    const moodEmojis = ["😫", "😕", "😐", "😊", "🤩"];
    const energyEmojis = ["🪫", "🔋", "⚡", "🔥", "⭐"];

    return (
        <Card className="p-6 space-y-6 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-semibold text-white">Daily Journal</h3>
                    <p className="text-sm text-slate-400">How did your day actually go?</p>
                </div>
                {predictionData && (
                    <Badge variant="outline" className="bg-purple-500/20 border-purple-500 text-purple-300">
                        Personal Day {personalDayNumber}
                    </Badge>
                )}
            </div>

            {/* Mood Selection */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Mood</label>
                <div className="flex gap-2 justify-between">
                    {moodEmojis.map((emoji, index) => (
                        <button
                            key={index}
                            onClick={() => setMood(index + 1)}
                            className={`flex-1 p-3 rounded-lg text-3xl transition-all ${mood === index + 1
                                    ? "bg-purple-600 scale-110 shadow-lg"
                                    : "bg-slate-800 hover:bg-slate-700 opacity-50 hover:opacity-100"
                                }`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* Energy Level */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Energy Level</label>
                <div className="flex gap-2 justify-between">
                    {energyEmojis.map((emoji, index) => (
                        <button
                            key={index}
                            onClick={() => setEnergyLevel(index + 1)}
                            className={`flex-1 p-3 rounded-lg text-3xl transition-all ${energyLevel === index + 1
                                    ? "bg-amber-600 scale-110 shadow-lg"
                                    : "bg-slate-800 hover:bg-slate-700 opacity-50 hover:opacity-100"
                                }`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>

            {/* Activities */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">What did you do today?</label>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addActivity()}
                        placeholder="Add an activity..."
                        className="flex-1 px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <Button onClick={addActivity} variant="outline" size="sm">
                        Add
                    </Button>
                </div>
                {activities.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {activities.map((activity, index) => (
                            <Badge
                                key={index}
                                variant="secondary"
                                className="bg-slate-700 text-white pr-1"
                            >
                                {activity}
                                <button
                                    onClick={() => removeActivity(index)}
                                    className="ml-1 hover:text-red-400"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Notes & Reflections</label>
                <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="How accurate was today's prediction? Any insights or reflections..."
                    rows={4}
                    className="bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                />
            </div>

            {/* Prediction Accuracy Indicator */}
            {predictionData && (
                <div className="p-4 bg-slate-800/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-400">Prediction Accuracy</span>
                        <span className="text-lg font-semibold text-purple-400">
                            {calculateAccuracy()}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all"
                            style={{ width: `${calculateAccuracy()}%` }}
                        />
                    </div>
                    <p className="text-xs text-slate-500">
                        Based on your mood and energy vs. today's {predictionData.theme} theme
                    </p>
                </div>
            )}

            {/* Save Button */}
            <div className="flex gap-2">
                <Button
                    onClick={handleSave}
                    disabled={saveJournalMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                >
                    <BookmarkPlus className="w-4 h-4 mr-2" />
                    {saveJournalMutation.isPending ? "Saving..." : "Save Journal Entry"}
                </Button>
            </div>

            {showSaveConfirm && (
                <div className="p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-300 text-sm">
                    ✓ Journal saved! Building your accuracy history...
                </div>
            )}

            {/* Insight */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-200">
                        <strong>Pro Tip:</strong> Track your journal for 30 days to see patterns between your numbers and real-life experiences. This helps refine future predictions!
                    </div>
                </div>
            </div>
        </Card>
    );
}
