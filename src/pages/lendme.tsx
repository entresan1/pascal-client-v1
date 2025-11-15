import { Box } from "@chakra-ui/react";
import { LendMeNavbar } from "@/components/LendMe/Navbar";
import { LendMeHero } from "@/components/LendMe/Hero";
import { MyLoans } from "@/components/LendMe/MyLoans";
import { TreasuryStats } from "@/components/LendMe/TreasuryStats";
import { AnimatedBackground } from "@/components/LendMe/AnimatedBackground";

export default function LendMePage() {
  return (
    <Box
      minH="100vh"
      bg="linear-gradient(180deg, #050509 0%, #0B0B10 100%)"
      position="relative"
      overflow="hidden"
    >
      <AnimatedBackground />
      <LendMeNavbar />
      <Box position="relative" zIndex={1}>
        <LendMeHero />
        <Box
          maxW="1400px"
          mx="auto"
          px={{ base: 4, md: 8 }}
          py={12}
          display="grid"
          gridTemplateColumns={{ base: "1fr", lg: "1fr 1fr" }}
          gap={6}
        >
          <MyLoans />
          <TreasuryStats />
        </Box>
      </Box>
    </Box>
  );
}


