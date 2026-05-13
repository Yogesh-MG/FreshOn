import { Leaf, Instagram, Twitter, Facebook, Mail, Phone } from "lucide-react";

export const Footer = () => (
  <footer className="bg-primary text-primary-foreground mt-8">
    <div className="container mx-auto px-4 py-14">
      <div className="grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center mb-4">
            <img src="/logo.png" alt="Freshon" className="h-10 w-auto brightness-0 invert" />
          </div>
          <p className="text-sm opacity-75 max-w-xs">
            Organic produce, delivered fresh from Indian farms to your kitchen.
          </p>
          <div className="flex gap-3 mt-5">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-smooth">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-600 mb-4">About</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><a href="#" className="hover:opacity-100">Our story</a></li>
            <li><a href="#" className="hover:opacity-100">Meet the farmers</a></li>
            <li><a href="#" className="hover:opacity-100">Sustainability</a></li>
            <li><a href="#" className="hover:opacity-100">Careers</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-600 mb-4">Help</h4>
          <ul className="space-y-2 text-sm opacity-80">
            <li><a href="#" className="hover:opacity-100">Delivery info</a></li>
            <li><a href="#" className="hover:opacity-100">Returns & refunds</a></li>
            <li><a href="#" className="hover:opacity-100">FAQs</a></li>
            <li><a href="#" className="hover:opacity-100">Contact us</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg font-600 mb-4">Get in touch</h4>
          <ul className="space-y-3 text-sm opacity-90">
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1800-FRESHON</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@freshon.in</li>
          </ul>
          <form className="mt-5 flex gap-2">
            <input type="email" placeholder="Your email" className="flex-1 px-3 py-2 rounded-xl bg-primary-foreground/10 border border-primary-foreground/20 placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:bg-primary-foreground/15" />
            <button className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold hover:opacity-90 transition-smooth">Join</button>
          </form>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs opacity-70">
        <div>© 2026 Freshon · Grown with care in India</div>
        <div className="flex gap-5">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
);
