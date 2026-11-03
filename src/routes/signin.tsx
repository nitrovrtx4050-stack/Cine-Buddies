import { Link, createFileRoute } from "@tanstack/react-router";

import { AppHeader } from "@/components/movie-night/AppHeader";
import { AuthForm } from "@/components/movie-night/AuthForm";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign In · Movie Night Planner" },
      { name: "description", content: "Sign in to your Movie Night Planner account to host or join a movie night." },
      { property: "og:title", content: "Sign In · Movie Night Planner" },
      {
        property: "og:description",
        content: "Sign in to your Movie Night Planner account to host or join a movie night.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignInPage,
});

function SignInPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-col px-4 pb-16 pt-10 sm:pt-16">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to host a new movie night or rejoin your group.
        </p>
        <div className="mt-6 rounded-2xl border border-border/70 bg-card p-6">
          <AuthForm mode="signin" />
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </main>
    </div>
  );
}
