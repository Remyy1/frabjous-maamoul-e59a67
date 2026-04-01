import Link from 'next/link';
import { Package, Github, Twitter, Linkedin } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { href: '/tracking', label: 'Track a Package' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/services', label: 'Services' },
    { href: '/admin', label: 'Admin Panel' },
  ],
  Carriers: [
    { href: '#', label: 'FedEx' },
    { href: '#', label: 'UPS' },
    { href: '#', label: 'USPS' },
    { href: '#', label: 'DHL' },
  ],
  Company: [
    { href: '#', label: 'About' },
    { href: '#', label: 'Blog' },
    { href: '#', label: 'Careers' },
    { href: '#', label: 'Contact' },
  ],
  Legal: [
    { href: '#', label: 'Privacy Policy' },
    { href: '#', label: 'Terms of Service' },
    { href: '#', label: 'Cookie Policy' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-subtle bg-ink-900">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-signal flex items-center justify-center">
                <Package className="w-4 h-4 text-ink-900" />
              </div>
              <span className="font-display font-bold text-lg">
                Track<span className="text-signal">Flow</span>
              </span>
            </Link>
            <p className="text-ink-400 text-sm leading-relaxed mb-5">
              Real-time logistics intelligence for modern businesses.
            </p>
            <div className="flex gap-3">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-ink-400 hover:text-signal hover:border-signal/30 border border-subtle transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs font-mono uppercase tracking-widest text-signal mb-4">{category}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-ink-400 hover:text-ink-100 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-ink-500 text-sm">
            © {new Date().getFullYear()} TrackFlow Inc. All rights reserved.
          </p>
          <p className="text-ink-500 text-xs font-mono">
            Powered by AfterShip · Mapbox · Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
