import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Badge,
  Progress,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useState } from "react";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

interface LendCardProps {
  tokenPrice: number;
  userBalance: number;
  lendAmount: string;
  setLendAmount: (value: string) => void;
  solToReceive: string;
  onLend: () => void;
  loading: boolean;
}

export const LendCard = ({
  tokenPrice,
  userBalance,
  lendAmount,
  setLendAmount,
  solToReceive,
  onLend,
  loading,
}: LendCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMax = () => {
    setLendAmount(userBalance.toString());
  };

  const lendPercentage = userBalance > 0 
    ? (parseFloat(lendAmount || "0") / userBalance) * 100 
    : 0;

  return (
    <MotionBox
      p={8}
      borderRadius="24px"
      bg="rgba(20, 20, 26, 0.6)"
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor="rgba(255, 255, 255, 0.08)"
      position="relative"
      overflow="hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      boxShadow={
        isHovered
          ? "0 20px 60px rgba(20, 241, 192, 0.1), 0 0 0 1px rgba(20, 241, 192, 0.1)"
          : "0 10px 40px rgba(0, 0, 0, 0.3)"
      }
    >
      {/* Ambient glow effect */}
      <Box
        position="absolute"
        top="-50%"
        right="-50%"
        width="200%"
        height="200%"
        bg="radial-gradient(circle, rgba(20, 241, 192, 0.1) 0%, transparent 70%)"
        opacity={isHovered ? 0.6 : 0.3}
        transition="opacity 0.3s"
      />

      <VStack spacing={6} position="relative" zIndex={1} align="stretch">
        {/* Token Overview */}
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Box
                width="40px"
                height="40px"
                borderRadius="12px"
                bg="linear-gradient(135deg, #14F1C0 0%, #7C48ED 100%)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="16px"
                fontWeight="bold"
                color="white"
              >
                C
              </Box>
              <VStack spacing={0} align="flex-start">
                <Text fontSize="16px" fontWeight="600" color="white">
                  CB9d…pump
                </Text>
                <Text fontSize="12px" color="rgba(255, 255, 255, 0.5)">
                  Balance: {userBalance.toFixed(4)}
                </Text>
              </VStack>
            </HStack>
            <Badge
              px={3}
              py={1}
              borderRadius="full"
              bg="rgba(20, 241, 192, 0.1)"
              color="#14F1C0"
              border="1px solid"
              borderColor="rgba(20, 241, 192, 0.2)"
              fontSize="11px"
              fontWeight="600"
            >
              LTV: 50%
            </Badge>
          </HStack>

          <HStack justify="space-between">
            <Text fontSize="13px" color="rgba(255, 255, 255, 0.6)">
              Current Price
            </Text>
            <Text fontSize="16px" fontWeight="600" color="white">
              {tokenPrice > 0 ? `${tokenPrice.toFixed(6)} SOL` : "Loading..."}
            </Text>
          </HStack>
        </VStack>

        {/* Lend Form */}
        <VStack spacing={4} align="stretch">
          <VStack spacing={2} align="stretch">
            <Text fontSize="13px" color="rgba(255, 255, 255, 0.6)" fontWeight="500">
              Amount to lend
            </Text>
            <InputGroup>
              <Input
                type="number"
                value={lendAmount}
                onChange={(e) => setLendAmount(e.target.value)}
                placeholder="0.00"
                size="lg"
                bg="rgba(255, 255, 255, 0.05)"
                border="1px solid"
                borderColor="rgba(255, 255, 255, 0.1)"
                borderRadius="12px"
                color="white"
                _placeholder={{ color: "rgba(255, 255, 255, 0.3)" }}
                _focus={{
                  borderColor: "rgba(20, 241, 192, 0.5)",
                  boxShadow: "0 0 0 3px rgba(20, 241, 192, 0.1)",
                }}
                _hover={{
                  borderColor: "rgba(255, 255, 255, 0.2)",
                }}
              />
              <InputRightElement width="auto" pr={2} pt={2}>
                <Button
                  size="xs"
                  px={3}
                  py={1}
                  borderRadius="full"
                  bg="rgba(255, 255, 255, 0.1)"
                  color="white"
                  fontSize="11px"
                  fontWeight="600"
                  _hover={{
                    bg: "rgba(255, 255, 255, 0.15)",
                  }}
                  onClick={handleMax}
                >
                  MAX
                </Button>
              </InputRightElement>
            </InputGroup>
          </VStack>

          {/* Progress bar */}
          {userBalance > 0 && (
            <Progress
              value={lendPercentage}
              size="sm"
              borderRadius="full"
              bg="rgba(255, 255, 255, 0.05)"
              sx={{
                "& > div": {
                  background: "linear-gradient(90deg, #14F1C0 0%, #7C48ED 100%)",
                },
              }}
            />
          )}

          {/* You will receive */}
          <Box
            p={4}
            borderRadius="12px"
            bg="rgba(20, 241, 192, 0.05)"
            border="1px solid"
            borderColor="rgba(20, 241, 192, 0.1)"
          >
            <HStack justify="space-between">
              <Text fontSize="13px" color="rgba(255, 255, 255, 0.6)">
                You will receive
              </Text>
              <Text
                fontSize="20px"
                fontWeight="700"
                bg="linear-gradient(135deg, #14F1C0 0%, #7C48ED 100%)"
                bgClip="text"
                color="transparent"
              >
                {solToReceive} SOL
              </Text>
            </HStack>
            <Text fontSize="11px" color="rgba(255, 255, 255, 0.4)" mt={1}>
              Calculated at 50% of current price
            </Text>
          </Box>

          {/* Lend Button */}
          <MotionButton
            size="lg"
            py={6}
            borderRadius="12px"
            bg="transparent"
            border="1px solid"
            borderColor="rgba(20, 241, 192, 0.3)"
            color="white"
            fontSize="15px"
            fontWeight="600"
            position="relative"
            overflow="hidden"
            _hover={{
              borderColor: "rgba(20, 241, 192, 0.6)",
              bg: "rgba(20, 241, 192, 0.05)",
            }}
            _active={{
              transform: "scale(0.98)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLend}
            isLoading={loading}
            loadingText="Processing..."
          >
            {loading && (
              <motion.div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "2px",
                  background: "linear-gradient(90deg, transparent, #14F1C0, transparent)",
                }}
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                  ease: "linear",
                }}
              />
            )}
            Lend & Receive SOL
          </MotionButton>
        </VStack>

        {/* Info Text */}
        <VStack spacing={2} align="stretch" pt={2}>
          <Text fontSize="11px" color="rgba(255, 255, 255, 0.4)" lineHeight="1.5">
            • Tokens are sent to the LendMe treasury wallet
            <br />
            • SOL is paid from creator fee reserves
            <br />• This is an experimental low-cap lending product. Use at your own risk.
          </Text>
        </VStack>
      </VStack>
    </MotionBox>
  );
};

