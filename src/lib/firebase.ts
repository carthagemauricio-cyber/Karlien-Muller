import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json'; 

const app = initializeApp(firebaseConfig);
const firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);

enableIndexedDbPersistence(firestoreDb).catch((err) => {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be cleared in one tab at a a time.
        console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the features required to enable persistence
        console.warn('Persistence not supported in this browser');
    }
});

export const db = firestoreDb;

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export enum OperationType {
  CREATE = 'create',

  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

import toast from 'react-hot-toast';

import i18n from '../i18n/config';

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid || 'anonymous',
      email: auth.currentUser?.email || 'anonymous',
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || true,
    },
    operationType,
    path
  };
  
  console.error('Firestore Error: ', errInfo);
  
  if (errorMessage.includes('Missing or insufficient permissions')) {
    toast.error(i18n.t('common.permission_error', 'Erro de permissão: Você precisa estar logado como administrador para realizar esta ação.'), { duration: 5000 });
  } else {
    toast.error(i18n.t('common.system_error', 'Erro de sistema: {{error}}', { error: errorMessage }), { duration: 5000 });
  }
}

// Quick connection test
export async function testConnection() {
  try {
    await getDoc(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
