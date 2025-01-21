// atoms/authAtom.ts
import {atom} from 'jotai';

interface User {
  id: number;
  name: string;
  email: string;
}

export const authTokenAtom = atom<string | null>(null); // JWT token
export const userAtom = atom<User | null>(null); // User information
export const isAuthenticatedAtom = atom(get => Boolean(get(authTokenAtom))); // Derived atom
