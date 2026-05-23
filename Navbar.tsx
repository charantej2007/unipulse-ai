import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { GraduationCap, User, LogOut, ChevronDown, LogIn } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/app/context/AuthContext';

export function Navbar() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            setIsProfileOpen(false);
            navigate('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/20"
            style={{
                background: 'linear-gradient(135deg, rgba(10, 26, 255, 0.85) 0%, rgba(59, 130, 246, 0.85) 100%)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
            }}
        >
            <div className="container mx-auto px-4 py-3">
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity">
                        <GraduationCap className="h-8 w-8" />
                        <span className="text-xl font-semibold">UniPulse</span>
                    </Link>

                    {/* Auth Section */}
                    <div className="flex items-center gap-3">
                        {currentUser ? (
                            /* Logged In - Profile Dropdown */
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity p-2 rounded-lg hover:bg-white/10"
                                >
                                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/30 overflow-hidden">
                                        {currentUser.photoURL ? (
                                            <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="h-5 w-5" />
                                        )}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                {isProfileOpen && (
                                    <div
                                        className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl border border-white/20 overflow-hidden"
                                        style={{
                                            background: 'linear-gradient(135deg, rgba(10, 26, 255, 0.95) 0%, rgba(59, 130, 246, 0.95) 100%)',
                                            backdropFilter: 'blur(16px)',
                                        }}
                                    >
                                        <div className="p-4 border-b border-white/20">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/30 overflow-hidden">
                                                    {currentUser.photoURL ? (
                                                        <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="h-6 w-6 text-white" />
                                                    )}
                                                </div>
                                                <div className="text-white">
                                                    <p className="font-semibold">{userProfile?.name || currentUser.displayName || 'User'}</p>
                                                    <p className="text-sm text-white/70">{currentUser.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-3">
                                            {userProfile?.careerGoal && (
                                                <div className="text-white">
                                                    <p className="text-xs text-white/60 uppercase tracking-wider">Career Goal</p>
                                                    <p className="font-medium">{userProfile.careerGoal}</p>
                                                </div>
                                            )}

                                            <Link to="/profile" onClick={() => setIsProfileOpen(false)}>
                                                <Button
                                                    variant="outline"
                                                    className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                                                >
                                                    Edit Profile
                                                </Button>
                                            </Link>

                                            <Button
                                                variant="ghost"
                                                className="w-full text-white/80 hover:text-white hover:bg-white/10 gap-2"
                                                onClick={handleLogout}
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Not Logged In - Login/Signup Buttons */
                            <>
                                <Link to="/login">
                                    <Button
                                        variant="ghost"
                                        className="text-white hover:bg-white/10 hover:text-white gap-2"
                                    >
                                        <LogIn className="h-4 w-4" />
                                        Sign In
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button
                                        className="bg-white text-primary hover:bg-white/90"
                                    >
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}
