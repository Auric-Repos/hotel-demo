import type { Metadata } from "next";
import "./globals.css";

import { SITE_CONFIG } from "@/lib/constants";

export const metadata: Metadata = {
  title: SITE_CONFIG.name,
  description: "A calm Nile-view retreat in Aswan, Egypt.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return children;
}
