import { Firestore, getFirestore } from 'firebase/firestore';
import app from './config';

const db: Firestore = getFirestore(app);

export { db };
