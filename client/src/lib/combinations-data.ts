export interface CombinationSynergy {
    numbers: [number, number];
    title: string;
    synergyScore: number; // 1-100
    summary: string;
    strengths: string[];
    challenges: string[];
    advice: string;
}

export const commonCombinations: CombinationSynergy[] = [
    {
        numbers: [1, 8],
        title: "The Powerhouse Alliance",
        synergyScore: 92,
        summary: "A high-octane combination of leadership and material mastery. Both numbers are driven by success and authority.",
        strengths: [
            "Unstoppable ambition",
            "Mutual respect for power",
            "Clarity in goals"
        ],
        challenges: [
            "Power struggles",
            "Ego clashes",
            "Neglect of emotional needs"
        ],
        advice: "Focus on different domains of authority to avoid direct competition. 1 initiates, 8 scales."
    },
    {
        numbers: [3, 5],
        title: "The Dynamic Duo",
        synergyScore: 88,
        summary: "Creative expression meets adventurous freedom. This pair thrives on variety, communication, and excitement.",
        strengths: [
            "Endless creativity",
            "Social charisma",
            "Optimism and joy"
        ],
        challenges: [
            "Lack of focus",
            "Restlessness",
            "Scattered energy"
        ],
        advice: "Implement structure to ground your shared enthusiasm. Channel your energy into collaborative creative projects."
    },
    {
        numbers: [2, 6],
        title: "The Nurturing Harmony",
        synergyScore: 95,
        summary: "A deeply supportive and harmonious pairing. Focused on partnership, home, and caring for others.",
        strengths: [
            "Deep emotional bond",
            "Mutual caretaking",
            "Peaceful environment"
        ],
        challenges: [
            "Codependency",
            "Avoiding conflict",
            "Over-sensitivity"
        ],
        advice: "Practice honest communication even when it's uncomfortable. Ensure both partners maintain individual identities."
    },
    {
        numbers: [7, 9],
        title: "The Spiritual Seekers",
        synergyScore: 85,
        summary: "Introspection meets humanitarian wisdom. A pairing focused on deeper truth and universal understanding.",
        strengths: [
            "Intellectual depth",
            "Shared spiritual values",
            "Compassionate outlook"
        ],
        challenges: [
            "Emotional detachment",
            "Isolation",
            "Practicality issues"
        ],
        advice: "Make a conscious effort to ground your high ideals in physical reality. Engage in shared service projects."
    }
];

export function getSynergy(n1: number, n2: number): CombinationSynergy {
    // Sort numbers to ensure order doesn't matter [1,8] vs [8,1]
    const sorted = [n1, n2].sort((a, b) => a - b);

    const found = commonCombinations.find(c =>
        c.numbers[0] === sorted[0] && c.numbers[1] === sorted[1]
    );

    if (found) return found;

    // Generic fallback logic for combinations not explicitly defined
    const baseScore = 70 + (Math.abs(n1 - n2) % 20);
    return {
        numbers: [n1, n2],
        title: `Interaction: ${n1} & ${n2}`,
        synergyScore: baseScore,
        summary: `The interaction between ${n1} and ${n2} creates a unique energetic signature in your chart.`,
        strengths: ["Complementary energies", "Growth opportunities"],
        challenges: ["Finding common ground", "Balancing different needs"],
        advice: "Look for the middle path where both energies can coexist and support each other."
    };
}
