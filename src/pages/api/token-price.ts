import { NextApiRequest, NextApiResponse } from "next";

const TOKEN_MINT = "CB9dDufT3ZuQXqqSfa1c5kY935TEreyBw9XJXxHKpump";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    // Fetch token price from QuickNode API
    // This is a placeholder - you'll need to implement the actual QuickNode API call
    // For now, returning a mock price
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NODE}/api/token-price/${TOKEN_MINT}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      res.status(200).json({ price: data.price || 0.001 });
    } else {
      // Fallback to a mock price for development
      res.status(200).json({ price: 0.001 });
    }
  } catch (error) {
    console.error("Error fetching token price:", error);
    // Return mock price on error
    res.status(200).json({ price: 0.001 });
  }
}


