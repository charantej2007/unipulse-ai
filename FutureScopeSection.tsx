import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    LineChart,
    Line,
    ComposedChart
} from 'recharts';
import {
    TrendingUp,
    Building2,
    Globe2,
    DollarSign,
    Briefcase,
    GraduationCap,
    Rocket,
    Target,
    Users,
    MapPin,
    Star,
    ArrowUpRight,
    Zap,
    CheckCircle2,
    Clock,
    Award,
    BookOpen
} from 'lucide-react';

// Career data for different roles
const CAREER_DATA: Record<string, CareerInsights> = {
    'Web Developer': {
        industryStatus: {
            demandLevel: 'Very High',
            demandScore: 92,
            growthRate: '+18%',
            totalJobs: '1.2M+',
            avgTimeToHire: '21 days'
        },
        futureScope: {
            projectedGrowth: 23,
            emergingTech: ['AI Integration', 'Web3/Blockchain', 'PWAs', 'WebAssembly', 'Edge Computing'],
            skillsInDemand: ['React', 'TypeScript', 'Node.js', 'Cloud Services', 'API Design'],
            timeline: [
                { year: '2024', jobs: 1200, salary: 85 },
                { year: '2025', jobs: 1400, salary: 92 },
                { year: '2026', jobs: 1650, salary: 100 },
                { year: '2027', jobs: 1900, salary: 108 },
                { year: '2028', jobs: 2200, salary: 118 }
            ]
        },
        companiesIndia: [
            { name: 'TCS', logo: '🏢', openings: 3500, rating: 4.1 },
            { name: 'Infosys', logo: '🏛️', openings: 2800, rating: 4.0 },
            { name: 'Wipro', logo: '🏗️', openings: 2200, rating: 3.9 },
            { name: 'Flipkart', logo: '🛒', openings: 450, rating: 4.3 },
            { name: 'Paytm', logo: '💳', openings: 320, rating: 4.0 },
            { name: 'Swiggy', logo: '🍔', openings: 280, rating: 4.2 }
        ],
        companiesAbroad: [
            { name: 'Google', logo: '🔍', openings: 2500, location: 'USA', rating: 4.6 },
            { name: 'Meta', logo: '📘', openings: 1800, location: 'USA', rating: 4.4 },
            { name: 'Amazon', logo: '📦', openings: 4200, location: 'Global', rating: 4.2 },
            { name: 'Microsoft', logo: '🪟', openings: 3100, location: 'USA', rating: 4.5 },
            { name: 'Netflix', logo: '🎬', openings: 400, location: 'USA', rating: 4.7 },
            { name: 'Spotify', logo: '🎵', openings: 350, location: 'Sweden', rating: 4.5 }
        ],
        salaryData: {
            india: { entry: 4, mid: 12, senior: 25, lead: 40 },
            abroad: { entry: 75, mid: 120, senior: 180, lead: 250 },
            currency: { india: '₹ LPA', abroad: '$K/year' }
        },
        marketTrends: [
            { trend: 'Remote Work', impact: 85, direction: 'up' },
            { trend: 'AI/ML Integration', impact: 78, direction: 'up' },
            { trend: 'Cybersecurity Focus', impact: 72, direction: 'up' },
            { trend: 'Low-Code Platforms', impact: 45, direction: 'neutral' },
            { trend: 'Traditional Web Dev', impact: 30, direction: 'down' }
        ],
        nextSteps: [
            { step: 'Master a Modern Framework', description: 'React, Vue, or Angular with TypeScript', priority: 'High', icon: 'code' },
            { step: 'Learn Cloud Platforms', description: 'AWS, Azure, or GCP fundamentals', priority: 'High', icon: 'cloud' },
            { step: 'Build Portfolio Projects', description: 'Create 3-5 impressive personal projects', priority: 'Medium', icon: 'folder' },
            { step: 'Contribute to Open Source', description: 'Start with documentation, then code', priority: 'Medium', icon: 'git' },
            { step: 'Prepare for System Design', description: 'Learn scalability and architecture patterns', priority: 'High', icon: 'design' }
        ]
    },
    'Data Scientist': {
        industryStatus: {
            demandLevel: 'Extremely High',
            demandScore: 95,
            growthRate: '+25%',
            totalJobs: '800K+',
            avgTimeToHire: '28 days'
        },
        futureScope: {
            projectedGrowth: 35,
            emergingTech: ['Generative AI', 'MLOps', 'AutoML', 'Explainable AI', 'Edge ML'],
            skillsInDemand: ['Python', 'Machine Learning', 'Deep Learning', 'Statistics', 'SQL'],
            timeline: [
                { year: '2024', jobs: 800, salary: 95 },
                { year: '2025', jobs: 1000, salary: 110 },
                { year: '2026', jobs: 1300, salary: 125 },
                { year: '2027', jobs: 1650, salary: 140 },
                { year: '2028', jobs: 2100, salary: 160 }
            ]
        },
        companiesIndia: [
            { name: 'Amazon', logo: '📦', openings: 1200, rating: 4.3 },
            { name: 'Flipkart', logo: '🛒', openings: 350, rating: 4.4 },
            { name: 'PhonePe', logo: '📱', openings: 180, rating: 4.2 },
            { name: 'Mu Sigma', logo: '📊', openings: 500, rating: 3.8 },
            { name: 'Tiger Analytics', logo: '🐯', openings: 220, rating: 4.0 },
            { name: 'Fractal', logo: '📐', openings: 300, rating: 4.1 }
        ],
        companiesAbroad: [
            { name: 'Google', logo: '🔍', openings: 1500, location: 'USA', rating: 4.7 },
            { name: 'OpenAI', logo: '🤖', openings: 200, location: 'USA', rating: 4.8 },
            { name: 'DeepMind', logo: '🧠', openings: 150, location: 'UK', rating: 4.9 },
            { name: 'Meta', logo: '📘', openings: 1200, location: 'USA', rating: 4.5 },
            { name: 'Netflix', logo: '🎬', openings: 180, location: 'USA', rating: 4.6 },
            { name: 'Uber', logo: '🚗', openings: 400, location: 'USA', rating: 4.3 }
        ],
        salaryData: {
            india: { entry: 6, mid: 18, senior: 35, lead: 55 },
            abroad: { entry: 95, mid: 150, senior: 220, lead: 320 },
            currency: { india: '₹ LPA', abroad: '$K/year' }
        },
        marketTrends: [
            { trend: 'Generative AI', impact: 95, direction: 'up' },
            { trend: 'MLOps & Deployment', impact: 82, direction: 'up' },
            { trend: 'AutoML Tools', impact: 70, direction: 'up' },
            { trend: 'Data Privacy/Ethics', impact: 65, direction: 'up' },
            { trend: 'Traditional BI', impact: 25, direction: 'down' }
        ],
        nextSteps: [
            { step: 'Learn Deep Learning', description: 'PyTorch or TensorFlow with neural networks', priority: 'High', icon: 'brain' },
            { step: 'Master MLOps', description: 'Docker, Kubernetes, ML pipelines', priority: 'High', icon: 'deploy' },
            { step: 'Build End-to-End Projects', description: 'From data collection to deployment', priority: 'High', icon: 'project' },
            { step: 'Explore GenAI', description: 'LLMs, prompt engineering, fine-tuning', priority: 'Medium', icon: 'ai' },
            { step: 'Get Certified', description: 'AWS ML, Google Cloud AI certifications', priority: 'Medium', icon: 'cert' }
        ]
    },
    'Machine Learning Engineer': {
        industryStatus: {
            demandLevel: 'Extremely High',
            demandScore: 97,
            growthRate: '+32%',
            totalJobs: '500K+',
            avgTimeToHire: '35 days'
        },
        futureScope: {
            projectedGrowth: 42,
            emergingTech: ['LLMs', 'Transformer Models', 'MLOps', 'Federated Learning', 'Neural Architecture Search'],
            skillsInDemand: ['Python', 'TensorFlow/PyTorch', 'MLOps', 'System Design', 'Mathematics'],
            timeline: [
                { year: '2024', jobs: 500, salary: 110 },
                { year: '2025', jobs: 680, salary: 130 },
                { year: '2026', jobs: 900, salary: 155 },
                { year: '2027', jobs: 1200, salary: 180 },
                { year: '2028', jobs: 1600, salary: 210 }
            ]
        },
        companiesIndia: [
            { name: 'Google India', logo: '🔍', openings: 400, rating: 4.6 },
            { name: 'Microsoft', logo: '🪟', openings: 350, rating: 4.5 },
            { name: 'Amazon', logo: '📦', openings: 600, rating: 4.3 },
            { name: 'Nvidia', logo: '💚', openings: 150, rating: 4.7 },
            { name: 'Qualcomm', logo: '📡', openings: 120, rating: 4.2 },
            { name: 'Samsung R&D', logo: '📱', openings: 180, rating: 4.1 }
        ],
        companiesAbroad: [
            { name: 'OpenAI', logo: '🤖', openings: 300, location: 'USA', rating: 4.9 },
            { name: 'Anthropic', logo: '🧬', openings: 100, location: 'USA', rating: 4.8 },
            { name: 'DeepMind', logo: '🧠', openings: 200, location: 'UK', rating: 4.9 },
            { name: 'Tesla', logo: '⚡', openings: 450, location: 'USA', rating: 4.4 },
            { name: 'Apple', logo: '🍎', openings: 380, location: 'USA', rating: 4.6 },
            { name: 'Nvidia', logo: '💚', openings: 500, location: 'USA', rating: 4.7 }
        ],
        salaryData: {
            india: { entry: 8, mid: 22, senior: 45, lead: 70 },
            abroad: { entry: 120, mid: 180, senior: 280, lead: 400 },
            currency: { india: '₹ LPA', abroad: '$K/year' }
        },
        marketTrends: [
            { trend: 'Large Language Models', impact: 98, direction: 'up' },
            { trend: 'Edge AI Deployment', impact: 75, direction: 'up' },
            { trend: 'Responsible AI', impact: 70, direction: 'up' },
            { trend: 'AutoML & No-Code ML', impact: 55, direction: 'up' },
            { trend: 'Traditional ML', impact: 40, direction: 'neutral' }
        ],
        nextSteps: [
            { step: 'Master Transformers', description: 'Attention mechanisms, BERT, GPT architectures', priority: 'High', icon: 'transformer' },
            { step: 'Learn MLOps at Scale', description: 'Kubeflow, MLflow, model serving', priority: 'High', icon: 'scale' },
            { step: 'Study System Design', description: 'Design ML systems that scale', priority: 'High', icon: 'system' },
            { step: 'Research Papers', description: 'Read and implement latest papers', priority: 'Medium', icon: 'paper' },
            { step: 'Contribute to Open Source', description: 'HuggingFace, PyTorch ecosystem', priority: 'Medium', icon: 'git' }
        ]
    },
    'AI Engineer': {
        industryStatus: {
            demandLevel: 'Explosive',
            demandScore: 99,
            growthRate: '+45%',
            totalJobs: '400K+',
            avgTimeToHire: '30 days'
        },
        futureScope: {
            projectedGrowth: 55,
            emergingTech: ['AGI Research', 'Multimodal AI', 'AI Agents', 'Neuromorphic Computing', 'Quantum ML'],
            skillsInDemand: ['Python', 'LLMs', 'Prompt Engineering', 'RAG', 'Vector Databases'],
            timeline: [
                { year: '2024', jobs: 400, salary: 120 },
                { year: '2025', jobs: 620, salary: 145 },
                { year: '2026', jobs: 950, salary: 175 },
                { year: '2027', jobs: 1400, salary: 210 },
                { year: '2028', jobs: 2100, salary: 250 }
            ]
        },
        companiesIndia: [
            { name: 'Google', logo: '🔍', openings: 300, rating: 4.7 },
            { name: 'Microsoft', logo: '🪟', openings: 280, rating: 4.5 },
            { name: 'Amazon', logo: '📦', openings: 400, rating: 4.3 },
            { name: 'Ola', logo: '🚗', openings: 80, rating: 4.0 },
            { name: 'Reliance Jio', logo: '📶', openings: 120, rating: 4.1 },
            { name: 'Startups', logo: '🚀', openings: 500, rating: 4.2 }
        ],
        companiesAbroad: [
            { name: 'OpenAI', logo: '🤖', openings: 400, location: 'USA', rating: 4.9 },
            { name: 'Anthropic', logo: '🧬', openings: 150, location: 'USA', rating: 4.8 },
            { name: 'Google', logo: '🔍', openings: 800, location: 'USA', rating: 4.7 },
            { name: 'xAI', logo: '✖️', openings: 80, location: 'USA', rating: 4.6 },
            { name: 'Cohere', logo: '🔗', openings: 60, location: 'Canada', rating: 4.5 },
            { name: 'Mistral AI', logo: '🌬️', openings: 50, location: 'France', rating: 4.7 }
        ],
        salaryData: {
            india: { entry: 10, mid: 28, senior: 55, lead: 90 },
            abroad: { entry: 150, mid: 220, senior: 350, lead: 500 },
            currency: { india: '₹ LPA', abroad: '$K/year' }
        },
        marketTrends: [
            { trend: 'GenAI Applications', impact: 99, direction: 'up' },
            { trend: 'AI Agents & Automation', impact: 90, direction: 'up' },
            { trend: 'Multimodal Systems', impact: 85, direction: 'up' },
            { trend: 'AI Safety & Alignment', impact: 75, direction: 'up' },
            { trend: 'Traditional Chatbots', impact: 20, direction: 'down' }
        ],
        nextSteps: [
            { step: 'Master LLM APIs', description: 'OpenAI, Anthropic, Gemini APIs', priority: 'High', icon: 'api' },
            { step: 'Learn RAG Patterns', description: 'Vector DBs, embeddings, retrieval', priority: 'High', icon: 'rag' },
            { step: 'Build AI Agents', description: 'LangChain, AutoGPT, agent frameworks', priority: 'High', icon: 'agent' },
            { step: 'Fine-tuning & RLHF', description: 'Customize models for specific use cases', priority: 'Medium', icon: 'tune' },
            { step: 'Study AI Safety', description: 'Alignment, red-teaming, guardrails', priority: 'Medium', icon: 'safety' }
        ]
    }
};

