import * as React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Zap, ShieldCheck, AlertCircle, Quote } from "lucide-react";
import { getSynergy } from "@/lib/combinations-data";

interface NumberCombinationsProps {
    n1: number;
    n2: number;
    type1: string;
    type2: string;
}

export function NumberCombinations({ n1, n2, type1, type2 }: NumberCombinationsProps) {
    const synergy = getSynergy(n1, n2);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    Synergy Analysis
                </h2>
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    Pro Feature
                </Badge>
            </div>

            <Card className="p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-yellow-500/10 border-slate-700">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-purple-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/20">
                            {n1}
                        </div>
                        <div className="text-2xl font-bold text-slate-500">+</div>
                        <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-pink-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-pink-500/20">
                            {n2}
                        </div>
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <div className="flex justify-between items-end mb-1">
                            <span className="text-slate-400 font-medium">Synergy Potential</span>
                            <span className="text-3xl font-bold text-yellow-400">{synergy.synergyScore}%</span>
                        </div>
                        <Progress value={synergy.synergyScore} className="h-3 bg-slate-800" />
                        <h3 className="text-xl font-bold text-white text-center md:text-left">{synergy.title}</h3>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-slate-900 border-slate-700">
                    <div className="flex items-center gap-2 text-green-400 mb-4">
                        <ShieldCheck className="w-5 h-5" />
                        <h3 className="font-bold">Core Strengths</h3>
                    </div>
                    <ul className="space-y-3">
                        {synergy.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                                {s}
                            </li>
                        ))}
                    </ul>
                </Card>

                <Card className="p-6 bg-slate-900 border-slate-700">
                    <div className="flex items-center gap-2 text-amber-400 mb-4">
                        <AlertCircle className="w-5 h-5" />
                        <h3 className="font-bold">Growth Challenges</h3>
                    </div>
                    <ul className="space-y-3">
                        {synergy.challenges.map((c, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                {c}
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            <Card className="p-6 bg-slate-900 border-slate-700 italic">
                <div className="flex gap-4">
                    <Quote className="w-8 h-8 text-slate-600 flex-shrink-0" />
                    <div className="space-y-2">
                        <p className="text-slate-300 leading-relaxed">
                            {synergy.summary}
                        </p>
                        <div className="pt-2">
                            <span className="text-yellow-400 font-semibold not-italic">Advice: </span>
                            <span className="text-slate-400 not-italic">{synergy.advice}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
