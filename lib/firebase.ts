// lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyA-OWy3RKllrQGU6x5bXH--vQwAnrNI1J0',
  authDomain: 'onerji.firebaseapp.com',
  projectId: 'donerji',
  storageBucket: 'donerji.firebasestorage.app',
  messagingSenderId: '288480219081',
  appId: '1:288480219081:web:b9702155a36cbfdd776218',
  measurementId: "G-V25Z5MVJDZ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
