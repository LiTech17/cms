// /components/public-footer.tsx

import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from "lucide-react";
import { fetchJsonServer } from "@/lib/json-client"; // server-side JSON fetch
import { HomeData } from "@/lib/types";

/**
 * Maps social media keys to Lucide icons.
 */
const SocialIcons: Record<string, React.ElementType> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
};

/**
 * Server Component for the footer.
 */
export const PublicFooter = async () => {
  // Fetch data directly from filesystem
  const homeData = await fetchJsonServer<HomeData>("home.json");
  const footerContent = homeData?.footer;
  const navigationItems = homeData?.header.navigation || [];

  // Show warning if footer data missing
  if (!footerContent) {
    return (
      <footer className="bg-muted/40 py-10 text-center text-sm text-destructive dark:text-destructive">
        ⚠️ Footer data missing — check <code>/data/home.json</code>.
      </footer>
    );
  }

  const { column1, column2, column3 } = footerContent;

  return (
    <footer className="bg-muted/20 dark:bg-muted/80 border-t border-border/40 text-foreground dark:text-foreground mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">
          {/* Column 1 — Logo & Mission */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-3">
              <Image
                src={column1.logo || "/uploads/logo-placeholder.png"} // must be inside /public
                alt={column1.title || "CAPDIMW Logo"}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
              <span className="text-lg font-semibold text-primary tracking-tight">
                {column1.title || "CAPDIMW.org"}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-xs">
              {column1.text || "Promoting inclusiveness among socially excluded groups."}
            </p>
          </div>

          {/* Column 2 — Quick Links */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground border-b border-primary/20 pb-2">
              Quick Links
            </h4>
            <nav className="flex flex-col space-y-2 text-sm">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/account-settings"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Admin Login
              </Link>
            </nav>
          </div>

          {/* Column 3 — Contact Info */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground border-b border-primary/20 pb-2">
              Contact Us
            </h4>
            <address className="not-italic space-y-3 text-sm leading-relaxed">
              {column2.address && (
                <p className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span>{column2.address}</span>
                </p>
              )}
              {column2.phone && (
                <p className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <a
                    href={`tel:${column2.phone}`}
                    className="hover:text-primary transition-colors"
                  >
                    {column2.phone}
                  </a>
                </p>
              )}
              {column2.email && (
                <p className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <a
                    href={`mailto:${column2.email}`}
                    className="hover:text-primary transition-colors"
                  >
                    {column2.email}
                  </a>
                </p>
              )}
            </address>
          </div>

          {/* Column 4 — Social Media */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold text-foreground border-b border-primary/20 pb-2">
              Connect
            </h4>
            <div className="flex items-center space-x-5">
              {Object.entries(column3.socials || {}).map(([platform, url]) => {
                const Icon = SocialIcons[platform];
                return url && Icon ? (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={`Visit our ${platform} page`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ) : null;
              })}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/60 mt-12 pt-6 text-center">
          <p className="text-xs text-muted-foreground tracking-wide">
            {column3.copyright ||
              `© ${new Date().getFullYear()} CAPDIMW.org — All Rights Reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
