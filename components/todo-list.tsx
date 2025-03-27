"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Todo = {
  id: string;
  title: string;
  isComplete: boolean;
  createdAt: string;
};

export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodo, setDeletingTodo] = useState<Todo | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const { register, handleSubmit, reset } = useForm<{ title: string }>();

  // Load todos from localStorage on component mount
  useEffect(() => {
    const savedTodos = localStorage.getItem("todos");
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos));
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  const createTodo = (data: { title: string }) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      title: data.title,
      isComplete: false,
      createdAt: new Date().toISOString(),
    };

    setTodos([...todos, newTodo]);
    reset();
  };

  const toggleTodo = (todo: Todo) => {
    setTodos(
      todos.map((t) =>
        t.id === todo.id ? { ...t, isComplete: !t.isComplete } : t
      )
    );
  };

  const startDelete = (todo: Todo) => {
    setDeletingTodo(todo);
  };

  const confirmDelete = () => {
    if (deletingTodo) {
      setTodos(todos.filter((todo) => todo.id !== deletingTodo.id));
      setDeletingTodo(null);
    }
  };

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo);
    setEditedTitle(todo.title);
  };

  const saveEdit = () => {
    if (editingTodo && editedTitle.trim()) {
      setTodos(
        todos.map((todo) =>
          todo.id === editingTodo.id
            ? { ...todo, title: editedTitle.trim() }
            : todo
        )
      );
      setEditingTodo(null);
    }
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <Card className="p-6">
          <form
            onSubmit={handleSubmit(createTodo)}
            className="flex items-center gap-4"
          >
            <Input
              placeholder="Add a new todo..."
              {...register("title", { required: true })}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {todos.map((todo) => (
            <Card
              key={todo.id}
              className="p-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={todo.isComplete}
                  onCheckedChange={() => toggleTodo(todo)}
                />
                <span
                  className={`${
                    todo.isComplete ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {todo.title}
                </span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEditing(todo)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startDelete(todo)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editingTodo !== null}
        onOpenChange={() => setEditingTodo(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Edit todo title..."
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTodo(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deletingTodo !== null}
        onOpenChange={() => setDeletingTodo(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              todo
              {deletingTodo?.title}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
