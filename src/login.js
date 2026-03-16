import { auth, db } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export async function loginUser() {
  try {
    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    // save user to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      uid: user.uid
    });

    // store locally
    localStorage.setItem("name", user.displayName);
    localStorage.setItem("photo", user.photoURL);

    return user;   // VERY IMPORTANT

  } catch (error) {
    console.log(error);
  }
}