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

  if (!supabase) {
    res.status(200).json({
      totalTokens: 0,
      totalSolPaid: 0,
      numberOfLoans: 0,
    });
    return;
  }

  try {
    // Get all loans
    const { data: loans, error } = await supabase
      .from("loans")
      .select("token_amount, sol_received");

    if (error) {
      console.error("Supabase error:", error);
      res.status(200).json({
        totalTokens: 0,
        totalSolPaid: 0,
        numberOfLoans: 0,
      });
      return;
    }

    const totalTokens = loans?.reduce((sum, loan) => sum + (loan.token_amount || 0), 0) || 0;
    const totalSolPaid = loans?.reduce((sum, loan) => sum + (loan.sol_received || 0), 0) || 0;
    const numberOfLoans = loans?.length || 0;

    res.status(200).json({
      totalTokens,
      totalSolPaid,
      numberOfLoans,
    });
  } catch (error) {
    console.error("Error fetching treasury stats:", error);
    res.status(200).json({
      totalTokens: 0,
      totalSolPaid: 0,
      numberOfLoans: 0,
    });
  }
}


