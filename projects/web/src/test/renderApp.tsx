import { render } from '@testing-library/react';
import App from '@/App';
import { ThemeProvider } from '@/hooks/ThemeProvider';
import { ToastProvider } from '@/hooks/ToastProvider';
import { Toaster } from '@/components/ui/toaster';

/** Renders the full app inside the same provider stack as main.tsx (sans StrictMode). */
export function renderApp() {
  return render(
    <ThemeProvider>
      <ToastProvider>
        <App />
        <Toaster />
      </ToastProvider>
    </ThemeProvider>,
  );
}
