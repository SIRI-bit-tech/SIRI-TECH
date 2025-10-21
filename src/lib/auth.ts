import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    async hashPassword(password: string) {
      return await bcrypt.hash(password, 12)
    },
    async verifyPassword(password: string, hash: string) {
      return await bcrypt.compare(password, hash)
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "ADMIN",
      },
    },
  },
  advanced: {
    generateId: () => crypto.randomUUID(),
  },
  trustedOrigins: [
    process.env.NODE_ENV === "production" 
      ? process.env.NEXTAUTH_URL || "https://your-domain.com"
      : "http://localhost:3000"
  ],
})

export type Session = typeof auth.$Infer.Session
export type User = typeof auth.$Infer.Session.user