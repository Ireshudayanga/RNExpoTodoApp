import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { getEmail } from "../lib/authstorage";
import { createTodo, deleteTodo, fetchTodos, updateTodo } from "../lib/todos";

type Todo = { _id: string; text: string; done?: boolean };

export default function Home() {
  const [owner, setOwner] = useState<string|null>(null);
  const [task, setTask] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // get saved email
  useEffect(() => {
    (async () => {
      const email = (await getEmail()).trim().toLowerCase() || null;
      setOwner(email || null);
    })();
  }, []);

  // fetch todos whenever owner changes
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fetchTodos(owner);
        setTodos(data as Todo[]);
      } catch (e:any) {
        setErr(e.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, [owner]);

  const addTodo = async () => {
    const text = task.trim();
    if (!text) return;
    const optimistic: Todo = { _id: `tmp-${Date.now()}`, text, done: false };
    setTodos((t) => [optimistic, ...t]);
    setTask("");
    try {
      const created = await createTodo(text, owner || undefined);
      setTodos((t) => t.map((x) => (x._id === optimistic._id ? (created as Todo) : x)));
    } catch (e:any) {
      setErr(e.message || "Create failed");
      setTodos((t) => t.filter((x) => !String(x._id).startsWith("tmp-")));
    }
  };

  const toggleTodo = async (id: string) => {
    const current = todos.find((t) => t._id === id);
    if (!current) return;
    const nextDone = !current.done;
    setTodos((t) => t.map((x) => (x._id === id ? { ...x, done: nextDone } : x)));
    try {
      await updateTodo(id, { done: nextDone });
    } catch (e:any) {
      setErr(e.message || "Update failed");
      setTodos((t) => t.map((x) => (x._id === id ? { ...x, done: !nextDone } : x)));
    }
  };

  const removeTodo = async (id: string) => {
    const prev = todos;
    setTodos((t) => t.filter((x) => x._id !== id));
    try {
      await deleteTodo(id);
    } catch (e:any) {
      setErr(e.message || "Delete failed");
      setTodos(prev);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-2 text-gray-600">Loading…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 p-6">
      <Text className="text-2xl font-bold mb-4">My To-Do List</Text>

      {err ? <Text className="text-red-600 mb-2">{err}</Text> : null}

      <View className="flex-row mb-4">
        <TextInput
          className="flex-1 border rounded-l p-3"
          placeholder="Enter a task"
          value={task}
          onChangeText={setTask}
        />
        <Pressable onPress={addTodo} className="bg-blue-600 px-4 items-center justify-center rounded-r">
          <Text className="text-white font-semibold">Add</Text>
        </Pressable>
      </View>

      <FlatList
        data={todos}
        keyExtractor={(item) => item._id}
        ItemSeparatorComponent={() => <View className="h-2" />}
        renderItem={({ item }) => (
          <View className="flex-row items-center justify-between p-3 bg-white rounded-xl">
            <Text
              className={`flex-1 ${item.done ? "line-through text-gray-500" : ""}`}
              onPress={() => toggleTodo(item._id)}
            >
              {item.text}
            </Text>
            <Pressable onPress={() => removeTodo(item._id)}>
              <Text className="text-red-500 font-bold">X</Text>
            </Pressable>
          </View>
        )}
      />

      <Pressable onPress={() => router.push("/login")} className="mt-6 self-center">
        <Text className="text-blue-600 underline">
          {owner ? `Logged in as ${owner} — change?` : "Login to set email"}
        </Text>
      </Pressable>
    </View>
  );
}
