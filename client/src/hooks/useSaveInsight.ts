import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface SaveInsightInput {
    odisId: string;
    source: string; // 'daily-energy' | 'personality' | 'chat' | 'compatibility' | 'celebrity' | 'number-report'
    content: string;
    title?: string;
    category?: string;
    tags?: string[];
}

export function useSaveInsight() {
    const [showConfirm, setShowConfirm] = useState(false);
    const queryClient = useQueryClient();

    const saveInsightMutation = useMutation({
        mutationFn: async (data: SaveInsightInput) => {
            const response = await fetch("/api/insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
            });
            if (!response.ok) throw new Error("Failed to save insight");
            return response.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [`/api/insights/${variables.odisId}`] });
            setShowConfirm(true);
            setTimeout(() => setShowConfirm(false), 2500);
        },
    });

    const saveInsight = (input: SaveInsightInput) => {
        saveInsightMutation.mutate(input);
    };

    return {
        saveInsight,
        isLoading: saveInsightMutation.isPending,
        showConfirm,
    };
}
