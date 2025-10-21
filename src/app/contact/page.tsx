import { Metadata } from 'next'
import PublicLayout from '@/components/layouts/PublicLayout'
import ContactForm from '@/components/ContactForm'
import { Mail, MapPin, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact | Portfolio',
  description: 'Get in touch with me for project collaborations, job opportunities, or any questions you might have.',
  openGraph: {
    title: 'Contact | Portfolio',
    description: 'Get in touch with me for project collaborations, job opportunities, or any questions you might have.',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Get In Touch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            I'm always interested in new opportunities, collaborations, and interesting projects. 
            Let's discuss how we can work together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-glass-medium backdrop-blur-md border border-border-glass dark:border-border-glass-dark rounded-xl p-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Let's Connect
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email</p>
                    <p className="text-gray-600 dark:text-gray-300">hello@portfolio.com</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Location</p>
                    <p className="text-gray-600 dark:text-gray-300">Available for remote work</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Response Time</p>
                    <p className="text-gray-600 dark:text-gray-300">Usually within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-glass-light backdrop-blur-sm border border-border-glass dark:border-border-glass-dark rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                What I'm Looking For
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                  <span>Full-stack development projects</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                  <span>React/Next.js opportunities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                  <span>Technical consulting</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-primary-600 rounded-full"></span>
                  <span>Interesting collaborations</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <div className="bg-glass-light backdrop-blur-sm border border-border-glass dark:border-border-glass-dark rounded-xl p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Prefer a Different Way to Connect?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              You can also find me on these platforms or check out my work directly.
            </p>
            <div className="flex justify-center space-x-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <span>LinkedIn</span>
              </a>
              <a
                href="/resume"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Resume</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </PublicLayout>
  )
}