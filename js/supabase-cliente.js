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

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL  = 'REEMPLAZAR_URL';
const SUPABASE_ANON = 'REEMPLAZAR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
