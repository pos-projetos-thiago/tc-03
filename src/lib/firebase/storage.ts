import { FirebaseStorage, getStorage } from 'firebase/storage';
import app from './config';

const storage: FirebaseStorage = getStorage(app);

export { storage };
