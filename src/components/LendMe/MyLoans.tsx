import {
  Box,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const MotionBox = motion(Box);

interface Loan {
  id: string;
  date: string;
  tokenAmount: number;
  solReceived: number;
  status: "active" | "completed";
  txHash: string;
}

export const MyLoans = () => {
  const { publicKey } = useWallet();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoans = async () => {
      if (!publicKey) {
        setLoans([]);
        setLoading(false);
        return;
      }

      try {
        // Fetch from Supabase
        const response = await fetch(`/api/loans?wallet=${publicKey.toBase58()}`);
        if (response.ok) {
          const data = await response.json();
          setLoans(data.loans || []);
        }
      } catch (error) {
        console.error("Error fetching loans:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, [publicKey]);

  if (!publicKey) {
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
        transition={{ duration: 0.4 }}
      >
        <VStack spacing={4} align="center" py={8}>
          <Text fontSize="18px" fontWeight="600" color="white">
            My Loans
          </Text>
          <Text fontSize="14px" color="rgba(255, 255, 255, 0.5)" textAlign="center">
            Connect your wallet to view your loans
          </Text>
        </VStack>
      </MotionBox>
    );
  }

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
      transition={{ duration: 0.4 }}
    >
      <VStack spacing={4} align="stretch">
        <Text fontSize="18px" fontWeight="600" color="white">
          My Loans
        </Text>

        {loading ? (
          <Text fontSize="14px" color="rgba(255, 255, 255, 0.5)" textAlign="center" py={8}>
            Loading...
          </Text>
        ) : loans.length === 0 ? (
          <VStack spacing={4} py={8} align="center">
            <Box
              width="64px"
              height="64px"
              borderRadius="16px"
              bg="rgba(255, 255, 255, 0.05)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="32px"
            >
              💰
            </Box>
            <VStack spacing={2}>
              <Text fontSize="14px" color="rgba(255, 255, 255, 0.7)" textAlign="center">
                No loans yet
              </Text>
              <Text fontSize="12px" color="rgba(255, 255, 255, 0.5)" textAlign="center" maxW="300px">
                Lend your first CB9d…pump token to borrow SOL
              </Text>
            </VStack>
          </VStack>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th color="rgba(255, 255, 255, 0.6)" fontSize="11px" fontWeight="600" textTransform="uppercase" borderColor="rgba(255, 255, 255, 0.08)">
                    Date
                  </Th>
                  <Th color="rgba(255, 255, 255, 0.6)" fontSize="11px" fontWeight="600" textTransform="uppercase" borderColor="rgba(255, 255, 255, 0.08)">
                    Amount
                  </Th>
                  <Th color="rgba(255, 255, 255, 0.6)" fontSize="11px" fontWeight="600" textTransform="uppercase" borderColor="rgba(255, 255, 255, 0.08)">
                    SOL Received
                  </Th>
                  <Th color="rgba(255, 255, 255, 0.6)" fontSize="11px" fontWeight="600" textTransform="uppercase" borderColor="rgba(255, 255, 255, 0.08)">
                    Status
                  </Th>
                  <Th color="rgba(255, 255, 255, 0.6)" fontSize="11px" fontWeight="600" textTransform="uppercase" borderColor="rgba(255, 255, 255, 0.08)">
                    TX
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {loans.map((loan, index) => (
                  <Tr
                    key={loan.id}
                    borderColor="rgba(255, 255, 255, 0.08)"
                    _hover={{
                      bg: "rgba(255, 255, 255, 0.03)",
                      transform: "translateY(-2px)",
                    }}
                    transition="all 0.2s"
                    cursor="pointer"
                  >
                    <Td color="rgba(255, 255, 255, 0.8)" fontSize="13px" borderColor="rgba(255, 255, 255, 0.08)">
                      {new Date(loan.date).toLocaleDateString()}
                    </Td>
                    <Td color="white" fontSize="13px" fontWeight="500" borderColor="rgba(255, 255, 255, 0.08)">
                      {loan.tokenAmount.toFixed(4)}
                    </Td>
                    <Td color="white" fontSize="13px" fontWeight="500" borderColor="rgba(255, 255, 255, 0.08)">
                      {loan.solReceived.toFixed(4)} SOL
                    </Td>
                    <Td borderColor="rgba(255, 255, 255, 0.08)">
                      <Box
                        display="inline-block"
                        px={2}
                        py={1}
                        borderRadius="6px"
                        bg={
                          loan.status === "active"
                            ? "rgba(20, 241, 192, 0.1)"
                            : "rgba(255, 255, 255, 0.1)"
                        }
                        color={
                          loan.status === "active" ? "#14F1C0" : "rgba(255, 255, 255, 0.7)"
                        }
                        fontSize="11px"
                        fontWeight="600"
                      >
                        {loan.status}
                      </Box>
                    </Td>
                    <Td borderColor="rgba(255, 255, 255, 0.08)">
                      <Link
                        href={`https://solscan.io/tx/${loan.txHash}?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK || "mainnet-beta"}`}
                        isExternal
                      >
                        <IconButton
                          aria-label="View transaction"
                          icon={<ExternalLinkIcon />}
                          size="xs"
                          variant="ghost"
                          color="rgba(255, 255, 255, 0.5)"
                          _hover={{
                            color: "#14F1C0",
                            bg: "rgba(20, 241, 192, 0.1)",
                          }}
                        />
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>
    </MotionBox>
  );
};

