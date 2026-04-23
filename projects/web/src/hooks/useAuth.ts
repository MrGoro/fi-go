import { useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signOut,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from 'firebase/auth';
import type { User, ConfirmationResult } from 'firebase/auth';
import { auth } from '../config/firebase';

function clearRecaptcha() {
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = undefined;
  }
}

function initRecaptcha(containerId: string) {
  if (window.recaptchaVerifier) return window.recaptchaVerifier;

  window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved - will proceed with submit
    },
    'expired-callback': () => {
      // Response expired. Ask user to solve reCAPTCHA again.
    },
  });

  return window.recaptchaVerifier;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const requestOtp = async (phoneNumber: string, containerId: string) => {
    try {
      const verifier = initRecaptcha(containerId);
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmationResult(result);
      return true;
    } catch (error) {
      console.error('Error requesting OTP:', error);
      // Reset recaptcha if it fails so it can be re-initialized
      clearRecaptcha();
      throw error;
    }
  };

  const verifyOtp = async (code: string) => {
    if (!confirmationResult) throw new Error('No confirmation result found');
    try {
      await confirmationResult.confirm(code);
      setConfirmationResult(null);
      clearRecaptcha();
      return true;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      clearRecaptcha();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return {
    user,
    loading,
    requestOtp,
    verifyOtp,
    logout,
    hasSentOtp: !!confirmationResult,
  };
}

// Global type declaration for RecaptchaVerifier on window
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}
