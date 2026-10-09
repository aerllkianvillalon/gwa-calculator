import { Bookmark, Calculator, Info, Mail, Shield, type LucideIcon } from "lucide-react";

export interface PageLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Site pages shown in the header (desktop) and in the menu drawer (phones). */
export const PAGE_LINKS: PageLink[] = [
  { href: "/calculator", label: "Calculator", icon: Calculator },
  { href: "/dashboard", label: "Saved Calculations", icon: Bookmark },
  { href: "/privacy", label: "Privacy", icon: Shield },
  { href: "/contact", label: "Contact", icon: Mail },
  { href: "/about", label: "About", icon: Info },
];
