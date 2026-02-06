import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Search, Trash2, Filter, Tag, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SavedInsight {
    id: string;
    source: string; // 'daily-energy' | 'personality' | 'chat' | 'compatibility' | 'celebrity' | 'number-report'
    content: string;
    title?: string;
    category?: string;
    tags: string[];
    createdAt: Date;
}

interface InsightsLibraryProps {
    odisId: string;
}

export function InsightsLibrary({ odisId }: InsightsLibraryProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSource, setFilterSource] = useState<string>("all");
    const [filterCategory, setFilterCategory] = useState<string>("all");

    const queryClient = useQueryClient();

    const { data: insightsData, isLoading } = useQuery({
        queryKey: [`/api/insights/${odisId}`],
        queryFn: async () => {
            const response = await fetch(`/api/insights/${odisId}?limit=100`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch insights");
            return response.json();
        },
    });

    const deleteInsightMutation = useMutation({
        mutationFn: async (insightId: string) => {
            const response = await fetch(`/api/insight/${insightId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to delete insight");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/insights/${odisId}`] });
        },
    });

    const insights: SavedInsight[] = insightsData?.insights || [];

    // Filter insights
    const filteredInsights = insights.filter((insight) => {
        const matchesSearch = searchQuery === "" ||
            insight.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            insight.title?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSource = filterSource === "all" || insight.source === filterSource;
        const matchesCategory = filterCategory === "all" || insight.category === filterCategory;

        return matchesSearch && matchesSource && matchesCategory;
    });

    // Source labels with icons
    const sourceLabels: Record<string, { label: string; icon: string; color: string }> = {
        'daily-energy': { label: 'Daily Energy', icon: '⚡', color: 'amber' },
        'personality': { label: 'Personality', icon: '🎭', color: 'purple' },
        'chat': { label: 'Chat', icon: '💬', color: 'blue' },
        'compatibility': { label: 'Compatibility', icon: '❤️', color: 'pink' },
        'celebrity': { label: 'Celebrity', icon: '⭐', color: 'yellow' },
        'number-report': { label: 'Number Report', icon: '📊', color: 'green' },
    };

    const categories = [
        { value: "all", label: "All Categories" },
        { value: "mindset", label: "Mindset" },
        { value: "action", label: "Action Steps" },
        { value: "relationship", label: "Relationships" },
        { value: "career", label: "Career" },
        { value: "spiritual", label: "Spiritual" },
        { value: "personal", label: "Personal Growth" },
    ];

    const sources = [
        { value: "all", label: "All Sources" },
        ...Object.entries(sourceLabels).map(([key, val]) => ({
            value: key,
            label: `${val.icon} ${val.label}`,
        })),
    ];

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            amber: "bg-amber-500/20 border-amber-500 text-amber-300",
            purple: "bg-purple-500/20 border-purple-500 text-purple-300",
            blue: "bg-blue-500/20 border-blue-500 text-blue-300",
            pink: "bg-pink-500/20 border-pink-500 text-pink-300",
            yellow: "bg-yellow-500/20 border-yellow-500 text-yellow-300",
            green: "bg-green-500/20 border-green-500 text-green-300",
        };
        return colors[color] || "bg-slate-500/20 border-slate-500 text-slate-300";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-slate-400">Loading your insights...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Bookmark className="w-6 h-6 text-purple-400" />
                            Insights Library
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">
                            Your personal collection of powerful insights
                        </p>
                    </div>
                    <Badge variant="outline" className="bg-purple-500/20 border-purple-500 text-purple-300">
                        {insights.length} {insights.length === 1 ? 'Insight' : 'Insights'} Saved
                    </Badge>
                </div>

                {/* Search & Filters */}
                <div className="grid md:grid-cols-3 gap-3">
                    <div className="md:col-span-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search insights..."
                            className="pl-10 bg-slate-800 border-slate-700 text-white"
                        />
                    </div>
                    <Select value={filterSource} onValueChange={setFilterSource}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Filter by source" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            {sources.map((source) => (
                                <SelectItem key={source.value} value={source.value} className="text-white">
                                    {source.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                            <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                            {categories.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value} className="text-white">
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Insights Grid */}
            {filteredInsights.length === 0 ? (
                <Card className="p-12 text-center bg-slate-900/50 border-slate-700">
                    <Bookmark className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    {insights.length === 0 ? (
                        <>
                            <h3 className="text-lg font-semibold text-white mb-2">No Insights Saved Yet</h3>
                            <p className="text-slate-400 mb-4">
                                As you explore the app, save your favorite insights to build your personal wisdom library
                            </p>
                            <div className="text-sm text-slate-500">
                                Look for the <Bookmark className="w-4 h-4 inline" /> bookmark icon throughout the app
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-semibold text-white mb-2">No Results Found</h3>
                            <p className="text-slate-400">
                                Try adjusting your search or filters
                            </p>
                        </>
                    )}
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredInsights.map((insight) => {
                        const sourceInfo = sourceLabels[insight.source] || { label: 'Unknown', icon: '📌', color: 'slate' };

                        return (
                            <Card
                                key={insight.id}
                                className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-purple-500/50 transition-all"
                            >
                                <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            {insight.title && (
                                                <h3 className="font-semibold text-white mb-1">{insight.title}</h3>
                                            )}
                                            <p className="text-slate-300 text-sm leading-relaxed">{insight.content}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteInsightMutation.mutate(insight.id)}
                                            className="text-slate-400 hover:text-red-400 flex-shrink-0"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge
                                            variant="outline"
                                            className={getColorClass(sourceInfo.color)}
                                        >
                                            {sourceInfo.icon} {sourceInfo.label}
                                        </Badge>

                                        {insight.category && (
                                            <Badge variant="secondary" className="text-xs">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {insight.category}
                                            </Badge>
                                        )}

                                        {insight.tags.map((tag) => (
                                            <Badge key={tag} variant="outline" className="text-xs bg-slate-700/50">
                                                #{tag}
                                            </Badge>
                                        ))}

                                        <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(insight.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Pro Tip */}
            {insights.length > 0 && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                        <Bookmark className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-200">
                            <strong>Pro Tip:</strong> Review your insights library weekly to reinforce patterns and track your personal growth journey. Your saved insights are your personalized playbook!
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
