import type { Metadata } from "next";
import { metadata as brandMetadata } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Sign in – ${brandMetadata.title}`,
  description: brandMetadata.description,
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
