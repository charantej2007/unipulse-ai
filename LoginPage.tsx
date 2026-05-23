import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { useAuth } from '@/app/context/AuthContext';
import {
    GraduationCap,
    Mail,
    Lock,
    AlertCircle,
    Sparkles,
    LogIn,
    Shield,
    Zap,
    Heart,
    Star
} from 'lucide-react';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithGoogle, isProfileComplete, currentUser, userProfile } = useAuth();
    const navigate = useNavigate();

    const features = [
        { icon: Shield, text: 'Secure & Private', desc: 'Your data is protected' },
        { icon: Zap, text: 'Instant Access', desc: 'Resume where you left off' },
        { icon: Heart, text: 'Personalized', desc: 'Tailored to your goals' },
        { icon: Star, text: 'AI-Powered', desc: 'Smart recommendations' }
    ];

    useEffect(() => {
        if (currentUser) {
            if (userProfile !== null) {
                if (isProfileComplete) {
                    navigate('/recommendations');
                } else {
                    navigate('/profile');
                }
            }
        }
    }, [currentUser, userProfile, isProfileComplete, navigate]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
            setLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        setError('');
        setLoading(true);

        try {
            await loginWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Failed to sign in with Google');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />

            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
                <div className="absolute top-40 right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
                <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
                <div className="absolute bottom-40 right-10 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">

                    {/* Left side - Welcome content */}
                    <div className="hidden lg:block text-white space-y-8 pr-8">
                        <Link to="/" className="inline-flex items-center gap-3 mb-4">
                            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                                <GraduationCap className="h-10 w-10 text-white" />
                            </div>
                            <span className="text-2xl font-bold">UniPulse</span>
                        </Link>

                        <div className="space-y-4">
                            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                                Welcome
                                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                    Back!
                                </span>
                            </h1>
                            <p className="text-lg text-white/70 max-w-md">
                                Your personalized career recommendations are waiting for you. Sign in to continue your journey.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 w-fit mb-3">
                                        <feature.icon className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="font-medium text-white">{feature.text}</div>
                                    <div className="text-sm text-white/60">{feature.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right side - Login form */}
                    <div className="w-full max-w-md mx-auto lg:mx-0">
                        <Card className="border-0 shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                            <CardHeader className="text-center pb-2 pt-8">
                                {/* Mobile logo */}
                                <Link to="/" className="lg:hidden inline-flex items-center justify-center gap-2 mb-4">
                                    <GraduationCap className="h-10 w-10 text-blue-600" />
                                </Link>

                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium mb-4 mx-auto">
                                    <Sparkles className="h-3 w-3" />
                                    Welcome Back
                                </div>

                                <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
                                <CardDescription className="text-base">
                                    Continue your career journey
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-5 px-6 pb-8">
                                {error && (
                                    <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                            <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 hover:underline">
                                                Forgot password?
                                            </Link>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-11 text-base font-medium bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/25"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Signing in...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <LogIn className="h-4 w-4" />
                                                Sign In
                                            </span>
                                        )}
                                    </Button>
                                </form>

                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white dark:bg-slate-900 px-3 text-muted-foreground">Or continue with</span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full h-11 gap-3 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
                                    onClick={handleGoogleSignIn}
                                    disabled={loading}
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path
                                            fill="#4285F4"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
                                    Continue with Google
                                </Button>

                                <p className="text-center text-sm text-muted-foreground pt-2">
                                    Don't have an account?{' '}
                                    <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
                                        Sign up free
                                    </Link>
                                </p>
                            </CardContent>
                        </Card>

                        <p className="text-center text-xs text-white/40 mt-4">
                            Protected by enterprise-grade security
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
