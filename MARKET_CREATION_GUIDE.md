# How to Create Prediction Markets on Pascal Protocol

## Current Status

Currently, market creation is **restricted** to administrators only. Here's how it works and how to enable it for more users.

## Current Restrictions

### 1. **Admin Wallet Check**
The "Create Market" button only appears if your wallet matches the admin public key:

```typescript
// In src/components/TopBar.tsx
const isAdmin = publicKey
  ? publicKey.toString() === process.env.NEXT_PUBLIC_OWNER_PUBLIC_KEY
  : false;
```

**To enable for your wallet:**
1. Set `NEXT_PUBLIC_OWNER_PUBLIC_KEY` in `.env.local` to your wallet address
2. Restart the development server

### 2. **Monaco Protocol Operator Role**
Even if you're an admin, your wallet must have the **operator role** in the Monaco Protocol program:

```typescript
// In src/components/CreateMarketModal/index.tsx
const checkRoles = await checkOperatorRoles(
  program,
  program.provider.publicKey
);

if (!checkRoles.data.market) {
  throw new Error("Wallet does not have the operator role");
}
```

**To grant operator role:**
- This must be done on-chain through the Monaco Protocol admin functions
- Contact the protocol administrators or use the Monaco Protocol admin CLI

### 3. **API Key Protection (Optional)**
The `/api/createMarket` endpoint can be protected with an API key:

```typescript
// In src/pages/api/middleware.ts
const authorizedApiKeys = process.env.CREATE_MARKET_API_KEY || "";
```

**To set up API key protection:**
1. Set `CREATE_MARKET_API_KEY` in `.env.local`
2. The API will require this key in the `X-API-KEY` header

## Market Creation Process

When a user creates a market, the following happens:

### Step 1: Fill Out Market Details
- **Title**: Market question/title
- **Category**: Financial, Economics, Crypto, Climate, or Other
- **Lock Date**: When trading stops (must be in the future)
- **Description**: Resolution criteria
- **Resolution Source**: Pyth, Coingecko, Switchboard, etc.
- **Oracle Symbol**: For automated resolution
- **Resolution Value**: Threshold value for resolution

### Step 2: On-Chain Market Creation
1. **Create Market Account** - Creates the market on Solana
2. **Initialize Outcomes** - Sets up "Yes" and "No" outcome pools
3. **Add Price Ladder** - Adds all price points (1.01 to 1.99)
4. **Open Market** - Changes status from "initializing" to "open"

### Step 3: Database Storage
- Market data is stored in MongoDB (or Supabase if migrated)
- Includes all market metadata and initial price data

## Enabling Public Market Creation

To allow anyone to create markets, you have several options:

### Option 1: Remove Admin Check (Simplest)
Remove the admin check from `TopBar.tsx`:

```typescript
// Change this:
{isAdmin && (
  <Button onClick={onOpen}>Create market</Button>
)}

// To this:
<Button onClick={onOpen}>Create market</Button>
```

**⚠️ Warning**: This still requires users to have the Monaco Protocol operator role.

### Option 2: Create a Permission System
Implement a whitelist or permission system:

1. **Create a permissions table** in your database:
```sql
CREATE TABLE market_creators (
  wallet_address TEXT PRIMARY KEY,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

2. **Update TopBar.tsx** to check permissions:
```typescript
const [canCreate, setCanCreate] = useState(false);

useEffect(() => {
  if (publicKey) {
    // Check if wallet is in permissions table
    fetch(`/api/check-permissions?wallet=${publicKey.toBase58()}`)
      .then(res => res.json())
      .then(data => setCanCreate(data.canCreate));
  }
}, [publicKey]);
```

3. **Create approval endpoint** for admins to approve creators

### Option 3: Fee-Based Market Creation
Require users to pay a fee to create markets:

1. Add a fee payment step before market creation
2. Store fee payment in database
3. Only allow market creation after fee is confirmed

### Option 4: Community Governance
Let the community vote on market proposals:

1. Users submit market proposals
2. Community votes on proposals
3. Approved markets are automatically created

## Required Setup for Market Creators

For a user to successfully create a market, they need:

1. ✅ **Connected Wallet** - Solana wallet (Phantom, Solflare, etc.)
2. ✅ **Operator Role** - Granted by protocol administrators
3. ✅ **SOL for Fees** - Transaction fees for on-chain operations
4. ✅ **API Access** - If API key protection is enabled

## Market Creation API Endpoint

The market creation endpoint is at `/api/createMarket`:

**Request:**
```json
POST /api/createMarket
Headers: {
  "Content-Type": "application/json",
  "X-API-KEY": "your-api-key" // Optional
}
Body: {
  "category": "Financial",
  "description": "Market description",
  "lockTimestamp": "2024-12-31T23:59:59",
  "resolutionSource": "Pyth",
  "oracleSymbol": "BTC/USD",
  "resolutionValue": "50000",
  "ticker": "BTC",
  "tag": "bitcoin",
  "marketAccount": { ... },
  "priceData": { ... }
}
```

**Response:**
```json
{
  "status": "success"
}
```

## Monaco Protocol Integration

Pascal uses the **Monaco Protocol** for market creation. Key functions:

- `createMarket()` - Creates the market account
- `initialiseOutcomes()` - Sets up outcome pools
- `batchAddPricesToAllOutcomePools()` - Adds price ladder
- `openMarket()` - Opens market for trading
- `checkOperatorRoles()` - Verifies permissions

## Recommendations

### For Development/Testing:
1. Set your wallet as `NEXT_PUBLIC_OWNER_PUBLIC_KEY`
2. Ensure your wallet has operator role in Monaco Protocol
3. Remove API key requirement temporarily

### For Production:
1. **Keep operator role requirement** - Prevents spam and ensures quality
2. **Implement approval system** - Review markets before they go live
3. **Add market creation fee** - Covers costs and prevents abuse
4. **Rate limiting** - Limit markets per user per day
5. **Content moderation** - Filter inappropriate markets

## Example: Making Market Creation Public

Here's a complete example of enabling public market creation:

```typescript
// src/components/TopBar.tsx
export default function WithSubnavigation() {
  const { publicKey } = useWallet();
  const [canCreateMarket, setCanCreateMarket] = useState(false);
  
  useEffect(() => {
    // Check if user can create markets
    if (publicKey) {
      // Option A: Everyone can create (remove operator check)
      setCanCreateMarket(true);
      
      // Option B: Check database permissions
      // fetch(`/api/check-permissions?wallet=${publicKey.toBase58()}`)
      //   .then(res => res.json())
      //   .then(data => setCanCreateMarket(data.canCreate));
    }
  }, [publicKey]);

  return (
    // ... rest of component
    {canCreateMarket && (
      <Button onClick={onOpen}>Create market</Button>
    )}
  );
}
```

## Next Steps

1. **Decide on permission model** - Who can create markets?
2. **Set up operator roles** - Grant roles to approved creators
3. **Implement approval system** (optional) - Review markets before going live
4. **Add rate limiting** - Prevent spam
5. **Monitor market quality** - Ensure markets are well-formed

## Support

For questions about:
- **Monaco Protocol**: Check their [documentation](https://docs.monaco.gg/)
- **Operator Roles**: Contact Monaco Protocol administrators
- **Market Creation Issues**: Check browser console for errors

