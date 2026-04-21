import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, githubProvider, googleProvider } from "../lib/firebase";
import { dbService } from "../services/dbService";
import { UserProfile } from "../types";

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  authProvider: "google" | "github" | null;
  githubUsername: string | null;
  githubToken: string | null;
  authError: string | null;
  authLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authProvider, setAuthProvider] = useState<"google" | "github" | null>(null);
  const [githubUsername, setGithubUsername] = useState<string | null>(sessionStorage.getItem("githubUsername"));
  const [githubToken, setGithubToken] = useState<string | null>(sessionStorage.getItem("githubToken"));
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userProfile = await dbService.getProfileByUid(currentUser.uid);
        setProfile(userProfile);

        if (userProfile?.authProvider) {
          setAuthProvider(userProfile.authProvider);
        } else if (currentUser.providerData.some((p) => p.providerId === "github.com")) {
          setAuthProvider("github");
        } else if (currentUser.providerData.some((p) => p.providerId === "google.com")) {
          setAuthProvider("google");
        } else {
          setAuthProvider(null);
        }

        if (userProfile?.githubUsername) {
          setGithubUsername(userProfile.githubUsername);
          sessionStorage.setItem("githubUsername", userProfile.githubUsername);
        }
      } else {
        setProfile(null);
        setAuthProvider(null);
        setGithubUsername(null);
        setGithubToken(null);
        sessionStorage.removeItem("githubUsername");
        sessionStorage.removeItem("githubToken");
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await signInWithPopup(auth, googleProvider);
      setAuthProvider("google");
    } catch (error) {
      console.error("Login Error:", error);
      setAuthError(error instanceof Error ? error.message : "Sign in failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithGitHub = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const result = await signInWithPopup(auth, githubProvider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken ?? null;

      setAuthProvider("github");
      setGithubToken(accessToken);

      if (accessToken) {
        sessionStorage.setItem("githubToken", accessToken);
      }

      if (accessToken) {
        const ghResponse = await fetch("https://api.github.com/user", {
          headers: {
            Accept: "application/vnd.github+json",
            Authorization: `token ${accessToken}`,
          },
        });

        if (ghResponse.ok) {
          const ghUser = await ghResponse.json() as { login?: string };
          if (ghUser.login) {
            setGithubUsername(ghUser.login);
            sessionStorage.setItem("githubUsername", ghUser.login);
          }
        }
      }
    } catch (error) {
      console.error("GitHub Login Error:", error);
      setAuthError(error instanceof Error ? error.message : "GitHub sign in failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email Login Error:", error);
      setAuthError(error instanceof Error ? error.message : "Email sign in failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const registerWithEmail = async (email: string, password: string) => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email Register Error:", error);
      setAuthError(error instanceof Error ? error.message : "Email account creation failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAuthProvider(null);
      setGithubUsername(null);
      setGithubToken(null);
      sessionStorage.removeItem("githubUsername");
      sessionStorage.removeItem("githubToken");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await dbService.getProfileByUid(user.uid);
      setProfile(userProfile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authProvider,
        githubUsername,
        githubToken,
        authError,
        authLoading,
        loginWithGoogle,
        loginWithGitHub,
        loginWithEmail,
        registerWithEmail,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
