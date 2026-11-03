import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Film } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import * as roomService from "@/services/api/roomService";

export interface AuthFormProps {
  mode: "signin" | "signup";
}

/**
 * Mock authentication form. The prototype signs the user into the local
 * session only; the future Spring Boot auth API replaces `setUser` here.
 */
export function AuthForm({ mode }: AuthFormProps) {
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSignup && name.trim().length < 2) {
      setError("Tell us what your friends should call you.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Passwords need at least 6 characters.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const displayName = isSignup
        ? name.trim()
        : email
            .split("@")[0]!
            .replace(/[._-]+/g, " ")
            .replace(/\b\w/g, (character) => character.toUpperCase());
      await roomService.setUser({ name: displayName, email: email.trim() });
      toast.success(isSignup ? `Welcome aboard, ${displayName}!` : `Welcome back, ${displayName}!`);
      await navigate({ to: "/create" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {isSignup ? (
        <Input
          label="Display name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Dexter"
          autoComplete="name"
        />
      ) : null}
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        iconLeft={<Film size={15} />}
      />
      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="At least 6 characters"
        autoComplete={isSignup ? "new-password" : "current-password"}
      />
      {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
      <Button size="lg" className="w-full" onClick={() => void handleSubmit()} disabled={submitting}>
        {submitting ? "One moment…" : isSignup ? "Create account" : "Sign in"}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Prototype sign-in: nothing is sent to a server yet — the future Spring Boot
        authentication API takes over here.
      </p>
    </div>
  );
}
