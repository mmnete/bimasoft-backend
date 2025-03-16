// src/utils/firebaseUtils.ts
import { initializeApp, getApps } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    UserCredential,
    getAuth as getClientAuth
} from 'firebase/auth';
import { UserRecord, getAuth as getAdminAuth } from 'firebase-admin/auth';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

/**
 * Create a Firebase user account
 * @param email - User email
 * @param password - User password
 * @returns Firebase user record
 */
export const createFirebaseUser = async (email: string, password: string): Promise<UserCredential | null> => {
    try {

        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

        // Create the user with email and password
        const userCredential = await createUserWithEmailAndPassword(getClientAuth(), email, password);

        // Return the user credentials along with the generated password
        return userCredential;
    } catch (error) {
        console.error('Error creating Firebase account:', error);
        return null;
    }
};

/**
 * Log in a user using Firebase Authentication
 * @param email - User email
 * @param password - User password
 * @returns Firebase ID token
 */
export const loginUser = async (email: string, password: string): Promise<{ userCredential: UserCredential, token: string } | null> => {
    try {

        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        // const client_auth = getClientAuth(app);
        // Sign in user with email and password
        const userCredential = await signInWithEmailAndPassword(getClientAuth(), email, password);

        // Get the authentication token
        const token = await userCredential.user.getIdToken();

        return { userCredential, token };
    } catch (error) {
        console.error('Error logging in:', error);
        return null;
    }
};

export const logoutUser = async (email: string): Promise<void> => {
    try {
        const userRecord = await getAdminAuth().getUserByEmail(email);
        await getAdminAuth().revokeRefreshTokens(userRecord.uid);

        console.log('User logged out successfully');
    } catch (error) {
        console.error('Error logging out:', error);
    }
};

export const checkUserLoggedIn  = async (token: string): Promise<UserRecord | null> => {
    try {
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
        // Verify the ID token using Firebase Admin SDK
        const decodedToken = await getAdminAuth().verifyIdToken(token); // await auth.verifyIdToken(token);

        // If the token is valid, return the user record
        const user = await getAdminAuth().getUser(decodedToken.uid);

        return user;  // User is logged in, return the user data
    } catch (error) {
        console.error('Error verifying token:', error);
        return null;  // Token is invalid or expired, return null
    }
};
