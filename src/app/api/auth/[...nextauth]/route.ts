import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { query } from '../../../../../lib/db';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Corporate Login',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // Verifies both email and password against the database
        const [employee] = await query(
          `SELECT id, first_name, last_name, email, system_role FROM employees WHERE email = ? AND password = ? AND status = 'Active'`,
          [credentials.email, credentials.password]
        ) as any[];

        if (employee) {
          return {
            id: employee.id,
            name: `${employee.first_name} ${employee.last_name}`,
            email: employee.email,
            role: employee.system_role,
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };