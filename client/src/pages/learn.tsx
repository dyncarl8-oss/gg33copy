import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Navigation } from '@/components/Navigation';
import { StarField } from '@/components/StarField';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/UpgradeModal';
import { BookOpen, Play, Clock, Star, Lock, Sparkles, Search, Zap, Calculator, Moon, Sun } from 'lucide-react';
import { courses } from '@/lib/courses-data';
import { useWhopContext } from '@/context/WhopContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { glossaryTerms, masterNumbers, dailyRituals } from '@/lib/study-data';
import { Input } from '@/components/ui/input';

const ODIS_ID_KEY = 'gg33-odis-id';

export default function Learn() {
  const { basePath } = useWhopContext();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const savedOdisId = localStorage.getItem(ODIS_ID_KEY);
  const { data: profileData } = useQuery<{ isPro?: boolean }>({
    queryKey: ['/api/profile', savedOdisId],
    enabled: !!savedOdisId,
  });
  const isPro = profileData?.isPro ?? false;

  const [searchTerm, setSearchTerm] = useState('');

  const filteredGlossary = glossaryTerms.filter(item =>
    item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <StarField />
      <Navigation />

      <main className="pt-20 pb-12 px-4 min-h-screen" data-testid="page-learn">
        <div className="container mx-auto max-w-6xl space-y-8">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              <BookOpen className="w-3 h-3 mr-1" />
              Advanced Academy
            </Badge>
            <h1 className="text-6 md:text-7 font-semibold mb-4">
              <span className="gradient-text">Study</span> Zone
            </h1>
            <p className="text-gray-11 text-3 max-w-2xl mx-auto">
              Master the GG33 system through structured lessons, terminology guides, and daily spiritual rituals.
            </p>
          </div>

          <Tabs defaultValue="courses" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-gray-a2 border border-gray-5/50 p-1">
                <TabsTrigger value="courses" className="px-6 py-2 data-[state=active]:bg-gold-gradient data-[state=active]:text-gray-1">
                  Courses
                </TabsTrigger>
                <TabsTrigger value="glossary" className="px-6 py-2 data-[state=active]:bg-gold-gradient data-[state=active]:text-gray-1">
                  Glossary
                </TabsTrigger>
                <TabsTrigger value="master" className="px-6 py-2 data-[state=active]:bg-gold-gradient data-[state=active]:text-gray-1">
                  Master Hub
                </TabsTrigger>
                <TabsTrigger value="rituals" className="px-6 py-2 data-[state=active]:bg-gold-gradient data-[state=active]:text-gray-1">
                  Rituals
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="courses" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    variant={course.free ? 'frosted' : 'glass'}
                    className="relative overflow-hidden flex flex-col h-full"
                    data-testid={`card-course-${course.id}`}
                  >
                    {!course.free && !isPro && (
                      <div className="absolute top-4 right-4">
                        <Lock className="w-4 h-4 text-gray-10" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        {course.free ? (
                          <Badge color="green" variant="outline" size="sm">
                            Free
                          </Badge>
                        ) : (
                          <Badge variant="secondary" size="sm">
                            Premium
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-4">{course.title}</CardTitle>
                      <CardDescription className="text-2 text-gray-11">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="flex items-center gap-4 text-2 text-gray-11 mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          {course.lessons.length} lessons
                        </span>
                      </div>
                      <div className="mt-auto">
                        {course.free || isPro ? (
                          <Link href={`${basePath}/course/${course.id}`}>
                            <Button
                              variant="gold"
                              className="w-full"
                              data-testid={`button-start-course-${course.id}`}
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Start Learning
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setShowUpgradeModal(true)}
                            data-testid={`button-locked-course-${course.id}`}
                          >
                            <Lock className="w-4 h-4 mr-2" />
                            Unlock Course
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!isPro && (
                <Card variant="glow" className="text-center">
                  <CardContent className="py-12">
                    <BookOpen className="w-12 h-12 mx-auto text-amber-9 mb-4" />
                    <h3 className="text-4 font-semibold mb-2">
                      Unlock All Courses
                    </h3>
                    <p className="text-gray-11 text-2 mb-6 max-w-md mx-auto">
                      Upgrade to Pro to access all premium courses and become a GG33 master.
                    </p>
                    <Button
                      variant="gold"
                      onClick={() => setShowUpgradeModal(true)}
                      data-testid="button-unlock-courses"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="glossary" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-10" />
                  <Input
                    placeholder="Search energy terms..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid gap-4">
                  {filteredGlossary.map((item, i) => (
                    <Card key={i} variant="glass" className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-3 font-semibold text-amber-9">{item.term}</h4>
                            <Badge variant="secondary" size="sm" className="opacity-70">
                              {item.category}
                            </Badge>
                          </div>
                          <p className="text-2 text-gray-11 leading-relaxed">
                            {item.definition}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {filteredGlossary.length === 0 && (
                    <div className="text-center py-12 text-gray-11">
                      <p>No terms found matching "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="master" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-3 gap-6">
                {masterNumbers.map((mn) => (
                  <Card key={mn.number} variant="frosted" className="p-6 text-center group border-amber-9/20 hover:border-amber-9/50 transition-colors h-full">
                    <div className="w-16 h-16 rounded-full bg-amber-9/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <span className="text-6 font-bold text-amber-9">{mn.number}</span>
                    </div>
                    <CardTitle className="text-4 mb-2">{mn.title}</CardTitle>
                    <p className="text-2 text-gray-11 mb-4 flex-1">
                      {mn.description}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {mn.keywords.map(kw => (
                        <Badge key={kw} variant="outline" size="sm" className="text-[10px] uppercase tracking-wider">
                          {kw}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="rituals" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-4 font-semibold mb-2">Daily Harmonization</h3>
                  <p className="text-gray-11 text-2">Incorporate these simple practices to align your daily energy with the GG33 system.</p>
                </div>

                <div className="grid gap-4">
                  {dailyRituals.map((ritual) => (
                    <Card key={ritual.id} variant="glass" className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-gray-a3 flex items-center justify-center flex-shrink-0">
                          {ritual.category === 'Morning' ? <Sun className="w-5 h-5 text-amber-11" /> :
                            ritual.category === 'Evening' ? <Moon className="w-5 h-5 text-blue-11" /> :
                              <Zap className="w-5 h-5 text-gold-11" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="text-3 font-semibold">{ritual.title}</h4>
                            <Badge variant="secondary" size="sm">{ritual.duration}</Badge>
                          </div>
                          <p className="text-2 text-gray-11">{ritual.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <UpgradeModal open={showUpgradeModal} onOpenChange={setShowUpgradeModal} />
    </>
  );
}
