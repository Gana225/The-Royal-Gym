/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Dumbbell } from "lucide-react";
import { Link } from "react-scroll";
import { useNavigate, useLocation } from "react-router-dom";

const navLinks = [
  { name: "Home", to: "home" },
  { name: "About", to: "about" },
  { name: "Status", to: "status" },
  { name: "Membership", to: "membership" },
  { name: "Gallery", to: "gallery" },
  { name: "Contact", to: "contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Navbar Scroll Background Effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ FIX: Handle Scroll Links From Other Pages
  const handleScrollLink = (section) => {
    if (location.pathname !== "/") {
      // ✅ First navigate back to home
      navigate("/");

      // ✅ Then scroll after page loads
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 500);
    }
  };

  return (
    <nav
      className={`w-full z-50 transition-all duration-300 
        ${
          scrolled
            ? "bg-royal-900/90 backdrop-blur-md shadow-lg border-b border-white/10"
            : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* ✅ Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Dumbbell className="h-8 w-8 text-royal-gold" />
            <span className="text-2xl font-bold tracking-wider font-sans text-white">
              <span className="text-royal-gold mr-2">THE</span>
              ROYAL
              <span className="text-royal-gold ml-2">GYM</span>
            </span>
          </div>

          {/* ✅ Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  smooth={true}
                  duration={500}
                  onClick={() => handleScrollLink(link.to)}
                  className="cursor-pointer text-gray-300 hover:text-royal-gold transition-colors duration-300 text-sm font-medium uppercase tracking-widest"
                >
                  {link.name}
                </Link>
              ))}

              {/* ✅ Login Button */}
              <div
                onClick={() => navigate("/admin/login")}
                className="cursor-pointer text-gray-300 hover:text-royal-gold transition-colors duration-300 text-sm font-medium uppercase tracking-widest"
              >
                Login
              </div>
            </div>
          </div>

          {/* ✅ Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-royal-gold hover:text-white transition-colors"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-royal-800 border-t border-white/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.to}
                  smooth={true}
                  duration={500}
                  onClick={() => {
                    handleScrollLink(link.to);
                    setIsOpen(false);
                  }}
                  className="block px-3 py-4 rounded-md text-base font-medium text-gray-300 hover:text-royal-gold hover:bg-black/20"
                >
                  {link.name}
                </Link>
              ))}

              {/* ✅ Mobile Login */}
              <div
                onClick={() => {
                  setIsOpen(false);
                  navigate("/admin/login");
                }}
                className="block px-3 py-4 rounded-md text-base font-medium text-gray-300 hover:text-royal-gold hover:bg-black/20"
              >
                Login
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
