const express = require("express");

const { ensureSupabaseAdmin } = require("../config/supabase");
const { authenticateToken } = require("../middleware/auth");
const { createError } = require("../utils/errors");

const router = express.Router();

const ensureParticipant = async (client, propertyId, user) => {
  const { data: property, error: propertyError } = await client
    .from("properties")
    .select("id, landlord_id")
    .eq("id", propertyId)
    .maybeSingle();
  if (propertyError) throw propertyError;
  if (!property) throw createError(404, "Property not found.");
  if (user.role === "landlord" && property.landlord_id !== user.id) {
    throw createError(403, "You can only access messages for your properties.");
  }
  if (user.role === "tenant") {
    const { data: request, error: requestError } = await client
      .from("rental_requests")
      .select("id")
      .eq("property_id", propertyId)
      .eq("tenant_id", user.id)
      .maybeSingle();
    if (requestError) throw requestError;
    if (!request) throw createError(403, "Submit a rental request before messaging about this property.");
  }
};

router.get("/:propertyId", authenticateToken, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const client = ensureSupabaseAdmin();
    await ensureParticipant(client, propertyId, req.user);

    const { data, error } = await client
      .from("messages")
      .select("*")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      messages: data || [],
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/:propertyId", authenticateToken, async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { message } = req.body || {};

    if (!message || !String(message).trim()) {
      return next(createError(400, "Message content is required."));
    }

    const client = ensureSupabaseAdmin();
    await ensureParticipant(client, propertyId, req.user);
    const { data, error } = await client
      .from("messages")
      .insert([
        {
          property_id: propertyId,
          sender_id: req.user.id,
          message: String(message).trim(),
        },
      ])
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: data,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
