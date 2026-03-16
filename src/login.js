import { auth, db } from "./firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export async function loginUser() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    await setDoc(doc(db, "users", user.uid), {
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      uid: user.uid
    });

    localStorage.setItem("name", user.displayName);
    localStorage.setItem("photo", user.photoURL);

    return user;

  } catch (error) {
    console.log(error);
  }
}