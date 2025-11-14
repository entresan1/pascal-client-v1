import clientPromise from "@/lib/mongodb";
import apiKeyAuthMiddleware from "./middleware";

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      console.log("body is", req.body);
      const {
        category,
        description,
        marketCreateTimestamp,
        tag,
        ticker,
        resolutionSource,
        resolutionValue,
        oracleSymbol,
        marketAccount,
        priceData,
      } = req.body;

      // Validate required fields
      if (!marketAccount || !marketAccount.publicKey || !marketAccount.account) {
        res.status(400).json({ error: "Missing required marketAccount fields" });
        return;
      }

      // Validate publicKey format
      const { publicKey, account } = marketAccount;
      if (typeof publicKey !== 'string' || publicKey.length < 32 || publicKey.length > 44) {
        res.status(400).json({ error: "Invalid publicKey format" });
        return;
      }
      const {
        marketPriceSummary,
        marketOutcomesSummary,
        liquidityTotal,
        matchedTotal,
        totalUnmatchedOrders,
      } = priceData;

      // Add market to db
      if (!clientPromise) {
        res.status(503).json({ error: "Database not configured" });
        return;
      }
      const client = await clientPromise;
      const markets = client.db("pascal").collection("markets");
      const market = await markets.insertOne({
        publicKey,
        ...account,
        category,
        description,
        marketCreateTimestamp,
        tag,
        ticker,
        resolutionSource,
        resolutionValue,
        oracleSymbol,
        liquidityTotal,
        matchedTotal,
        totalUnmatchedOrders,
      });
      console.log(
        `A document is inserted into markets with the _id: ${market.insertedId}`
      );

      // Update market data in db
      await markets.updateOne(
        { _id: market.insertedId },
        {
          $set: {
            prices: marketPriceSummary,
            outcomes: marketOutcomesSummary,
          },
        }
      );

      res.status(200).send({ status: "success" });
    } catch (e) {
      throw e;
    }
  } else {
    res.status(405).send(`Method ${req.method} not allowed`);
  }
}
