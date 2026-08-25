const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('[Supabase Client] Initialized successfully with URL:', supabaseUrl);
} else {
  console.warn('[Supabase Client] SUPABASE_URL or SUPABASE_ANON_KEY environment variables are missing.');
}

module.exports = { supabase };
