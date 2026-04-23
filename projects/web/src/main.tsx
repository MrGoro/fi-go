import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ToastProvider } from './hooks/use-toast.tsx'
import { Toaster } from './components/ui/toaster.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ToastProvider>
      <App />
      <Toaster />
    </ToastProvider>
  </StrictMode>,
)
