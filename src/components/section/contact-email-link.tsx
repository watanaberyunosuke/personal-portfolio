"use client";

import { trackEvent } from "@/lib/analytics";
import Link from "next/link";

interface ContactEmailLinkProps {
  readonly email: string;
  readonly className?: string;
  readonly children: React.ReactNode;
}

export default function ContactEmailLink({
  email,
  className,
  children,
}: ContactEmailLinkProps) {
  return (
    <Link
      href={`mailto:${email}`}
      className={className}
      onClick={() => trackEvent("Contact Email Clicked", { location: "contact-section" })}
    >
      {children}
    </Link>
  );
}
