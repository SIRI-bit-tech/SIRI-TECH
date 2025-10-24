'use client'

import { motion } from 'framer-motion'
import GlassmorphismCard from '../glassmorphism/GlassmorphismCard'
import { Github, Linkedin, Twitter, Mail } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { name: 'GitHub', href: '#', icon: <Github className="w-5 h-5" /> },
    { name: 'LinkedIn', href: '#', icon: <Linkedin className="w-5 h-5" /> },
    { name: 'Twitter', href: '#', icon: <Twitter className="w-5 h-5" /> },
    { name: 'Email', href: 'mailto:contact@example.com', icon: <Mail className="w-5 h-5" /> },
  ]

  const footerLinks = [
    { name: 'Home', href: '/' },
    { name: 'Projects', href: '/projects' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <footer className="relative mt-20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <GlassmorphismCard 
          variant="medium" 
          className="p-8"
          animate={false}
          hover={false}
        >
          <div className="grid grid-cols-1 tablet:grid-cols-3 gap-8">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Portfolio
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Crafting digital experiences with modern web technologies. 
                Passionate about clean code and innovative solutions.
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {footerLinks.map((link, index) => (
                  <motion.li
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <a
                      href={link.href}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors text-sm"
                    >
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Connect
              </h4>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className="w-12 h-12 rounded-full bg-glass-light dark:bg-glass-dark-medium backdrop-blur-sm border border-border-glass dark:border-border-glass-dark flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-glass-medium dark:hover:bg-glass-dark-heavy transition-all duration-200 touch-manipulation"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    title={social.name}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col xs:flex-row justify-between items-center space-y-4 xs:space-y-0">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                © {currentYear} Portfolio. All rights reserved.
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Built with Next.js & TypeScript
              </p>
            </div>
          </motion.div>
        </GlassmorphismCard>
      </div>
    </footer>
  )
}

Footer.displayName = 'Footer'

export default Footer