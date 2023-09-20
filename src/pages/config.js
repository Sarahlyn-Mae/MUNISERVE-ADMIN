import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDwnErQ_yVHlzzDQ1AmbtrEFS2fCHQXlys",
    authDomain: "muniserve-86be6.firebaseapp.com",
    projectId: "muniserve-86be6",
    storageBucket: "muniserve-86be6.appspot.com",
    messagingSenderId: "832647182248",
    appId: "1:832647182248:web:58bf00709fef57f3964f9d",
    measurementId: "G-W40JVJ3WK9"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export const signInWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      const name = result.user.displayName;
      const email = result.user.email;
      const profilePic = result.user.photoURL;

      localStorage.setItem("name", name);
      localStorage.setItem("email", email);
      localStorage.setItem("profilePic", profilePic);
    })
    .catch((error) => {
      console.log(error);
    });
};