import { Auth, getAuth } from 'firebase/auth';
import app from './config';

const auth: Auth = getAuth(app);

export { auth };
