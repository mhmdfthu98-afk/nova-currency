// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Firebase Auth
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase Firestore
import { 
    getFirestore, 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot,
    serverTimestamp,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase Storage
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// إعدادات Firebase من مشروعك
const firebaseConfig = {
    apiKey: "AIzaSyAmiuvUSKY-UPL_oD7FOgQUOUh1-lRUANo",
    authDomain: "nova-currency-app.firebaseapp.com",
    projectId: "nova-currency-app",
    storageBucket: "nova-currency-app.firebasestorage.app",
    messagingSenderId: "633638757418",
    appId: "1:633638757418:web:e221ce88973f8665c68f53",
    measurementId: "G-SR7RJTVKDN"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// تصدير جميع الخدمات
export { 
    auth, 
    db,
    storage,
    googleProvider,
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    updateDoc, 
    deleteDoc, 
    addDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot,
    serverTimestamp,
    Timestamp,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject
};
