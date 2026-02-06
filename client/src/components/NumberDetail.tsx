import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Share2, TrendingUp, Lightbulb, Target, AlertTriangle, Star, Calendar } from "lucide-react";
import { useSaveInsight } from "@/hooks/useSaveInsight";

interface NumberDetailProps {
    odisId: string;
    numberType: "life-path" | "expression" | "soul-urge" | "personality" | "maturity";
    numberValue: number;
    userName: string;
}

// This is a comprehensive template - in production, these would be AI-generated
// based on the specific number and user profile
const generateNumberContent = (type: string, value: number, userName: string) => {
    const content: Record<string, any> = {
        "life-path": {
            title: `Life Path ${value}`,
            subtitle: "Your Core Purpose & Life Direction",
            overview: `As a Life Path ${value}, your journey is defined by ${value === 1 ? "leadership and independence" :
                    value === 2 ? "partnership and diplomacy" :
                        value === 3 ? "creative expression and communication" :
                            value === 4 ? "building and stability" :
                                value === 5 ? "freedom and adventure" :
                                    value === 6 ? "nurturing and responsibility" :
                                        value === 7 ? "spiritual seeking and analysis" :
                                            value === 8 ? "power and material mastery" :
                                                "universal love and wisdom"
                }. This is not just a number - it's your soul's chosen path in this lifetime.`,
            uniqueExpression: `${userName}, your Life Path ${value} manifests uniquely in your personality. While others with this number share core traits, your specific birth details create a distinctive blend...`,
            dailyLife: {
                work: `At work, you naturally ${value === 1 ? "take charge" : value === 2 ? "mediate conflicts" : value === 3 ? "bring creative ideas" : "excel in your domain"}`,
                relationships: `In relationships, you ${value === 1 ? "need independence" : value === 2 ? "seek harmony" : value === 3 ? "need expression" : "value connection"}`,
                decisions: `When making decisions, you tend to ${value === 1 ? "trust your gut" : value === 2 ? "weigh all sides" : value === 3 ? "follow your passion" : "analyze deeply"}`
            },
            superpower: `Your hidden superpower is ${value === 1 ? "the ability to initiate and pioneer where others hesitate" :
                    value === 2 ? "sensing what others need before they say it" :
                        value === 3 ? "turning any situation into an opportunity for joy" :
                            value === 4 ? "creating systems that last generations" :
                                value === 5 ? "adapting instantly to any change" :
                                    value === 6 ? "making everyone feel genuinely cared for" :
                                        value === 7 ? "seeing truth beneath surface appearances" :
                                            value === 8 ? "manifesting visions into reality" :
                                                "understanding the interconnectedness of all things"
                }.`,
            shadowSide: `Watch for the shadow side: ${value === 1 ? "stubbornness and ego" :
                    value === 2 ? "codependency and overthinking" :
                        value === 3 ? "scattering energy and superficiality" :
                            value === 4 ? "rigidity and workaholism" :
                                value === 5 ? "restlessness and commitment issues" :
                                    value === 6 ? "martyrdom and control" :
                                        value === 7 ? "isolation and cynicism" :
                                            value === 8 ? "materialism and power struggles" :
                                                "escapism and impracticality"
                }. Awareness is the first step to balance.`,
            famousExamples: [
                { name: "Example Celebrity 1", achievement: "Achievement details", lesson: "What you can learn from them" },
                { name: "Example Celebrity 2", achievement: "Achievement details", lesson: "What you can learn from them" },
                { name: "Example Celebrity 3", achievement: "Achievement details", lesson: "What you can learn from them" },
            ],
            thisYear: `This year, your Life Path ${value} energy interacts with the current Universal Year to create unique opportunities...`,
            actionSteps: [
                `Start your day with ${value === 1 ? "affirmations of leadership" : value === 2 ? "gratitude for connections" : "creative expression"}`,
                `Practice ${value === 1 ? "listening to others" : value === 2 ? "setting boundaries" : "focused completion"}`,
                `Schedule weekly ${value === 1 ? "solo reflection time" : value === 2 ? "social connection" : "creative projects"}`,
                `When stressed, remember to ${value === 1 ? "collaborate" : value === 2 ? "trust yourself" : "ground yourself"}`,
                `Invest in ${value === 1 ? "leadership training" : value === 2 ? "relationships" : "your passions"}`
            ],
            journalPrompts: [
                `Where in my life am I fully expressing my Life Path ${value} energy?`,
                `What shadow aspects of ${value} am I currently struggling with?`,
                `Who in my life embodies the best qualities of a Life Path ${value}?`,
                `What dream would I pursue if I fully embraced my ${value} nature?`
            ]
        }
    };

    return content[type] || content["life-path"];
};

