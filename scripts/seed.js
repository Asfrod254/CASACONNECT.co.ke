const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "./backend/.env" });

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://gvavzauiafltpchlrkio.supabase.co";
const SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2YXZ6YXVpYWZsdHBjaGxya2lvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzY4Njg1OSwiZXhwIjoyMTAzMjYyODU5fQ.VJ3Tqv4drptJRAXgI5IzItpvLjlq701sdj23cJaJO8A";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findOrCreateUser(email, password, name, role, company = "") {
  // Check if user exists in auth
  const { data: listData } = await supabase.auth.admin.listUsers();
  let user = listData?.users?.find((u) => u.email === email);

  if (!user) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });
    if (error) {
      console.error(`Failed to create auth user ${email}:`, error.message);
      return null;
    }
    user = created.user;
  }

  // Ensure public.users profile exists
  const { data: profile } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const { error: profileError } = await supabase.from("users").insert([
      {
        id: user.id,
        email,
        full_name: name,
        role,
        company,
        account_status: "active",
      },
    ]);
    if (profileError) {
      console.error(`Profile error for ${email}:`, profileError.message);
    }
  }

  return user.id;
}

async function runSeed() {
  console.log("Starting CasaConnect database seed...");

  // 1. Create Users
  const adminId = await findOrCreateUser(
    "admin@casaconnect.co",
    "Password123!",
    "System Administrator",
    "admin",
  );
  const landlord1Id = await findOrCreateUser(
    "daniel@casaconnect.co",
    "Password123!",
    "Daniel Karu",
    "landlord",
    "Karu Holdings",
  );
  const landlord2Id = await findOrCreateUser(
    "sarah@casaconnect.co",
    "Password123!",
    "Sarah Njeri",
    "landlord",
    "Highland Real Estate",
  );
  const tenant1Id = await findOrCreateUser(
    "alex@casaconnect.co",
    "Password123!",
    "Alex Omondi",
    "tenant",
  );
  const tenant2Id = await findOrCreateUser(
    "clara@casaconnect.co",
    "Password123!",
    "Clara Wanjiku",
    "tenant",
  );

  console.log("Users seeded successfully.");

  // 2. Check existing properties
  const { data: existingProps } = await supabase
    .from("properties")
    .select("id");
  if (!existingProps || existingProps.length === 0) {
    const propertiesToInsert = [
      {
        landlord_id: landlord1Id,
        title: "Sunflower Heights 2BR Suite",
        address: "14 Chania Avenue, Off Argwings Kodhek",
        city: "Kilimani",
        description:
          "Modern high-rise 2-bedroom apartment with panoramic city views, solar water heating, high-speed elevators, and backup generator.",
        rent: 65000,
        bedrooms: 2,
        bathrooms: 2,
        amenities: [
          "WiFi",
          "Gym",
          "Backup Generator",
          "Borehole Water",
          "24/7 Security",
          "Balcony",
        ],
        listing_status: "approved",
      },
      {
        landlord_id: landlord1Id,
        title: "The Mirage Executive 1BR",
        address: "Chiromo Road, Westlands",
        city: "Westlands",
        description:
          "Fully furnished executive 1-bedroom apartment close to Sarit Centre and Westgate. Includes dedicated underground parking and rooftop lounge.",
        rent: 45000,
        bedrooms: 1,
        bathrooms: 1,
        amenities: [
          "Furnished",
          "Swimming Pool",
          "High Speed Lifts",
          "Underground Parking",
          "CCTV",
        ],
        listing_status: "approved",
      },
      {
        landlord_id: landlord2Id,
        title: "Lavington Green Villa",
        address: "James Gichuru Road",
        city: "Lavington",
        description:
          "Spacious 3-bedroom standalone villa with private garden, DSQ for 1, electric fence, and fireplace. Quiet neighborhood close to international schools.",
        rent: 120000,
        bedrooms: 3,
        bathrooms: 3,
        amenities: [
          "Private Garden",
          "Fireplace",
          "DSQ",
          "Perimeter Wall",
          "Pet Friendly",
        ],
        listing_status: "approved",
      },
      {
        landlord_id: landlord2Id,
        title: "Riverside Court Penthouse",
        address: "Riverside Drive",
        city: "Riverside",
        description:
          "Luxury 3-bedroom penthouse with terrace, jacuzzi, fully fitted open-plan kitchen, and breathtaking forest views.",
        rent: 150000,
        bedrooms: 3,
        bathrooms: 4,
        amenities: [
          "Jacuzzi",
          "Terrace",
          "Fitted Kitchen",
          "Clubhouse",
          "Gym",
          "Concierge",
        ],
        listing_status: "approved",
      },
      {
        landlord_id: landlord1Id,
        title: "Parkview Studio Apartment",
        address: "Parklands 4th Avenue",
        city: "Parklands",
        description:
          "Charming studio apartment near Aga Khan Hospital. Ideal for medical residents or working professionals.",
        rent: 28000,
        bedrooms: 0,
        bathrooms: 1,
        amenities: ["WiFi", "Water Included", "Security Gate"],
        listing_status: "pending",
      },
    ];

    const { data: insertedProps, error: propError } = await supabase
      .from("properties")
      .insert(propertiesToInsert)
      .select("id, title, landlord_id");

    if (propError) {
      console.error("Property insert error:", propError.message);
    } else {
      console.log(`Inserted ${insertedProps.length} properties.`);

      const p1 = insertedProps[0];
      const p2 = insertedProps[1];
      const p3 = insertedProps[2];

      // 3. Insert Reviews
      if (p1 && tenant1Id) {
        await supabase.from("reviews").insert([
          {
            property_id: p1.id,
            tenant_id: tenant1Id,
            rating: 5,
            comment:
              "Exceptional building management, quiet neighbors, and uninterrupted water supply. Highly recommended!",
            moderation_status: "approved",
          },
        ]);
      }
      if (p2 && tenant2Id) {
        await supabase.from("reviews").insert([
          {
            property_id: p2.id,
            tenant_id: tenant2Id,
            rating: 4,
            comment:
              "Super convenient location for commuting. Sarit Centre is just 5 minutes walk. Gym is well maintained.",
            moderation_status: "approved",
          },
        ]);
      }

      // 4. Insert Rental Requests
      if (p1 && tenant1Id) {
        await supabase.from("rental_requests").insert([
          {
            property_id: p1.id,
            tenant_id: tenant1Id,
            status: "approved",
            message:
              "I am ready to move in on the 1st of next month. Can we schedule a contract signing?",
          },
        ]);
      }
      if (p2 && tenant2Id) {
        await supabase.from("rental_requests").insert([
          {
            property_id: p2.id,
            tenant_id: tenant2Id,
            status: "pending",
            message:
              "Hello, is this property available for immediate occupancy?",
          },
        ]);
      }

      // 5. Insert Messages
      if (p1 && tenant1Id) {
        await supabase.from("messages").insert([
          {
            property_id: p1.id,
            sender_id: tenant1Id,
            message:
              "Hello Daniel, I wanted to confirm if the deposit can be split into two installments?",
          },
          {
            property_id: p1.id,
            sender_id: landlord1Id,
            message:
              "Hi Alex! Yes, we can do 50% upon signing and the remainder by the end of the first month.",
          },
        ]);
      }

      // 6. Insert Payments
      if (p1 && tenant1Id) {
        await supabase.from("payments").insert([
          {
            property_id: p1.id,
            tenant_id: tenant1Id,
            landlord_id: landlord1Id,
            amount: 65000,
            currency: "KES",
            method: "mpesa",
            status: "paid",
            provider_reference: "QHX8294719",
          },
        ]);
      }
    }
  } else {
    console.log("Database already has properties.");
  }

  console.log("Seed completed successfully!");
}

runSeed().catch(console.error);
