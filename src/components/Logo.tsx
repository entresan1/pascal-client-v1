import { Image, HTMLChakraProps } from "@chakra-ui/react";

export const Logo = (props: HTMLChakraProps<"img">) => (
  <Image
    src="/logo.png"
    alt="Tricast"
    height="32px"
    width="auto"
    {...props}
  />
);
