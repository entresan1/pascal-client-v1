import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  IconButton,
  useClipboard,
  useToast,
} from "@chakra-ui/react";
import { CopyIcon, CheckIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const MotionBox = motion(Box);

interface TreasuryStats {
  totalTokens: number;
  totalSolPaid: number;
  numberOfLoans: number;
  treasuryWallet: string;
}

export const TreasuryStats = () => {
  const [stats, setStats] = useState<TreasuryStats>({
    totalTokens: 0,
    totalSolPaid: 0,
    numberOfLoans: 0,
    treasuryWallet: process.env.NEXT_PUBLIC_TREASURY_WALLET || "",
  });
  const [loading, setLoading] = useState(true);
  const { onCopy, hasCopied } = useClipboard(stats.treasuryWallet);
  const toast = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/treasury-stats");
        if (response.ok) {
          const data = await response.json();
          setStats((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Error fetching treasury stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    onCopy();
    toast({
      title: "Copied!",
      description: "Treasury wallet address copied to clipboard",
      status: "success",
      duration: 2000,
      position: "bottom-right",
    });
  };

  const treasuryHealth = stats.totalSolPaid > 0 
    ? Math.min((stats.totalSolPaid / (stats.totalTokens * 0.5)) * 100, 100)
    : 0;

  return (
    <MotionBox
      p={6}
      borderRadius="20px"
      bg="rgba(20, 20, 26, 0.6)"
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.08)"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <VStack spacing={6} align="stretch">
        <Text fontSize="18px" fontWeight="600" color="white">
          Treasury Overview
        </Text>

        {loading ? (
          <Text fontSize="14px" color="rgba(255, 255, 255, 0.5)" textAlign="center" py={4}>
            Loading...
          </Text>
        ) : (
          <>
            <VStack spacing={4} align="stretch">
              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="12px" color="rgba(255, 255, 255, 0.6)">
                    Total Tokens in Treasury
                  </Text>
                  <Text fontSize="16px" fontWeight="600" color="white">
                    {stats.totalTokens.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </HStack>
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="12px" color="rgba(255, 255, 255, 0.6)">
                    Total SOL Paid Out
                  </Text>
                  <Text fontSize="16px" fontWeight="600" color="white">
                    {stats.totalSolPaid.toFixed(4)} SOL
                  </Text>
                </HStack>
              </Box>

              <Box>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="12px" color="rgba(255, 255, 255, 0.6)">
                    Number of Loans
                  </Text>
                  <Text fontSize="16px" fontWeight="600" color="white">
                    {stats.numberOfLoans}
                  </Text>
                </HStack>
              </Box>
            </VStack>

            {/* Treasury Health Bar */}
            <VStack spacing={2} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="12px" color="rgba(255, 255, 255, 0.6)">
                  Treasury Health
                </Text>
                <Text fontSize="12px" fontWeight="600" color="white">
                  {treasuryHealth.toFixed(1)}%
                </Text>
              </HStack>
              <Progress
                value={treasuryHealth}
                size="sm"
                borderRadius="full"
                bg="rgba(255, 255, 255, 0.05)"
                sx={{
                  "& > div": {
                    background: treasuryHealth > 70
                      ? "linear-gradient(90deg, #14F1C0 0%, #7C48ED 100%)"
                      : treasuryHealth > 40
                      ? "linear-gradient(90deg, #F59E0B 0%, #EF4444 100%)"
                      : "linear-gradient(90deg, #EF4444 0%, #DC2626 100%)",
                  },
                }}
              />
            </VStack>

            {/* Treasury Wallet */}
            {stats.treasuryWallet && (
              <VStack spacing={2} align="stretch" pt={2}>
                <Text fontSize="12px" color="rgba(255, 255, 255, 0.6)">
                  Treasury Wallet
                </Text>
                <HStack
                  p={3}
                  borderRadius="12px"
                  bg="rgba(255, 255, 255, 0.05)"
                  border="1px solid"
                  borderColor="rgba(255, 255, 255, 0.08)"
                >
                  <Text
                    fontSize="12px"
                    fontFamily="mono"
                    color="rgba(255, 255, 255, 0.7)"
                    flex={1}
                    isTruncated
                  >
                    {stats.treasuryWallet}
                  </Text>
                  <IconButton
                    aria-label="Copy address"
                    icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                    size="xs"
                    variant="ghost"
                    color={hasCopied ? "#14F1C0" : "rgba(255, 255, 255, 0.5)"}
                    _hover={{
                      bg: "rgba(20, 241, 192, 0.1)",
                    }}
                    onClick={handleCopy}
                  />
                </HStack>
              </VStack>
            )}
          </>
        )}
      </VStack>
    </MotionBox>
  );
};


