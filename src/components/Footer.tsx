import { motion } from "framer-motion";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    "Quick Links": ["About Us", "Contact Us", "Terms of Use", "Privacy Policy"],
    "Movies": ["Now Showing", "Coming Soon", "Exclusives", "Premieres"],
    "Help": ["FAQs", "Customer Care", "Feedback", "Gift Cards"],
  };

  const socialLinks = [
    { icon: Facebook, label: "Facebook" },
    { icon: Twitter, label: "Twitter" },
    { icon: Instagram, label: "Instagram" },
    { icon: Youtube, label: "YouTube" },
  ];

  return (
    <footer className="bg-card border-t border-border mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <span className="font-display text-xl text-primary-foreground">B</span>
              </div>
              <span className="font-display text-xl text-foreground">
                BOOK<span className="text-primary">MY</span>SHOW
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Your one-stop destination for booking movie tickets, events, and entertainment experiences.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ icon: Icon, label }) => (
                <motion.a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="p-2 bg-secondary border border-border rounded-lg hover:bg-primary hover:border-primary transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className="w-5 h-5 text-foreground" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display text-lg text-foreground mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-muted-foreground text-sm hover:text-primary transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © 2026 BookMyShow. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-muted-foreground text-sm hover:text-foreground transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
