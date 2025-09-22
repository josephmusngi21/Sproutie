import { auth } from './config'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';


export async function signUp(email: string, password: string) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

export async function signIn(email: string, password: string) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function logOut() {
  return await signOut(auth);
}

export function subscribeToAuthChanges(callback: (user: any) => void) {
  return onAuthStateChanged(auth, callback);
}