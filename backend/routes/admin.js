const express = require("express");

const { ensureSupabaseAdmin } = require("../config/supabase");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();
const MAX_RENT_AMOUNT = 9999999999.99;

const validateRentAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_RENT_AMOUNT) {
    throw new Error('Rent must be a valid positive amount under 10,000,000,000.');
  }
  return amount;
};

router.use(authenticateToken, requireRole("admin"));

const list = (table, select = "*") => async (req, res, next) => {
  try {
    const { data, error } = await ensureSupabaseAdmin().from(table).select(select).order("created_at", { ascending: false });
    if (error) throw error;
    return res.json({ success: true, [table]: data || [] });
  } catch (error) { return next(error); }
};

router.get("/users", list("users"));
router.get("/properties", list("properties"));

const normalizeImageArray = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      // Keep the raw value as a single image string.
    }

    return [trimmed];
  }

  return [];
};

const buildPropertyPayload = (input = {}, landlordId) => {
  const rentValue = validateRentAmount(input.rent);

  const propertyData = {
    title: String(input.title ?? "").trim(),
    address: String(input.address ?? "").trim(),
    city: String(input.city ?? "").trim(),
    description: String(input.description ?? "").trim(),
    rent: rentValue,
    landlord_id: landlordId || input.landlord_id || null,
    bedrooms: Number(input.bedrooms ?? 1),
    bathrooms: Number(input.bathrooms ?? 1),
    amenities: Array.isArray(input.amenities)
      ? input.amenities
      : String(input.amenities ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
  };

  const imageList = normalizeImageArray(input.images ?? input.image_url);
  if (imageList.length > 0) {
    propertyData.images = imageList;
  }

  if (input.available_from !== undefined && input.available_from !== null && String(input.available_from).trim() !== "") {
    propertyData.available_from = input.available_from;
  }

  return propertyData;
};

router.post("/properties", async (req, res, next) => {
  try {
    const requiredFields = ["title", "address", "city", "rent"];
    const missingFields = requiredFields.filter((field) => !req.body?.[field] && req.body?.[field] !== 0);

    if (missingFields.length > 0) {
      return res.status(400).json({ success: false, message: "Missing required property fields.", missing: missingFields });
    }

    const client = ensureSupabaseAdmin();
    const propertyData = buildPropertyPayload(req.body, req.body.landlord_id || req.user.id);

    let result = await client.from("properties").insert([propertyData]).select("*").single();
    if (result.error && /available_from|image_url|images/i.test(result.error.message || "")) {
      const fallback = { ...propertyData };
      delete fallback.available_from;
      result = await client.from("properties").insert([fallback]).select("*").single();
    }
    if (result.error) throw result.error;

    return res.status(201).json({ success: true, property: result.data });
  } catch (error) {
    return next(error);
  }
});
router.get("/reviews", list("reviews", "*, properties(title)"));
router.get("/messages", async (req, res, next) => {
  try {
    const { data, error } = await ensureSupabaseAdmin()
      .from("messages")
      .select("*, properties(title), sender:users!sender_id(full_name, email, role)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return res.json({ success: true, messages: data || [] });
  } catch (e) { return next(e); }
});
router.get("/payments", list("payments"));
router.get("/requests", async (req, res, next) => {
  try {
    const { data, error } = await ensureSupabaseAdmin()
      .from("rental_requests")
      .select("*, properties(title, city, rent), tenant:users!tenant_id(full_name, email)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return res.json({ success: true, requests: data || [] });
  } catch (e) { return next(e); }
});
router.get("/landlords", async (req, res, next) => {
  try {
    const { data, error } = await ensureSupabaseAdmin()
      .from("users")
      .select("id, full_name, email, phone, company, account_status, created_at")
      .eq("role", "landlord")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return res.json({ success: true, landlords: data || [] });
  } catch (e) { return next(e); }
});
router.get("/stats", async (req, res, next) => {
  try {
    const client = ensureSupabaseAdmin();
    const tables = ["users", "properties", "reviews", "messages", "payments"];
    const counts = await Promise.all(tables.map(async (table) => {
      const { count, error } = await client.from(table).select("id", { count: "exact", head: true });
      if (error) throw error;
      return [table, count || 0];
    }));

    const { count: pendingProperties, error: pendingError } = await client
      .from("properties").select("id", { count: "exact", head: true }).eq("listing_status", "pending");
    if (pendingError) throw pendingError;

    const { count: flaggedReviews, error: reviewError } = await client
      .from("reviews").select("id", { count: "exact", head: true }).eq("moderation_status", "flagged");
    if (reviewError) throw reviewError;

    return res.json({
      success: true,
      stats: {
        ...Object.fromEntries(counts),
        pendingProperties: pendingProperties || 0,
        flaggedReviews: flaggedReviews || 0,
      },
    });
  } catch (error) { return next(error); }
});

router.get("/analytics", async (req, res, next) => {
  try {
    const client = ensureSupabaseAdmin();

    const [userRes, propertyRes, reviewRes, paymentRes] = await Promise.all([
      client.from("users").select("created_at").gte("created_at", new Date(Date.now() - 365 * 24 * 3600 * 1000).toISOString()).order("created_at"),
      client.from("properties").select("listing_status, city, rent"),
      client.from("reviews").select("rating"),
      client.from("payments").select("amount, status, created_at"),
    ]);

    const month = (iso) => iso ? iso.slice(0, 7) : "unknown";
    const userByMonth = {};
    (userRes.data || []).forEach((u) => { const m = month(u.created_at); userByMonth[m] = (userByMonth[m] || 0) + 1; });

    const statusCounts = {};
    const cityCounts = {};
    const rentByCity = {};
    (propertyRes.data || []).forEach((p) => {
      statusCounts[p.listing_status] = (statusCounts[p.listing_status] || 0) + 1;
      cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
      rentByCity[p.city] = (rentByCity[p.city] || 0) + p.rent;
    });

    const revenueByMonth = {};
    (paymentRes.data || [])
      .filter((p) => p.status === "paid")
      .forEach((p) => {
        const m = month(p.created_at);
        revenueByMonth[m] = (revenueByMonth[m] || 0) + Number(p.amount || 0);
      });

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    (reviewRes.data || []).forEach((r) => { if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating] += 1; });
    const totalRatings = (reviewRes.data || []).length;
    const averageRating = totalRatings
      ? (Object.entries(ratingCounts).reduce((sum, [rating, count]) => sum + Number(rating) * count, 0) / totalRatings).toFixed(2)
      : "0.00";

    return res.json({
      success: true,
      analytics: {
        usersByMonth: Object.entries(userByMonth).sort().map(([monthKey, count]) => ({ month: monthKey, count })),
        propertyStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
        propertiesByCity: Object.entries(cityCounts).map(([city, count]) => ({ city, count })),
        revenueByMonth: Object.entries(revenueByMonth).sort().map(([monthKey, amount]) => ({ month: monthKey, amount: Math.round(amount) })),
        ratingDistribution: ratingCounts,
        averageRating: Number(averageRating),
        totalRatings,
      },
    });
  } catch (error) { return next(error); }
});

router.patch("/requests/:id", async (req, res, next) => {
  try {
    const status = String(req.body?.status || "").toLowerCase();
    if (!["pending","approved","rejected","withdrawn"].includes(status)) return res.status(400).json({ success: false, message: "Invalid status." });
    const { data, error } = await ensureSupabaseAdmin().from("rental_requests").update({ status }).eq("id", req.params.id).select("*").single();
    if (error) throw error;
    return res.json({ success: true, request: data });
  } catch (e) { return next(e); }
});

router.delete("/properties/:id", async (req, res, next) => {
  try {
    const { error } = await ensureSupabaseAdmin().from("properties").delete().eq("id", req.params.id);
    if (error) throw error;
    return res.json({ success: true });
  } catch (e) { return next(e); }
});

router.delete("/users/:id", async (req, res, next) => {
  try {
    const { error } = await ensureSupabaseAdmin().from("users").delete().eq("id", req.params.id);
    if (error) throw error;
    return res.json({ success: true });
  } catch (e) { return next(e); }
});

router.patch("/users/:id", async (req, res, next) => {
  try {
    const allowed = ["role", "account_status"];
    const updates = Object.fromEntries(allowed.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    const { data, error } = await ensureSupabaseAdmin().from("users").update(updates).eq("id", req.params.id).select("*").single();
    if (error) throw error;
    return res.json({ success: true, user: data });
  } catch (error) { return next(error); }
});

router.patch("/properties/:id", async (req, res, next) => {
  try {
    const allowed = ["listing_status", "title", "address", "city", "description", "rent", "bedrooms", "bathrooms", "amenities", "image_url"];
    const updates = Object.fromEntries(allowed.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    const { data, error } = await ensureSupabaseAdmin().from("properties").update(updates).eq("id", req.params.id).select("*").single();
    if (error) throw error;
    return res.json({ success: true, property: data });
  } catch (error) { return next(error); }
});

router.patch("/reviews/:id", async (req, res, next) => {
  try {
    const status = String(req.body.moderation_status || "").toLowerCase();
    if (!["pending", "approved", "flagged", "removed"].includes(status)) return res.status(400).json({ success: false, message: "Invalid moderation status." });
    const { data, error } = await ensureSupabaseAdmin().from("reviews").update({ moderation_status: status }).eq("id", req.params.id).select("*").single();
    if (error) throw error;
    return res.json({ success: true, review: data });
  } catch (error) { return next(error); }
});

module.exports = router;
