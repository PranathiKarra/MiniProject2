
//   ----------------------/Database Integration/-----------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
 const firebaseConfig = {
   apiKey: "AIzaSyAzQm25GWD6IoHGulx4cnP2EMXGPw7zhxA",
   authDomain: "pilgrimages-3d287.firebaseapp.com",
   projectId: "pilgrimages-3d287",
   storageBucket: "pilgrimages-3d287.firebasestorage.app",
   messagingSenderId: "872643371829",
   appId: "1:872643371829:web:39775c20cd27116d4da27c",
   measurementId: "G-F49S5144SM"
 };
 const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
//-------------------------------/Fetching Data/-------------------------------
