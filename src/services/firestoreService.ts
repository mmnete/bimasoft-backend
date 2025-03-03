import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, UserCredential } from 'firebase/auth';

// Firebase configuration using environment variables
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
};

// Ensure Firebase is initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
// Utility function to generate a random password
const generatePassword = (userId: string, length: number = 7): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        password += characters[randomIndex];
    }
    return password + userId;
};

// Service function to create Firebase account
export const createAccount = async (userId: string, email: string): Promise<{ userCredential: UserCredential | null, password: string } | null> => {
    try {
        // Generate a random password
        const password = generatePassword(userId);

        // Create the user with email and password
        const userCredential = await createUserWithEmailAndPassword(getAuth(), email, password);

        // Return the user credentials along with the generated password
        return { userCredential, password };
    } catch (error) {
        console.error('Error creating Firebase account:', error);
        return null;
    }
};

