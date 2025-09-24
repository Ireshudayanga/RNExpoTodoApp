import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { setAuthed } from "../lib/authstorage";

export default function Login() {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    if (!email.trim()) return;
    await setAuthed(email.trim().toLowerCase());
    router.replace("/"); // go to Home
  };

  return (
    <View className="flex-1 items-center justify-center px-6 bg-gray-100">
      <View className="w-full max-w-xs rounded-2xl bg-white p-6 space-y-3">
        <Text className="text-xl font-bold text-center">Login</Text>
        <TextInput
          className="border rounded p-2"
          placeholder="Enter your email"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <Pressable
          onPress={handleLogin}
          className="bg-blue-600 rounded p-3 mt-3"
        >
          <Text className="text-white text-center font-semibold">
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
