import NextLink from "next/link";
import type { ComponentProps } from "react";

export default function NavigationLink({
  href,
  scroll,
  ...props
}: ComponentProps<typeof NextLink>) {
  const hasHash = typeof href === "string" ? href.includes("#") : Boolean(href.hash);

  // Let the route listener animate page changes; Next still handles anchor links.
  return <NextLink {...props} href={href} scroll={scroll ?? hasHash} />;
}
