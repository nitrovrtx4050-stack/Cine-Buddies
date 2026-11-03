import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { PreferenceForm } from "@/components/movie-night/PreferenceForm";
import { CURRENT_MEMBER_ID } from "@/mocks/mockData";
import { useRoomByCode } from "@/context/RoomContext";
import { getPreferences, submitPreferences } from "@/services/api/preferenceService";
import { setMemberPreferencesSubmitted } from "@/services/api/roomService";
import type { Preferences } from "@/types/movie-night";

export const Route = createFileRoute("/room/$code/preferences")({
  component: PreferencesPage,
});

function PreferencesPage() {
  const { code } = Route.useParams();
  const room = useRoomByCode(code);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (!room) return null;

  const handleSubmit = async (preferences: Preferences) => {
    setSubmitting(true);
    try {
      await submitPreferences(room.code, CURRENT_MEMBER_ID, preferences);
      await setMemberPreferencesSubmitted(room.code, CURRENT_MEMBER_ID);
      toast.success("Preferences submitted — the group analysis uses them now.");
      await navigate({ to: "/room/$code", params: { code: room.code } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Your preferences</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Everything here feeds the group matching — only the overlap with your friends' tastes is
          shared back.
        </p>
      </header>
      <div className="rounded-2xl border border-border/70 bg-card p-6">
        <PreferenceForm
          initial={getPreferences(room.code, CURRENT_MEMBER_ID)}
          submitting={submitting}
          submitLabel="Submit preferences"
          onSubmit={(preferences) => void handleSubmit(preferences)}
        />
      </div>
    </div>
  );
}
