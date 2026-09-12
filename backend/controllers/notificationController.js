import { supabase, isSupabaseConfigured } from "../config/supabase.js";

const MEMORY_NOTIFICATIONS = [];

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          return res.status(200).json({ success: true, data });
        }
      } catch (err) {}
    }

    const filtered = MEMORY_NOTIFICATIONS.filter((n) => n.user_id === userId);
    return res.status(200).json({ success: true, data: filtered });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to fetch notifications" },
    });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .update({ read_status: true })
          .eq("id", id)
          .eq("user_id", userId)
          .select()
          .single();

        if (!error && data) return res.status(200).json({ success: true, data });
      } catch (err) {}
    }

    const match = MEMORY_NOTIFICATIONS.find((n) => n.id === id && n.user_id === userId);
    if (match) match.read_status = true;

    return res.status(200).json({ success: true, data: match || { id, read_status: true } });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: "SERVER_ERROR", message: "Failed to update notification" },
    });
  }
};
