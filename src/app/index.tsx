import { auth } from "@/lib/firebase";
import { Redirect } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

export default function Index() {
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(user !== null);
      setIsChecking(false);
    });

    return unsubscribe;
  }, []);

  if (isChecking) {
    return null;
  }

  return (
    <Redirect
      href={isLoggedIn ? "/(tab)" : "/login"}
    />
  );
}