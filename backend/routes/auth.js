const express = require("express");
const { ensureSupabase, ensureSupabaseAdmin } = require("../config/supabase");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { createError } = require("../utils/errors");
const { signToken } = require("../utils/token");
const { isValidEmail } = require("../middleware/validate");

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body || {};

    if (!name || !email || !password) {
      return next(createError(400, "Name, email, and password are required."));
    }

    if (!isValidEmail(email)) {
      return next(createError(400, "Please provide a valid email address."));
    }

    if (password.length < 6) {
      return next(createError(400, "Password must be at least 6 characters long."));
    }

    const normalizedRole = String(role || "tenant").toLowerCase();
    if (!['tenant', 'landlord'].includes(normalizedRole)) {
      return next(createError(400, "Role must be either tenant or landlord."));
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const client = ensureSupabase();

    if (normalizedRole === "landlord") {
      return next(createError(403, "Landlord accounts can only be created by an administrator."));
    }

    const profileClient = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? ensureSupabaseAdmin()
      : client;
    const { data: existingUser, error: existingError } = await profileClient
      .from("users")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingError && existingError.code !== "PGRST116") {
      throw existingError;
    }

    if (existingUser) {
      return next(createError(409, "A user with this email already exists."));
    }

    const authResult = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await profileClient.auth.admin.createUser({
          email: cleanEmail,
          password,
          email_confirm: true,
          user_metadata: { name: String(name).trim(), role: normalizedRole },
        })
      : await client.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { name: String(name).trim(), role: normalizedRole } },
        });
    const { data: authData, error: authError } = authResult;
    if (authError) {
      return next(createError(400, authError.message));
    }
    if (!authData?.user) {
      return next(createError(400, "Account creation requires a confirmed email session."));
    }

    const { data, error } = await profileClient
      .from("users")
      .insert([{ id: authData.user.id, email: cleanEmail, full_name: String(name).trim(), phone: String(phone || '').trim(), role: normalizedRole }])
      .select("id, email, role, created_at")
      .single();

    if (error) {
      await profileClient.auth.admin.deleteUser(authData.user.id);
      throw error;
    }

    let supabaseSession = authData.session || null;
    const token = authData.session?.access_token || signToken(data);

    // Fresh sign-ins get a real Supabase session so the frontend can open
    // realtime subscriptions (messages).
    if (!supabaseSession && process.env.SUPABASE_KEY) {
      try {
        const refresh = await client.auth.signInWithPassword({ email: cleanEmail, password });
        supabaseSession = refresh.data?.session || null;
      } catch {
        supabaseSession = null;
      }
    }

    return res.status(201).json({
      success: true,
      token,
      supabaseSession: supabaseSession
        ? { access_token: supabaseSession.access_token, expires_at: supabaseSession.expires_at }
        : null,
      user: {
        id: data.id,
        name: String(name).trim(),
        email: data.email,
        role: data.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/landlords", authenticateToken, requireRole("admin"), async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body || {};
    const trimmedName = String(name || "").trim();
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanedPhone = String(phone || "").trim();
    const cleanPassword = String(password || "");

    if (!trimmedName || !cleanEmail || !cleanPassword) {
      return next(createError(400, "Name, email, and password are required."));
    }
    if (!isValidEmail(cleanEmail) || cleanPassword.length < 6) {
      return next(createError(400, "Provide a valid email and a password of at least 6 characters."));
    }

    const adminClient = ensureSupabaseAdmin();
    const { data: existingProfile, error: existingProfileError } = await adminClient
      .from("users")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();
    if (existingProfileError) throw existingProfileError;
    if (existingProfile) {
      return next(createError(409, "A user with this email already exists."));
    }

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: cleanPassword,
      email_confirm: true,
      user_metadata: { name: trimmedName, role: "landlord" },
    });
    if (authError) {
      return next(createError(400, authError.message));
    }

    const { data, error } = await adminClient
      .from("users")
      .insert([
        {
          id: authData.user.id,
          email: cleanEmail,
          full_name: trimmedName,
          phone: cleanedPhone,
          role: "landlord",
        },
      ])
      .select("id, email, role, created_at, phone")
      .single();
    if (error) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      throw error;
    }

    return res.status(201).json({
      success: true,
      token: signToken(data),
      user: { id: data.id, name: trimmedName, email: data.email, role: data.role, phone: data.phone || cleanedPhone },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return next(createError(400, "Please provide a valid email address."));
    }

    const client = ensureSupabase();

    // Always return success to avoid email enumeration
    const redirectTo = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password`;
    await client.auth.resetPasswordForEmail(email, { redirectTo });

    return res.status(200).json({
      success: true,
      message: "If this email is registered, a reset link has been sent.",
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const access_token = String(req.body?.access_token || "").trim();
    const password = String(req.body?.password || "");

    if (!access_token || !password) {
      return next(createError(400, "Access token and new password are required."));
    }
    if (password.length < 6) {
      return next(createError(400, "Password must be at least 6 characters long."));
    }

    // Use the user's own session token to update their password
    const { createClient } = require('@supabase/supabase-js');
    const userClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
      global: { headers: { Authorization: `Bearer ${access_token}` } },
    });

    const { error } = await userClient.auth.updateUser({ password });
    if (error) {
      return next(createError(400, error.message || "Unable to reset password."));
    }

    return res.status(200).json({
      success: true,
      message: "Your password was reset successfully. Please sign in again.",
    });
  } catch (error) {
    return next(error);
  }
});

router.patch("/profile", authenticateToken, async (req, res, next) => {
  try {
    const allowed = ["full_name", "phone", "preferred_area", "company"];
    const updates = Object.fromEntries(
      allowed.filter((f) => req.body[f] !== undefined).map((f) => [f, String(req.body[f] || "").trim()])
    );
    if (!Object.keys(updates).length) return next(createError(400, "No valid fields to update."));
    const { data, error } = await ensureSupabaseAdmin()
      .from("users").update(updates).eq("id", req.user.id).select("id, email, role, full_name, phone, preferred_area, company").single();
    if (error) throw error;
    return res.json({ success: true, user: data });
  } catch (error) { return next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return next(createError(400, "Email and password are required."));
    }

    if (!isValidEmail(email)) {
      return next(createError(400, "Please provide a valid email address."));
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const client = ensureSupabase();

    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (authError || !authData.user) {
      return next(createError(400, "Invalid credentials"));
    }

    const profileClient = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? ensureSupabaseAdmin()
      : client;
    const { data, error } = await profileClient
      .from("users")
      .select("id, email, role")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!data) {
      return next(createError(400, "Invalid credentials"));
    }

    const token = signToken({
      id: data.id,
      email: data.email,
      role: data.role,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      supabaseSession: authData.session
        ? { access_token: authData.session.access_token, expires_at: authData.session.expires_at }
        : null,
      user: {
        id: data.id,
        name: authData.user.user_metadata?.name || cleanEmail.split("@")[0],
        email: data.email,
        role: data.role,
      },
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
