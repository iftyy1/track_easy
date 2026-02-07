import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { users } from "@/server/db/schema/auth-users";
import { eq } from "drizzle-orm";
import { UserRole } from "@/types/next-auth";
import { scryptSync } from "crypto";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [user] = await db.select().from(users).where(eq(users.email, credentials.email));
        if (!user) return null;

  // password is stored as "salt$hash" using scrypt
  
  // const passwordValid = user.password === credentials.password;
  //       if (!passwordValid) return null;
  
  const [salt, hash] = String(user.password).split('$');
  const derived = scryptSync(credentials.password, salt, 64).toString('hex');
  const passwordValid = hash === derived;
  if (!passwordValid) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
          role: (user.role as UserRole) || 'user'
        };
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
