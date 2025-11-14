import clientPromise from "@/lib/mongodb";

export default async function handler(req, res) {
  try {
    const { publicKey } = req.query;

    // Validate publicKey format (Solana public keys are base58, 32-44 chars)
    if (!publicKey || typeof publicKey !== 'string' || publicKey.length < 32 || publicKey.length > 44) {
      res.status(400).json({ error: "Invalid publicKey format" });
      return;
    }

    // Sanitize: only allow alphanumeric characters and base58 characters
    const sanitizedPublicKey = publicKey.replace(/[^A-Za-z0-9]/g, '');
    if (sanitizedPublicKey !== publicKey) {
      res.status(400).json({ error: "Invalid publicKey characters" });
      return;
    }

    if (!clientPromise) {
      res.status(503).json({ error: "Database not configured" });
      return;
    }
    const client = await clientPromise;
    const db = client.db("pascal");

    const user = await db
      .collection("users")
      .find({ userPk: sanitizedPublicKey })
      .toArray();

    res.json(user[0] || null);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Internal server error" });
  }
}
