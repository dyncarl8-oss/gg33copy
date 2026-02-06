import { useQuery, useMutation, useQueryClient } from "@tantml:react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, TrendingUp, Trophy, Target } from "lucide-react";

interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastCheckIn: string;
    achievements: string[];
}

interface StreakDisplayProps {
    odisId: string;
    variant?: "full" | "compact";
}

export function StreakDisplay({ odisId, variant = "compact" }: StreakDisplayProps) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: [`/api/streak/${odisId}`],
        queryFn: async () => {
            const response = await fetch(`/api/streak/${odisId}`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch streak");
            return response.json();
        },
    });

    const checkInMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch(`/api/streak/${odisId}/check-in`, {
                method: "POST",
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to check in");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/streak/${odisId}`] });
        },
    });

    if (isLoading) return null;

    const streak: StreakData = data?.streak;
    if (!streak) return null;

    const today = new Date().toISOString().split('T')[0];
    const lastCheckIn = streak.lastCheckIn ? new Date(streak.lastCheckIn).toISOString().split('T')[0] : null;
    const canCheckIn = lastCheckIn !== today;

    const achievementLabels: Record<string, { label: string; icon: JSX.Element }> = {
        first_check_in: { label: "First Step", icon: <Target className="w-4 h-4" /> },
        week_streak: { label: "Week Warrior", icon: <Flame className="w-4 h-4" /> },
        month_streak: { label: "Monthly Master", icon: <TrendingUp className="w-4 h-4" /> },
        hundred_streak: { label: "Century Club", icon: <Trophy className="w-4 h-4" /> },
    };

    // Compact variant for headers
    if (variant === "compact") {
        return (
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg border border-orange-500/30">
                <Flame className={`w-6 h-6 ${streak.currentStreak > 0 ? 'text-orange-400 animate-pulse' : 'text-orange-600/50'}`} />
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                            {streak.currentStreak} Day Streak
                        </span>
                        {streak.currentStreak > 0 && <span className="text-lg">🔥</span>}
                    </div>
                    <div className="text-xs text-slate-300">
                        Best: {streak.longestStreak} days
                    </div>
                </div>
                {canCheckIn && (
                    <Button
                        size="sm"
                        onClick={() => checkInMutation.mutate()}
                        disabled={checkInMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        Check In
                    </Button>
                )}
            </div>
        );
    }

    // Full variant for dedicated streak page
    return (
        <div className="space-y-6">
            {/* Main Streak Display */}
            <Card className="p-8 text-center bg-gradient-to-br from-orange-500/20 via-red-500/20 to-pink-500/20 border-orange-500/50">
                <Flame className="w-20 h-20 text-orange-400 mx-auto mb-4 animate-pulse" />
                <div className="text-6xl font-bold text-white mb-2">
                    {streak.currentStreak}
                </div>
                <div className="text-xl text-slate-300 mb-6">
                    {streak.currentStreak === 1 ? 'Day' : 'Days'} Streak 🔥
                </div>

                {canCheckIn ? (
                    <Button
                        size="lg"
                        onClick={() => checkInMutation.mutate()}
                        disabled={checkInMutation.isPending}
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    >
                        <Flame className="w-5 h-5 mr-2" />
                        {checkInMutation.isPending ? "Checking In..." : "Check In Today"}
                    </Button>
                ) : (
                    <Badge className="bg-green-500 text-white text-sm px-4 py-2">
                        ✓ Already Checked In Today!
                    </Badge>
                )}
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 bg-slate-900 border-slate-700 text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-1">
                        {streak.currentStreak}
                    </div>
                    <div className="text-sm text-slate-400">Current Streak</div>
                </Card>
                <Card className="p-6 bg-slate-900 border-slate-700 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-1">
                        {streak.longestStreak}
                    </div>
                    <div className="text-sm text-slate-400">Best Streak</div>
                </Card>
            </div>

            {/* Achievements */}
            {streak.achievements.length > 0 && (
                <Card className="p-6 bg-slate-900 border-slate-700">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        Achievements Unlocked
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {streak.achievements.map((achievement) => {
                            const info = achievementLabels[achievement] || {
                                label: achievement,
                                icon: <Trophy className="w-4 h-4" />
                            };
                            return (
                                <div
                                    key={achievement}
                                    className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg"
                                >
                                    <div className="text-yellow-400">{info.icon}</div>
                                    <div className="text-sm font-medium text-yellow-300">
                                        {info.label}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Next Milestones */}
            <Card className="p-6 bg-slate-900 border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Next Milestones</h3>
                <div className="space-y-3">
                    {streak.currentStreak < 7 && (
                        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Flame className="w-4 h-4 text-orange-400" />
                                <span className="text-sm text-slate-300">Week Warrior</span>
                            </div>
                            <div className="text-sm text-slate-400">
                                {7 - streak.currentStreak} days to go
                            </div>
                        </div>
                    )}
                    {streak.currentStreak < 30 && (
                        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-purple-400" />
                                <span className="text-sm text-slate-300">Monthly Master</span>
                            </div>
                            <div className="text-sm text-slate-400">
                                {30 - streak.currentStreak} days to go
                            </div>
                        </div>
                    )}
                    {streak.currentStreak < 100 && (
                        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-400" />
                                <span className="text-sm text-slate-300">Century Club</span>
                            </div>
                            <div className="text-sm text-slate-400">
                                {100 - streak.currentStreak} days to go
                            </div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Motivational Message */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
                <div className="text-sm text-blue-200">
                    {streak.currentStreak === 0 && "Start your journey today! Consistency builds momentum."}
                    {streak.currentStreak > 0 && streak.currentStreak < 7 && "Great start! Keep the momentum going."}
                    {streak.currentStreak >= 7 && streak.currentStreak < 30 && "Incredible dedication! You're building a powerful habit."}
                    {streak.currentStreak >= 30 && streak.currentStreak < 100 && "You're a master of consistency! This is inspiring."}
                    {streak.currentStreak >= 100 && "Legendary! Your dedication is truly extraordinary. 🏆"}
                </div>
            </div>
        </div>
    );
}
