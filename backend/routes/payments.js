const express = require("express");

const { ensureSupabaseAdmin } = require("../config/supabase");
const { authenticateToken } = require("../middleware/auth");
const { createError } = require("../utils/errors");

const router = express.Router();
router.use(authenticateToken);

router.get("/", async (req, res, next) => {
  try {
    const client = ensureSupabaseAdmin();
    let query = client.from("payments").select("*").order("created_at", { ascending: false });
    if (req.user.role === "tenant") query = query.eq("tenant_id", req.user.id);
    if (req.user.role === "landlord") query = query.eq("landlord_id", req.user.id);
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ success: true, payments: data || [] });
  } catch (error) { return next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    if (req.user.role !== "tenant") return next(createError(403, "Only tenants can create payments."));
    const { property_id: propertyId, amount, currency = "KES", method = "other", provider_reference: providerReference } = req.body || {};
    if (!propertyId || !amount || Number(amount) <= 0) return next(createError(400, "Property and a positive amount are required."));
    if (!["mpesa", "stripe", "bank_transfer", "other"].includes(method)) return next(createError(400, "Invalid payment method."));
    const client = ensureSupabaseAdmin();
    const { data: property, error: propertyError } = await client.from("properties").select("landlord_id").eq("id", propertyId).maybeSingle();
    if (propertyError) throw propertyError;
    if (!property) return next(createError(404, "Property not found."));
    const { data, error } = await client.from("payments").insert([{ property_id: propertyId, tenant_id: req.user.id, landlord_id: property.landlord_id, amount: Number(amount), currency, method, provider_reference: providerReference || null }]).select("*").single();
    if (error) throw error;
    return res.status(201).json({ success: true, payment: data });
  } catch (error) { return next(error); }
});

module.exports = router;
