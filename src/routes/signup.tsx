import { Link, createFileRoute } from "@tanstack/react-router";

import { AppHeader } from "@/components/movie-night/AppHeader";
import { AuthForm } from "@/components/movie-night/AuthForm";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign Up · Movie Night Planner" },
      { name: "description", content: "Create your Movie Night Planner account and host your first group movie night." },
      { property: "og:title", content: "Sign Up · Movie Night Planner" },
      {
        property: "og:description",
        content: "Create your Movie Night Planner account and host your first group movie night.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-col px-4 pb-16 pt-10 sm:pt-16">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Create your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Set up your profile once and every movie night after is two clicks away.
        </p>
        <div className="mt-6 rounded-2xl border border-border/70 bg-card p-6">
          <AuthForm mode="signup" />
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/signin" className="font-semibold text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}
