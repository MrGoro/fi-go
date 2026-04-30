import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useSessionData } from './hooks/useSessionData';
import { AuthLayout } from './components/layout/AuthLayout';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingScreen } from './components/layout/LoadingScreen';
import { InputScreen } from './components/features/timer/InputScreen';
import { DisplayScreen } from './components/features/timer/DisplayScreen';
import { DailyMaxDialog } from './components/features/timer/DailyMaxDialog';
import { BreaksDrawer } from './components/features/breaks/BreaksDrawer';
import { LoginView } from './components/features/auth/LoginView';
import { Button } from './components/ui/button';
import { Surface } from './components/ui/surface';
import { BottomBarAction } from './components/ui/bottom-bar-action';
import { LogOut } from 'lucide-react';

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();
  const {
    startTime,
    breaks,
    dailyMaxOvertimeMinutes,
    loading: sessionLoading,
    clockIn,
    clockOut,
    addBreak,
    removeBreak,
    setDailyMaxOvertime,
  } = useSessionData();

  const [isDailyMaxOpen, setIsDailyMaxOpen] = useState(false);

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
      <AppLayout user={user} onLogout={logout} minimal>
        <InputScreen onStart={clockIn} loading={sessionLoading} />
      </AppLayout>
    );
  }

  const bottomBar = (
    <Surface variant="bar" className="flex justify-around items-center w-full py-3 px-4">
      <BreaksDrawer breaks={breaks} onAddBreak={addBreak} onRemoveBreak={removeBreak} startTime={startTime} />
      <BottomBarAction
        icon={<LogOut className="h-6 w-6" />}
        label="Feierabend"
        onClick={clockOut}
      />
    </Surface>
  );

  const desktopActions = (
    <>
      <BreaksDrawer breaks={breaks} onAddBreak={addBreak} onRemoveBreak={removeBreak} startTime={startTime} desktopMode />
      <Button
        onClick={clockOut}
        className="rounded-full bg-primary text-white hover:brightness-110 shadow-[0_0_14px_hsl(var(--primary)/0.38)] border-0"
      >
        <LogOut className="mr-2 h-4 w-4" /> Feierabend
      </Button>
    </>
  );

  const dailyMaxDialog = startTime ? (
    <DailyMaxDialog
      open={isDailyMaxOpen}
      onClose={() => setIsDailyMaxOpen(false)}
      startTime={startTime}
      breaks={breaks}
      currentValue={dailyMaxOvertimeMinutes}
      onSave={(v) => setDailyMaxOvertime(v)}
      onClear={() => setDailyMaxOvertime(null)}
    />
  ) : null;

  return (
    <AppLayout
      user={user}
      onLogout={logout}
      bottomBar={bottomBar}
      desktopActions={desktopActions}
      onOpenDailyMax={() => setIsDailyMaxOpen(true)}
      dailyMaxActive={dailyMaxOvertimeMinutes !== null}
      dailyMaxDialog={dailyMaxDialog}
    >
      <DisplayScreen startTime={startTime} breaks={breaks} maxOvertimeMinutes={dailyMaxOvertimeMinutes} />
    </AppLayout>
  );
}
