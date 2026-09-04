import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider, getUserProfile, saveUserProfile } from '../firebase';
import { UserProfile } from '../types/auth';

export const ADMIN_EMAIL = 'saaketh7619@gmail.com';

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  authModalOpen: boolean;
  authModalMode: 'signin' | 'signup';
  openAuthModal: (mode?: 'signin' | 'signup', onSuccessfulAuth?: () => void) => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string, phone: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Admin portal is strictly restricted: ONLY after sign in AND ONLY for admin email (saaketh7619@gmail.com)
  const isAdmin = Boolean(user && user.email?.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase());

  // Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [postAuthCallback, setPostAuthCallback] = useState<(() => void) | null>(null);

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const isUserAdmin = currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
        try {
          const profile = await getUserProfile(currentUser.uid);
          if (profile) {
            if (isUserAdmin && profile.role !== 'admin') {
              profile.role = 'admin';
              saveUserProfile(profile).catch(() => {});
            }
            setUserProfile(profile);
          } else {
            // First time profile
            const fallbackProfile: UserProfile = {
              uid: currentUser.uid,
              name: currentUser.displayName || (isUserAdmin ? 'Hospital Administrator' : (currentUser.email?.split('@')[0] || 'Patient')),
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || undefined,
              role: isUserAdmin ? 'admin' : 'patient',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await saveUserProfile(fallbackProfile);
            setUserProfile(fallbackProfile);
          }
        } catch (e) {
          console.warn('Could not sync user profile with Firestore:', e);
          // Still provide in-memory profile so user isn't locked out
          setUserProfile({
            uid: currentUser.uid,
            name: currentUser.displayName || (isUserAdmin ? 'Hospital Administrator' : (currentUser.email?.split('@')[0] || 'Patient')),
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || undefined,
            role: isUserAdmin ? 'admin' : 'patient',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = (mode: 'signin' | 'signup' = 'signin', onSuccessfulAuth?: () => void) => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    if (onSuccessfulAuth) {
      setPostAuthCallback(() => onSuccessfulAuth);
    } else {
      setPostAuthCallback(null);
    }
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setPostAuthCallback(null);
  };

  const executePostAuth = () => {
    if (postAuthCallback) {
      setTimeout(() => {
        postAuthCallback();
        setPostAuthCallback(null);
      }, 200);
    }
    setAuthModalOpen(false);
  };

  // Sign In with Email & Password
  const signInWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      try {
        const profile = await getUserProfile(cred.user.uid);
        if (profile) {
          setUserProfile(profile);
        } else {
          const fallback: UserProfile = {
            uid: cred.user.uid,
            name: cred.user.displayName || cred.user.email?.split('@')[0] || 'Patient',
            email: cred.user.email || '',
            role: 'patient',
            createdAt: new Date().toISOString(),
          };
          setUserProfile(fallback);
          saveUserProfile(fallback).catch((err) => console.warn('Deferred profile save notice:', err));
        }
      } catch (err) {
        console.warn('Profile fetch notice:', err);
        setUserProfile({
          uid: cred.user.uid,
          name: cred.user.displayName || cred.user.email?.split('@')[0] || 'Patient',
          email: cred.user.email || '',
          role: 'patient',
          createdAt: new Date().toISOString(),
        });
      }
      executePostAuth();
    }
  };

  // Sign Up with Email, Name & Phone
  const signUpWithEmail = async (name: string, email: string, pass: string, phone: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      try {
        await updateProfile(cred.user, { displayName: name });
      } catch (e) {
        console.warn('Profile name update notice:', e);
      }
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role: 'patient',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUserProfile(newProfile);
      try {
        await saveUserProfile(newProfile);
      } catch (profileErr) {
        console.warn('Profile persistence notice:', profileErr);
      }
      executePostAuth();
    }
  };

  // Sign In with Google popup
  const signInWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    if (cred.user) {
      try {
        const existing = await getUserProfile(cred.user.uid);
        if (existing) {
          setUserProfile(existing);
        } else {
          const newProfile: UserProfile = {
            uid: cred.user.uid,
            name: cred.user.displayName || cred.user.email?.split('@')[0] || 'Patient',
            email: cred.user.email || '',
            photoURL: cred.user.photoURL || undefined,
            role: 'patient',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUserProfile(newProfile);
          saveUserProfile(newProfile).catch((err) => console.warn('Deferred google profile save notice:', err));
        }
      } catch (err) {
        console.warn('Google profile fetch notice:', err);
        setUserProfile({
          uid: cred.user.uid,
          name: cred.user.displayName || cred.user.email?.split('@')[0] || 'Patient',
          email: cred.user.email || '',
          photoURL: cred.user.photoURL || undefined,
          role: 'patient',
          createdAt: new Date().toISOString(),
        });
      }
      executePostAuth();
    }
  };

  // Log Out
  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        loading,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
