import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { publicKey, orderData, marketPk, priceData } = req.body;
      
      // Validate required fields
      if (!publicKey || !marketPk || !orderData || !priceData) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      // Validate publicKey format
      if (typeof publicKey !== 'string' || publicKey.length < 32 || publicKey.length > 44) {
        res.status(400).json({ error: "Invalid publicKey format" });
        return;
      }

      // Validate marketPk format
      if (typeof marketPk !== 'string' || marketPk.length < 32 || marketPk.length > 44) {
        res.status(400).json({ error: "Invalid marketPk format" });
        return;
      }

      const {
        marketPriceSummary,
        marketOutcomesSummary,
        liquidityTotal,
        matchedTotal,
        totalUnmatchedOrders,
      } = priceData;
      const orderAccounts = orderData.data.orderAccounts;

      const client = await clientPromise;
      const users = client.db("pascal").collection("users");
      // Update user collection in db
      const user = await users.updateOne(
        { userPk: publicKey },
        { $set: { orderAccounts } },
        { upsert: true }
      );
      console.log(
        `A document is inserted into markets with the user publicKey: ${user}`
      );

      // Update market collection's outcomeAccount in db
      const markets = client.db("pascal").collection("market");
      const market = await markets.updateOne(
        { publicKey: marketPk },
        {
          $set: {
            marketPriceSummary: marketPriceSummary,
            liquidityTotal: liquidityTotal,
            matchedTotal: matchedTotal,
            totalUnmatchedOrders: totalUnmatchedOrders,
            prices: marketPriceSummary,
            outcomes: marketOutcomesSummary,
          },
        }
      );
      console.log(`A document is updated in markets with: ${market}`);

      res.status(200).send({ status: "success" });
    } catch (e) {
      throw e;
    }
  } else {
    res.status(405).send(`Method ${req.method} not allowed`);
  }
}
