import { config } from 'dotenv'
import { resolve } from 'path'

// Explicitly load .env from root directory
config({ path: resolve(__dirname, '../.env') })

import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../src/lib/password'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function main() {
  console.log('🌱 Seeding database...')
  console.log('Database URL exists:', !!process.env.DATABASE_URL)

  // Create admin user if it doesn't exist
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!'
    const hashedPassword = await hashPassword(adminPassword)

    const admin = await prisma.user.create({
      data: {
        email: process.env.ADMIN_EMAIL || 'admin@portfolio.com',
        passwordHash: hashedPassword,
        name: process.env.ADMIN_NAME || 'Portfolio Admin',
        role: 'ADMIN',
      },
    })
    console.log('✅ Created admin user:', admin.email)
  } else {
    console.log('ℹ️  Admin user already exists')
  }

  // Create default profile if it doesn't exist
  const existingProfile = await prisma.profile.findFirst()

  if (!existingProfile) {
    const profile = await prisma.profile.create({
      data: {
        name: 'Your Name',
        title: 'Full Stack Developer',
        bio: 'Passionate developer with expertise in modern web technologies.',
        email: 'contact@yourportfolio.com',
        skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js'],
        experience: [],
        education: [],
        socialLinks: {
          github: 'https://github.com/yourusername',
          linkedin: 'https://linkedin.com/in/yourusername',
          email: 'contact@yourportfolio.com'
        },
      },
    })
    console.log('✅ Created default profile')
  } else {
    console.log('ℹ️  Profile already exists')
  }

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })