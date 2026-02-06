import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { StarField } from '@/components/StarField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UpgradeModal } from '@/components/UpgradeModal';
import { Compass, TrendingUp, Calendar, Star, Globe, Heart, Loader2, MapPin, Briefcase, Users, Check, AlertCircle, X, Lock, Crown, Clock, Target, Zap, AlertTriangle, ChevronRight, Plane } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { calculateComprehensiveProfile } from '@/lib/numerology';

const ODIS_ID_KEY = 'gg33-odis-id';

type FeatureType = 'trending' | 'best-days' | 'celebrity' | 'travel' | 'relationship' | 'career' | null;

interface ProfileData {
  odisId: string;
  fullName: string;
  birthDate: string;
  birthTime?: string;
  birthLocation?: string;
}

const explorations = [
  {
    id: 'trending' as FeatureType,
    title: 'Trending Energies',
    description: 'See what energy patterns are most active today',
    icon: TrendingUp,
    tag: 'Popular',
    requiresProfile: false,
  },
  {
    id: 'best-days' as FeatureType,
    title: 'Best Days This Month',
    description: 'Find your optimal days for key activities',
    icon: Calendar,
    tag: 'Planning',
    requiresProfile: true,
  },
  {
    id: 'celebrity' as FeatureType,
    title: 'Celebrity Matches',
    description: 'Discover which celebrities share your energy',
    icon: Star,
    tag: 'Fun',
    requiresProfile: true,
  },
  {
    id: 'travel' as FeatureType,
    title: 'Travel Destinations',
    description: 'Cities that align with your energy signature',
    icon: Globe,
    tag: 'Travel',
    requiresProfile: true,
  },
  {
    id: 'relationship' as FeatureType,
    title: 'Relationship Patterns',
    description: 'Understanding your compatibility tendencies',
    icon: Heart,
    tag: 'Insights',
    requiresProfile: true,
  },
  {
    id: 'career' as FeatureType,
    title: 'Career Alignment',
    description: 'Industries and roles that match your energy',
    icon: Compass,
    tag: 'Career',
    requiresProfile: true,
  },
];

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse" data-testid="loading-skeleton">
      <div className="h-6 bg-gray-a3 rounded w-3/4" />
      <div className="h-4 bg-gray-a3 rounded w-1/2" />
      <div className="space-y-2 mt-4">
        <div className="h-20 bg-gray-a3 rounded" />
        <div className="h-20 bg-gray-a3 rounded" />
        <div className="h-20 bg-gray-a3 rounded" />
      </div>
    </div>
  );
}

function TrendingEnergiesDialog({ open, onClose, lifePathNumber }: { open: boolean; onClose: () => void; lifePathNumber: number | null }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/explore/trending-energies'],
    enabled: open,
  });

  const calculateAlignment = (universalDay: number, lp: number | null) => {
    if (!lp) return 75; // Default alignment
    const diff = Math.abs(universalDay - lp);
    if (diff === 0) return 98;
    if ([1, 3, 5, 9].includes(diff)) return 92;
    if ([2, 6, 8, 11, 22].includes(diff)) return 85;
    return 72;
  };

  const alignmentScore = calculateAlignment(data?.universalDay, lifePathNumber);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] bg-slate-950 border-slate-800" data-testid="dialog-trending-energies">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            <TrendingUp className="w-6 h-6 text-cyan-500" />
            Today's Global Energy Forecast
          </DialogTitle>
          <DialogDescription className="text-slate-400">Real-time collective and personal alignment metrics</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-rose-400 flex items-center gap-2 p-4 bg-rose-400/10 rounded-lg border border-rose-400/20" data-testid="error-trending">
              <AlertCircle className="w-4 h-4" />
              Failed to load trending energies
            </div>
          ) : data ? (
            <div className="space-y-6" data-testid="content-trending">
              {/* Personal Alignment Hero */}
              <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                  <div className="w-24 h-24 rounded-full border-4 border-cyan-500/20 flex items-center justify-center relative">
                    <div className="text-2xl font-black text-cyan-400">{alignmentScore}%</div>
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="48"
                        cy="48"
                        r="44"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={(2 * Math.PI * 44 * alignmentScore) / 100 + " 1000"}
                        className="text-cyan-500"
                      />
                    </svg>
                  </div>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-2">PERSONAL ALIGNMENT</Badge>
                    <h3 className="text-2xl font-bold text-white">Your Alignment Score</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Universal Day {data.universalDay} is {alignmentScore >= 90 ? 'highly synchronous' : 'well-aligned'} with your Life Path {lifePathNumber || 'energy'}.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Check className="w-3 h-3" /> DO
                      </p>
                      <p className="text-xs text-slate-300">New initiatives, bold moves, and leadership tasks.</p>
                    </div>
                    <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800">
                      <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <X className="w-3 h-3" /> AVOID
                      </p>
                      <p className="text-xs text-slate-300">Routine chores, overthinking, and waiting for others.</p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Universal Metrics */}
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Universal Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="text-slate-400 text-sm">Today's Number</div>
                      <div className="text-2xl font-bold text-cyan-400" data-testid="text-universal-day">{data.universalDay}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-slate-400 text-sm">Energy Theme</div>
                      <div className="text-sm font-medium text-white text-right" data-testid="text-day-title">{data.todayTitle}</div>
                    </div>
                    <div className="text-xs text-slate-500 italic text-right" data-testid="text-day-theme">{data.todayTheme}</div>
                  </div>
                </Card>

                {/* Best Windows */}
                <Card className="p-4 bg-slate-900 border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Your Power Windows</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">1</div>
                      <div>
                        <div className="text-xs font-bold text-white">09:00 AM - 11:00 AM</div>
                        <div className="text-[10px] text-slate-400">Peak mental clarity</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold">2</div>
                      <div>
                        <div className="text-xs font-bold text-white">03:00 PM - 05:00 PM</div>
                        <div className="text-[10px] text-slate-400">Optimal social energy</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Database Stats */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-500" />
                  Community Energy Snapshot
                </h3>
                <div className="grid gap-2">
                  {data.topLifePaths?.map((lp: any, i: number) => (
                    <div key={lp.number} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/30 transition-colors" data-testid={`card-lifepath-${lp.number}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center font-bold text-cyan-400">
                          {lp.number}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{lp.title}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider">{lp.theme}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-none">{lp.count.toLocaleString()} seekers</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </ScrollArea>

        <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
            <Star className="w-3 h-3" /> Live Data from {data?.date}
          </p>
          <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300 text-xs gap-2">
            Get Tomorrow's Preview <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BestDaysDialog({ open, onClose, birthDate }: { open: boolean; onClose: () => void; birthDate: string | null }) {
  const [selectedDay, setSelectedDay] = useState<any>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/explore/best-days', birthDate],
    queryFn: async () => {
      if (!birthDate) return null;
      const response = await fetch(`/api/explore/best-days/${birthDate}`);
      if (!response.ok) throw new Error('Failed to fetch best days');
      return response.json();
    },
    enabled: open && !!birthDate,
  });

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent': return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
      case 'good': return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      case 'neutral': return 'bg-slate-500/20 border-slate-500/50 text-slate-400';
      case 'challenging': return 'bg-rose-500/20 border-rose-500/50 text-rose-400';
      default: return 'bg-slate-500/20 border-slate-500/50 text-slate-400';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'excellent': return <Crown className="w-5 h-5 text-emerald-400" />;
      case 'good': return <Star className="w-5 h-5 text-amber-400" />;
      case 'challenging': return <AlertTriangle className="w-5 h-5 text-rose-400" />;
      default: return <Target className="w-5 h-5 text-slate-400" />;
    }
  };

  const calculateBestHours = (personalDay: number) => {
    const hours = [9, 11, 15, 17, 20]; // Mock peak energy hours
    return hours.map(h => `${h}:00 - ${h + 1}:00`);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        onClose();
        setSelectedDay(null);
      }
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-950 border-slate-800" data-testid="dialog-best-days">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
            <Calendar className="w-6 h-6 text-amber-500" />
            Your Personal Power Calendar
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Maximize your potential by aligning with your numerical cycles
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Left Column: Calendar & Summary */}
          <div className="md:col-span-3 space-y-6">
            {isLoading ? (
              <LoadingSkeleton />
            ) : error ? (
              <div className="text-red-400 flex items-center gap-2 p-4 bg-red-400/10 rounded-lg border border-red-400/20">
                <AlertCircle className="w-4 h-4" />
                Failed to load calendar
              </div>
            ) : data ? (
              <ScrollArea className="h-[65vh] pr-4">
                <div className="space-y-6">
                  {/* Month Header Card */}
                  <Card className="bg-slate-900/50 border-slate-800 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-amber-500/10 to-transparent flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-white">{data.monthName} {data.year}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-amber-400 border-amber-400/30">LP {data.lifePathNumber}</Badge>
                          <Badge variant="outline" className="text-purple-400 border-purple-400/30">Personal Year {data.personalYear}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Today is</div>
                        <div className="text-lg font-bold text-white">Day {new Date().getDate()}</div>
                      </div>
                    </div>
                  </Card>

                  {/* Interactive Calendar Grid */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-white">Monthly Grid</h3>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> <span className="text-[10px] text-slate-400">Excellent</span></div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> <span className="text-[10px] text-slate-400">Good</span></div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500" /> <span className="text-[10px] text-slate-400">Challenging</span></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                        <div key={i} className="text-xs text-slate-500 font-bold py-1 text-center">{d}</div>
                      ))}
                      {(() => {
                        const now = new Date();
                        const isCurrentMonth = data.month === now.getMonth() + 1 && data.year === now.getFullYear();
                        const todayDate = now.getDate();
                        const firstDayOfMonth = new Date(data.year, data.month - 1, 1).getDay();

                        const emptyCells = Array(firstDayOfMonth).fill(null).map((_, j) => (
                          <div key={`empty-${j}`} className="p-2" />
                        ));

                        const dayCells = data.days?.map((day: any) => {
                          const isToday = isCurrentMonth && day.day === todayDate;
                          const isSelected = selectedDay?.day === day.day;
                          return (
                            <button
                              key={day.day}
                              onClick={() => setSelectedDay(day)}
                              className={`relative aspect-square p-1 rounded-lg border transition-all duration-200 group flex flex-col items-center justify-center gap-1 ${day.rating === 'excellent' ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20' :
                                day.rating === 'good' ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20' :
                                  day.rating === 'challenging' ? 'bg-rose-500/10 border-rose-500/30 hover:bg-rose-500/20' :
                                    'bg-slate-900 border-slate-800 hover:border-slate-700'
                                } ${isToday ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-slate-950' : ''} ${isSelected ? 'border-white !bg-slate-100/10 scale-105' : ''}`}
                              data-testid={`calendar-day-${day.day}`}
                            >
                              <span className={`text-sm font-bold ${isToday ? 'text-amber-500' : 'text-slate-200'} group-hover:scale-110 transition-transform`}>{day.day}</span>
                              <div className={`w-1 h-1 rounded-full ${day.rating === 'excellent' ? 'bg-emerald-500' :
                                day.rating === 'good' ? 'bg-amber-500' :
                                  day.rating === 'challenging' ? 'bg-rose-500' :
                                    'bg-slate-700'
                                }`} />
                            </button>
                          );
                        }) || [];

                        return [...emptyCells, ...dayCells];
                      })()}
                    </div>
                  </div>

                  {/* Upcoming Power Days */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Upcoming Power Days
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {data.bestDays?.filter((d: any) => d.day >= new Date().getDate()).slice(0, 4).map((day: any) => (
                        <button
                          key={day.date}
                          onClick={() => setSelectedDay(day)}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-colors flex items-center justify-between text-left group"
                        >
                          <div>
                            <div className="text-xs text-slate-500 font-medium">Day {day.day}</div>
                            <div className="text-sm font-bold text-white group-hover:text-amber-400">{day.theme}</div>
                          </div>
                          <div className={`p-2 rounded-lg ${getRatingColor(day.rating)}`}>
                            {getRatingIcon(day.rating)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : null}
          </div>

          {/* Right Column: Day Detail */}
          <div className="md:col-span-2">
            {selectedDay ? (
              <div className="space-y-6 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                <Card className="flex-1 bg-slate-900/50 border-slate-800 p-6 flex flex-col gap-6 relative overflow-hidden">
                  <div className={`absolute top-0 right-0 p-8 opacity-5 text-8xl font-black ${getRatingColor(selectedDay.rating)}`}>
                    {selectedDay.day}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getRatingColor(selectedDay.rating)}>
                        {selectedDay.rating.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-slate-500">Personal Day {selectedDay.personalDay}</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white">{selectedDay.theme}</h2>
                    <p className="text-slate-400">Your specific guidance for Day {selectedDay.day}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Target className="w-3 h-3" /> Recommended Activities
                      </h4>
                      <ul className="space-y-2">
                        {selectedDay.activities.map((activity: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 text-sm text-slate-200">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator className="bg-slate-800" />

                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Clock className="w-3 h-3" /> Peak Energy Hours
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {calculateBestHours(selectedDay.personalDay).map((hour, i) => (
                          <Badge key={i} variant="secondary" className="bg-slate-800 text-slate-300 font-medium">
                            {hour}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20 mt-4">
                      <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                        <Star className="w-3 h-3" /> Pro Insight
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        "Since your Life Path is {data?.lifePathNumber}, this Day {selectedDay.personalDay} energy creates a {selectedDay.rating === 'excellent' ? 'powerful synergy' : 'unique opportunity'} for your personal growth. Focus on {selectedDay.theme.toLowerCase()} for maximum results."
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex gap-3">
                    <Button className="flex-1 bg-amber-600 hover:bg-amber-700 font-bold">
                      Add to Focus
                    </Button>
                    <Button variant="ghost" className="p-2 text-slate-400" onClick={() => setSelectedDay(null)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              </div>
            ) : (
              <div className="h-full border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center bg-slate-900/20">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mb-4">
                  <Calendar className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-400">Select a Day</h3>
                <p className="text-sm text-slate-500 mt-2">Click on any date in the calendar to see your personalized peak hours and activities.</p>
                <div className="mt-6 p-4 bg-blue-500/5 rounded-lg border border-blue-500/10 max-w-[200px]">
                  <p className="text-[10px] text-blue-400/80 font-medium flex items-center gap-1">
                    <Crown className="w-3 h-3" /> PRO TIP
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 italic">
                    Your energy peaks twice daily based on your biorhythms.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CelebrityMatchesDialog({ open, onClose, lifePathNumber, energySignature, userName }: {
  open: boolean;
  onClose: () => void;
  lifePathNumber: number | null;
  energySignature: string | null;
  userName: string;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/explore/celebrity-matches', lifePathNumber, energySignature],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (lifePathNumber) params.append('lifePathNumber', lifePathNumber.toString());
      if (energySignature) params.append('energySignature', energySignature);
      params.append('limit', '12');
      const response = await fetch(`/api/explore/celebrity-matches?${params}`);
      if (!response.ok) throw new Error('Failed to fetch celebrity matches');
      return response.json();
    },
    enabled: open && (!!lifePathNumber || !!energySignature),
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-950 border-slate-800" data-testid="dialog-celebrity-matches">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
            <Star className="w-6 h-6 text-amber-500" />
            Your Success Blueprints
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Study the journeys of these icons who share your core energy signature.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-rose-400 flex items-center gap-2 p-4 bg-rose-400/10 rounded-lg border border-rose-400/20" data-testid="error-celebrity">
              <AlertCircle className="w-4 h-4" />
              Failed to load blueprints
            </div>
          ) : data ? (
            <div className="space-y-6" data-testid="content-celebrity">
              <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-sm text-slate-400">
                  Found <span className="text-amber-400 font-bold">{data.totalCelebrities?.toLocaleString()}</span> mentors in our database matching your <Badge variant="outline" className="text-amber-400 border-amber-400/30">LP {lifePathNumber}</Badge> energy.
                </div>
                <Button variant="ghost" size="sm" className="text-amber-400 text-xs text-info">Filter by Industry <Compass className="w-3 h-3 ml-2" /></Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.matches?.map((celeb: any) => (
                  <Card key={celeb.id} className="bg-slate-900 border-slate-800 overflow-hidden hover:border-amber-500/30 transition-all duration-300 group" data-testid={`card-celebrity-${celeb.id}`}>
                    <div className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-xl">
                            {celeb.lifePathNumber}
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-lg group-hover:text-amber-400 transition-colors" data-testid={`text-celebrity-name-${celeb.id}`}>{celeb.name}</h3>
                            <p className="text-xs text-slate-500">{celeb.category} • {celeb.country}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" color="green" className="border-none">{celeb.score}% Match</Badge>
                      </div>

                      <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                          <Crown className="w-3 h-3" /> Their Journey
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed italic">
                          "Like you, {userName}, this individual leveraged their {celeb.energySignature.toLowerCase()} energy to achieve mastery. Their breakthrough came during a Personal Year {Math.floor(Math.random() * 9) + 1}."
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <Check className="w-3 h-3" /> Shared Strengths
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {celeb.matchReasons.map((reason: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-[10px] bg-slate-800/50 border-slate-700/50 text-slate-400">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <Button variant="outline" className="w-full text-xs bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white transition-all h-8">
                          Study Success Pattern <ChevronRight className="w-3 h-3 ml-2" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {(!data.matches || data.matches.length === 0) && (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
                  <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-slate-700" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-500">No Matches Found Yet</h3>
                  <p className="text-sm text-slate-600 mt-2">Try updating your profile with more details to improve matching.</p>
                </div>
              )}
            </div>
          ) : null}
        </ScrollArea>

        <div className="mt-4 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3" /> Mentor Guidance
          </p>
          <p className="text-[11px] text-slate-400">
            {userName}, the numbers suggest you are currently in a cycle similar to what this mentor experienced at 28. Review their early work for specific tactical inspiration.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TravelDestinationsDialog({ open, onClose, lifePathNumber, element, birthYear, birthDate }: {
  open: boolean;
  onClose: () => void;
  lifePathNumber: number | null;
  element: string | null;
  birthYear: number | null;
  birthDate: string | null;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/explore/travel-destinations', lifePathNumber, element, birthYear],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (lifePathNumber) params.append('lifePathNumber', lifePathNumber.toString());
      if (element) params.append('element', element);
      if (birthYear) params.append('birthYear', birthYear.toString());
      params.append('limit', '12');
      const response = await fetch(`/api/explore/travel-destinations?${params}`);
      if (!response.ok) throw new Error('Failed to fetch travel destinations');
      return response.json();
    },
    enabled: open && (!!lifePathNumber || !!element),
  });

  const getTripTiming = () => {
    if (!birthDate) return 'Your optimal travel window opens in 3 months.';
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    // Simple logic for timing - Personal Month 5 or 3 are best for travel
    const timingMonths = [3, 5, 9];
    return `Your numerology suggests the best months for departure are March, May, or September when personal energy is most expansive.`;
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-950 border-slate-800" data-testid="dialog-travel-destinations">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-600 bg-clip-text text-transparent">
            <Globe className="w-6 h-6 text-emerald-500" />
            Destiny Destinations
          </DialogTitle>
          <DialogDescription className="text-slate-400">Locations that vibrate in harmony with your zodiac & life path</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-rose-400 flex items-center gap-2 p-4 bg-rose-400/10 rounded-lg border border-rose-400/20" data-testid="error-travel">
              <AlertCircle className="w-4 h-4" />
              Failed to load destinations
            </div>
          ) : data ? (
            <div className="space-y-6" data-testid="content-travel">
              <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Globe className="w-32 h-32" />
                </div>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Plane className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Your Trip Planner</h3>
                    <p className="text-sm text-slate-400">{getTripTiming()}</p>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.destinations?.map((dest: any) => (
                  <Card
                    key={dest.id}
                    className={`group relative overflow-hidden transition-all duration-300 hover:border-emerald-500/40 ${dest.isUserMatch ? 'bg-slate-900/80 border-emerald-500/30' : 'bg-slate-900 border-slate-800'}`}
                    data-testid={`card-destination-${dest.id}`}
                  >
                    {dest.isUserMatch && (
                      <div className="absolute top-0 right-0 p-3 bg-emerald-500/10 rounded-bl-xl border-l border-b border-emerald-500/20">
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-none px-2 py-0 text-[10px]">PEAK MATCH</Badge>
                      </div>
                    )}

                    <div className="p-5 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                          <MapPin className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-lg">{dest.name}</h4>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                            Est. {dest.foundingYear} • Year of the {dest.zodiacAnimal}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                        {dest.description}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950/50 rounded-md border border-slate-800 text-[10px] text-slate-400">
                          <Zap className="w-3 h-3 text-emerald-500" />
                          {dest.vibe}
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-950/50 rounded-md border border-slate-800 text-[10px] text-slate-400">
                          <Target className="w-3 h-3 text-emerald-500" />
                          {dest.bestFor}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-800/50">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          {dest.compatibleSigns.slice(0, 3).map((sign: string) => (
                            <div key={sign} className={`w-6 h-6 rounded-full border border-slate-950 flex items-center justify-center text-[8px] font-bold ${data.userZodiac === sign ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                              {sign.charAt(0)}
                            </div>
                          ))}
                          {dest.compatibleSigns.length > 3 && (
                            <div className="w-6 h-6 rounded-full border border-slate-950 bg-slate-800 flex items-center justify-center text-[8px] text-slate-400">
                              +{dest.compatibleSigns.length - 3}
                            </div>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] text-emerald-400 hover:text-emerald-300 gap-1 p-0">
                          View Activities <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function RelationshipPatternsDialog({ open, onClose, lifePathNumber }: {
  open: boolean;
  onClose: () => void;
  lifePathNumber: number | null;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/explore/relationship-patterns', lifePathNumber],
    queryFn: async () => {
      if (!lifePathNumber) return null;
      const response = await fetch(`/api/explore/relationship-patterns/${lifePathNumber}`);
      if (!response.ok) throw new Error('Failed to fetch relationship patterns');
      return response.json();
    },
    enabled: open && !!lifePathNumber,
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-950 border-slate-800" data-testid="dialog-relationship-patterns">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-rose-400 to-pink-600 bg-clip-text text-transparent">
            <Heart className="w-6 h-6 text-rose-500" />
            Soul Alignment Hub
          </DialogTitle>
          <DialogDescription className="text-slate-400">Deep-dive into your energetic compatibility patterns</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-rose-400 flex items-center gap-2 p-4 bg-rose-400/10 rounded-lg border border-rose-400/20" data-testid="error-relationship">
              <AlertCircle className="w-4 h-4" />
              Failed to load patterns
            </div>
          ) : data ? (
            <div className="space-y-8" data-testid="content-relationship">
              {/* Hero Analysis */}
              <Card className="p-6 bg-gradient-to-br from-rose-500/10 to-pink-500/10 border-rose-500/20">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-rose-500/30 flex flex-col items-center justify-center shrink-0">
                    <div className="text-3xl font-black text-rose-500">{data.lifePathNumber}</div>
                    <div className="text-[10px] text-slate-500 font-bold">LIFE PATH</div>
                  </div>
                  <div className="space-y-2">
                    <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 uppercase text-[10px]">{data.title}</Badge>
                    <h3 className="text-xl font-bold text-white leading-tight">Your Core Relationship DNA</h3>
                    <p className="text-sm text-slate-400 italic leading-relaxed">
                      "{data.description}"
                    </p>
                  </div>
                </div>
              </Card>

              {/* Compatibility Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="p-4 bg-emerald-500/5 border-emerald-500/10">
                  <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Check className="w-3 h-3" /> Best Matches
                  </h4>
                  <div className="space-y-3">
                    {data.bestMatches?.map((match: any) => (
                      <div key={match.number} className="flex items-center gap-3 p-2 bg-slate-950/50 rounded-lg border border-slate-900 shadow-sm" data-testid={`card-best-match-${match.number}`}>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm">
                          {match.number}
                        </div>
                        <div className="text-xs font-medium text-slate-300">{match.title}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 bg-blue-500/5 border-blue-500/10">
                  <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Star className="w-3 h-3" /> Spiritual Kin
                  </h4>
                  <div className="space-y-3">
                    {data.goodMatches?.map((match: any) => (
                      <div key={match.number} className="flex items-center gap-3 p-2 bg-slate-950/50 rounded-lg border border-slate-900 shadow-sm" data-testid={`card-good-match-${match.number}`}>
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-sm">
                          {match.number}
                        </div>
                        <div className="text-xs font-medium text-slate-300">{match.title}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 bg-orange-500/5 border-orange-500/10">
                  <h4 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> Growth Catalyst
                  </h4>
                  <div className="space-y-3">
                    {data.challengingMatches?.map((match: any) => (
                      <div key={match.number} className="flex items-center gap-3 p-2 bg-slate-950/50 rounded-lg border border-slate-900 shadow-sm" data-testid={`card-challenging-match-${match.number}`}>
                        <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400 font-bold text-sm">
                          {match.number}
                        </div>
                        <div className="text-xs font-medium text-slate-300">{match.title}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Communication Guide */}
              <div className="space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-rose-500" />
                  Communication Masterclass
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {data.tips?.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-4 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800/50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 text-[10px] font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </ScrollArea>

        <div className="mt-4 p-4 border-t border-slate-800 flex justify-between items-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-3 h-3" /> Encrypted Soul Insights
          </p>
          <Button variant="outline" size="sm" className="h-8 text-xs bg-slate-900 border-rose-500/20 text-rose-400 hover:bg-rose-500/10">
            View Full Compatibility Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CareerAlignmentDialog({ open, onClose, lifePathNumber }: {
  open: boolean;
  onClose: () => void;
  lifePathNumber: number | null;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/explore/career-alignment', lifePathNumber],
    queryFn: async () => {
      if (!lifePathNumber) return null;
      const response = await fetch(`/api/explore/career-alignment/${lifePathNumber}`);
      if (!response.ok) throw new Error('Failed to fetch career alignment');
      return response.json();
    },
    enabled: open && !!lifePathNumber,
  });

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-slate-950 border-slate-800" data-testid="dialog-career-alignment">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent">
            <Briefcase className="w-6 h-6 text-blue-500" />
            Executive Alchemy
          </DialogTitle>
          <DialogDescription className="text-slate-400">Strategic industries and leadership roles aligned with your mastery</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          {isLoading ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-rose-400 flex items-center gap-2 p-4 bg-rose-400/10 rounded-lg border border-rose-400/20" data-testid="error-career">
              <AlertCircle className="w-4 h-4" />
              Failed to load alignment
            </div>
          ) : data ? (
            <div className="space-y-8" data-testid="content-career">
              {/* Career Hero */}
              <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Target className="w-40 h-40 -mr-10 -mt-10" />
                </div>
                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-20 h-20 rounded-2xl bg-slate-950 border border-blue-500/30 flex flex-col items-center justify-center shrink-0">
                    <div className="text-3xl font-black text-blue-500">{data.lifePathNumber}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Mastery</div>
                  </div>
                  <div className="space-y-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 uppercase text-[10px]">{data.title}</Badge>
                    <h3 className="text-2xl font-bold text-white">Your Professional Power Zone</h3>
                    <p className="text-sm text-slate-400 leading-relaxed italic">
                      "{data.description}"
                    </p>
                  </div>
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-5 bg-slate-900 border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Compass className="w-3 h-3 text-blue-500" /> High-Yield Industries
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.industries?.map((industry: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-slate-950 py-1.5 px-3 border-slate-700 text-slate-300 hover:border-blue-500/50 transition-colors" data-testid={`badge-industry-${i}`}>
                        {industry}
                      </Badge>
                    ))}
                  </div>
                </Card>

                <Card className="p-5 bg-slate-900 border-slate-800">
                  <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-blue-500" /> Operational Strengths
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {data.coreStrengths?.map((strength: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 font-medium" data-testid={`card-strength-${i}`}>
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {strength}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-blue-500" />
                  Optimized Roles & Career Path
                </h3>
                <div className="grid gap-3">
                  {data.suggestedRoles?.map((role: any, i: number) => (
                    <div key={i} className="group p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:bg-slate-900 hover:border-blue-500/30 transition-all duration-300" data-testid={`card-role-${i}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{role.name}</div>
                        <Badge className="bg-slate-800 text-[8px] border-none h-4">ROLE MASTERY</Badge>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed italic">
                        "{role.reason}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </ScrollArea>

        <div className="mt-4 p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
            <Target className="w-3 h-3" /> Career Transition Tool
          </p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Based on your Personal Year cycle, the next 4 months are ideal for <span className="text-white font-bold">salary negotiations</span> or <span className="text-white font-bold">lateral moves</span>. Your energy peak for new projects aligns with Personal Day 1.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProfileRequiredPrompt({ onClose }: { onClose: () => void }) {
  return (
    <Dialog open={true} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md" data-testid="dialog-profile-required">
        <DialogHeader>
          <DialogTitle>Profile Required</DialogTitle>
          <DialogDescription>
            This feature requires your birth date to provide personalized insights.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-4">
          <p className="text-sm text-gray-11">
            Create your profile to unlock personalized numerology features including best days,
            celebrity matches, travel destinations, relationship patterns, and career alignment.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} data-testid="button-close-profile-prompt">
              Cancel
            </Button>
            <Link href="/">
              <Button data-testid="button-create-profile">Create Profile</Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Explore() {
  const [activeFeature, setActiveFeature] = useState<FeatureType>(null);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const savedOdisId = typeof window !== 'undefined' ? localStorage.getItem(ODIS_ID_KEY) : null;

  const { data: profileData, isLoading: isProfileLoading } = useQuery<ProfileData & { isPro?: boolean } | null>({
    queryKey: ['/api/profile', savedOdisId],
    queryFn: async () => {
      if (!savedOdisId) return null;
      const response = await fetch(`/api/profile/${savedOdisId}`);
      if (!response.ok) return null;
      const data = await response.json();
      return { ...data.user, isPro: data.isPro } as ProfileData & { isPro?: boolean };
    },
    enabled: !!savedOdisId,
    staleTime: 1000 * 60 * 5,
  });

  const hasProfile = !!profileData;
  const isPro = profileData?.isPro ?? false;
  const profileLoaded = !savedOdisId || !isProfileLoading;
  const birthDate = profileData?.birthDate || null;

  const calculatedProfile = useMemo(() => {
    if (!profileData?.birthDate || !profileData?.fullName) return null;
    try {
      return calculateComprehensiveProfile(
        profileData.fullName,
        new Date(profileData.birthDate),
        profileData.birthTime || '12:00',
        profileData.birthLocation || 'Unknown'
      );
    } catch {
      return null;
    }
  }, [profileData]);

  const lifePathNumber = calculatedProfile?.lifePathNumber || null;
  const energySignature = calculatedProfile?.energySignature || null;
  const element = energySignature ? energySignature.split(' ')[0] : null;

  const handleCardClick = (featureId: FeatureType) => {
    if (!isPro) {
      setShowUpgradeModal(true);
      return;
    }

    const feature = explorations.find(e => e.id === featureId);

    if (feature?.requiresProfile && !hasProfile) {
      setShowProfilePrompt(true);
      return;
    }

    setActiveFeature(featureId);
  };

  const handleCloseDialog = () => {
    setActiveFeature(null);
  };

  return (
    <>
      <StarField />
      <Navigation />

      <main className="pt-20 pb-12 px-4 min-h-screen" data-testid="page-explore">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              <Compass className="w-3 h-3 mr-1" />
              Discovery
            </Badge>
            <h1 className="text-6 md:text-7 font-semibold mb-4">
              <span className="gradient-text">Explore</span> Your Energy
            </h1>
            <p className="text-gray-11 text-3 max-w-2xl mx-auto">
              Discover insights about your energy patterns and how they connect to the world around you.
            </p>
          </div>

          {profileLoaded && !hasProfile && (
            <Card variant="frosted" className="border-amber-a4">
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-9" />
                    <div>
                      <div className="font-medium">Create your profile for personalized features</div>
                      <div className="text-sm text-gray-11">Unlock all 6 explore features with your birth date</div>
                    </div>
                  </div>
                  <Link href="/">
                    <Button data-testid="button-create-profile-banner">Create Profile</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {explorations.map((item) => (
              <Card
                key={item.id}
                variant="frosted"
                className={`hover:border-amber-6/30 transition-all cursor-pointer group relative ${profileLoaded && item.requiresProfile && !hasProfile ? 'opacity-60' : ''
                  }`}
                onClick={() => handleCardClick(item.id)}
                data-testid={`card-explore-${item.id}`}
              >
                {!isPro && (
                  <div className="absolute inset-0 bg-gray-1/60 backdrop-blur-[1px] rounded-lg z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-a3 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-gray-11" />
                      </div>
                      <Badge variant="secondary" size="sm">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-lg bg-amber-a3 flex items-center justify-center group-hover:bg-amber-a4 transition-colors">
                      <item.icon className="w-6 h-6 text-amber-9" />
                    </div>
                    <div className="flex items-center gap-2">
                      {profileLoaded && item.requiresProfile && !hasProfile && (
                        <Badge variant="outline" size="sm" className="text-xs">
                          Profile needed
                        </Badge>
                      )}
                      <Badge variant="secondary" size="sm">
                        {item.tag}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-4 mt-4">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2 text-gray-11">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <TrendingEnergiesDialog
        open={activeFeature === 'trending'}
        onClose={handleCloseDialog}
        lifePathNumber={lifePathNumber}
      />

      <BestDaysDialog
        open={activeFeature === 'best-days'}
        onClose={handleCloseDialog}
        birthDate={birthDate}
      />

      <CelebrityMatchesDialog
        open={activeFeature === 'celebrity'}
        onClose={handleCloseDialog}
        lifePathNumber={lifePathNumber}
        energySignature={energySignature}
        userName={profileData?.fullName?.split(' ')[0] || "Seeker"}
      />

      <TravelDestinationsDialog
        open={activeFeature === 'travel'}
        onClose={handleCloseDialog}
        lifePathNumber={lifePathNumber}
        element={element}
        birthYear={birthDate ? new Date(birthDate).getFullYear() : null}
        birthDate={birthDate}
      />

      <RelationshipPatternsDialog
        open={activeFeature === 'relationship'}
        onClose={handleCloseDialog}
        lifePathNumber={lifePathNumber}
      />

      <CareerAlignmentDialog
        open={activeFeature === 'career'}
        onClose={handleCloseDialog}
        lifePathNumber={lifePathNumber}
      />

      {showProfilePrompt && (
        <ProfileRequiredPrompt onClose={() => setShowProfilePrompt(false)} />
      )}

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </>
  );
}
