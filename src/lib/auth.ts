import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('🚫 Missing credentials')
          return null
        }

        try {
          console.log('🔍 Attempting login for:', credentials.email)
          
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: {
              userPharmacies: {
                include: { pharmacy: true }
              }
            }
          })

          console.log('👤 User found:', user ? 'YES' : 'NO')
          if (user) {
            console.log('   - Has password:', user.hashedPassword ? 'YES' : 'NO')
            console.log('   - Is approved:', user.isApproved)
            console.log('   - Approval status:', user.approvalStatus)
            console.log('   - Role:', user.role)
          }

          if (!user || !user.hashedPassword) {
            console.log('❌ User not found or no password')
            return null
          }

          // Check if user is approved
          if (!user.isApproved || user.approvalStatus !== 'approved') {
            console.log('❌ User not approved:', { isApproved: user.isApproved, status: user.approvalStatus })
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.hashedPassword)
          console.log('🔐 Password valid:', isPasswordValid)
          if (!isPasswordValid) {
            console.log('❌ Invalid password')
            return null
          }

          // Format pharmacies for session
          const pharmacies = user.userPharmacies.map(up => ({
            id: up.pharmacy.id,
            name: up.pharmacy.name,
            code: up.pharmacy.code
          }))

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            pharmacies: pharmacies,
            mustChangePassword: false // Default to false since field doesn't exist in schema
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.pharmacies = user.pharmacies
        token.mustChangePassword = user.mustChangePassword
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.pharmacies = token.pharmacies as any[]
        session.user.mustChangePassword = token.mustChangePassword as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/signin',
    signOut: '/signout',
  }
}

// NextAuth v4 export
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

// For server-side usage
export { authOptions as auth }