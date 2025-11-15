import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { wallet } = req.query;

  if (!wallet || typeof wallet !== "string") {
    res.status(400).json({ error: "Wallet address required" });
    return;
  }

  if (!supabase) {
    res.status(503).json({ error: "Database not configured", loans: [] });
    return;
  }

  try {
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("wallet_address", wallet)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      res.status(500).json({ error: "Database error", loans: [] });
      return;
    }

    res.status(200).json({ loans: data || [] });
  } catch (error) {
    console.error("Error fetching loans:", error);
    res.status(500).json({ error: "Internal server error", loans: [] });
  }
}


