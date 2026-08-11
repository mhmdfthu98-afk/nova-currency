/* =========================================
   NOVA FIREBASE CONFIG - ACTIVE KEYS
   ========================================= */

// نستخدم الإصدارات المتوافقة من Firebase CDN للعمل على الهاتف مباشرة
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";

// تم إدراج المفاتيح الخاصة بك هنا
const firebaseConfig = {
  apiKey: "AIzaSyAmiuvUSKY-UPL_oD7FOgQUOUh1-lRUANo",
  authDomain: "nova-currency-app.firebaseapp.com",
  projectId: "nova-currency-app",
  storageBucket: "nova-currency-app.firebasestorage.app",
  messagingSenderId: "633638757418",
  appId: "1:633638757418:web:e221ce88973f8665c68f53",
  measurementId: "G-SR7RJTVKDN"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);

// تصدير الخدمات (لاحظ استخدام export بدلاً من module.exports)
export const db = getFirestore(app);
export const auth = getAuth(app);