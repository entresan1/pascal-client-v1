import {
  Box,
  Flex,
  Text,
  Button,
  HStack,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const MotionBox = motion(Box);
const MotionButton = motion(Button);

export const LendMeNavbar = () => {
  const { publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <MotionBox
      position="sticky"
      top={0}
      zIndex={1000}
      backdropFilter="blur(20px)"
      bg={scrolled ? "rgba(20, 20, 26, 0.8)" : "rgba(20, 20, 26, 0.4)"}
      borderBottom="1px solid"
      borderColor="rgba(255, 255, 255, 0.06)"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Flex
        maxW="1400px"
        mx="auto"
        px={{ base: 4, md: 8 }}
        py={4}
        justify="space-between"
        align="center"
      >
        {/* Logo */}
        <HStack spacing={3}>
          <Box
            width="32px"
            height="32px"
            borderRadius="8px"
            bg="linear-gradient(135deg, #14F1C0 0%, #7C48ED 100%)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="18px"
            fontWeight="bold"
            color="white"
          >
            L
          </Box>
          <Text
            fontSize="20px"
            fontWeight="600"
            bg="linear-gradient(135deg, #14F1C0 0%, #7C48ED 100%)"
            bgClip="text"
            color="transparent"
          >
            LendMe
          </Text>
        </HStack>

        {/* Nav Links */}
        <HStack spacing={8} display={{ base: "none", md: "flex" }}>
          <Link
            href="#dashboard"
            color="rgba(255, 255, 255, 0.7)"
            _hover={{ color: "rgba(255, 255, 255, 0.9)" }}
            fontSize="14px"
            fontWeight="500"
            transition="color 0.2s"
          >
            Dashboard
          </Link>
          <Link
            href="#loans"
            color="rgba(255, 255, 255, 0.7)"
            _hover={{ color: "rgba(255, 255, 255, 0.9)" }}
            fontSize="14px"
            fontWeight="500"
            transition="color 0.2s"
          >
            My Loans
          </Link>
          <Link
            href="#docs"
            color="rgba(255, 255, 255, 0.7)"
            _hover={{ color: "rgba(255, 255, 255, 0.9)" }}
            fontSize="14px"
            fontWeight="500"
            transition="color 0.2s"
          >
            Docs
          </Link>
        </HStack>

        {/* Wallet Button */}
        {publicKey ? (
          <MotionButton
            size="sm"
            px={4}
            py={2}
            borderRadius="full"
            border="1px solid"
            borderColor="rgba(20, 241, 192, 0.3)"
            bg="transparent"
            color="white"
            fontSize="13px"
            fontWeight="500"
            _hover={{
              borderColor: "rgba(20, 241, 192, 0.6)",
              bg: "rgba(20, 241, 192, 0.05)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={disconnect}
          >
            <HStack spacing={2}>
              <Box
                width="6px"
                height="6px"
                borderRadius="50%"
                bg="#14F1C0"
                boxShadow="0 0 8px rgba(20, 241, 192, 0.6)"
              />
              {truncateAddress(publicKey.toBase58())}
            </HStack>
          </MotionButton>
        ) : (
          <MotionButton
            size="sm"
            px={4}
            py={2}
            borderRadius="full"
            border="1px solid"
            borderColor="rgba(20, 241, 192, 0.3)"
            bg="transparent"
            color="white"
            fontSize="13px"
            fontWeight="500"
            _hover={{
              borderColor: "rgba(20, 241, 192, 0.6)",
              bg: "rgba(20, 241, 192, 0.05)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setVisible(true)}
          >
            Connect Wallet
          </MotionButton>
        )}
      </Flex>
    </MotionBox>
  );
};