// Default data for roles not in the list
const DEFAULT_CAREER_DATA: CareerInsights = {
    industryStatus: {
        demandLevel: 'High',
        demandScore: 75,
        growthRate: '+15%',
        totalJobs: '500K+',
        avgTimeToHire: '25 days'
    },
    futureScope: {
        projectedGrowth: 20,
        emergingTech: ['Cloud Computing', 'AI Integration', 'Automation', 'DevOps', 'Security'],
        skillsInDemand: ['Programming', 'Problem Solving', 'Communication', 'Teamwork', 'Adaptability'],
        timeline: [
            { year: '2024', jobs: 500, salary: 70 },
            { year: '2025', jobs: 580, salary: 78 },
            { year: '2026', jobs: 670, salary: 88 },
            { year: '2027', jobs: 780, salary: 98 },
            { year: '2028', jobs: 900, salary: 110 }
        ]
    },
    companiesIndia: [
        { name: 'TCS', logo: '🏢', openings: 2000, rating: 4.0 },
        { name: 'Infosys', logo: '🏛️', openings: 1500, rating: 4.0 },
        { name: 'Wipro', logo: '🏗️', openings: 1200, rating: 3.9 },
        { name: 'HCL', logo: '🏭', openings: 1000, rating: 3.9 },
        { name: 'Tech Mahindra', logo: '🔧', openings: 800, rating: 3.8 },
        { name: 'Cognizant', logo: '🧠', openings: 700, rating: 4.0 }
    ],
    companiesAbroad: [
        { name: 'Google', logo: '🔍', openings: 1000, location: 'USA', rating: 4.6 },
        { name: 'Microsoft', logo: '🪟', openings: 1500, location: 'USA', rating: 4.5 },
        { name: 'Amazon', logo: '📦', openings: 2000, location: 'Global', rating: 4.2 },
        { name: 'Apple', logo: '🍎', openings: 600, location: 'USA', rating: 4.5 },
        { name: 'IBM', logo: '🔵', openings: 800, location: 'USA', rating: 4.1 },
        { name: 'Accenture', logo: '🔷', openings: 1200, location: 'Global', rating: 4.0 }
    ],
    salaryData: {
        india: { entry: 4, mid: 10, senior: 20, lead: 35 },
        abroad: { entry: 60, mid: 100, senior: 150, lead: 200 },
        currency: { india: '₹ LPA', abroad: '$K/year' }
    },
    marketTrends: [
        { trend: 'Cloud Adoption', impact: 80, direction: 'up' },
        { trend: 'AI Integration', impact: 75, direction: 'up' },
        { trend: 'Remote Work', impact: 70, direction: 'up' },
        { trend: 'DevOps Culture', impact: 65, direction: 'up' },
        { trend: 'Traditional IT', impact: 35, direction: 'down' }
    ],
    nextSteps: [
        { step: 'Build Technical Skills', description: 'Focus on in-demand technologies', priority: 'High', icon: 'code' },
        { step: 'Get Certified', description: 'Industry-recognized certifications', priority: 'High', icon: 'cert' },
        { step: 'Build Portfolio', description: 'Showcase your best work', priority: 'Medium', icon: 'folder' },
        { step: 'Network', description: 'Connect with industry professionals', priority: 'Medium', icon: 'network' },
        { step: 'Stay Updated', description: 'Follow industry trends and news', priority: 'Low', icon: 'news' }
    ]
};

