import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, Share2, TrendingUp, Lightbulb, Target, AlertTriangle, Star, Calendar } from "lucide-react";
import { useSaveInsight } from "@/hooks/useSaveInsight";

interface NumberDetailProps {
    odisId: string;
    numberType: "life-path" | "expression" | "soul-urge" | "personality" | "maturity" | "attitude" | "generation" | "day-of-birth";
    numberValue: number;
    userName: string;
    comparisonNumber?: number;
}

import {
    lifePathContent,
    expressionContent,
    soulUrgeContent,
    personalityContent,
    maturityContent,
    attitudeContent,
    generationContent,
    dayOfBirthContent
} from "@/lib/numerologyContent";

// Map internal types to content objects
const contentMap: Record<string, any> = {
    "life-path": lifePathContent,
    "expression": expressionContent,
    "soul-urge": soulUrgeContent,
    "personality": personalityContent,
    "maturity": maturityContent,
    "attitude": attitudeContent,
    "generation": generationContent,
    "day-of-birth": dayOfBirthContent
};

const typeLabels: Record<string, string> = {
    "life-path": "Life Path",
    "expression": "Expression",
    "soul-urge": "Soul Urge",
    "personality": "Personality",
    "maturity": "Maturity",
    "attitude": "Attitude",
    "generation": "Generation",
    "day-of-birth": "Day of Birth"
};

const generateNumberContent = (type: string, value: number, userName: string) => {
    const rawData = contentMap[type]?.[value] || contentMap["life-path"][value];
    const typeLabel = typeLabels[type] || "Numerology";

    // Build the report structure dynamically
    return {
        title: `${typeLabel} ${value}`,
        subtitle: rawData?.title || "Your Energetic Signature",
        overview: rawData?.description || `Your ${typeLabel} ${value} defines a significant part of your destiny and personality.`,
        uniqueExpression: `${userName}, your ${typeLabel} ${value} manifests uniquely. While others share this number, your specific interactions create a distinctive blend...`,
        dailyLife: {
            work: rawData?.work || rawData?.career || "You thrive in environments that align with your core vibration.",
            relationships: rawData?.love || "In relationships, you seek alignment and mutual understanding.",
            decisions: "Your decision-making process is guided by your inner numerological compass."
        },
        superpower: rawData?.talents || rawData?.specialGifts || rawData?.accomplishment || "Your presence brings a unique energy to every room.",
        shadowSide: rawData?.darkSide || rawData?.challenges || "Awareness of your shadow qualities is key to growth.",
        famousExamples: [
            { name: "Global Influence", achievement: "Many leaders share this vibration", lesson: "Alignment breeds success" },
        ],
        thisYear: `This year, your ${typeLabel} energy invites you to lean into your core strengths and master your chosen path.`,
        actionSteps: [
            rawData?.lessonsToLearn || "Practice presence and self-awareness.",
            "Reflect on your core values weekly.",
            "Seek environments that support your growth.",
            "Journal about your progress."
        ],
        journalPrompts: [
            `What does ${typeLabel} ${value} mean to me personally?`,
            `How can I better embody the positive traits of ${value}?`,
            `What is one thing I can do today to align with my purpose?`
        ]
    };
};

import { NumberCombinations } from "./NumberCombinations";
import { useState } from "react";

export function NumberDetail({ odisId, numberType, numberValue, userName }: NumberDetailProps) {
    const { saveInsight, isLoading, showConfirm } = useSaveInsight();
    const [showCombinations, setShowCombinations] = useState(false);
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
                            <h3 className="font-semibold text-white mb-1">Impact & Purpose</h3>
                            <p className="text-slate-300">{content.dailyLife.work}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                            ❤️
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-white mb-1">Harmonious Connections</h3>
                            <p className="text-slate-300">{content.dailyLife.relationships}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Superpower */}
            <Card className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                <div className="flex items-start gap-4">
                    <Star className="w-8 h-8 text-amber-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-3">Core Strength</h2>
                        <p className="text-slate-300 text-lg leading-relaxed">{content.superpower}</p>
                    </div>
                </div>
            </Card>

            {/* Shadow Side */}
            <Card className="p-8 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/30">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="w-8 h-8 text-red-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-3">Shadow Qualities</h2>
                        <p className="text-slate-300 text-lg leading-relaxed">{content.shadowSide}</p>
                    </div>
                </div>
            </Card>

            {/* Action Steps */}
            <Card className="p-8 bg-slate-900 border-slate-700">
                <div className="flex items-start justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Target className="w-6 h-6 text-green-400" />
                        Integrated Action Steps
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
                        Self-Discovery Work
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

            {/* Combination Analysis View */}
            {showCombinations ? (
                <div className="pt-8 border-t border-slate-800">
                    <NumberCombinations
                        n1={numberValue}
                        n2={comparisonNumber || 1}
                        type1={numberType}
                        type2="life-path"
                    />
                    <div className="text-center mt-6">
                        <Button variant="ghost" onClick={() => setShowCombinations(false)}>
                            Back to Report
                        </Button>
                    </div>
                </div>
            ) : (
                /* Bottom CTA */
                <Card className="p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 text-center">
                    <h3 className="text-lg font-semibold text-white mb-2">
                        💎 Want Deeper Insights?
                    </h3>
                    <p className="text-slate-300 mb-4">
                        Explore how your {content.title} combines with other core numbers in your chart.
                    </p>
                    <Button
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                        onClick={() => setShowCombinations(true)}
                    >
                        View Combination Synergy
                    </Button>
                </Card>
            )}
        </div>
    );
}
