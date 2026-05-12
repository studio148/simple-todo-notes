import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { promises as fs } from "node:fs";
import path from "node:path";

export type TodoItem = {
  id: string;
  text: string;
  createdAt: number;
};

type Store = { items: TodoItem[] };

const FILE_PATH = path.join(process.cwd(), "data", "todos.json");

let writeChain: Promise<unknown> = Promise.resolve();

async function readStore(): Promise<Store> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Store;
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };
    return parsed;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") {
      await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
      await fs.writeFile(FILE_PATH, JSON.stringify({ items: [] }, null, 2), "utf-8");
      return { items: [] };
    }
    throw err;
  }
}

async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(path.dirname(FILE_PATH), { recursive: true });
  await fs.writeFile(FILE_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export const getTodos = createServerFn({ method: "GET" }).handler(async () => {
  const store = await readStore();
  return store.items;
});

export const addTodo = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ text: z.string().trim().min(1).max(500) }).parse(data),
  )
  .handler(async ({ data }) => {
    const run = writeChain.then(async () => {
      const store = await readStore();
      const item: TodoItem = {
        id: crypto.randomUUID(),
        text: data.text,
        createdAt: Date.now(),
      };
      store.items = [item, ...store.items];
      await writeStore(store);
      return store.items;
    });
    writeChain = run.catch(() => undefined);
    return await run;
  });
