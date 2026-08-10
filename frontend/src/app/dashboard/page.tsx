"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
};

type Task = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  dueDate: string | null;
};

type Workspace = {
  id: number;
  name: string;
  description: string | null;
  ownerUsername: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [tasks, setTasks] =
    useState<Task[]>([]);

  const [workspaces, setWorkspaces] =
    useState<Workspace[]>([]);

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [dueDate, setDueDate] =
    useState("");

  const [workspaceName, setWorkspaceName] =
    useState("");

  const [
    workspaceDescription,
    setWorkspaceDescription,
  ] = useState("");

  const [showTaskForm, setShowTaskForm] =
    useState(false);

  const [
    showWorkspaceForm,
    setShowWorkspaceForm,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [creatingTask, setCreatingTask] =
    useState(false);

  const [
    creatingWorkspace,
    setCreatingWorkspace,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    async function loadDashboard() {
      const token =
        localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          userResponse,
          tasksResponse,
          workspaceResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/users/me`,
            { headers }
          ),
          fetch(
            `${API_URL}/api/tasks`,
            { headers }
          ),
          fetch(
            `${API_URL}/api/workspaces`,
            { headers }
          ),
        ]);

        if (
          !userResponse.ok ||
          !tasksResponse.ok ||
          !workspaceResponse.ok
        ) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        setUser(
          await userResponse.json()
        );

        setTasks(
          await tasksResponse.json()
        );

        setWorkspaces(
          await workspaceResponse.json()
        );
      } catch {
        setError(
          "Unable to load your dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router, API_URL]);

  function clearMessages() {
    setError("");
    setMessage("");
  }

  async function createTask(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setCreatingTask(true);
    clearMessages();

    try {
      const response = await fetch(
        `${API_URL}/api/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            dueDate:
              dueDate || null,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to create task."
        );
      }

      const newTask =
        await response.json();

      setTasks((current) => [
        newTask,
        ...current,
      ]);

      setTitle("");
      setDescription("");
      setDueDate("");
      setShowTaskForm(false);
      setMessage("Task created.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create task."
      );
    } finally {
      setCreatingTask(false);
    }
  }

  async function toggleTask(id: number) {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    clearMessages();

    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${id}/toggle`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to update task."
        );
      }

      const updatedTask =
        await response.json();

      setTasks((current) =>
        current.map((task) =>
          task.id === id
            ? updatedTask
            : task
        )
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to update task."
      );
    }
  }

  async function deleteTask(id: number) {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    clearMessages();

    try {
      const response = await fetch(
        `${API_URL}/api/tasks/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to delete task."
        );
      }

      setTasks((current) =>
        current.filter(
          (task) => task.id !== id
        )
      );

      setMessage("Task deleted.");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete task."
      );
    }
  }

  async function createWorkspace(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setCreatingWorkspace(true);
    clearMessages();

    try {
      const response = await fetch(
        `${API_URL}/api/workspaces`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: workspaceName,
            description:
              workspaceDescription,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Unable to create workspace."
        );
      }

      const newWorkspace =
        await response.json();

      setWorkspaces((current) => [
        newWorkspace,
        ...current,
      ]);

      setWorkspaceName("");
      setWorkspaceDescription("");
      setShowWorkspaceForm(false);

      setMessage(
        "Workspace created."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create workspace."
      );
    } finally {
      setCreatingWorkspace(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

          <p className="text-sm text-slate-400">
            Loading your space...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const completedTasks =
    tasks.filter(
      (task) => task.completed
    ).length;

  const remainingTasks =
    tasks.length - completedTasks;

  const firstName =
    user.name.split(" ")[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">

      {/* NAVBAR */}

      <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 w-full items-center justify-between px-5 sm:px-8 lg:px-10">

          <Link
            href="/dashboard"
            className="text-xl font-semibold tracking-[-0.05em] text-slate-950"
          >
            forever.
          </Link>

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">
                {user.name}
              </p>

              <p className="text-xs text-slate-400">
                @{user.username}
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white shadow-sm shadow-indigo-200">
              {user.name
                .charAt(0)
                .toUpperCase()}
            </div>

            <button
              onClick={logout}
              className="text-sm font-medium text-slate-400 transition hover:text-slate-950"
            >
              Log out
            </button>

          </div>

        </div>
      </header>

      {/* PAGE */}

      <div className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-10 xl:px-12">

        {/* HERO */}

        <section className="mb-10">

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-600">
                  Personal space
                </span>

              </div>

              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl lg:text-5xl">
                Good to see you,{" "}
                {firstName}.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Keep your daily work organized,
                focused and moving forward.
              </p>

            </div>

            <button
              onClick={() => {
                setShowTaskForm(
                  !showTaskForm
                );

                setShowWorkspaceForm(false);
              }}
              className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 lg:w-auto"
            >
              {showTaskForm
                ? "Close"
                : "+ New task"}
            </button>

          </div>

        </section>

        {/* MESSAGES */}

        {(error || message) && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-rose-100 bg-rose-50 text-rose-600"
                : "border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || message}
          </div>
        )}

        {/* STATS */}

        <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">

            <div className="flex items-center justify-between">

              <p className="text-sm font-medium text-slate-500">
                Total tasks
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                ✓
              </div>

            </div>

            <p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
              {tasks.length}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Everything on your list
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">

            <div className="flex items-center justify-between">

              <p className="text-sm font-medium text-slate-500">
                Completed
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                ✓
              </div>

            </div>

            <p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
              {completedTasks}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Tasks you've finished
            </p>

          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100">

            <div className="flex items-center justify-between">

              <p className="text-sm font-medium text-slate-500">
                Remaining
              </p>

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                !
              </div>

            </div>

            <p className="mt-5 text-3xl font-semibold tracking-[-0.04em]">
              {remainingTasks}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Still waiting for you
            </p>

          </div>

        </section>

        {/* CREATE TASK */}

        {showTaskForm && (
          <form
            onSubmit={createTask}
            className="mb-8 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm shadow-indigo-50 sm:p-6"
          >

            <div className="mb-6">

              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">
                Personal task
              </span>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.02em]">
                What needs to get done?
              </h2>

            </div>

            <div className="space-y-4">

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Task title"
                required
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Add a description..."
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) =>
                    setDueDate(
                      e.target.value
                    )
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-400"
                />

                <button
                  type="submit"
                  disabled={creatingTask}
                  className="h-11 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creatingTask
                    ? "Creating..."
                    : "Create task"}
                </button>

              </div>

            </div>

          </form>
        )}

        {/* PERSONAL TASKS */}

        <section className="mb-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-7">

            <div>

              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">
                Personal
              </span>

              <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                Your tasks
              </h2>

            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              {tasks.length} total
            </span>

          </div>

          {tasks.length === 0 ? (
            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                +
              </div>

              <p className="mt-5 text-sm font-semibold">
                Nothing here yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Create your first task to get started.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-start gap-4 px-5 py-5 transition hover:bg-slate-50 sm:px-7"
                >

                  <button
                    onClick={() =>
                      toggleTask(task.id)
                    }
                    aria-label={
                      task.completed
                        ? "Mark task incomplete"
                        : "Mark task complete"
                    }
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                      task.completed
                        ? "border-emerald-500 bg-emerald-500 text-[10px] text-white"
                        : "border-slate-300 hover:border-indigo-500 hover:bg-indigo-50"
                    }`}
                  >
                    {task.completed &&
                      "✓"}
                  </button>

                  <div className="min-w-0 flex-1">

                    <p
                      className={`text-sm font-semibold ${
                        task.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-900"
                      }`}
                    >
                      {task.title}
                    </p>

                    {task.description && (
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {task.description}
                      </p>
                    )}

                    {task.dueDate && (
                      <span className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-600">
                        Due {task.dueDate}
                      </span>
                    )}

                  </div>

                  <button
                    onClick={() =>
                      deleteTask(task.id)
                    }
                    className="text-xs font-medium text-slate-300 transition hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    Delete
                  </button>

                </div>
              ))}

            </div>
          )}

        </section>

        {/* WORKSPACES */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100">

          <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-6 sm:px-7 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">
                Collaboration
              </span>

              <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                Your workspaces
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Shared spaces for you and your team.
              </p>

            </div>

            <button
              onClick={() => {
                setShowWorkspaceForm(
                  !showWorkspaceForm
                );

                setShowTaskForm(false);
              }}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
            >
              {showWorkspaceForm
                ? "Close"
                : "+ New workspace"}
            </button>

          </div>

          {showWorkspaceForm && (
            <form
              onSubmit={createWorkspace}
              className="border-b border-slate-200 bg-indigo-50/40 p-5 sm:p-7"
            >

              <div className="mb-5">

                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">
                  New workspace
                </span>

                <p className="mt-2 text-sm text-slate-500">
                  Create a shared space and invite your team.
                </p>

              </div>

              <div className="space-y-4">

                <input
                  value={workspaceName}
                  onChange={(e) =>
                    setWorkspaceName(
                      e.target.value
                    )
                  }
                  placeholder="Workspace name"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />

                <textarea
                  value={
                    workspaceDescription
                  }
                  onChange={(e) =>
                    setWorkspaceDescription(
                      e.target.value
                    )
                  }
                  placeholder="What is this workspace for?"
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                />

                <div className="flex justify-end">

                  <button
                    type="submit"
                    disabled={
                      creatingWorkspace
                    }
                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {creatingWorkspace
                      ? "Creating..."
                      : "Create workspace"}
                  </button>

                </div>

              </div>

            </form>
          )}

          {workspaces.length === 0 ? (
            <div className="px-6 py-20 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                W
              </div>

              <p className="mt-5 text-sm font-semibold">
                No workspaces yet
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Create one and start collaborating.
              </p>

            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3 xl:grid-cols-4">

              {workspaces.map(
                (workspace, index) => {

                  const accents = [
                    "from-indigo-500 to-violet-500",
                    "from-cyan-500 to-blue-500",
                    "from-emerald-500 to-teal-500",
                    "from-orange-400 to-rose-500",
                  ];

                  const accent =
                    accents[
                      index %
                        accents.length
                    ];

                  return (
                    <Link
                      key={workspace.id}
                      href={`/workspace/${workspace.id}`}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50"
                    >

                      <div
                        className={`h-2 bg-gradient-to-r ${accent}`}
                      />

                      <div className="p-5">

                        <div className="flex items-start justify-between">

                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                            {workspace.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <span className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600">
                            →
                          </span>

                        </div>

                        <h3 className="mt-5 text-base font-semibold">
                          {workspace.name}
                        </h3>

                        <p className="mt-2 line-clamp-2 min-h-[40px] text-sm leading-5 text-slate-400">
                          {workspace.description ||
                            "Team workspace"}
                        </p>

                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                          <span className="text-xs text-slate-400">
                            Owner
                          </span>

                          <span className="max-w-[140px] truncate text-xs font-medium text-slate-600">
                            @{workspace.ownerUsername}
                          </span>

                        </div>

                      </div>

                    </Link>
                  );
                }
              )}

            </div>
          )}

        </section>

        <footer className="flex items-center justify-between border-t border-slate-200 py-8 text-xs text-slate-400">

          <span className="font-medium">
            forever.
          </span>

          <span>
            Personal work · Team collaboration
          </span>

        </footer>

      </div>

    </main>
  );
}