export function NumberDetail({ odisId, numberType, numberValue, userName }: NumberDetailProps) {
    const { saveInsight, isLoading, showConfirm } = useSaveInsight();
    const content = generateNumberContent(numberType, numberValue, userName);

    const handleSaveSection = (sectionTitle: string, sectionContent: string) => {
        saveInsight({
            odisId,
            source: 'number-report',
            content: sectionContent,
            title: `${content.title}: ${sectionTitle}`,
            category: 'personal',
            tags: [numberType, `number-${numberValue}`],
        });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            {/* Header */}
            <div className="text-center space-y-4 pb-6 border-b border-slate-700">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white text-4xl font-bold">
                    {numberValue}
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{content.title}</h1>
                    <p className="text-xl text-slate-400">{content.subtitle}</p>
                </div>
                <div className="flex gap-3 justify-center">
                    <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSaveSection("Overview", content.overview)}
                        disabled={isLoading}
                    >
                        <Bookmark className="w-4 h-4 mr-2" />
                        Save Overview
                    </Button>
                </div>
                {showConfirm && (
                    <div className="text-sm text-green-400">✓ Saved to Insights Library!</div>
                )}
            </div>

            {/* Overview */}
            <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
                <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                <p className="text-slate-300 text-lg leading-relaxed">{content.overview}</p>
            </Card>

            {/* Unique Expression */}
            <Card className="p-8 bg-slate-900 border-slate-700">
                <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Your Unique Expression</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveSection("Unique Expression", content.uniqueExpression)}
                    >
                        <Bookmark className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-slate-300 leading-relaxed">{content.uniqueExpression}</p>
            </Card>

            {/* In Daily Life */}
            <Card className="p-8 bg-slate-900 border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">In Daily Life</h2>
                <div className="space-y-4">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                            💼
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">At Work</h3>
                            <p className="text-slate-300">{content.dailyLife.work}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                            ❤️
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">In Relationships</h3>
                            <p className="text-slate-300">{content.dailyLife.relationships}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            🤔
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">Making Decisions</h3>
                            <p className="text-slate-300">{content.dailyLife.decisions}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Superpower */}
            <Card className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                <div className="flex items-start gap-4">
                    <Star className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-3">Your Superpower</h2>
                        <p className="text-slate-300 text-lg leading-relaxed">{content.superpower}</p>
                    </div>
                </div>
            </Card>

            {/* Shadow Side */}
            <Card className="p-8 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-3">Shadow Side to Watch</h2>
                        <p className="text-slate-300 text-lg leading-relaxed">{content.shadowSide}</p>
                    </div>
                </div>
            </Card>

            {/* Famous Examples */}
            <Card className="p-8 bg-slate-900 border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6">Famous Life Path {numberValue}s</h2>
                <div className="space-y-4">
                    {content.famousExamples.map((example: any, index: number) => (
                        <div key={index} className="p-4 bg-slate-800 rounded-lg">
                            <h3 className="font-semibold text-white mb-2">⭐ {example.name}</h3>
                            <p className="text-slate-300 text-sm mb-2">{example.achievement}</p>
                            <p className="text-purple-400 text-sm italic">→ {example.lesson}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* This Year For You */}
            <Card className="p-8 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
                <div className="flex items-start gap-4">
                    <Calendar className="w-8 h-8 text-blue-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-3">This Year For You</h2>
                        <p className="text-slate-300 text-lg leading-relaxed">{content.thisYear}</p>
                    </div>
                </div>
            </Card>

            {/* Action Steps */}
            <Card className="p-8 bg-slate-900 border-slate-700">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Target className="w-6 h-6 text-green-400" />
                        Action Steps This Week
                    </h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSaveSection("Action Steps", content.actionSteps.join("\n"))}
                    >
                        <Bookmark className="w-4 h-4" />
                    </Button>
                </div>
                <div className="space-y-3">
                    {content.actionSteps.map((step: string, index: number) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                                {index + 1}
                            </div>
                            <p className="text-slate-300 flex-1">{step}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Journal Prompts */}
            <Card className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Lightbulb className="w-6 h-6 text-indigo-400" />
                        Journal Prompts for Self-Discovery
                    </h2>
                </div>
                <div className="space-y-4">
                    {content.journalPrompts.map((prompt: string, index: number) => (
                        <div key={index} className="p-4 bg-slate-900/50 rounded-lg">
                            <p className="text-indigo-300 italic">{prompt}</p>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Bottom CTA */}
            <Card className="p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                    💎 Want Deeper Insights?
                </h3>
                <p className="text-slate-300 mb-4">
                    Explore how your Life Path {numberValue} combines with your Expression, Soul Urge, and Personality numbers
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                    View Number Combinations
                </Button>
            </Card>
        </div>
    );
}
