import { Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const Blob = ({ 
  size, 
  x, 
  y, 
  color, 
  delay = 0,
  mouseX = 0,
  mouseY = 0 
}: { 
  size: number; 
  x: string; 
  y: string; 
  color: string;
  delay?: number;
  mouseX?: number;
  mouseY?: number;
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const moveX = (e.clientX - centerX) * 0.01;
      const moveY = (e.clientY - centerY) * 0.01;
      setPosition({ x: moveX, y: moveY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(80px)",
        opacity: 0.4,
      }}
      animate={{
        x: position.x,
        y: position.y,
        scale: [1, 1.02, 1],
      }}
      transition={{
        x: { duration: 0.3, ease: "easeOut" },
        y: { duration: 0.3, ease: "easeOut" },
        scale: {
          duration: 4 + delay,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    />
  );
};

export const AnimatedBackground = () => {
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={0}
      pointerEvents="none"
      overflow="hidden"
    >
      {/* Top-left blob */}
      <Blob
        size={600}
        x="0%"
        y="0%"
        color="radial-gradient(circle, rgba(20, 241, 192, 0.3) 0%, rgba(20, 241, 192, 0) 70%)"
        delay={0}
      />
      
      {/* Bottom-right blob */}
      <Blob
        size={500}
        x="80%"
        y="70%"
        color="radial-gradient(circle, rgba(124, 72, 237, 0.25) 0%, rgba(124, 72, 237, 0) 70%)"
        delay={2}
      />
      
      {/* Center subtle blob */}
      <Blob
        size={400}
        x="50%"
        y="30%"
        color="radial-gradient(circle, rgba(20, 241, 192, 0.15) 0%, rgba(20, 241, 192, 0) 70%)"
        delay={1}
      />

      {/* Subtle geometric shapes */}
      <Box
        position="absolute"
        top="20%"
        right="10%"
        width="200px"
        height="200px"
        border="1px solid"
        borderColor="rgba(255, 255, 255, 0.03)"
        borderRadius="50%"
        opacity={0.3}
      />
      <Box
        position="absolute"
        bottom="15%"
        left="15%"
        width="150px"
        height="150px"
        border="1px solid"
        borderColor="rgba(20, 241, 192, 0.1)"
        borderRadius="50%"
        opacity={0.2}
      />
    </Box>
  );
};


