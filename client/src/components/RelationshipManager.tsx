import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Plus, Trash2, Edit2, Users, TrendingUp, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Relationship {
    id: string;
    name: string;
    relationshipType: string;
    birthDate: Date;
    birthTime?: string;
    birthLocation?: string;
    compatibilityScore?: number;
    notes?: string;
    createdAt: Date;
}

interface RelationshipManagerProps {
    odisId: string;
    userBirthDate: Date;
    userLifePathNumber: number;
}

export function RelationshipManager({ odisId, userBirthDate, userLifePathNumber }: RelationshipManagerProps) {
    const [showNewRelationship, setShowNewRelationship] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        relationshipType: "partner",
        birthDate: "",
        birthTime: "",
        birthLocation: "",
        notes: "",
    });

    const queryClient = useQueryClient();

    const { data: relationshipsData, isLoading } = useQuery({
        queryKey: [`/api/relationships/${odisId}`],
        queryFn: async () => {
            const response = await fetch(`/api/relationships/${odisId}`, {
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to fetch relationships");
            return response.json();
        },
    });

    const createRelationshipMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await fetch("/api/relationships", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to create relationship");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/relationships/${odisId}`] });
            setShowNewRelationship(false);
            resetForm();
        },
    });

    const updateRelationshipMutation = useMutation({
        mutationFn: async ({ relationshipId, updates }: { relationshipId: string; updates: any }) => {
            const response = await fetch(`/api/relationship/${relationshipId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to update relationship");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/relationships/${odisId}`] });
            setEditingId(null);
            resetForm();
        },
    });

    const deleteRelationshipMutation = useMutation({
        mutationFn: async (relationshipId: string) => {
            const response = await fetch(`/api/relationship/${relationshipId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to delete relationship");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/relationships/${odisId}`] });
        },
    });

    const resetForm = () => {
        setFormData({
            name: "",
            relationshipType: "partner",
            birthDate: "",
            birthTime: "",
            birthLocation: "",
            notes: "",
        });
    };

    // Calculate simple compatibility score (Life Path based)
    const calculateCompatibility = (theirBirthDate: string): number => {
        if (!theirBirthDate) return 0;

        // Simple Life Path calculation from birth date
        const date = new Date(theirBirthDate);
        const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
        let sum = dateStr.split('').reduce((acc, digit) => acc + parseInt(digit), 0);

        while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
            sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
        }

        const theirLifePath = sum;

        // Compatibility matrix (simplified)
        const compatibilityMatrix: Record<number, number[]> = {
            1: [1, 5, 7],
            2: [2, 4, 8],
            3: [3, 6, 9],
            4: [2, 4, 8],
            5: [1, 5, 7],
            6: [3, 6, 9],
            7: [1, 5, 7],
            8: [2, 4, 8],
            9: [3, 6, 9],
        };

        const compatible = compatibilityMatrix[userLifePathNumber] || [];
        if (compatible.includes(theirLifePath)) {
            return 85 + Math.floor(Math.random() * 10); // 85-95% for compatible
        } else if (Math.abs(userLifePathNumber - theirLifePath) <= 2) {
            return 60 + Math.floor(Math.random() * 15); // 60-75% for neutral
        } else {
            return 40 + Math.floor(Math.random() * 15); // 40-55% for challenging
        }
    };

    const handleSave = () => {
        const compatibilityScore = calculateCompatibility(formData.birthDate);

        const payload = {
            odisId,
            ...formData,
            compatibilityScore,
        };

        if (editingId) {
            updateRelationshipMutation.mutate({ relationshipId: editingId, updates: formData });
        } else {
            createRelationshipMutation.mutate(payload);
        }
    };

    const startEdit = (relationship: Relationship) => {
        setFormData({
            name: relationship.name,
            relationshipType: relationship.relationshipType,
            birthDate: new Date(relationship.birthDate).toISOString().split('T')[0],
            birthTime: relationship.birthTime || "",
            birthLocation: relationship.birthLocation || "",
            notes: relationship.notes || "",
        });
        setEditingId(relationship.id);
        setShowNewRelationship(true);
    };

    const relationships: Relationship[] = relationshipsData?.relationships || [];

    const relationshipTypes = [
        { value: "partner", label: "Partner", icon: "❤️" },
        { value: "spouse", label: "Spouse", icon: "💍" },
        { value: "parent", label: "Parent", icon: "👨‍👩‍👦" },
        { value: "sibling", label: "Sibling", icon: "👫" },
        { value: "child", label: "Child", icon: "👶" },
        { value: "friend", label: "Friend", icon: "🤝" },
        { value: "coworker", label: "Coworker", icon: "💼" },
        { value: "boss", label: "Boss", icon: "👔" },
        { value: "other", label: "Other", icon: "👤" },
    ];

    const getCompatibilityColor = (score: number) => {
        if (score >= 80) return { bg: "bg-green-500/20", border: "border-green-500", text: "text-green-300" };
        if (score >= 60) return { bg: "bg-amber-500/20", border: "border-amber-500", text: "text-amber-300" };
        return { bg: "bg-red-500/20", border: "border-red-500", text: "text-red-300" };
    };

    const getCompatibilityLabel = (score: number) => {
        if (score >= 80) return "Harmonious";
        if (score >= 60) return "Balanced";
        return "Challenging";
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-slate-400">Loading relationships...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Heart className="w-6 h-6 text-pink-400" />
                        Relationship Library
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Track compatibility and understand your connections
                    </p>
                </div>
                <Dialog open={showNewRelationship} onOpenChange={(open) => {
                    setShowNewRelationship(open);
                    if (!open) {
                        setEditingId(null);
                        resetForm();
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-pink-600 to-pink-500">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Person
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                {editingId ? "Edit" : "Add"} Relationship
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300">Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Sarah, Mom, John"
                                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-300">Relationship Type</label>
                                <Select
                                    value={formData.relationshipType}
                                    onValueChange={(value) => setFormData({ ...formData, relationshipType: value })}
                                >
                                    <SelectTrigger className="mt-1 bg-slate-800 border-slate-700 text-white">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-800 border-slate-700">
                                        {relationshipTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value} className="text-white">
                                                {type.icon} {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-300">Birth Date</label>
                                <Input
                                    type="date"
                                    value={formData.birthDate}
                                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm font-medium text-slate-300">Birth Time (Optional)</label>
                                    <Input
                                        type="time"
                                        value={formData.birthTime}
                                        onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                                        className="mt-1 bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-300">Location (Optional)</label>
                                    <Input
                                        value={formData.birthLocation}
                                        onChange={(e) => setFormData({ ...formData, birthLocation: e.target.value })}
                                        placeholder="City, Country"
                                        className="mt-1 bg-slate-800 border-slate-700 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-300">Notes (Optional)</label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Any observations or important details..."
                                    className="mt-1 bg-slate-800 border-slate-700 text-white"
                                    rows={3}
                                />
                            </div>

                            <Button
                                onClick={handleSave}
                                disabled={!formData.name || !formData.birthDate || createRelationshipMutation.isPending || updateRelationshipMutation.isPending}
                                className="w-full bg-gradient-to-r from-pink-600 to-pink-500"
                            >
                                {editingId ? "Update" : "Add"} Relationship
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Relationships Grid */}
            {relationships.length === 0 ? (
                <Card className="p-12 text-center bg-slate-900/50 border-slate-700">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Relationships Added</h3>
                    <p className="text-slate-400 mb-4">
                        Add the important people in your life to understand your compatibility and connection patterns
                    </p>
                    <Button onClick={() => setShowNewRelationship(true)} variant="outline">
                        Add Your First Relationship
                    </Button>
                </Card>
            ) : (
                <div className="grid md:grid-cols-2 gap-4">
                    {relationships.map((relationship) => {
                        const typeInfo = relationshipTypes.find((t) => t.value === relationship.relationshipType) || relationshipTypes[0];
                        const score = relationship.compatibilityScore || 0;
                        const colorClasses = getCompatibilityColor(score);

                        return (
                            <Card
                                key={relationship.id}
                                className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 hover:border-pink-500/50 transition-all"
                            >
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{typeInfo.icon}</span>
                                                <div>
                                                    <h3 className="font-semibold text-white">{relationship.name}</h3>
                                                    <p className="text-xs text-slate-400">{typeInfo.label}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => startEdit(relationship)}
                                                className="text-slate-400 hover:text-blue-400"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteRelationshipMutation.mutate(relationship.id)}
                                                className="text-slate-400 hover:text-red-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Compatibility Score */}
                                    <div className={`p-3 rounded-lg border ${colorClasses.bg} ${colorClasses.border}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-white">Compatibility</span>
                                            <Badge variant="outline" className={`${colorClasses.text} border-current`}>
                                                {getCompatibilityLabel(score)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-slate-700/50 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full transition-all ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${score}%` }}
                                                />
                                            </div>
                                            <span className={`text-lg font-bold ${colorClasses.text}`}>{score}%</span>
                                        </div>
                                    </div>

                                    {/* Birth Info */}
                                    <div className="flex items-center gap-4 text-xs text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(relationship.birthDate).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </div>
                                        {relationship.birthTime && (
                                            <div>{relationship.birthTime}</div>
                                        )}
                                    </div>

                                    {/* Notes */}
                                    {relationship.notes && (
                                        <p className="text-sm text-slate-300 italic">{relationship.notes}</p>
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Stats Summary */}
            {relationships.length > 0 && (
                <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-green-500/10 border-green-500/30">
                        <div className="text-sm text-green-300">Most Harmonious</div>
                        <div className="text-2xl font-bold text-green-400 mt-1">
                            {Math.max(...relationships.map(r => r.compatibilityScore || 0))}%
                        </div>
                    </Card>
                    <Card className="p-4 bg-amber-500/10 border-amber-500/30">
                        <div className="text-sm text-amber-300">Average Compatibility</div>
                        <div className="text-2xl font-bold text-amber-400 mt-1">
                            {Math.round(relationships.reduce((sum, r) => sum + (r.compatibilityScore || 0), 0) / relationships.length)}%
                        </div>
                    </Card>
                    <Card className="p-4 bg-purple-500/10 border-purple-500/30">
                        <div className="text-sm text-purple-300">Total Relationships</div>
                        <div className="text-2xl font-bold text-purple-400 mt-1">
                            {relationships.length}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
