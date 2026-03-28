"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

const DEV_USER =
  process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true"
    ? ({
        uid: "dev-user",
        email: "dev@local.test",
        displayName: "Dev User",
        photoURL: null,
        emailVerified: true,
      } as unknown as User)
    : null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(DEV_USER);
  const [loading, setLoading] = useState(DEV_USER ? false : true);

  useEffect(() => {
    if (DEV_USER) return; // skip Firebase when bypassing auth

    // Fallback: if Firebase doesn't respond in 5s, stop loading
    const timeout = setTimeout(() => setLoading(false), 5000);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      clearTimeout(timeout);
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
