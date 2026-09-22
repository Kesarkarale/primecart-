"use client";

import Link, { LinkProps } from "next/link";
import { ReactNode, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface ProtectedLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export default function ProtectedLink({
  children,
  href,
  className,
  onClick,
  ...props
}: ProtectedLinkProps) {
  const router = useRouter();

  const handleClick = async (
    event: MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();

    onClick?.(event);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.push(href);
        return;
      }

      const nextUrl = encodeURIComponent(href);

      router.push(`/auth/login?next=${nextUrl}`);
    } catch (error) {
      console.error("Authentication check failed:", error);

      const nextUrl = encodeURIComponent(href);

      router.push(`/auth/login?next=${nextUrl}`);
    }
  };

  return (
    <Link
      {...props}
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
