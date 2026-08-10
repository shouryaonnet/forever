"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router=useRouter();

  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [showPassword,setShowPassword]=useState(false);
  const [message,setMessage]=useState("");
  const [loading,setLoading]=useState(false);

  async function handleSubmit(e:FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const response=await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method:"POST",
          headers:{
            "Content-Type":"application/json",
          },
          body:JSON.stringify({
            email,
            password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Invalid email or password"
        );
      }

      const data=await response.json();

      localStorage.setItem(
        "token",
        data.token
      );

      router.push("/dashboard");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">

      {/* NAVBAR */}

      <header className="w-full border-b border-slate-200 bg-white">

        <div className="flex h-16 w-full items-center justify-between px-5 sm:px-8 lg:px-10 xl:px-12">

          <Link
            href="/"
            className="text-xl font-semibold tracking-[-0.05em]"
          >
            forever.
          </Link>

          <div className="flex items-center gap-3">

            <span className="hidden text-sm text-slate-400 sm:block">
              Don't have an account?
            </span>

            <Link
              href="/register"
              className="rounded-lg px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
            >
              Create account
            </Link>

          </div>

        </div>

      </header>

      {/* CONTENT */}

      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-5 py-12 sm:px-8 lg:px-10">

        <div className="w-full max-w-[500px]">

          {/* HEADING */}

          <div className="mb-8">

            <div className="mb-4 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-600">
              Welcome back
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Sign in to Forever.
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
              Continue to your personal space
              and workspaces.
            </p>

          </div>

          {/* FORM CARD */}

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-100 sm:p-8"
          >

            <div className="space-y-5">

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e)=>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                />

              </div>

              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-800"
                >
                  Password
                </label>

                <div className="relative">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(e)=>
                      setPassword(
                        e.target.value
                      )
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-20 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  />

                  <button
                    type="button"
                    onClick={()=>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                  >
                    {showPassword
                      ? "Hide"
                      : "Show"}
                  </button>

                </div>

              </div>

              {/* ERROR */}

              {message && (
                <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-600">
                  {message}
                </div>
              )}

              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Signing in..."
                  : "Sign in"}
              </button>

            </div>

          </form>

          {/* MOBILE / SECONDARY LINK */}

          <p className="mt-7 text-center text-sm text-slate-500 sm:hidden">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create account
            </Link>
          </p>

          {/* FOOTER */}

          <p className="mt-10 text-center text-xs text-slate-400">
            Simple work management for focused teams.
          </p>

        </div>

      </div>

    </main>
  );
}