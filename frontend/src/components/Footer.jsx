import React from 'react';
import { Facebook, Instagram, Twitter, Youtube, MapPin, Phone, Mail } from 'lucide-react';
import { useSiteData } from "../context/SiteDataContext"
const Footer = () => {
  const {siteData} = useSiteData();
  const address = siteData.gym_address;
  const mapsUrl = "https://www.google.com/maps?q=18.293064,83.548727";

  const socail_media = [
                        [Instagram, siteData.instagram],
                        [Facebook, siteData.facebook],
                        [Twitter, siteData.twitter],
                        [Youtube, siteData.youtube]
                       ]

  return (
    <footer id="contact" className="bg-black border-t border-white/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            ROYAL<span className="text-royal-gold">FITNESS</span>
          </h2>
          <p className="text-gray-400 mb-6">
            {siteData.footer_description}
          </p>
          <div className="flex gap-4">
            {/* eslint-disable-next-line no-unused-vars, no-unused-vars, no-unused-vars */}
            {socail_media.map(([Icon, link], i) => (
              <a
                key={i}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black transition-all"
              >
                <Icon size={20} />
              </a>
            ))}
          </div>

        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">
            Contact Us
          </h3>

          <div className="space-y-4 text-gray-400">
            
            {/* Location */}
            <div className="flex items-start gap-3">
              <MapPin className="text-royal-gold flex-shrink-0 mt-1" />
              <div className="space-y-1">
                <p>{address}</p>
                <div className="flex gap-4 text-sm">
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-royal-gold hover:underline"
                  >
                    Get Directions
                  </a>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-royal-gold hover:underline"
                  >
                    View in Map
                  </a>
                </div>
              </div>
            </div>

            {/* Phone 1 */}
            <div className="flex items-center gap-3">
              <Phone className="text-royal-gold flex-shrink-0" />
              <a
                href="tel:+919876543210"
                className="hover:text-royal-gold transition"
              >
                +91 {siteData.phone1}
              </a>
            </div>

            {/* Phone 2 */}
            {siteData.phone2 && (<div className="flex items-center gap-3">
              <Phone className="text-royal-gold flex-shrink-0" />
              <a
                href="tel:+919876543210"
                className="hover:text-royal-gold transition"
              >
                +91 {siteData.phone2}
              </a>
            </div>)}

            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="text-royal-gold flex-shrink-0" />
              <a
                href="mailto:example@royalfitness.com"
                className="hover:text-royal-gold transition"
              >
                {siteData.email}
              </a>
            </div>
          </div>
        </div>

        {/* Hours */}
        <div>
          <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">
            Opening Hours
          </h3>
          <ul className="space-y-2 text-gray-400">
            <li className="flex justify-between">
              <span>Mon - Fri</span>
              <span>5:00 AM - 8:00 PM</span>
            </li>
            <li className="flex justify-between">
              <span>Saturday</span>
              <span>6:00 AM - 10:00 PM</span>
            </li>
            <li className="flex justify-between text-royal-gold">
              <span>Sunday</span>
              <span>8:00 AM - 8:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8 text-center text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} Royal Fitness. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
