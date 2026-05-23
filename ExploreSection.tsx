import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { PlayCircle, Flame, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    url: string;
    description: string;
}

export function ExploreSection() {
    const [videos, setVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrendingTech = async () => {
            try {
                // @ts-ignore
                const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
                const response = await fetch(`${baseUrl}/api/trending-tech`);
                if (response.ok) {
                    const data = await response.json();
                    setVideos(data.videos || []);
                }
            } catch (error) {
                console.error("Failed to fetch trending tech:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingTech();
    }, []);


    if (loading) {
        return (
            <div className="w-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (videos.length === 0) return null;

    return (
        <div className="w-full mx-auto mt-4 animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl">
                        <Flame className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                            Explore Trending Tech
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Curated essential concepts to stay ahead.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-2 pb-8">
                {videos.map((video) => (
                    <Card
                        key={video.id}
                        className="w-full flex-col border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden group/card cursor-pointer hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-1 transition-all duration-300"
                        onClick={() => window.open(video.url, '_blank')}
                    >
                        <div className="relative aspect-video overflow-hidden">
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-slate-900/20 group-hover/card:bg-slate-900/10 transition-colors" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                                <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl scale-90 group-hover/card:scale-100 transition-all duration-300">
                                    <PlayCircle className="w-8 h-8 ml-1" />
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-5">
                            <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 h-12 mb-2 group-hover/card:text-orange-600 dark:group-hover/card:text-orange-400 transition-colors">
                                {video.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                {video.description}
                            </p>
                            <div className="mt-4 flex items-center text-xs font-semibold text-orange-600 dark:text-orange-500 uppercase tracking-widest gap-1 opacity-0 -translate-y-2 group-hover/card:opacity-100 group-hover/card:translate-y-0 transition-all duration-300">
                                Watch Now <ExternalLink className="w-3 h-3" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
