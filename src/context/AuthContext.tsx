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

export const AUTHORIZED_ADMIN_EMAIL = 'basudev527269@gmail.com';

/**
 * Strict server-trusted authorization check using the authenticated token
 */
export const isAuthorizedAdminUser = (currentUser: User | null): boolean => {
  if (!currentUser || !currentUser.email) return false;
  
  const normalizedEmail = currentUser.email.trim().toLowerCase();
  const targetEmail = AUTHORIZED_ADMIN_EMAIL.toLowerCase();
  
  if (normalizedEmail !== targetEmail) {
    return false;
  }

  // Must be verified by Google or email verification
  const isGoogle = currentUser.providerData.some(p => p.providerId === 'google.com');
  const isVerified = Boolean(currentUser.emailVerified || isGoogle);

  return isVerified;
};

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  authorizedAdminEmail: string;
  loginWithGoogle: () => Promise<User>;
  loginWithEmail: (e: string, p: string) => Promise<void>;
  signupWithEmail: (e: string, p: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Strictly compute admin authorization from authenticated Firebase identity
  const isAdmin = isAuthorizedAdminUser(user);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const isUserAdmin = isAuthorizedAdminUser(currentUser);
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || (isUserAdmin ? 'Administrator' : 'Customer'),
              role: isUserAdmin ? 'admin' : 'customer',
              wishlist: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }

          // If confirmed authorized admin, record admin presence
          if (isUserAdmin) {
            const adminDocRef = doc(db, 'admins', currentUser.uid);
            await setDoc(adminDocRef, { 
              email: currentUser.email, 
              role: 'admin',
              lastLogin: new Date().toISOString() 
            }, { merge: true });
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

  const loginWithGoogle = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return result.user;
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
    try {
      localStorage.removeItem('ziini_admin_mode');
    } catch {}
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        authorizedAdminEmail: AUTHORIZED_ADMIN_EMAIL,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        logout
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
