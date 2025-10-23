'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'
import GlassmorphismCard from '@/components/glassmorphism/GlassmorphismCard'
import { useApiFormSubmission } from '@/hooks/useFormSubmission'
import FormLoadingState from '@/components/ui/FormLoadingState'
import ErrorDisplay from '@/components/ui/ErrorDisplay'
import { ContactFormData, ApiResponse } from '@/types'
import { cn } from '@/lib/utils'

interface ContactFormProps {
    className?: string
}

interface FormErrors {
    name?: string
    email?: string
    subject?: string
    message?: string
    general?: string
}

export default function ContactForm({ className }: ContactFormProps) {
    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        subject: '',
        message: ''
    })

    const [errors, setErrors] = useState<FormErrors>({})
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [honeypot, setHoneypot] = useState('')

    // Form submission with built-in error handling and toasts
    const { state, submitToApi } = useApiFormSubmission('/api/contact', {
        successMessage: 'Your message has been sent successfully! I\'ll get back to you soon.',
        onSuccess: () => {
            setIsSubmitted(true)
            setFormData({ name: '', email: '', subject: '', message: '' })
        },
        onError: (error) => {
            setErrors({ general: error })
        }
    })

    // Real-time validation
    const validateField = (name: keyof ContactFormData, value: string): string | undefined => {
        switch (name) {
            case 'name':
                if (!value.trim()) return 'Name is required'
                if (value.trim().length < 2) return 'Name must be at least 2 characters'
                if (value.trim().length > 100) return 'Name must be less than 100 characters'
                break
            case 'email':
                if (!value.trim()) return 'Email is required'
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
                if (!emailRegex.test(value)) return 'Please enter a valid email address'
                break
            case 'subject':
                if (value && value.length > 200) return 'Subject must be less than 200 characters'
                break
            case 'message':
                if (!value.trim()) return 'Message is required'
                if (value.trim().length < 10) return 'Message must be at least 10 characters'
                if (value.trim().length > 5000) return 'Message must be less than 5000 characters'
                break
        }
        return undefined
    }

    const handleInputChange = (name: keyof ContactFormData, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))

        // Clear error for this field and validate in real-time
        const error = validateField(name, value)
        setErrors(prev => ({ ...prev, [name]: error }))
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        // Validate all fields
        Object.entries(formData).forEach(([key, value]) => {
            const error = validateField(key as keyof ContactFormData, value)
            if (error) {
                newErrors[key as keyof FormErrors] = error
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Honeypot check - if filled, it's likely a bot
        if (honeypot) {
            return
        }

        if (!validateForm()) {
            return
        }

        setErrors({})

        await submitToApi(formData)
    }

    if (isSubmitted) {
        return (
            <GlassmorphismCard className={cn('p-8 text-center', className)}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-green-600 dark:text-green-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Message Sent Successfully!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Thank you for reaching out. I'll get back to you as soon as possible.
                    </p>
                    <Button
                        variant="glass"
                        onClick={() => setIsSubmitted(false)}
                    >
                        Send Another Message
                    </Button>
                </motion.div>
            </GlassmorphismCard>
        )
    }

    return (
        <GlassmorphismCard className={cn('p-8', className)}>
            <FormLoadingState 
                loading={state.loading} 
                loadingText="Sending your message..."
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field - hidden from users */}
                <input
                    type="text"
                    name="website"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                    className="absolute left-[-9999px] opacity-0"
                    tabIndex={-1}
                    autoComplete="off"
                />

                {(errors.general || state.error) && (
                    <ErrorDisplay
                        error={errors.general || state.error}
                        title="Failed to Send Message"
                        action={{
                            label: 'Try Again',
                            onClick: () => {
                                setErrors({})
                                handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                            }
                        }}
                    />
                )}

                <div className="grid grid-cols-1 tablet:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={cn(
                                'w-full px-4 py-3 bg-glass-light dark:bg-glass-dark backdrop-blur-sm border rounded-lg',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                                'transition-all duration-200 touch-manipulation min-h-[44px]',
                                'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
                                'text-base', // Prevent zoom on iOS
                                errors.name
                                    ? 'border-red-300 dark:border-red-600'
                                    : 'border-border-glass dark:border-border-glass-dark'
                            )}
                            placeholder="Your full name"
                            disabled={state.loading}
                        />
                        {errors.name && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1 text-sm text-red-600 dark:text-red-400"
                            >
                                {errors.name}
                            </motion.p>
                        )}
                    </div>

                    {/* Email Field */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={cn(
                                'w-full px-4 py-3 bg-glass-light dark:bg-glass-dark backdrop-blur-sm border rounded-lg',
                                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                                'transition-all duration-200 touch-manipulation min-h-[44px]',
                                'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
                                'text-base', // Prevent zoom on iOS
                                errors.email
                                    ? 'border-red-300 dark:border-red-600'
                                    : 'border-border-glass dark:border-border-glass-dark'
                            )}
                            placeholder="your.email@example.com"
                            disabled={state.loading}
                        />
                        {errors.email && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-1 text-sm text-red-600 dark:text-red-400"
                            >
                                {errors.email}
                            </motion.p>
                        )}
                    </div>
                </div>

                {/* Subject Field */}
                <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject
                    </label>
                    <input
                        type="text"
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        className={cn(
                            'w-full px-4 py-3 bg-glass-light dark:bg-glass-dark backdrop-blur-sm border rounded-lg',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                            'transition-all duration-200 touch-manipulation min-h-[44px]',
                            'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
                            'text-base', // Prevent zoom on iOS
                            errors.subject
                                ? 'border-red-300 dark:border-red-600'
                                : 'border-border-glass dark:border-border-glass-dark'
                        )}
                        placeholder="What's this about?"
                        disabled={state.loading}
                    />
                    {errors.subject && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-600 dark:text-red-400"
                        >
                            {errors.subject}
                        </motion.p>
                    )}
                </div>

                {/* Message Field */}
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Message *
                    </label>
                    <textarea
                        id="message"
                        rows={6}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        className={cn(
                            'w-full px-4 py-3 bg-glass-light dark:bg-glass-dark backdrop-blur-sm border rounded-lg',
                            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                            'transition-all duration-200 resize-vertical touch-manipulation',
                            'text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
                            'text-base', // Prevent zoom on iOS
                            errors.message
                                ? 'border-red-300 dark:border-red-600'
                                : 'border-border-glass dark:border-border-glass-dark'
                        )}
                        placeholder="Tell me about your project, question, or how I can help you..."
                        disabled={state.loading}
                    />
                    {errors.message && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-600 dark:text-red-400"
                        >
                            {errors.message}
                        </motion.p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {formData.message.length}/5000 characters
                    </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={state.loading}
                        disabled={state.loading}
                        className="min-w-[140px] touch-manipulation min-h-[44px]"
                    >
                        {state.loading ? 'Sending...' : 'Send Message'}
                    </Button>
                </div>
            </form>
            </FormLoadingState>
        </GlassmorphismCard>
    )
}