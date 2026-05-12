# ToDo List with JSON file storage

## Overview
A single-page todo list. Title "ToDo list" + "Add item" button that reveals an input. Submitting prepends a new (immutable, undeletable, unsortable) item. Data persists in a local JSON file on the server.

## Storage
- File: `data/todos.json` at project root
- Shape: `{ "items": [{ "id": string, "text": string, "createdAt": number }] }`
- Newest items at index 0

## Server functions (`src/lib/todos.functions.ts`)
- `getTodos` (GET): reads the JSON file, returns `items`. Creates the file with `{ items: [] }` if missing.
- `addTodo` (POST): validates `{ text: string (1-500) }` with Zod, prepends `{ id: crypto.randomUUID(), text, createdAt: Date.now() }`, writes back, returns the new list.
- Uses `node:fs/promises` and `node:path`. File access wrapped in a tiny in-handler mutex (sequential await) to avoid concurrent write races.

## Route (`src/routes/index.tsx`)
Replace the placeholder. Uses TanStack Query:
- `useQuery(['todos'], getTodos)` for the list
- `useMutation(addTodo)` that invalidates `['todos']` on success
- Local UI state: `isAdding` (boolean), `text` (string)
- Header: `<h1>ToDo list</h1>`
- Button "Add item" toggles input row. Input + Submit button; Enter submits. After submit, input clears and closes.
- List rendered as a plain `<ul>`, each item shows only its text (no edit/delete controls).

## Styling
Use existing semantic tokens (`bg-background`, `text-foreground`, `border`, `bg-primary`, etc.) with shadcn `Button` and `Input`. Clean centered card layout, max-width ~600px.

## SEO
Update route `head()`: title "ToDo list", matching description, single H1.

## Files touched
- New: `src/lib/todos.functions.ts`
- New: `data/todos.json` (created at runtime if missing; no commit needed)
- Edit: `src/routes/index.tsx`

## Notes / constraints respected
- No edit, delete, or reorder UI or server endpoints.
- Items are append-to-front only; order is creation order (newest first).
