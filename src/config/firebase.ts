import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC6ZgBa5S_66-Mp3P29VEVKNXMHRqLDkTU",
  authDomain: "sensorapp-35807.firebaseapp.com",
  databaseURL: "https://sensorapp-35807-default-rtdb.firebaseio.com",
  projectId: "sensorapp-35807",
  storageBucket: "sensorapp-35807.firebasestorage.app",
  messagingSenderId: "296882403725",
  appId: "1:296882403725:web:fa158a418d8df91affa5c4",
  measurementId: "G-T5DEMSBTRB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export default app;
