import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    signInWithPopup,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/app/firebase';

export interface UserProfile {
    name: string;
    email: string;
    careerGoal?: string;
    skills?: string[];
    interests?: string[];
    educationLevel?: string;
    difficulty?: string;
    isProfileComplete?: boolean;
}

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    isProfileComplete: boolean;
    isAdmin: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile from Firestore
    async function fetchUserProfile(user: User) {
        // Default profile from auth data (works offline)
        const defaultProfile: UserProfile = {
            name: user.displayName || 'User',
            email: user.email || '',
        };

        try {
            const docRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserProfile(docSnap.data() as UserProfile);
            } else {
                // Create default profile in Firestore
                try {
                    await setDoc(docRef, defaultProfile);
                } catch {
                    // Silently fail - offline or permission issue
                }
                setUserProfile(defaultProfile);
            }
        } catch {
            // Offline or permission error - use local profile from auth
            setUserProfile(defaultProfile);
        }
    }

    // Login with email/password
    async function login(email: string, password: string) {
        await signInWithEmailAndPassword(auth, email, password);
    }

    // Signup with email/password
    async function signup(email: string, password: string, name: string) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Update display name
        await updateProfile(userCredential.user, { displayName: name });

        // Create user profile in Firestore (with error handling)
        try {
            const profile: UserProfile = {
                name,
                email,
            };
            await setDoc(doc(db, 'users', userCredential.user.uid), profile);
        } catch {
            // Silently fail - offline or permission issue
        }
    }

    // Logout
    async function logout() {
        await signOut(auth);
        setUserProfile(null);
    }

    // Login with Google
    async function loginWithGoogle() {
        const result = await signInWithPopup(auth, googleProvider);

        // Try to save profile to Firestore
        try {
            const docRef = doc(db, 'users', result.user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                const profile: UserProfile = {
                    name: result.user.displayName || 'User',
                    email: result.user.email || '',
                };
                await setDoc(docRef, profile);
            }
        } catch {
            // Silently fail - offline or permission issue
        }
    }

    // Update user profile
    async function updateUserProfile(data: Partial<UserProfile>) {
        if (!currentUser) return;

        try {
            const docRef = doc(db, 'users', currentUser.uid);
            await setDoc(docRef, data, { merge: true });
        } catch {
            // Silently fail - offline or permission issue
        }
        // Always update local state
        setUserProfile(prev => prev ? { ...prev, ...data } : null);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserProfile(user);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        // Set a timeout to prevent infinite loading
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 3000);

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const isProfileComplete = !!(userProfile?.isProfileComplete);
    const isAdmin = currentUser?.email === 'admin@admin.com';

    const value: AuthContextType = {
        currentUser,
        userProfile,
        loading,
        isProfileComplete,
        isAdmin,
        login,
        signup,
        logout,
        loginWithGoogle,
        updateUserProfile,
    };

    // Always render children, show loading state via context
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
