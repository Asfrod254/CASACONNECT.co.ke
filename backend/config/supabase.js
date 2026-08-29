const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const supabaseAdmin = supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

const ensureSupabase = () => {
  if (!supabase) {
    const error = new Error(
      "Supabase is not configured. Please add SUPABASE_URL and SUPABASE_KEY to your .env file."
    );
    error.statusCode = 500;
    throw error;
  }

  return supabase;
};

const ensureSupabaseAdmin = () => {
  if (!supabaseAdmin) {
    const error = new Error(
      "Supabase service role is not configured. Add SUPABASE_SERVICE_ROLE_KEY for admin account creation."
    );
    error.statusCode = 503;
    throw error;
  }

  return supabaseAdmin;
};

module.exports = {
  supabase,
  ensureSupabase,
  ensureSupabaseAdmin,
};
