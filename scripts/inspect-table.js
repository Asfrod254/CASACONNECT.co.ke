const {
  createClient,
} = require("./backend/node_modules/@supabase/supabase-js");
require("dotenv").config({ path: "./backend/.env" });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function inspect() {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .limit(1);
  console.log("Error:", error);
  console.log("Data:", data);
}

inspect();
