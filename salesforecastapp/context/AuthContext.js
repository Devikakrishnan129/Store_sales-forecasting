// context/AuthContext.js

'use client'; // This context will be used on the client-side

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'; // Renamed signOut to firebaseSignOut to avoid conflict
import { auth } from '@/lib/firebase'; // Correct path using alias

// Create the AuthContext
const AuthContext = createContext();

// Create a custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};

// AuthProvider component to wrap your application
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // Tracks if auth state is still loading

  useEffect(() => {
    // This function subscribes to Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Set the current user
      setLoading(false); // Authentication state has been loaded
    });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Function to handle logout
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      // Optionally handle logout error
    }
  };

  const value = {
    currentUser,
    loading,
    signOut,
  };

  // Only render children when the authentication state has been determined
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
