export interface GlossaryTerm {
    term: string;
    definition: string;
    category: 'Numerology' | 'Astrology' | 'GG33' | 'General';
}

export const glossaryTerms: GlossaryTerm[] = [
    {
        term: 'Life Path Number',
        definition: 'The most critical number in your chart. It represents your innate traits, the lessons you will learn, and the path you are destined to walk. It is calculated by summing the digits of your full birth date.',
        category: 'Numerology'
    },
    {
        term: 'Expression Number',
        definition: 'Also known as the Destiny Number, it reveals your natural talents, strengths, and the specific goals you are meant to achieve. It is calculated from the numerical value of your full birth name.',
        category: 'Numerology'
    },
    {
        term: 'Soul Urge Number',
        definition: 'Calculated from the vowels in your name, this number reveals your heart\'s deepest desires, what motivates you, and what your soul truly craves.',
        category: 'Numerology'
    },
    {
        term: 'Personal Year',
        definition: 'A cycle that changes every year on your birthday. It informs you about the specific energetic themes and opportunities you will encounter during that 12-month period.',
        category: 'Numerology'
    },
    {
        term: 'Universal Year',
        definition: 'The overall theme for the entire world for a calendar year, calculated by summing the digits of the year (e.g., 2024 is an 8 year).',
        category: 'Numerology'
    },
    {
        term: 'Master Number',
        definition: 'The double-digit numbers 11, 22, and 33. These are not reduced to single digits and signify high potential, intensified energy, and significant spiritual responsibility.',
        category: 'Numerology'
    },
    {
        term: 'Energy Signature',
        definition: 'The unique frequency produced by the synthesis of your Western Numerology and Chinese Astrology. It identifies your core "Archetype."',
        category: 'GG33'
    },
    {
        term: 'Triangle of Harmony',
        definition: 'In Chinese Astrology, animals are grouped into four triangles of three animals each that share similar temperaments and goals.',
        category: 'Astrology'
    },
    {
        term: 'Five Elements',
        definition: 'Wood, Fire, Earth, Metal, and Water. These interact in cycles of creation and control to influence the core nature of a year and those born within it.',
        category: 'Astrology'
    },
    {
        term: 'Karmic Debt Number',
        definition: 'Numbers 13, 14, 16, and 19. If these appear in your calculations, they indicate specific lessons or obstacles carried over that must be mastered in this lifetime.',
        category: 'Numerology'
    },
    {
        term: 'Attitude Number',
        definition: 'Calculated from your birth month and day. It describes your first impression on others and your default reaction to new situations.',
        category: 'Numerology'
    },
    {
        term: 'Personal Day',
        definition: 'The specific resonance of a single day for an individual, helping time daily actions like signing contracts or resting.',
        category: 'Numerology'
    },
    {
        term: 'Empty Chinese Sign',
        definition: 'A year in the 12-year cycle that corresponds to your "clash" sign, typically requiring more caution and focus on internal work.',
        category: 'Astrology'
    },
];

export const masterNumbers = [
    {
        number: 11,
        title: 'The Illuminator',
        description: 'High intuition, sensitivity, and spiritual insight. The number of the visionary and the psychic.',
        keywords: ['Intuition', 'Vision', 'Sensitivity', 'Inspiration']
    },
    {
        number: 22,
        title: 'The Master Builder',
        description: 'The ability to turn grand dreams into physical reality. Combines intuition with practical discipline.',
        keywords: ['Manifestation', 'Discipline', 'Power', 'Legacy']
    },
    {
        number: 33,
        title: 'The Master Teacher',
        description: 'The most spiritually evolved number. Represents selfless service, healing, and unconditional love.',
        keywords: ['Healing', 'Service', 'Devotion', 'Mastery']
    },
];

export const dailyRituals = [
    {
        id: 'morning-meditation',
        title: 'Morning Number Alignment',
        description: 'Calculate your Personal Day number and set an intention aligned with its frequency.',
        duration: '5 min',
        category: 'Morning'
    },
    {
        id: 'evening-review',
        title: 'Evening Energy Audit',
        description: 'Reflect on how your day\'s events matched the universal and personal day energies.',
        duration: '10 min',
        category: 'Evening'
    },
    {
        id: 'name-vibration',
        title: 'Name Vibration Awareness',
        description: 'Periodically chant or write your name to connect with your Expression energy.',
        duration: '2 min',
        category: 'Daily'
    }
];
