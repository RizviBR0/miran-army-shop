import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram } from "lucide-react";

const socialLinks = [
  {
    name: "Facebook",
    url: "https://facebook.com/jinmiranarmy",
    icon: Facebook,
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/jinmiranarmy/",
    icon: Instagram,
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@jinmiranarmy",
    icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-elevated">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <Image
                src="/logo/logo_circle.png"
                alt="Miran Army"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <h3 className="font-heading font-bold text-lg text-text-main">
                  Miran Army
                </h3>
                <p className="text-xs text-text-muted">The #1 Fan Community</p>
              </div>
            </Link>
            <p className="text-sm text-text-muted max-w-md">
              Discover cute and fun products curated just for fans. We find the
              best deals on AliExpress so you don't have to! 💛
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-text-main mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/shop"
                  className="text-sm text-text-muted hover:text-brand-black transition-colors"
                >
                  Shop All
                </Link>
              </li>
              <li>
                <Link
                  href="/favorites"
                  className="text-sm text-text-muted hover:text-brand-black transition-colors"
                >
                  My Favorites
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-heading font-semibold text-text-main mb-4">
              Follow Us
            </h4>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-brand-yellow flex items-center justify-center text-text-muted hover:text-brand-black transition-all duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-sm text-text-muted mt-3">@jinmiranarmy</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border-subtle">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-text-muted">
              © {new Date().getFullYear()} Miran Army. Made with 💛 for fans.
            </p>
            <p className="text-xs text-text-muted">
              Products linked through the AliExpress affiliate program
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
