import { RouterProvider } from 'react-router';
import { router } from '@/app/routes';
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { ChatBot } from '@/app/components/ChatBot';
import { MouseGlow, AnimatedBackground } from '@/app/components/MouseGlow';
import { NotesWidget } from '@/app/components/NotesWidget';

function AuthenticatedWidgets() {
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  return (
    <>
      <ChatBot />
      <NotesWidget />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MouseGlow />
      <AnimatedBackground />
      <RouterProvider router={router} />
      <AuthenticatedWidgets />
    </AuthProvider>
  );
}
