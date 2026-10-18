import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auric Hotel",
  description: "A calm Nile-view retreat in Aswan, Egypt.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return children;
}
