import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './hooks/ThemeProvider.tsx'
import { ToastProvider } from './hooks/ToastProvider.tsx'
import { Toaster } from './components/ui/toaster.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <App />
        <Toaster />
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
