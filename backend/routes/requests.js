const express = require("express");

const { ensureSupabaseAdmin } = require("../config/supabase");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { createError } = require("../utils/errors");

const router = express.Router();
const requestStatuses = ["pending", "approved", "rejected", "withdrawn"];

router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const client = ensureSupabaseAdmin();
    let query = client
      .from("rental_requests")
      .select("*, properties(id, title, landlord_id)")
      .order("created_at", { ascending: false });

    if (req.user.role === "tenant") {
      query = query.eq("tenant_id", req.user.id);
    } else if (req.user.role === "landlord") {
      const { data: properties, error: propertyError } = await client
        .from("properties")
        .select("id")
        .eq("landlord_id", req.user.id);
      if (propertyError) throw propertyError;
      query = query.in("property_id", (properties || []).map((property) => property.id));
    } else if (req.user.role !== "admin") {
      return next(createError(403, "You do not have permission to view requests."));
    }

    const { data, error } = await query;
    if (error) throw error;
    return res.status(200).json({ success: true, requests: data || [] });
  } catch (error) {
    return next(error);
  }
});

router.post("/", authenticateToken, requireRole("tenant"), async (req, res, next) => {
  try {
    const { property_id: propertyId, message = "" } = req.body || {};
    if (!propertyId) return next(createError(400, "Property is required."));

    const client = ensureSupabaseAdmin();
    const { data: property, error: propertyError } = await client
      .from("properties")
      .select("id")
      .eq("id", propertyId)
      .maybeSingle();
    if (propertyError) throw propertyError;
    if (!property) return next(createError(404, "Property not found."));

    const { data, error } = await client
      .from("rental_requests")
      .insert([{ property_id: propertyId, tenant_id: req.user.id, message: String(message).trim() }])
      .select("*, properties(id, title, landlord_id)")
      .single();
    if (error) {
      if (error.code === "23505") return next(createError(409, "You already have a request for this property."));
      throw error;
    }
    return res.status(201).json({ success: true, request: data });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id", authenticateToken, requireRole("landlord", "admin"), async (req, res, next) => {
  try {
    const status = String(req.body?.status || "").toLowerCase();
    if (!requestStatuses.includes(status)) return next(createError(400, "Invalid request status."));

    const client = ensureSupabaseAdmin();
    const { data: request, error: requestError } = await client
      .from("rental_requests")
      .select("id, property_id, properties(landlord_id)")
      .eq("id", req.params.id)
      .maybeSingle();
    if (requestError) throw requestError;
    if (!request) return next(createError(404, "Rental request not found."));
    if (req.user.role === "landlord" && request.properties?.landlord_id !== req.user.id) {
      return next(createError(403, "You can only manage requests for your properties."));
    }

    const { data, error } = await client
      .from("rental_requests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .select("*, properties(id, title, landlord_id)")
      .single();
    if (error) throw error;
    return res.status(200).json({ success: true, request: data });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
