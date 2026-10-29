/* ===================================================
   supabase-cliente.js
   
   Archivo de configuración de Supabase para el lado
   del CLIENTE (navegador). Solo contiene:
     - La URL del proyecto (pública, no es secreto)
     - La clave "anon" (pública, está diseñada para
       exponerse; la seguridad real está en RLS)
   
   IMPORTANTE: NUNCA pongas la clave service_role aquí.
   Ese archivo va solo en la Edge Function de Supabase.
   
   Cómo completar este archivo:
   1. Entra a https://supabase.com y abre tu proyecto
   2. Ve a Project Settings → API
   3. Copia "Project URL" → reemplaza REEMPLAZAR_URL
   4. Copia "anon public" → reemplaza REEMPLAZAR_ANON_KEY
   =================================================== */

/* =====================================================
   supabase-cliente.js — Configuración de Supabase.

   Solo contiene la URL pública y la clave anon.
   NUNCA pongas aquí la clave service_role.
   ===================================================== */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL  = 'https://tegwesymgwctelobwrjp.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlZ3dlc3ltZ3djdGVsb2J3cmpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNDE3OTEsImV4cCI6MjEwODgxNzc5MX0.PRDKYrScX2FM54K9yfb11N1fQL5-eD3zS8ebfXKiwM0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
