import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import {
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
    PolarAngleAxis,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell
} from 'recharts';
import {
    BookOpen,
    Target,
    TrendingUp,
    CheckCircle2,
    Sparkles,
    ExternalLink,
    ChevronDown,
    GraduationCap,
    Zap,
    Star
} from 'lucide-react';
import { useState } from 'react';
import { CourseRecommendation } from '@/app/utils/recommendationEngine';

// Platform data with search URLs
const PLATFORMS = [
    {
        name: 'Udemy',
        icon: '🎓',
        color: 'bg-purple-600',
        getUrl: (courseName: string) => `https://www.udemy.com/courses/search/?q=${encodeURIComponent(courseName)}`
    },
    {
        name: 'Coursera',
        icon: '📚',
        color: 'bg-blue-600',
        getUrl: (courseName: string) => `https://www.coursera.org/search?query=${encodeURIComponent(courseName)}`
    },
    {
        name: 'YouTube',
        icon: '📺',
        color: 'bg-red-600',
        getUrl: (courseName: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(courseName + ' tutorial')}`
    },
    {
        name: 'LinkedIn Learning',
        icon: '💼',
        color: 'bg-sky-700',
        getUrl: (courseName: string) => `https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(courseName)}`
    },
    {
        name: 'edX',
        icon: '🔬',
        color: 'bg-red-800',
        getUrl: (courseName: string) => `https://www.edx.org/search?q=${encodeURIComponent(courseName)}`
    },
    {
        name: 'Pluralsight',
        icon: '💡',
        color: 'bg-rose-600',
        getUrl: (courseName: string) => `https://www.pluralsight.com/search?q=${encodeURIComponent(courseName)}`
    }
];

interface CourseDetailsDialogProps {
    recommendation: CourseRecommendation | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentReadiness: number;
}

