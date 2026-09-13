import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabase, isSupabaseConfigured } from "../config/supabase.js";
import { JWT_SECRET } from "../middleware/authMiddleware.js";
import { logAuditEvent } from "../services/auditLogger.js";

const IN_MEMORY_USERS = new Map();

// Helper to sanitize user object
const sanitizeUser = (user) => {
  const { password_hash, password, ...cleanUser } = user;
  return cleanUser;
};

export const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role = "customer",
      category,
      experienceYears,
      cooperative,
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: "USER_EXISTS",
          message: "User with this email already exists",
        },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newUser = {
      id: userId,
      full_name: fullName,
      email: normalizedEmail,
      phone,
      password_hash: passwordHash,
      role: role === "worker" ? "worker" : "customer",
      profile_info: {
        category: category || "general",
        experienceYears: Number(experienceYears) || 0,
        cooperative: cooperative || "Independent",
      },
      status: "ACTIVE",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let savedUser = null;
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("users")
          .insert([newUser])
          .select()
          .single();
        if (!error && data) {
          savedUser = data;
        } else if (error) {
          console.warn("[Register Warning] Supabase user insert failed");
        }
      } catch (dbErr) {
        console.warn("[Register Exception]");
      }
    }

    if (!savedUser) {
      IN_MEMORY_USERS.set(normalizedEmail, newUser);
      savedUser = newUser;
    }

    let linkedWorkerId = null;

    // If role is worker, automatically initialize corresponding worker profile in workers table
    if (role === "worker") {
      const workerId = `worker-${Date.now()}`;
      linkedWorkerId = workerId;
      const workerPayload = {
        id: workerId,
        user_id: userId,
        name: fullName,
        title: `${(category || "general")[0].toUpperCase()}${(category || "general").slice(1)} Specialist`,
        category: (category || "plumbing").toLowerCase(),
        cooperative: cooperative || "Independent Cooperative Federation",
        coop_id: `MDU-LAB-${Math.floor(1000 + Math.random() * 9000)}`,
        rating: 4.8,
        jobs_completed: 0,
        experience_years: Number(experienceYears) || 1,
        skill_fit_percent: 85,
        verified_skill_level: "Verified",
        status: "AVAILABLE",
        is_available: true,
        skills: [
          { name: category || "general", level: "Advanced", confidence: 90 },
        ],
        verifications: ["Phone Verified", "Identity Verified"],
        bio: `Professional ${category || "general"} technician registered on CO-OP OS.`,
      };

      if (isSupabaseConfigured()) {
        try {
          await supabase.from("workers").insert([workerPayload]);
        } catch (wErr) {}
      }
    }

    const token = jwt.sign(
      {
        id: savedUser.id,
        email: savedUser.email,
        role: savedUser.role,
        fullName: savedUser.full_name,
        workerId: linkedWorkerId,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    await logAuditEvent({
      actorUserId: savedUser.id,
      action: "USER_REGISTER",
      entityType: "USER",
      entityId: savedUser.id,
      metadata: { role: savedUser.role, email: savedUser.email },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      data: {
        user: sanitizeUser(savedUser),
        token,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to register user" },
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      });
    }

    // Update last login
    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from("users")
          .update({ last_login: new Date().toISOString() })
          .eq("id", user.id);
      } catch (e) {}
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    await logAuditEvent({
      actorUserId: user.id,
      action: "USER_LOGIN",
      entityType: "USER",
      entityId: user.id,
      metadata: { role: user.role },
      ipAddress: req.ip,
    });

    return res.status(200).json({
      success: true,
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to log in",
        details: err.message,
      },
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: "NOT_FOUND", message: "User profile not found" },
      });
    }

    return res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to retrieve user profile",
      },
    });
  }
};

// Internal Helper Functions
const findUserByEmail = async (email) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();
      if (!error && data) return data;
    } catch (err) {}
  }
  return IN_MEMORY_USERS.get(email) || null;
};

const findUserById = async (id) => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) return data;
    } catch (err) {}
  }
  for (const u of IN_MEMORY_USERS.values()) {
    if (u.id === id) return u;
  }
  return null;
};
