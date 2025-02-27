"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent"
      }`}
    >
      {children}
    </Link>
  );
}

interface HeaderProps {
  hasToken: boolean;
  onLogout: () => void;
  storageType?: string;
}

export function Header({ hasToken, onLogout, storageType }: HeaderProps) {
  return (
    <header className="border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold mr-8">GitLab Tools</h1>

            {hasToken && (
              <nav className="flex space-x-2">
                <NavLink href="/">Projects</NavLink>
                <NavLink href="/release">Release Tool</NavLink>
                <NavLink href="/merge-requests">Merge Requests</NavLink>
              </nav>
            )}
          </div>

          {hasToken && (
            <div className="flex items-center gap-4">
              <div className="text-xs text-muted-foreground">
                {storageType === "session"
                  ? "Session storage (secure)"
                  : "Local storage (persistent)"}
              </div>
              <button
                onClick={onLogout}
                className="text-sm px-3 py-1 text-muted-foreground hover:bg-accent rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
