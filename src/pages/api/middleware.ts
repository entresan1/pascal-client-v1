import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

/* Restrict access to the API route to only authorized API keys
 *
 * @param handler - The API route handler
 * @returns The API route handler wrapped with the middleware
 */
const authorizedApiKeys: string = process.env.CREATE_MARKET_API_KEY || "";

const apiKeyAuthMiddleware =
  (handler: NextApiHandler): NextApiHandler =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    const apiKey = req.headers["x-api-key"];
    // Use exact match instead of includes() to prevent partial key matching
    const validKeys = authorizedApiKeys.split(",").map(k => k.trim()).filter(k => k);
    if (!apiKey || !validKeys.includes(apiKey as string)) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    return handler(req, res);
  };

export default apiKeyAuthMiddleware;
