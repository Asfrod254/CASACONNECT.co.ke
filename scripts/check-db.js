const https = require("https");

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YXZ6YXVpYWZsdHBjaGxya2lvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY4Njg1OSwiZXhwIjoyMTAzMjYyODU5fQ.VJ3Tqv4drptJRAXgI5IzItpvLjlq701sdj23cJaJO8A";
const base = "https://gvavzauiafltpchlrkio.supabase.co/rest/v1/";

const names = [
  "users",
  "properties",
  "reviews",
  "messages",
  "rental_requests",
  "payments",
];

function headCount(table) {
  return new Promise((resolve) => {
    const req = https.request(
      `${base}${table}?select=id&limit=1`,
      {
        method: "GET",
        headers: {
          apikey: token,
          Authorization: `Bearer ${token}`,
          Prefer: "count=exact",
        },
      },
      (res) => {
        res.resume();
        res.on("end", () =>
          resolve(
            `${table} => HTTP ${res.statusCode} | ${res.headers["content-range"] || "no range"}`,
          ),
        );
      },
    );
    req.on("error", () => resolve(`${table} => NETWORK ERROR`));
    req.end();
  });
}

(async () => {
  for (const t of names) {
    const line = await headCount(t);
    console.log(line);
  }
})();
