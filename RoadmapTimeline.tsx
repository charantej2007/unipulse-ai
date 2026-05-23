import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { CheckCircle2, BookOpen, PenTool, Lightbulb, Rocket, Flag } from 'lucide-react';
import { cn } from "../utils/utils";

interface Resource {
    title: string;
    type: string;
    url: string;
}

interface Phase {
    phase: string;
    goal: string;
    concepts: string[];
    projects: string[];
    resources: Resource[];
}

interface CareerLaunch {
    tips: string[];
    portfolio_ideas: string[];
}

interface RoadmapData {
    roadmap: Phase[];
    career_launch: CareerLaunch;
}

interface RoadmapTimelineProps {
    data: RoadmapData | string;
}

export function RoadmapTimeline({ data }: RoadmapTimelineProps) {
    // Parse data if it's a string (backwards compatibility or initial load)
    let parsedData: RoadmapData;

    try {
        if (typeof data === 'string') {
            // Try to parse JSON, if fails, it might be the old markdown format or error message
            // If it starts with { it is likely JSON.
            if (data.trim().startsWith('{')) {
                parsedData = JSON.parse(data);
            } else {
                // Fallback for markdown or error
                return <div className="prose max-w-none dark:prose-invert whitespace-pre-wrap">{data}</div>;
            }
        } else {
            parsedData = data;
        }
    } catch (e) {
        // Fallback if parsing fails
        return <div className="prose max-w-none dark:prose-invert">{typeof data === 'string' ? data : 'Error parsing roadmap data'}</div>;
    }

    return (
        <div className="relative space-y-8 pl-8 md:pl-12 before:absolute before:inset-0 before:ml-4 md:before:ml-6 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">

            {/* Phases */}
            {parsedData.roadmap.map((phase, index) => (
                <div key={index} className="relative animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'both' }}>
                    {/* Timeline Dot */}
                    <div className="absolute -left-8 md:-left-12 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-background border-2 border-primary shadow-sm z-10">
                        <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>

                    <Card className="border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <CardTitle className="text-xl font-bold text-primary">{phase.phase}</CardTitle>
                                <Badge variant="outline" className="w-fit">
                                    <Flag className="h-3 w-3 mr-1" />
                                    Goal
                                </Badge>
                            </div>
                            <CardDescription className="text-base font-medium text-foreground/80 mt-1">
                                {phase.goal}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                            {/* Concepts */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                    <BookOpen className="h-4 w-4" /> Key Concepts
                                </div>
                                <ul className="space-y-1">
                                    {phase.concepts.map((concept, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                                            {concept}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Projects */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                    <PenTool className="h-4 w-4" /> Projects
                                </div>
                                <ul className="space-y-1">
                                    {phase.projects.map((project, i) => (
                                        <li key={i} className="text-sm flex items-start gap-2">
                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                                            {project}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Resources (Optional, spanning full width) */}
                            {phase.resources && phase.resources.length > 0 && (
                                <div className="space-y-2 md:col-span-2 pt-2 border-t border-border/50">
                                    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                        <Lightbulb className="h-4 w-4" /> Resources
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {phase.resources.map((res, i) => (
                                            <a
                                                key={i}
                                                href={res.url && res.url !== "null" ? res.url : `https://www.google.com/search?q=${encodeURIComponent(res.title + " " + res.type)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="no-underline"
                                            >
                                                <Badge variant="secondary" className="text-xs hover:bg-secondary/80 transition-colors cursor-pointer flex items-center gap-1">
                                                    {res.title}
                                                    <span className="opacity-50 text-[10px] ml-1">({res.type})</span>
                                                </Badge>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ))}

            {/* Career Launch Section */}
            <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${parsedData.roadmap.length * 150}ms`, animationFillMode: 'both' }}>
                <div className="absolute -left-8 md:-left-12 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm z-10">
                    <Rocket className="h-4 w-4" />
                </div>

                <Card className="border-primary bg-primary/5 shadow-md">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            Career Launch
                        </CardTitle>
                        <CardDescription>You are ready to take off! Here is how to land that job.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                Tips for Success
                            </h4>
                            <ul className="grid gap-2 sm:grid-cols-2">
                                {parsedData.career_launch.tips.map((tip, i) => (
                                    <li key={i} className="text-sm bg-background/50 p-2 rounded border border-border/50">
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                Portfolio Ideas
                            </h4>
                            <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                                {parsedData.career_launch.portfolio_ideas.map((idea, i) => (
                                    <li key={i}>{idea}</li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
