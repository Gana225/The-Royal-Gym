import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Zap, Award } from 'lucide-react';

const features = [
  { icon: Target, title: "Expert Trainers", desc: "Elite coaching from certified professionals." },
  { icon: Zap, title: "Modern Equipment", desc: "State-of-the-art biomechanical machinery." },
  { icon: Users, title: "Community", desc: "A supportive environment of high achievers." },
  { icon: Award, title: "Proven Results", desc: "Thousands of transformation success stories." },
];

const Features = () => {
  return (
    <section id="about" className="section-padding bg-royal-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-sans mb-4">Why Choose <span className="text-gradient-gold">The Royal Gym?</span></h2>
          <div className="w-24 h-1 bg-royal-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="glass-card p-8 rounded-2xl text-center group cursor-pointer hover:border-royal-gold/50 transition-all duration-300"
            >
              <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white transition-colors duration-300">
                <item.icon className="w-8 h-8 text-royal-gold group-hover:text-black transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;