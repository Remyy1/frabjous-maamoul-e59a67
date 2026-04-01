'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Menu, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/tracking', label: 'Track' },
  { href: '/services', label: 'Services' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
          scrolled
            ? 'bg-ink-900/90 backdrop-blur-xl border-b border-subtle shadow-card'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-signal flex items-center justify-center group-hover:shadow-signal transition-shadow">
              <Package className="w-4 h-4 text-ink-900" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Track<span className="text-signal">Flow</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-signal bg-signal/10'
                    : 'text-ink-300 hover:text-ink-100 hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/tracking"
              className="btn-primary text-sm py-2 px-5"
            >
              Track Package
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 md:hidden transition-all duration-300',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="absolute inset-0 bg-ink-900/95 backdrop-blur-xl" onClick={() => setMenuOpen(false)} />
        <div className="absolute top-16 left-0 right-0 p-6 flex flex-col gap-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'px-4 py-3.5 rounded-xl text-base font-medium transition-colors',
                pathname === link.href
                  ? 'text-signal bg-signal/10'
                  : 'text-ink-200 hover:bg-white/5'
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/tracking"
            onClick={() => setMenuOpen(false)}
            className="btn-primary mt-2 justify-center"
          >
            Track Package
          </Link>
        </div>
      </div>
    </>
  );
}
