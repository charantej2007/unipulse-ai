import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell
} from 'recharts';
import { AlertTriangle, CheckCircle2, Target, Zap, TrendingUp } from 'lucide-react';
import { SkillWithStatus, SkillStatus } from '@/app/utils/recommendationEngine';

interface OverviewSectionProps {
    careerGoal: string;
    currentSkills: SkillWithStatus[];
    requiredSkills: string[];
    strongSkills: string[];
    moderateSkills: string[];
    missingSkills: string[];
    readinessScore: number;
}

export function OverviewSection({
    careerGoal,
    currentSkills,
    requiredSkills,
    strongSkills,
    moderateSkills,
    missingSkills,
    readinessScore
}: OverviewSectionProps) {

    // Helper to get skill status color based on user-entered status
    const getSkillStatusFromProfile = (skillName: string): { coverage: number; color: string } => {
        const skill = currentSkills.find(s => s.name === skillName);
        if (skill) {
            switch (skill.status) {
                case 'completed': return { coverage: 100, color: '#22c55e' }; // green
                case 'ongoing': return { coverage: 50, color: '#f59e0b' }; // yellow/amber
                case 'not_started': return { coverage: 25, color: '#ef4444' }; // red
            }
        }
        // Skill not in user's list = missing
        return { coverage: 0, color: '#ef4444' }; // red for missing
    };

    // Prepare data for skill coverage bar chart (heatmap style) - uses USER STATUS
    const skillCoverageData = requiredSkills.slice(0, 10).map(skill => {
        const { coverage, color } = getSkillStatusFromProfile(skill);
        return {
            skill: skill.length > 12 ? skill.substring(0, 12) + '...' : skill,
            fullSkill: skill,
            coverage,
            color
        };
    });

    // Prepare data for radar chart
    const radarData = [
        { subject: 'Skills Match', A: strongSkills.length, fullMark: requiredSkills.length || 1 },
        { subject: 'Moderate Skills', A: moderateSkills.length, fullMark: requiredSkills.length || 1 },
        { subject: 'Missing Skills', A: Math.max(0, requiredSkills.length - missingSkills.length), fullMark: requiredSkills.length || 1 },
        { subject: 'Readiness', A: readinessScore, fullMark: 100 },
    ];

    // Urgent skills are the first 3-5 missing skills (prioritize foundational ones)
    const urgentSkills = missingSkills.slice(0, 5);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Career Summary Header */}
            <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full bg-primary/20">
                            <Target className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Career Overview: {careerGoal}</CardTitle>
                            <CardDescription className="text-base mt-1">
                                Your personalized skill analysis and readiness assessment
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="text-center p-4 bg-background/50 rounded-lg border">
                            <div className="text-3xl font-bold text-green-600">
                                {currentSkills.filter(s => s.status === 'completed').length}
                            </div>
                            <div className="text-sm text-muted-foreground">Skills Mastered</div>
                        </div>
                        <div className="text-center p-4 bg-background/50 rounded-lg border">
                            <div className="text-3xl font-bold text-amber-500">
                                {currentSkills.filter(s => s.status === 'ongoing').length}
                            </div>
                            <div className="text-sm text-muted-foreground">In Progress</div>
                        </div>
                        <div className="text-center p-4 bg-background/50 rounded-lg border">
                            <div className="text-3xl font-bold text-red-500">{missingSkills.length}</div>
                            <div className="text-sm text-muted-foreground">To Learn</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Skills Lists & Chart Row */}
            <div className="grid gap-6 lg:grid-cols-2">

                {/* Skill Coverage Heatmap/Bar Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Skill Coverage Heatmap
                        </CardTitle>
                        <CardDescription>
                            Visual representation of your skill alignment with {careerGoal} requirements
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={skillCoverageData} layout="vertical" margin={{ left: 10, right: 20 }}>
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis
                                    type="category"
                                    dataKey="skill"
                                    width={100}
                                    tick={{ fontSize: 11 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`${value}%`, 'Coverage']}
                                    labelFormatter={(label) => skillCoverageData.find(d => d.skill === label)?.fullSkill || label}
                                />
                                <Bar dataKey="coverage" radius={[0, 4, 4, 0]}>
                                    {skillCoverageData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-4 text-xs">
                            <div className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded bg-green-500" /> Mastered
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded bg-amber-500" /> In Progress
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-3 h-3 rounded bg-red-500" /> Missing
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Skills Required List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Skills Required for {careerGoal}</CardTitle>
                        <CardDescription>Complete list of skills needed for this career path</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Current Skills */}
                        <div>
                            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Your Current Skills ({currentSkills.length})
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                                {currentSkills.map(skill => {
                                    const bgColor = skill.status === 'completed' ? 'bg-green-500/10 border-green-500/30 text-green-700' :
                                        skill.status === 'ongoing' ? 'bg-amber-500/10 border-amber-500/30 text-amber-700' :
                                            'bg-red-500/10 border-red-500/30 text-red-700';
                                    return (
                                        <Badge key={skill.name} variant="outline" className={bgColor}>
                                            {skill.name}
                                        </Badge>
                                    );
                                })}
                                {currentSkills.length === 0 && <span className="text-sm text-muted-foreground">None specified</span>}
                            </div>
                        </div>

                        {/* Required Skills */}
                        <div>
                            <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4 text-primary" />
                                All Required Skills ({requiredSkills.length})
                            </h4>
                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                                {requiredSkills.map(skill => {
                                    const isStrong = strongSkills.includes(skill);
                                    const isModerate = moderateSkills.includes(skill);
                                    return (
                                        <Badge
                                            key={skill}
                                            variant={isStrong ? "default" : isModerate ? "secondary" : "destructive"}
                                            className={isStrong ? "bg-green-600" : isModerate ? "bg-amber-500 text-white" : ""}
                                        >
                                            {skill}
                                        </Badge>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Urgent Skills Section */}
            {urgentSkills.length > 0 && (
                <Card className="border-red-500/30 bg-red-500/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Urgent Skills to Develop
                        </CardTitle>
                        <CardDescription>
                            These skills are critical for your {careerGoal} career and should be prioritized
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {urgentSkills.map((skill, index) => (
                                <div
                                    key={skill}
                                    className="flex items-center gap-3 p-3 bg-background rounded-lg border border-red-200 animate-in fade-in slide-in-from-left-2"
                                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                                >
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-100 text-red-600 font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <div className="font-medium">{skill}</div>
                                        <div className="text-xs text-muted-foreground">High Priority</div>
                                    </div>
                                    <Zap className="h-4 w-4 text-red-500 ml-auto" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
