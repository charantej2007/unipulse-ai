import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { RoadmapTimeline } from "./RoadmapTimeline";

interface RoadmapViewProps {
    roadmap: string | null;
    loading: boolean;
    onGenerate: () => void;
    error?: string;
}

export function RoadmapView({ roadmap, loading, onGenerate, error }: RoadmapViewProps) {
    if (loading) {
        return (
            <Card className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-muted/20 border-dashed">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Generating Your Personalized Roadmap</h3>
                <p className="text-muted-foreground max-w-sm">
                    Our AI is analyzing your profile and crafting a step-by-step career path for you. This usually takes about 10-15 seconds.
                </p>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="p-8 text-center bg-destructive/5 border-destructive/20">
                <h3 className="text-xl font-semibold text-destructive mb-2">Generation Failed</h3>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={onGenerate}>Try Again</Button>
            </Card>
        )
    }

    if (!roadmap) {
        return (
            <Card className="min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 bg-primary/10 p-4 rounded-full">
                    <RefreshCw className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to Plan Your Career?</h3>
                <p className="text-muted-foreground max-w-md mb-6">
                    Generate a personalized learning path tailored to your specific career goals and current skill level.
                </p>
                <Button onClick={onGenerate} size="lg">Generate Career Roadmap</Button>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <RoadmapTimeline data={roadmap} />

            <div className="flex justify-end">
                <Button variant="outline" onClick={onGenerate} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Regenerate Roadmap
                </Button>
            </div>
        </div>
    );
}