export function CourseDetailsDialog({
    recommendation,
    open,
    onOpenChange,
    currentReadiness
}: CourseDetailsDialogProps) {
    const [showPlatforms, setShowPlatforms] = useState(false);

    if (!recommendation) return null;

    const { course, matchScore, skillsMatched, skillsMissing, explanation } = recommendation;

    // Calculate potential readiness increase
    const potentialIncrease = Math.min(15 + (skillsMissing.length * 5), 35);
    const newReadiness = Math.min(currentReadiness + potentialIncrease, 100);

    // Data for the radial chart
    const readinessData = [
        { name: 'Current', value: currentReadiness, fill: '#6366f1' },
        { name: 'After Course', value: newReadiness, fill: '#22c55e' }
    ];

    // Data for skill impact chart
    const skillImpactData = course.skills.map(skill => ({
        skill: skill.length > 10 ? skill.substring(0, 10) + '...' : skill,
        fullSkill: skill,
        impact: skillsMatched.includes(skill) ? 30 : 70 + Math.random() * 30,
        isNew: !skillsMatched.includes(skill)
    }));

    const handlePlatformClick = (platform: typeof PLATFORMS[0]) => {
        window.open(platform.getUrl(course.name), '_blank');
    };

    // Why to join reasons based on course data
    const whyToJoin = [
        { icon: Target, text: `Aligns with your career goal`, highlight: true },
        { icon: TrendingUp, text: `Increases job readiness by ${potentialIncrease}%`, highlight: true },
        { icon: GraduationCap, text: `${course.difficulty} level - Perfect for current stage` },
        { icon: Zap, text: `Learn ${skillsMissing.length} new in-demand skills` },
        { icon: Star, text: `${matchScore}% match with your profile` }
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <DialogHeader>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <DialogTitle className="text-2xl flex items-center gap-2">
                                <BookOpen className="h-6 w-6 text-primary" />
                                {course.name}
                            </DialogTitle>
                            <DialogDescription className="mt-2 text-base">
                                {course.description}
                            </DialogDescription>
                        </div>
                        <Badge className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-lg px-4 py-1">
                            {matchScore}% Match
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Skills Covered */}
                    <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            Skills You'll Master
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {course.skills.map(skill => {
                                const isMatched = skillsMatched.includes(skill);
                                return (
                                    <Badge
                                        key={skill}
                                        className={`px-3 py-1.5 text-sm ${isMatched
                                                ? 'bg-green-500 text-white'
                                                : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'
                                            }`}
                                    >
                                        {skill}
                                        {isMatched && <CheckCircle2 className="h-3 w-3 ml-1" />}
                                        {!isMatched && <span className="ml-1 text-xs opacity-75">NEW</span>}
                                    </Badge>
                                );
                            })}
                        </div>
                    </div>

                    {/* Why to Join */}
                    <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="h-5 w-5" />
                            Why You Should Join
                        </h3>
                        <div className="grid gap-2">
                            {whyToJoin.map((reason, index) => (
                                <div
                                    key={index}
                                    className={`flex items-center gap-3 p-2 rounded-lg ${reason.highlight
                                            ? 'bg-emerald-100 dark:bg-emerald-900/50'
                                            : 'bg-white/50 dark:bg-white/5'
                                        }`}
                                >
                                    <reason.icon className={`h-4 w-4 ${reason.highlight ? 'text-emerald-600' : 'text-muted-foreground'
                                        }`} />
                                    <span className="text-sm">{reason.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Job Readiness Chart */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <TrendingUp className="h-5 w-5" />
                            Job Readiness Impact
                        </h3>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Radial Progress */}
                            <div className="flex flex-col items-center">
                                <ResponsiveContainer width="100%" height={180}>
                                    <RadialBarChart
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="60%"
                                        outerRadius="100%"
                                        barSize={15}
                                        data={readinessData}
                                        startAngle={180}
                                        endAngle={0}
                                    >
                                        <PolarAngleAxis
                                            type="number"
                                            domain={[0, 100]}
                                            angleAxisId={0}
                                            tick={false}
                                        />
                                        <RadialBar
                                            background
                                            dataKey="value"
                                            cornerRadius={10}
                                        />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                                <div className="text-center -mt-20">
                                    <div className="text-3xl font-bold text-green-600">+{potentialIncrease}%</div>
                                    <div className="text-sm text-muted-foreground">Readiness Increase</div>
                                </div>
                            </div>

                            {/* Before/After comparison */}
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Current Readiness</span>
                                        <span className="font-semibold">{currentReadiness}%</span>
                                    </div>
                                    <Progress value={currentReadiness} className="h-3 [&>div]:bg-indigo-500" />
                                </div>
                                <div className="flex items-center justify-center">
                                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>After This Course</span>
                                        <span className="font-semibold text-green-600">{newReadiness}%</span>
                                    </div>
                                    <Progress value={newReadiness} className="h-3 [&>div]:bg-green-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Skill Impact Chart */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                        <h3 className="font-semibold text-lg mb-3">Skill Boost Analysis</h3>
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={skillImpactData} layout="vertical">
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis type="category" dataKey="skill" width={80} tick={{ fontSize: 11 }} />
                                <Tooltip
                                    formatter={(value: number) => [`${Math.round(value)}% boost`, 'Impact']}
                                    labelFormatter={(label) => skillImpactData.find(d => d.skill === label)?.fullSkill || label}
                                />
                                <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                                    {skillImpactData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.isNew ? '#8b5cf6' : '#22c55e'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded bg-green-500" /> Skills You Have
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded bg-violet-500" /> New Skills
                            </span>
                        </div>
                    </div>

                    {/* Start Course Button with Platform Selection */}
                    <div className="relative">
                        <Button
                            className="w-full h-14 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                            onClick={() => setShowPlatforms(!showPlatforms)}
                        >
                            <GraduationCap className="h-5 w-5 mr-2" />
                            Start Course
                            <ChevronDown className={`h-5 w-5 ml-2 transition-transform ${showPlatforms ? 'rotate-180' : ''}`} />
                        </Button>

                        {showPlatforms && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-muted-foreground">Choose a platform to start learning:</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 p-3">
                                    {PLATFORMS.map(platform => (
                                        <button
                                            key={platform.name}
                                            onClick={() => handlePlatformClick(platform)}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group"
                                        >
                                            <span className="text-2xl">{platform.icon}</span>
                                            <div className="flex-1">
                                                <div className="font-medium">{platform.name}</div>
                                                <div className="text-xs text-muted-foreground">Search course</div>
                                            </div>
                                            <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
