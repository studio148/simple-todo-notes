import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addTodo, getTodos, type TodoItem } from "@/lib/todos.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ToDo list" },
      { name: "description", content: "A simple, append-only ToDo list." },
    ],
  }),
  component: Index,
});

function Index() {
  const getTodosFn = useServerFn(getTodos);
  const addTodoFn = useServerFn(addTodo);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery<TodoItem[]>({
    queryKey: ["todos"],
    queryFn: () => getTodosFn(),
  });

  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState("");

  const mutation = useMutation({
    mutationFn: (value: string) => addTodoFn({ data: { text: value } }),
    onSuccess: (newItems) => {
      queryClient.setQueryData(["todos"], newItems);
      setText("");
      setIsAdding(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || mutation.isPending) return;
    mutation.mutate(trimmed);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            ToDo list
          </h1>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)}>Add item</Button>
          )}
        </header>

        {isAdding && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 flex gap-2 rounded-lg border border-border bg-card p-3"
          >
            <Input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What needs to be done?"
              maxLength={500}
              disabled={mutation.isPending}
            />
            <Button type="submit" disabled={!text.trim() || mutation.isPending}>
              {mutation.isPending ? "Adding..." : "Submit"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setText("");
                setIsAdding(false);
              }}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
          </form>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No items yet. Add one to get started.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-md border border-border bg-card px-4 py-3 text-card-foreground"
              >
                {item.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
