import { useState } from 'react';
import { AppProvider } from './lib/AppContext';
import { SessionProvider, useSession } from './lib/SessionContext';
import { Header } from './components/Header';
import { Landing } from './components/Landing';
import { Login } from './components/Login';
import { StudentDashboard } from './components/StudentDashboard';
import { BookingWizard } from './components/BookingWizard';
import { ConsultationView } from './components/ConsultationView';
import { TriageBoard } from './components/TriageBoard';
import { ChatPage } from './components/ChatPage';
import { AdminConsole } from './components/AdminConsole';
import { PrivacyNotice, Spinner } from './components/ui';

function AppContent() {
  const { currentUser, loading } = useSession();
  const [view, setView] = useState('landing');

  const navigate = (next: string) => {
    setView(next);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header onNavigate={navigate} currentView={view} />

      <main className="flex-1">
        {loading ? (
          <Spinner label="Loading clinic system..." />
        ) : view === 'landing' ? (
          <Landing onNavigate={navigate} />
        ) : view === 'login' ? (
          <Login onNavigate={navigate} />
        ) : !currentUser ? (
          <div className="mx-auto max-w-md px-4 py-16 text-center">
            <PrivacyNotice />
            <p className="mt-4 text-sm text-slate-500">Please sign in to access clinic features.</p>
            <button
              onClick={() => navigate('login')}
              className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              Go to sign in
            </button>
          </div>
        ) : view === 'dashboard' ? (
          <StudentDashboard onNavigate={navigate} />
        ) : view === 'book' ? (
          <BookingWizard onNavigate={navigate} />
        ) : view === 'consultations' ? (
          <ConsultationView />
        ) : view === 'sessions' ? (
          <ConsultationView counselorMode />
        ) : view === 'queue' ? (
          <TriageBoard />
        ) : view === 'chat' ? (
          <ChatPage />
        ) : view === 'admin' ? (
          currentUser.role === 'ADMIN' ? (
            <AdminConsole />
          ) : (
            <TriageBoard />
          )
        ) : (
          <Landing onNavigate={navigate} />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4">
        <p className="mx-auto max-w-7xl px-4 text-center text-xs text-slate-400">
          CampusCare Student Health Consultation System — demo data only. All patient
          information shown is fictional.
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <SessionProvider>
        <AppContent />
      </SessionProvider>
    </AppProvider>
  );
}