interface CareerInsights {
    industryStatus: {
        demandLevel: string;
        demandScore: number;
        growthRate: string;
        totalJobs: string;
        avgTimeToHire: string;
    };
    futureScope: {
        projectedGrowth: number;
        emergingTech: string[];
        skillsInDemand: string[];
        timeline: { year: string; jobs: number; salary: number }[];
    };
    companiesIndia: { name: string; logo: string; openings: number; rating: number }[];
    companiesAbroad: { name: string; logo: string; openings: number; location: string; rating: number }[];
    salaryData: {
        india: { entry: number; mid: number; senior: number; lead: number };
        abroad: { entry: number; mid: number; senior: number; lead: number };
        currency: { india: string; abroad: string };
    };
    marketTrends: { trend: string; impact: number; direction: string }[];
    nextSteps: { step: string; description: string; priority: string; icon: string }[];
}

interface FutureScopeSectionProps {
    careerGoal: string;
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export function FutureScopeSection({ careerGoal }: FutureScopeSectionProps) {
    // Normalize career goal to match predefined data keys
    const normalizedCareer = (() => {
        const goal = careerGoal.toLowerCase();
        if (goal.includes('ml engineer') || goal.includes('machine learning')) {
            return 'Machine Learning Engineer';
        }
        if (goal.includes('ai engineer') || goal.includes('artificial intelligence')) {
            return 'AI Engineer';
        }
        if (goal.includes('data scientist') || goal.includes('data science')) {
            return 'Data Scientist';
        }
        if (goal.includes('web') || goal.includes('frontend') || goal.includes('full stack') || goal.includes('fullstack')) {
            return 'Web Developer';
        }
        return careerGoal;
    })();

    // Get data for the career or use default
    const data = CAREER_DATA[normalizedCareer] || DEFAULT_CAREER_DATA;

    const salaryChartData = [
        { level: 'Entry', india: data.salaryData.india.entry, abroad: data.salaryData.abroad.entry },
        { level: 'Mid', india: data.salaryData.india.mid, abroad: data.salaryData.abroad.mid },
        { level: 'Senior', india: data.salaryData.india.senior, abroad: data.salaryData.abroad.senior },
        { level: 'Lead', india: data.salaryData.india.lead, abroad: data.salaryData.abroad.lead }
    ];

    const demandDistribution = [
        { name: 'USA', value: 35, color: '#3b82f6' },
        { name: 'India', value: 25, color: '#10b981' },
        { name: 'Europe', value: 20, color: '#8b5cf6' },
        { name: 'Others', value: 20, color: '#f59e0b' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Rocket className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Future Scope: {careerGoal}</h1>
                            <p className="text-white/80 text-lg">Explore your career's future opportunities & trends</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-3xl font-bold">{data.industryStatus.demandScore}%</div>
                            <div className="text-white/70 text-sm">Demand Score</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-3xl font-bold text-green-300">{data.industryStatus.growthRate}</div>
                            <div className="text-white/70 text-sm">Annual Growth</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-3xl font-bold">{data.industryStatus.totalJobs}</div>
                            <div className="text-white/70 text-sm">Global Jobs</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                            <div className="text-3xl font-bold">{data.industryStatus.avgTimeToHire}</div>
                            <div className="text-white/70 text-sm">Avg Time to Hire</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Industry Status & Demand */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/30 dark:to-background">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-violet-600" />
                            Industry Status
                        </CardTitle>
                        <CardDescription>Current demand and market position for {careerGoal}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">Demand Level</span>
                            <Badge className="bg-green-500 text-white">{data.industryStatus.demandLevel}</Badge>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span>Market Demand</span>
                                <span className="font-semibold">{data.industryStatus.demandScore}%</span>
                            </div>
                            <Progress value={data.industryStatus.demandScore} className="h-3" />
                        </div>
                        <div className="pt-4 border-t">
                            <h4 className="font-medium mb-3 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-amber-500" />
                                Emerging Technologies
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {data.futureScope.emergingTech.map(tech => (
                                    <Badge key={tech} variant="outline" className="bg-violet-100 dark:bg-violet-900/30 border-violet-300">
                                        {tech}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Global Demand Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe2 className="h-5 w-5 text-blue-600" />
                            Global Demand Distribution
                        </CardTitle>
                        <CardDescription>Where the jobs are located worldwide</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={demandDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}%`}
                                >
                                    {demandDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-2 flex-wrap">
                            {demandDistribution.map(item => (
                                <div key={item.name} className="flex items-center gap-1 text-sm">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Future Growth Projection */}
            <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/30 dark:to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowUpRight className="h-5 w-5 text-cyan-600" />
                        5-Year Growth Projection
                    </CardTitle>
                    <CardDescription>
                        Expected job growth and salary trends for {careerGoal} roles
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={data.futureScope.timeline}>
                            <XAxis dataKey="year" />
                            <YAxis yAxisId="left" orientation="left" stroke="#06b6d4" />
                            <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="jobs" name="Jobs (K)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                            <Line yAxisId="right" type="monotone" dataKey="salary" name="Avg Salary ($K)" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                    <div className="mt-4 p-4 bg-gradient-to-r from-cyan-100 to-green-100 dark:from-cyan-900/30 dark:to-green-900/30 rounded-lg">
                        <div className="flex items-center gap-2 text-lg font-semibold text-cyan-700 dark:text-cyan-300">
                            <TrendingUp className="h-5 w-5" />
                            Projected Growth: {data.futureScope.projectedGrowth}% by 2028
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            Based on current market trends and industry analysis
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Companies Hiring Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    Top Companies Hiring
                </h2>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* India Companies */}
                    <Card className="border-2 border-green-200">
                        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-green-600" />
                                🇮🇳 India
                            </CardTitle>
                            <CardDescription>Top companies hiring in India</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {data.companiesIndia.map((company, index) => (
                                    <div key={company.name} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">{company.logo}</div>
                                            <div>
                                                <div className="font-semibold">{company.name}</div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                                    {company.rating}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                            {company.openings.toLocaleString()}+ openings
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Global Companies */}
                    <Card className="border-2 border-blue-200">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                            <CardTitle className="flex items-center gap-2">
                                <Globe2 className="h-5 w-5 text-blue-600" />
                                🌍 Global
                            </CardTitle>
                            <CardDescription>Top companies hiring worldwide</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {data.companiesAbroad.map((company, index) => (
                                    <div key={company.name} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="text-2xl">{company.logo}</div>
                                            <div>
                                                <div className="font-semibold">{company.name}</div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" /> {company.location}
                                                    <span className="mx-1">•</span>
                                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                                    {company.rating}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                            {company.openings.toLocaleString()}+ openings
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Salary Comparison */}
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-amber-600" />
                        Salary Packages
                    </CardTitle>
                    <CardDescription>
                        Compensation comparison: India ({data.salaryData.currency.india}) vs International ({data.salaryData.currency.abroad})
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salaryChartData} layout="vertical">
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="level" width={60} />
                            <Tooltip
                                formatter={(value: number, name: string) => [
                                    name === 'india' ? `₹${value} LPA` : `$${value}K/year`,
                                    name === 'india' ? 'India' : 'International'
                                ]}
                            />
                            <Legend />
                            <Bar dataKey="india" name="India (₹ LPA)" fill="#10b981" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="abroad" name="International ($K)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
                            <div className="text-sm text-muted-foreground">Entry Level (India)</div>
                            <div className="text-xl font-bold text-green-700 dark:text-green-300">₹{data.salaryData.india.entry} LPA</div>
                        </div>
                        <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
                            <div className="text-sm text-muted-foreground">Senior (India)</div>
                            <div className="text-xl font-bold text-green-700 dark:text-green-300">₹{data.salaryData.india.senior} LPA</div>
                        </div>
                        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center">
                            <div className="text-sm text-muted-foreground">Entry Level (Intl)</div>
                            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">${data.salaryData.abroad.entry}K</div>
                        </div>
                        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-center">
                            <div className="text-sm text-muted-foreground">Senior (Intl)</div>
                            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">${data.salaryData.abroad.senior}K</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Market Trends */}
            <Card className="border-2 border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/30 dark:to-fuchsia-950/30">
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        Job Market Trends
                    </CardTitle>
                    <CardDescription>Current trends shaping the {careerGoal} job market</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        {data.marketTrends.map((trend, index) => (
                            <div key={trend.trend} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{trend.trend}</span>
                                        {trend.direction === 'up' && <ArrowUpRight className="h-4 w-4 text-green-500" />}
                                        {trend.direction === 'down' && <ArrowUpRight className="h-4 w-4 text-red-500 rotate-180" />}
                                    </div>
                                    <span className="text-sm font-semibold">{trend.impact}%</span>
                                </div>
                                <Progress
                                    value={trend.impact}
                                    className={`h-2 ${trend.direction === 'up' ? '[&>div]:bg-green-500' :
                                        trend.direction === 'down' ? '[&>div]:bg-red-500' : '[&>div]:bg-amber-500'
                                        }`}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Next Steps to Stay Ahead */}
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-emerald-600" />
                        Next Steps to Stay Ahead
                    </CardTitle>
                    <CardDescription>
                        Actionable steps to advance your {careerGoal} career
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {data.nextSteps.map((step, index) => (
                            <div
                                key={step.step}
                                className="p-4 rounded-xl bg-white dark:bg-background border-2 border-emerald-100 dark:border-emerald-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${step.priority === 'High' ? 'bg-red-100 text-red-600' :
                                        step.priority === 'Medium' ? 'bg-amber-100 text-amber-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                        <CheckCircle2 className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-semibold">{step.step}</div>
                                        <div className="text-sm text-muted-foreground mt-1">{step.description}</div>
                                        <Badge className={`mt-2 ${step.priority === 'High' ? 'bg-red-500' :
                                            step.priority === 'Medium' ? 'bg-amber-500' :
                                                'bg-green-500'
                                            } text-white`}>
                                            {step.priority} Priority
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Skills in Demand */}
            <Card className="border-2 border-rose-200">
                <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30">
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-rose-600" />
                        Hot Skills in Demand
                    </CardTitle>
                    <CardDescription>Most sought-after skills for {careerGoal} in 2024-2025</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-3">
                        {data.futureScope.skillsInDemand.map((skill, index) => (
                            <div
                                key={skill}
                                className="px-4 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium shadow-md hover:shadow-lg transition-shadow"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {skill}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Pro Tips */}
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-amber-400" />
                        Pro Tips for Success
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                            <h4 className="font-semibold flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4 text-cyan-400" />
                                Time Investment
                            </h4>
                            <p className="text-white/80 text-sm">
                                Dedicate 1-2 hours daily to learning. Consistency beats intensity.
                            </p>
                        </div>
                        <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                            <h4 className="font-semibold flex items-center gap-2 mb-2">
                                <Users className="h-4 w-4 text-green-400" />
                                Networking
                            </h4>
                            <p className="text-white/80 text-sm">
                                Connect with professionals on LinkedIn. Attend meetups and conferences.
                            </p>
                        </div>
                        <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                            <h4 className="font-semibold flex items-center gap-2 mb-2">
                                <Briefcase className="h-4 w-4 text-amber-400" />
                                Portfolio
                            </h4>
                            <p className="text-white/80 text-sm">
                                Build real projects. Quality over quantity. Document your journey.
                            </p>
                        </div>
                        <div className="p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                            <h4 className="font-semibold flex items-center gap-2 mb-2">
                                <GraduationCap className="h-4 w-4 text-purple-400" />
                                Continuous Learning
                            </h4>
                            <p className="text-white/80 text-sm">
                                Technology evolves fast. Stay curious and keep learning new skills.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
