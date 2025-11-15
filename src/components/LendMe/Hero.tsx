import {
  Box,
  Flex,
  Text,
  VStack,
  HStack,
  Input,
  Button,
  Badge,
  Progress,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { motion } from "framer-motion";
import { LendCard } from "./LendCard";

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const TOKEN_MINT = "CB9dDufT3ZuQXqqSfa1c5kY935TEreyBw9XJXxHKpump";
const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET || "";

export const LendMeHero = () => {
  const { publicKey, sendTransaction } = useWallet();
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [lendAmount, setLendAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Fetch token price from QuickNode API
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        // This would call your QuickNode API endpoint
        // For now, using a placeholder
        const response = await fetch("/api/token-price");
        if (response.ok) {
          const data = await response.json();
          setTokenPrice(data.price || 0);
        }
      } catch (error) {
        console.error("Error fetching token price:", error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  // Fetch user balance
  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) {
        setUserBalance(0);
        return;
      }

      try {
        const connection = new Connection(
          process.env.NEXT_PUBLIC_NODE || "https://api.mainnet-beta.solana.com"
        );
        // Get token balance logic here
        // This is simplified - you'd need to get the token account balance
        setUserBalance(0); // Placeholder
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };

    fetchBalance();
  }, [publicKey]);

  const solToReceive = tokenPrice > 0 && lendAmount 
    ? (parseFloat(lendAmount) * tokenPrice * 0.5).toFixed(4)
    : "0.0000";

  const handleLend = async () => {
    if (!publicKey || !lendAmount || parseFloat(lendAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount to lend",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      // Create transaction to send tokens to treasury
      const connection = new Connection(
        process.env.NEXT_PUBLIC_NODE || "https://api.mainnet-beta.solana.com"
      );

      // Transaction creation logic here
      // This would create a transfer instruction to send tokens to treasury

      toast({
        title: "Transaction submitted",
        description: "Your loan is being processed",
        status: "success",
        duration: 5000,
      });

      setLendAmount("");
    } catch (error: any) {
      toast({
        title: "Transaction failed",
        description: error.message || "Please try again",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxW="1400px"
      mx="auto"
      px={{ base: 4, md: 8 }}
      py={16}
      position="relative"
      zIndex={1}
    >
      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={12}
        align={{ base: "center", lg: "flex-start" }}
      >
        {/* Left Column - Text */}
        <MotionVStack
          flex={1}
          align={{ base: "center", lg: "flex-start" }}
          spacing={6}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Text
            fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
            fontWeight="700"
            lineHeight="1.1"
            textAlign={{ base: "center", lg: "left" }}
            bg="linear-gradient(135deg, #FFFFFF 0%, rgba(255, 255, 255, 0.8) 100%)"
            bgClip="text"
            color="transparent"
          >
            Lend your token.
            <br />
            Borrow SOL.
          </Text>

          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="rgba(255, 255, 255, 0.7)"
            maxW="600px"
            textAlign={{ base: "center", lg: "left" }}
            lineHeight="1.6"
          >
            Deposit the CB9d…pump token into the LendMe treasury and instantly
            receive SOL worth 50% of its current market price.
          </Text>

          <HStack
            spacing={4}
            fontSize="sm"
            color="rgba(255, 255, 255, 0.5)"
            flexWrap="wrap"
            justify={{ base: "center", lg: "flex-start" }}
          >
            <Text>Powered by Solana</Text>
            <Text>•</Text>
            <Text>Prices via QuickNode</Text>
            <Text>•</Text>
            <Text>Loans stored in Supabase</Text>
          </HStack>
        </MotionVStack>

        {/* Right Column - Lend Card */}
        <MotionBox
          flex={1}
          maxW={{ base: "100%", lg: "500px" }}
          w="100%"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
        >
          <LendCard
            tokenPrice={tokenPrice}
            userBalance={userBalance}
            lendAmount={lendAmount}
            setLendAmount={setLendAmount}
            solToReceive={solToReceive}
            onLend={handleLend}
            loading={loading}
          />
        </MotionBox>
      </Flex>
    </Box>
  );
};


