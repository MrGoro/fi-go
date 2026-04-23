import { useAuth } from './hooks/useAuth';
import { useSessionData } from './hooks/useSessionData';
import { AuthLayout } from './components/layout/AuthLayout';
import { MinimalLayout } from './components/layout/MinimalLayout';
import AppLayout from './components/layout/AppLayout';
import LoadingScreen from './components/layout/LoadingScreen';
import InputScreen from './components/features/timer/InputScreen';
import DisplayScreen from './components/features/timer/DisplayScreen';
import BreaksDrawer from './components/features/breaks/BreaksDrawer';
import LoginView from './components/features/auth/LoginView';
import { Button } from './components/ui/button';
import { LogOut } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const {
    startTime,
    breaks,
    loading: sessionLoading,
    clockIn,
    clockOut,
    addBreak,
    removeBreak,
  } = useSessionData();

  const loading = authLoading || (user && sessionLoading);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <AuthLayout>
        <LoginView />
      </AuthLayout>
    );
  }

  if (!startTime) {
    return (
      <MinimalLayout user={user} onLogout={logout}>
        <InputScreen onStart={clockIn} loading={sessionLoading} />
      </MinimalLayout>
    );
  }

  const bottomBar = (
    <div className="flex justify-around items-center w-full py-3 px-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-[rgba(229,23,63,0.1)]">
      <BreaksDrawer breaks={breaks} onAddBreak={addBreak} onRemoveBreak={removeBreak} startTime={startTime} />
      <Button
        variant="ghost"
        onClick={clockOut}
        className="flex flex-col gap-1 h-auto py-2.5 px-5 text-[#999] hover:text-[#E5173F] hover:bg-transparent"
      >
        <LogOut className="h-6 w-6" />
        <span className="text-[10px] font-medium uppercase tracking-wider">Feierabend</span>
      </Button>
    </div>
  );

  const desktopActions = (
    <>
      <BreaksDrawer breaks={breaks} onAddBreak={addBreak} onRemoveBreak={removeBreak} startTime={startTime} desktopMode />
      <Button
        onClick={clockOut}
        className="rounded-full bg-[#E5173F] text-white hover:bg-[#cc1538] shadow-[0_0_14px_rgba(229,23,63,0.38)] border-0"
      >
        <LogOut className="mr-2 h-4 w-4" /> Feierabend
      </Button>
    </>
  );

  return (
    <AppLayout
      user={user}
      onLogout={logout}
      bottomBar={bottomBar}
      desktopActions={desktopActions}
    >
      <DisplayScreen startTime={startTime} breaks={breaks} />
    </AppLayout>
  );
}
