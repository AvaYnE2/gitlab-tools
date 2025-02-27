'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  
  const navItems = [
    { path: '/', label: 'Projects' },
    { path: '/release', label: 'Release' },
    { path: '/merge-requests', label: 'Merge Requests' },
  ];
  
  return (
    <nav className="flex items-center space-x-4">
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          href={item.path}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            pathname === item.path 
              ? 'bg-primary/10 text-primary' 
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}