# LendMe Setup Guide

## Overview

LendMe is a premium, minimal Solana lending dApp that allows users to lend the CB9d…pump token and receive SOL worth 50% of the token's current market price.

## Features

- ✨ Premium minimal dark UI with glassmorphism effects
- 🎨 Smooth animations and micro-interactions
- 💰 Single-token lending mechanic (CB9d…pump → SOL)
- 📊 Real-time price tracking via QuickNode
- 💾 Loan data stored in Supabase
- 🔗 Full Solana wallet integration

## Environment Variables

Add these to your `.env.local` file:

```env
# Solana Configuration
NEXT_PUBLIC_NODE=https://small-twilight-sponge.solana-mainnet.quiknode.pro/71bdb31dd3e965467b1393cebaaebe69d481dbeb/
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta

# Treasury Wallet (where tokens are sent)
NEXT_PUBLIC_TREASURY_WALLET=YOUR_TREASURY_WALLET_ADDRESS

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://voskmcxmtvophehityoa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_i8vnsmfEDOEDXwO79k0UaA_m6q59CJM
SUPABASE_SERVICE_ROLE_KEY=sb_secret_nTkQZcUaDxQ9ykYG2d84Bw_a1YzNVOC
```

## Supabase Setup

1. Create a `loans` table in Supabase with the following schema:

```sql
CREATE TABLE loans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  token_amount DECIMAL NOT NULL,
  sol_received DECIMAL NOT NULL,
  tx_hash TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_loans_wallet ON loans(wallet_address);
CREATE INDEX idx_loans_created_at ON loans(created_at DESC);
```

2. Enable Row Level Security (RLS) if needed for your use case.

## QuickNode API Setup

The token price API endpoint (`/api/token-price`) currently uses a placeholder. You'll need to:

1. Implement the actual QuickNode API call to fetch token price
2. Or use a different price oracle (Jupiter, Birdeye, etc.)

Example implementation:

```typescript
// In src/pages/api/token-price.ts
const response = await fetch(
  `https://api.quicknode.com/v1/token-price/${TOKEN_MINT}`,
  {
    headers: {
      "X-API-Key": process.env.QUICKNODE_API_KEY,
    },
  }
);
```

## Transaction Implementation

The lending transaction in `src/components/LendMe/Hero.tsx` needs to be fully implemented:

1. Create a token transfer instruction to send tokens to the treasury wallet
2. Calculate SOL amount (50% of token value)
3. Create a SOL transfer instruction (or use a program)
4. Combine into a single transaction
5. Send transaction and wait for confirmation
6. Store loan data in Supabase

Example structure:

```typescript
import { 
  createTransferInstruction, 
  getAssociatedTokenAddress 
} from "@solana/spl-token";

// Get user's token account
const userTokenAccount = await getAssociatedTokenAddress(
  TOKEN_MINT_PUBLIC_KEY,
  publicKey
);

// Get treasury token account
const treasuryTokenAccount = await getAssociatedTokenAddress(
  TOKEN_MINT_PUBLIC_KEY,
  TREASURY_WALLET_PUBLIC_KEY
);

// Create transfer instruction
const transferInstruction = createTransferInstruction(
  userTokenAccount,
  treasuryTokenAccount,
  publicKey,
  amount * 10 ** tokenDecimals
);

// Add to transaction
transaction.add(transferInstruction);
```

## Accessing the Page

Navigate to `/lendme` in your browser to see the LendMe interface.

## Design System

The UI follows a premium minimal design with:

- **Colors**: Deep charcoal backgrounds (#050509 - #0B0B10)
- **Accents**: Solana gradient (teal #14F1C0 to purple #7C48ED)
- **Effects**: Glassmorphism, subtle glows, smooth animations
- **Typography**: Clean, modern sans-serif
- **Spacing**: Generous padding and margins for premium feel

## Components

- `AnimatedBackground`: Ambient background shapes with parallax
- `LendMeNavbar`: Sticky navbar with wallet connection
- `LendMeHero`: Main hero section with lending card
- `LendCard`: Premium glassmorphism card with lending form
- `MyLoans`: User's loan history table
- `TreasuryStats`: Treasury overview and statistics

## Next Steps

1. ✅ UI Components created
2. ⏳ Implement actual token transfer logic
3. ⏳ Connect QuickNode API for real-time prices
4. ⏳ Set up Supabase table and test data storage
5. ⏳ Add error handling and loading states
6. ⏳ Test on mainnet with real transactions


