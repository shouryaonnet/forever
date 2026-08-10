"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
};

type Workspace = {
  id: number;
  name: string;
  description: string | null;
  ownerUsername: string;
};

type Member = {
  userId: number;
  name: string;
  username: string;
  email: string;
  role: string;
};

type WorkspaceTask = {
  id: number;
  title: string;
  description: string | null;
  status:
    | "TODO"
    | "IN_PROGRESS"
    | "COMPLETED";
  priority:
    | "LOW"
    | "MEDIUM"
    | "HIGH";
  dueDate: string | null;
  createdAt: string;
  completedAt: string | null;
  creatorId: number;
  creatorName: string;
  assignedUserId: number | null;
  assignedUserName: string | null;
};

const statuses = [
  {
    value: "TODO",
    label: "To do",
    description: "Tasks waiting to start",
  },
  {
    value: "IN_PROGRESS",
    label: "In progress",
    description: "Currently being worked on",
  },
  {
    value: "COMPLETED",
    label: "Completed",
    description: "Finished tasks",
  },
] as const;

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();

  const workspaceId = params.id;

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

  const [user, setUser] =
    useState<User | null>(null);

  const [workspace, setWorkspace] =
    useState<Workspace | null>(null);

  const [members, setMembers] =
    useState<Member[]>([]);

  const [tasks, setTasks] =
    useState<WorkspaceTask[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [showInvite, setShowInvite] =
    useState(false);

  const [showCreateTask, setShowCreateTask] =
    useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false);

  const [email, setEmail] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState("MEDIUM");

  const [dueDate, setDueDate] =
    useState("");

  const [assignedUserId, setAssignedUserId] =
    useState("");

  const [addingMember, setAddingMember] =
    useState(false);

  const [creatingTask, setCreatingTask] =
    useState(false);

  const [deletingWorkspace, setDeletingWorkspace] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    async function loadWorkspace() {
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
          workspaceResponse,
          membersResponse,
          tasksResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/api/users/me`,
            { headers }
          ),
          fetch(
            `${API_URL}/api/workspaces/${workspaceId}`,
            { headers }
          ),
          fetch(
            `${API_URL}/api/workspaces/${workspaceId}/members`,
            { headers }
          ),
          fetch(
            `${API_URL}/api/workspaces/${workspaceId}/tasks`,
            { headers }
          ),
        ]);

        if (
          !userResponse.ok ||
          !workspaceResponse.ok ||
          !membersResponse.ok ||
          !tasksResponse.ok
        ) {
          throw new Error(
            "Unable to load workspace."
          );
        }

        setUser(
          await userResponse.json()
        );

        setWorkspace(
          await workspaceResponse.json()
        );

        setMembers(
          await membersResponse.json()
        );

        setTasks(
          await tasksResponse.json()
        );
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load workspace."
        );
      } finally {
        setLoading(false);
      }
    }

    loadWorkspace();
  }, [
    workspaceId,
    router,
    API_URL,
  ]);

  function clearMessages() {
    setMessage("");
    setError("");
  }

  async function addMember(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setAddingMember(true);
    clearMessages();

    try {
      const response = await fetch(
        `${API_URL}/api/workspaces/${workspaceId}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const text =
        await response.text();

      if (!response.ok) {
        throw new Error(
          text || "Unable to add member."
        );
      }

      const newMember: Member =
        JSON.parse(text);

      setMembers((current) => [
        ...current,
        newMember,
      ]);

      setEmail("");
      setShowInvite(false);

      setMessage(
        "Member added successfully."
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to add member."
      );
    } finally {
      setAddingMember(false);
    }
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
        `${API_URL}/api/workspaces/${workspaceId}/tasks`,
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
            priority,
            dueDate:
              dueDate || null,
            assignedUserId:
              assignedUserId
                ? Number(assignedUserId)
                : null,
          }),
        }
      );

      const text =
        await response.text();

      if (!response.ok) {
        throw new Error(
          text || "Unable to create task."
        );
      }

      const newTask: WorkspaceTask =
        JSON.parse(text);

      setTasks((current) => [
        newTask,
        ...current,
      ]);

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      setAssignedUserId("");
      setShowCreateTask(false);

      setMessage(
        "Task created successfully."
      );
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

  async function updateTaskStatus(
    taskId: number,
    status: string
  ) {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    clearMessages();

    try {
      const response = await fetch(
        `${API_URL}/api/workspaces/${workspaceId}/tasks/${taskId}/status?status=${status}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const text =
        await response.text();

      if (!response.ok) {
        throw new Error(
          text || "Unable to update task."
        );
      }

      const updatedTask: WorkspaceTask =
        JSON.parse(text);

      setTasks((current) =>
        current.map((task) =>
          task.id === updatedTask.id
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

  async function deleteTask(
    taskId: number
  ) {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    clearMessages();

    try {
      const response = await fetch(
        `${API_URL}/api/workspaces/${workspaceId}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const text =
          await response.text();

        throw new Error(
          text || "Unable to delete task."
        );
      }

      setTasks((current) =>
        current.filter(
          (task) => task.id !== taskId
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

  async function deleteWorkspace() {
    const token =
      localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setDeletingWorkspace(true);
    clearMessages();

    try {
      const response = await fetch(
        `${API_URL}/api/workspaces/${workspaceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const text =
          await response.text();

        throw new Error(
          text ||
            "Unable to delete workspace."
        );
      }

      router.replace("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete workspace."
      );

      setDeletingWorkspace(false);
      setShowDeleteConfirm(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    router.replace("/login");
  }

  function getTasksByStatus(
    status: string
  ) {
    return tasks.filter(
      (task) => task.status === status
    );
  }

  function getPriorityStyle(
    taskPriority: string
  ) {
    if (taskPriority === "HIGH") {
      return "bg-rose-50 text-rose-600 border-rose-100";
    }

    if (taskPriority === "LOW") {
      return "bg-slate-50 text-slate-500 border-slate-200";
    }

    return "bg-amber-50 text-amber-600 border-amber-100";
  }

  function getStatusColor(
    status: string
  ) {
    if (status === "TODO") {
      return "bg-slate-400";
    }

    if (status === "IN_PROGRESS") {
      return "bg-amber-500";
    }

    return "bg-emerald-500";
  }

  const isOwner =
    !!user &&
    !!workspace &&
    user.username ===
      workspace.ownerUsername;

  const completedCount =
    tasks.filter(
      (task) =>
        task.status === "COMPLETED"
    ).length;

  const inProgressCount =
    tasks.filter(
      (task) =>
        task.status === "IN_PROGRESS"
    ).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

          <p className="text-sm text-slate-400">
            Loading workspace...
          </p>
        </div>
      </main>
    );
  }

  if (!workspace) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
            !
          </div>

          <h1 className="mt-5 text-xl font-semibold tracking-[-0.03em]">
            Workspace not found
          </h1>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
            This workspace may have been
            deleted or you may not have
            access to it.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Back to dashboard
          </Link>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">

      {/* NAVBAR */}

      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="flex h-16 w-full items-center justify-between px-5 sm:px-8 lg:px-10">

          <Link
            href="/dashboard"
            className="text-xl font-semibold tracking-[-0.05em]"
          >
            forever.
          </Link>

          <div className="flex items-center gap-4">

            <Link
              href="/dashboard"
              className="hidden text-sm font-medium text-slate-400 transition hover:text-slate-950 sm:block"
            >
              Dashboard
            </Link>

            {user && (
              <>
                <div className="hidden text-right md:block">
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
              </>
            )}

            <button
              onClick={logout}
              className="text-sm font-medium text-slate-400 transition hover:text-slate-950"
            >
              Log out
            </button>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <div className="w-full px-5 py-8 sm:px-8 sm:py-10 lg:px-10 xl:px-12">

        {/* BACK */}

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-slate-950"
        >
          <span>←</span>
          Dashboard
        </Link>

        {/* WORKSPACE HEADER */}

        <section className="mt-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 sm:p-8">

          <div className="flex flex-col justify-between gap-8 xl:flex-row xl:items-end">

            <div className="min-w-0">

              <div className="mb-4 flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-indigo-600">
                  Workspace
                </span>

                {isOwner && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-600">
                    Owner
                  </span>
                )}

              </div>

              <h1 className="break-words text-3xl font-semibold tracking-[-0.05em] sm:text-4xl lg:text-5xl">
                {workspace.name}
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
                {workspace.description ||
                  "A shared workspace for your team."}
              </p>

            </div>

            <div className="grid grid-cols-3 gap-3 xl:min-w-[390px]">

              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="text-xs font-medium text-indigo-500">
                  Tasks
                </p>

                <p className="mt-2 text-2xl font-semibold text-indigo-950">
                  {tasks.length}
                </p>
              </div>

              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-xs font-medium text-amber-600">
                  Active
                </p>

                <p className="mt-2 text-2xl font-semibold text-amber-950">
                  {inProgressCount}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-medium text-emerald-600">
                  Done
                </p>

                <p className="mt-2 text-2xl font-semibold text-emerald-950">
                  {completedCount}
                </p>
              </div>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row">

            <button
              onClick={() => {
                setShowCreateTask(
                  !showCreateTask
                );
                setShowInvite(false);
              }}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700"
            >
              {showCreateTask
                ? "Close"
                : "+ New task"}
            </button>

            {isOwner && (
              <button
                onClick={() => {
                  setShowInvite(
                    !showInvite
                  );
                  setShowCreateTask(false);
                }}
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
              >
                {showInvite
                  ? "Close"
                  : "+ Add member"}
              </button>
            )}

          </div>

        </section>

        {/* ALERTS */}

        {(error || message) && (
          <div
            className={`mt-5 rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-rose-100 bg-rose-50 text-rose-600"
                : "border-emerald-100 bg-emerald-50 text-emerald-700"
            }`}
          >
            {error || message}
          </div>
        )}

        {/* CREATE TASK */}

        {showCreateTask && (
          <form
            onSubmit={createTask}
            className="mt-5 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm shadow-indigo-50 sm:p-7"
          >

            <div className="mb-6">

              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">
                New task
              </span>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                Add something to the board.
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Create a task and assign it
                to someone on the team.
              </p>

            </div>

            <div className="grid gap-4 lg:grid-cols-2">

              <input
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Task title"
                required
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />

              <select
                value={priority}
                onChange={(e) =>
                  setPriority(
                    e.target.value
                  )
                }
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              >
                <option value="LOW">
                  Low priority
                </option>

                <option value="MEDIUM">
                  Medium priority
                </option>

                <option value="HIGH">
                  High priority
                </option>
              </select>

              <textarea
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Describe the task..."
                rows={4}
                className="resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50 lg:col-span-2"
              />

              <input
                type="date"
                value={dueDate}
                onChange={(e) =>
                  setDueDate(
                    e.target.value
                  )
                }
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              />

              <select
                value={assignedUserId}
                onChange={(e) =>
                  setAssignedUserId(
                    e.target.value
                  )
                }
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-400 focus:bg-white"
              >
                <option value="">
                  Unassigned
                </option>

                {members.map((member) => (
                  <option
                    key={member.userId}
                    value={member.userId}
                  >
                    Assign to {member.name}
                  </option>
                ))}
              </select>

            </div>

            <div className="mt-5 flex justify-end">

              <button
                type="submit"
                disabled={creatingTask}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingTask
                  ? "Creating..."
                  : "Create task"}
              </button>

            </div>

          </form>
        )}

        {/* INVITE */}

        {showInvite && isOwner && (
          <form
            onSubmit={addMember}
            className="mt-5 rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm shadow-indigo-50 sm:p-7"
          >

            <div className="mb-5">

              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">
                Team
              </span>

              <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">
                Add a teammate
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                The person must already have a
                Forever account.
              </p>

            </div>

            <div className="flex flex-col gap-3 sm:flex-row">

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="member@example.com"
                required
                className="h-12 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
              />

              <button
                type="submit"
                disabled={addingMember}
                className="h-12 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {addingMember
                  ? "Adding..."
                  : "Add member"}
              </button>

            </div>

          </form>
        )}

        {/* BOARD */}

        <section className="mt-10">

          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">
                Work board
              </span>

              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                Team tasks
              </h2>

            </div>

            <p className="text-sm text-slate-400">
              {tasks.length}{" "}
              {tasks.length === 1
                ? "task"
                : "tasks"}{" "}
              · {members.length}{" "}
              {members.length === 1
                ? "member"
                : "members"}
            </p>

          </div>

          <div className="grid gap-5 lg:grid-cols-3">

            {statuses.map((status) => {
              const statusTasks =
                getTasksByStatus(
                  status.value
                );

              return (
                <div
                  key={status.value}
                  className="min-h-[420px] rounded-2xl border border-slate-200 bg-slate-100/80 p-3"
                >

                  {/* COLUMN HEADER */}

                  <div className="flex items-start justify-between px-3 py-3">

                    <div>

                      <div className="flex items-center gap-2">

                        <span
                          className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                            status.value
                          )}`}
                        />

                        <h3 className="text-sm font-semibold text-slate-800">
                          {status.label}
                        </h3>

                      </div>

                      <p className="mt-1 pl-4 text-xs text-slate-400">
                        {status.description}
                      </p>

                    </div>

                    <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white px-2 text-xs font-semibold text-slate-500 shadow-sm">
                      {statusTasks.length}
                    </span>

                  </div>

                  {/* TASKS */}

                  <div className="space-y-3">

                    {statusTasks.map(
                      (task) => (
                        <article
                          key={task.id}
                          className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/40"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <h4 className="min-w-0 flex-1 text-sm font-semibold leading-5 text-slate-900">
                              {task.title}
                            </h4>

                            <button
                              onClick={() =>
                                deleteTask(
                                  task.id
                                )
                              }
                              className="shrink-0 text-xs font-medium text-slate-300 transition hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100"
                            >
                              Delete
                            </button>

                          </div>

                          {task.description && (
                            <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
                              {task.description}
                            </p>
                          )}

                          {/* BADGES */}

                          <div className="mt-4 flex flex-wrap gap-2">

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${getPriorityStyle(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>

                            {task.dueDate && (
                              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                                Due {task.dueDate}
                              </span>
                            )}

                          </div>

                          {/* ASSIGNEE */}

                          <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">

                            {task.assignedUserName ? (
                              <>
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-600">
                                  {task.assignedUserName
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>

                                <p className="truncate text-xs text-slate-500">
                                  {task.assignedUserName}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-slate-400">
                                Unassigned
                              </p>
                            )}

                          </div>

                          {/* STATUS */}

                          <select
                            value={task.status}
                            onChange={(e) =>
                              updateTaskStatus(
                                task.id,
                                e.target.value
                              )
                            }
                            className="mt-3 h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-500 outline-none transition focus:border-indigo-400 focus:bg-white"
                          >
                            {statuses.map(
                              (item) => (
                                <option
                                  key={
                                    item.value
                                  }
                                  value={
                                    item.value
                                  }
                                >
                                  Move to{" "}
                                  {
                                    item.label
                                  }
                                </option>
                              )
                            )}
                          </select>

                        </article>
                      )
                    )}

                    {statusTasks.length ===
                      0 && (
                      <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50">

                        <div className="text-center">

                          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-300 shadow-sm">
                            +
                          </div>

                          <p className="mt-3 text-xs font-medium text-slate-400">
                            No tasks here
                          </p>

                        </div>

                      </div>
                    )}

                  </div>

                </div>
              );
            })}

          </div>

        </section>

        {/* MEMBERS */}

        <section className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100">

          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 sm:px-7">

            <div>

              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600">
                Team
              </span>

              <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">
                Members
              </h2>

            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
              {members.length}
            </span>

          </div>

          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3 xl:grid-cols-4">

            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between gap-3 px-5 py-5 transition hover:bg-slate-50 sm:px-6"
              >

                <div className="flex min-w-0 items-center gap-3">

                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      member.role ===
                      "OWNER"
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {member.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-900">
                      {member.name}
                    </p>

                    <p className="truncate text-xs text-slate-400">
                      @{member.username}
                    </p>

                  </div>

                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                    member.role ===
                    "OWNER"
                      ? "bg-indigo-50 text-indigo-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {member.role}
                </span>

              </div>
            ))}

          </div>

        </section>

        {/* DANGER ZONE */}

        {isOwner && (
          <section className="mt-10 rounded-2xl border border-rose-100 bg-white">

            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

              <div>

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-sm font-bold text-rose-500">
                    !
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    Danger zone
                  </p>

                </div>

                <p className="mt-2 max-w-xl text-xs leading-5 text-slate-400">
                  Permanently delete this
                  workspace, its members and
                  all workspace tasks.
                </p>

              </div>

              <button
                onClick={() =>
                  setShowDeleteConfirm(
                    true
                  )
                }
                className="rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
              >
                Delete workspace
              </button>

            </div>

          </section>
        )}

        {/* FOOTER */}

        <footer className="mt-12 flex flex-col gap-2 border-t border-slate-200 py-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

          <span className="font-semibold text-slate-500">
            forever.
          </span>

          <span>
            Work together. Stay organized.
          </span>

        </footer>

      </div>

      {/* DELETE MODAL */}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-5 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

            <div className="p-6 sm:p-7">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-lg font-bold text-rose-500">
                !
              </div>

              <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em]">
                Delete workspace?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                You are about to permanently
                delete{" "}
                <span className="font-semibold text-slate-900">
                  {workspace.name}
                </span>
                .
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                This will also remove its
                members and all workspace tasks.
                This action cannot be undone.
              </p>

            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-5 sm:flex-row sm:justify-end">

              <button
                onClick={() =>
                  setShowDeleteConfirm(
                    false
                  )
                }
                disabled={deletingWorkspace}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={deleteWorkspace}
                disabled={deletingWorkspace}
                className="rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingWorkspace
                  ? "Deleting..."
                  : "Yes, delete workspace"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}