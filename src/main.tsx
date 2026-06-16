import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const REQUIRED_VARS: string[] = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
for (const key of REQUIRED_VARS) {
  if (!import.meta.env[key]) {
    throw new Error(`Missing required environment variable: ${key}. Check your .env file.`);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
  
 