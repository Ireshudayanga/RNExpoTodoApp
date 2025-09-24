// lib/auth-storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function setAuthed(email: string) {
  await AsyncStorage.setItem("validUser", "true");
  await AsyncStorage.setItem("email", email);
}

export async function clearAuth() {
  await AsyncStorage.multiRemove(["validUser", "email"]);
}

export async function isAuthed() {
  return (await AsyncStorage.getItem("validUser")) === "true";
}

export async function getEmail() {
  return (await AsyncStorage.getItem("email")) || "";
}
