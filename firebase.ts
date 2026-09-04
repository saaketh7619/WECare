import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import { UserProfile } from './types/auth';
import { Appointment } from './types/hospital';

// Web app's Firebase configuration provided by user
export const firebaseConfig = {
  apiKey: "AIzaSyDSgxEesWZGWXxpkaEUuKUrQapS94L08ms",
  authDomain: "wecare-hospitals-9892d.firebaseapp.com",
  projectId: "wecare-hospitals-9892d",
  storageBucket: "wecare-hospitals-9892d.firebasestorage.app",
  messagingSenderId: "985673797728",
  appId: "1:985673797728:web:0c43ca2c753dc0f1b53305"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Standardized Operation types and error handler as per Firebase integration specifications
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline. Please verify network or project setup.');
    }
  }
}
testConnection();

// ==========================================
// User Profile Helpers
// ==========================================

export async function saveUserProfile(userProfile: UserProfile): Promise<void> {
  const path = `users/${userProfile.uid}`;
  try {
    const userDocRef = doc(db, 'users', userProfile.uid);
    await setDoc(userDocRef, userProfile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ==========================================
// Bookings Helpers
// ==========================================

export async function saveBookingToDb(booking: Appointment, userId: string): Promise<void> {
  const path = `bookings/${booking.id}`;
  try {
    const docRef = doc(db, 'bookings', booking.id);
    const dataToSave = {
      ...booking,
      userId,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, dataToSave);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateBookingStatusInDb(bookingId: string, status: Appointment['status']): Promise<void> {
  const path = `bookings/${bookingId}`;
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function rescheduleBookingInDb(bookingId: string, newDate: string, newSlot: string): Promise<void> {
  const path = `bookings/${bookingId}`;
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, {
      appointmentDate: newDate,
      appointmentTime: newSlot,
      status: 'Rescheduled',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export function subscribeUserBookings(
  userId: string,
  onUpdate: (bookings: Appointment[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'bookings';
  try {
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingsList: Appointment[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Appointment;
          bookingsList.push(data);
        });

        // Sort descending by appointment date or createdAt
        bookingsList.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.appointmentDate).getTime();
          const dateB = new Date(b.createdAt || b.appointmentDate).getTime();
          return dateB - dateA;
        });

        onUpdate(bookingsList);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (wrapped) {
          if (onError && wrapped instanceof Error) {
            onError(wrapped);
          }
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// ==========================================
// Admin Bookings Helpers
// ==========================================

export function subscribeAllBookings(
  onUpdate: (bookings: Appointment[]) => void,
  onError?: (err: Error) => void
): () => void {
  const path = 'bookings';
  try {
    const q = query(collection(db, 'bookings'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingsList: Appointment[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Appointment;
          bookingsList.push(data);
        });

        // Sort descending by appointment date or createdAt
        bookingsList.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.appointmentDate).getTime();
          const dateB = new Date(b.createdAt || b.appointmentDate).getTime();
          return dateB - dateA;
        });

        onUpdate(bookingsList);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, path);
        } catch (wrapped) {
          if (onError && wrapped instanceof Error) {
            onError(wrapped);
          }
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function deleteBookingInDb(bookingId: string): Promise<void> {
  const path = `bookings/${bookingId}`;
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateBookingInDb(bookingId: string, updates: Partial<Appointment>): Promise<void> {
  const path = `bookings/${bookingId}`;
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function addAdminBookingToDb(booking: Appointment): Promise<void> {
  const path = `bookings/${booking.id}`;
  try {
    const docRef = doc(db, 'bookings', booking.id);
    const dataToSave = {
      ...booking,
      userId: booking.patientId || auth.currentUser?.uid || 'admin-created',
      createdByAdmin: true,
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, dataToSave);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

