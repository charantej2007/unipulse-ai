import { Link } from 'react-router';
import { Button } from '@/app/components/ui/button';
import { Home, Search, ArrowLeft, AlertTriangle } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          {/* 404 Icon */}
          <div className="mb-8 relative">
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center backdrop-blur-sm border border-white/10">
              <AlertTriangle className="w-16 h-16 text-violet-400" />
            </div>
            <div className="absolute -inset-4 bg-violet-500/20 rounded-full blur-2xl opacity-50 animate-pulse" />
          </div>

          {/* Error Code */}
          <div className="mb-6">
            <span className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              404
            </span>
          </div>

          {/* Message */}
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-white/60 mb-8 max-w-md mx-auto">
            The page you're looking for seems to have wandered off. Don't worry, let's get you back on track.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 shadow-lg shadow-violet-500/25"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto gap-2 border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>

          {/* Help text */}
          <p className="mt-8 text-sm text-white/40">
            Need help? <Link to="/" className="text-violet-400 hover:text-violet-300 underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
