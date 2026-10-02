import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  signupWithEmail: (e: string, p: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  simulateAdminMode: boolean;
  toggleSimulateAdminMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'basudev527269@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulateAdminMode, setSimulateAdminMode] = useState(() => {
    return localStorage.getItem('ziini_admin_mode') === 'true';
  });

  const toggleSimulateAdminMode = () => {
    setSimulateAdminMode(prev => {
      const next = !prev;
      localStorage.setItem('ziini_admin_mode', String(next));
      return next;
    });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          
          const isUserAdmin = currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Customer',
              role: isUserAdmin ? 'admin' : 'customer',
              wishlist: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }

          // If designated admin, make sure admin record exists
          if (isUserAdmin) {
            const adminDocRef = doc(db, 'admins', currentUser.uid);
            await setDoc(adminDocRef, { email: currentUser.email, role: 'admin' }, { merge: true });
          }
        } catch (err) {
          console.warn('User profile sync notice:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: name });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = simulateAdminMode || (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) || (userProfile?.role === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout,
        simulateAdminMode,
        toggleSimulateAdminMode
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
