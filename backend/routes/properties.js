const express = require("express");

const { ensureSupabaseAdmin } = require("../config/supabase");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { validateRequired } = require("../middleware/validate");
const { createError } = require("../utils/errors");

const router = express.Router();
const MAX_RENT_AMOUNT = 9999999999.99;

const validateRentAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_RENT_AMOUNT) {
    throw createError(400, 'Rent must be a valid positive amount under 10,000,000,000.');
  }
  return amount;
};

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
      // Ignore invalid JSON and continue with a single URL value.
    }

    return [trimmed];
  }

  return [];
};

const buildPropertyData = (input = {}, landlordId) => {
  const rentValue = validateRentAmount(input.rent);

  const propertyData = {
    title: String(input.title ?? "").trim(),
    address: String(input.address ?? "").trim(),
    city: String(input.city ?? "").trim(),
    description: String(input.description ?? "").trim(),
    rent: rentValue,
    landlord_id: landlordId,
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

const mapLegacyProperty = (property) => {
  if (!property) return property;
  const imageList = normalizeImageArray(property.images ?? property.image_url);
  return {
    ...property,
    image_url: imageList[0] || property.image_url || "",
    images: imageList.length ? imageList : Array.isArray(property.images) ? property.images : [],
  };
};

router.get("/", async (req, res, next) => {
  try {
    const client = ensureSupabaseAdmin();
    let query = client
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    // Role-aware visibility.
    if (req.user?.role === "landlord") {
      query = query.eq("landlord_id", req.user.id);
    } else if (req.user?.role !== "admin") {
      query = query.eq("listing_status", "approved");
    }

    // Explicit status filter (admin mainly).
    if (req.query.status) {
      query = query.eq("listing_status", String(req.query.status).toLowerCase());
    }

    // Search & filters for the marketplace.
    if (req.query.city) {
      query = query.ilike("city", `%${String(req.query.city).trim()}%`);
    }
    if (req.query.q) {
      query = query.or(
        `title.ilike.%${String(req.query.q).trim()}%,address.ilike.%${String(req.query.q).trim()}%,city.ilike.%${String(req.query.q).trim()}%`
      );
    }
    if (req.query.minRent) {
      query = query.gte("rent", Number(req.query.minRent));
    }
    if (req.query.maxRent) {
      query = query.lte("rent", Number(req.query.maxRent));
    }
    if (req.query.bedrooms) {
      query = query.gte("bedrooms", Number(req.query.bedrooms));
    }
    if (req.query.amenity) {
      query = query.contains("amenities", [String(req.query.amenity).trim()]);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: data?.length || 0,
      properties: (data || []).map(mapLegacyProperty),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/mine", authenticateToken, requireRole("landlord"), async (req, res, next) => {
  try {
    const client = ensureSupabaseAdmin();
    const { data, error } = await client
      .from("properties")
      .select("*")
      .eq("landlord_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: data?.length || 0,
      properties: (data || []).map(mapLegacyProperty),
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = ensureSupabaseAdmin();

    const { data, error } = await client
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return next(createError(404, "Property not found."));
      }
      throw error;
    }

    // Hide non-approved listings from the public marketplace.
    if (data.listing_status !== "approved") {
      const isOwner =
        req.user && (req.user.role === "admin" || (req.user.role === "landlord" && req.user.id === data.landlord_id));
      if (!isOwner) {
        return next(createError(404, "Property not found."));
      }
    }

    return res.status(200).json({
      success: true,
      property: data,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/", authenticateToken, requireRole("landlord"), async (req, res, next) => {
  try {
    const requiredFields = ["title", "address", "city", "rent"];
    const missingFields = validateRequired(req.body, requiredFields);

    if (missingFields.length > 0) {
      return next(createError(400, "Missing required property fields.", missingFields));
    }

    const client = ensureSupabaseAdmin();
    const propertyData = buildPropertyData(req.body, req.user.id);

    let result = await client.from("properties").insert([propertyData]).select("*").single();

    if (result.error && /available_from|image_url|images/i.test(result.error.message || "")) {
      const fallback = { ...propertyData };
      delete fallback.available_from;
      result = await client.from("properties").insert([fallback]).select("*").single();
    }

    if (result.error) {
      throw result.error;
    }

    return res.status(201).json({
      success: true,
      property: mapLegacyProperty(result.data),
    });
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", authenticateToken, requireRole("landlord"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = ensureSupabaseAdmin();

    const { data: existingProperty, error: fetchError } = await client
      .from("properties")
      .select("id, landlord_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return next(createError(404, "Property not found."));
      }
      throw fetchError;
    }

    if (existingProperty.landlord_id !== req.user.id) {
      return next(createError(403, "You can only update your own properties."));
    }

    const editableFields = ["title", "address", "city", "description", "rent", "available_from", "bedrooms", "bathrooms", "amenities", "image_url", "images"];
    const updates = Object.fromEntries(
      editableFields
        .filter((field) => req.body[field] !== undefined)
        .map((field) => [field, req.body[field]])
    );

    if (updates.rent !== undefined) {
      updates.rent = validateRentAmount(updates.rent);
    }
    if (updates.bedrooms !== undefined) {
      updates.bedrooms = Number(updates.bedrooms || 1);
    }
    if (updates.bathrooms !== undefined) {
      updates.bathrooms = Number(updates.bathrooms || 1);
    }
    if (updates.amenities !== undefined) {
      updates.amenities = Array.isArray(updates.amenities)
        ? updates.amenities
        : String(updates.amenities)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }
    const imageList = normalizeImageArray(updates.images ?? updates.image_url);
    if (imageList.length > 0) {
      updates.images = imageList;
    }
    delete updates.image_url;
    if (updates.available_from === undefined || updates.available_from === null || String(updates.available_from).trim() === "") {
      delete updates.available_from;
    }

    const { data, error } = await client
      .from("properties")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      property: mapLegacyProperty(data),
    });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", authenticateToken, requireRole("landlord"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = ensureSupabaseAdmin();

    const { data: existingProperty, error: fetchError } = await client
      .from("properties")
      .select("id, landlord_id")
      .eq("id", id)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        return next(createError(404, "Property not found."));
      }
      throw fetchError;
    }

    if (existingProperty.landlord_id !== req.user.id) {
      return next(createError(403, "You can only delete your own properties."));
    }

    const { error } = await client.from("properties").delete().eq("id", id);
    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Property deleted successfully.",
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id/reviews", async (req, res, next) => {
  try {
    const { id } = req.params;
    const client = ensureSupabaseAdmin();

    const { data, error } = await client
      .from("reviews")
      .select("*, users(full_name)")
      .eq("property_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      reviews: data || [],
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/reviews", authenticateToken, requireRole("tenant"), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body || {};

    if (!rating) {
      return next(createError(400, "A rating is required."));
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return next(createError(400, "Rating must be a number between 1 and 5."));
    }

    const client = ensureSupabaseAdmin();
    const { data, error } = await client
      .from("reviews")
      .insert([
        {
          property_id: id,
          tenant_id: req.user.id,
          rating: numericRating,
          comment: comment || "",
        },
      ])
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return next(createError(409, "You have already reviewed this property."));
      }
      throw error;
    }

    return res.status(201).json({
      success: true,
      review: data,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
