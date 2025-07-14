import NextAuth from 'next-auth';
import { authOptions } from './auth';

const handler = NextAuth(authOptions);

// For NextAuth v4, we need to create our own signIn/signOut server actions
export { handler as handlers };

// We'll use server actions that call the NextAuth API endpoints directly
// This is the recommended approach for NextAuth v4 in production