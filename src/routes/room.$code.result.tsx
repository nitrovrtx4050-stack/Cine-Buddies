import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { RefreshCw, Trophy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { MatchScore } from "@/components/common/MatchScore";
import { PosterPlaceholder } from "@/components/common/PosterPlaceholder";
import { useRoomByCode, useSession } from "@/context/RoomContext";
import { contentTypeLabel } from "@/lib/movie-format";
import { clearSession } from "@/services/api/roomService";
import { getRoomResult } from "@/services/api/votingService";

export const Route = createFileRoute("/room/$code/result")({
  component: ResultPage,
});

function ResultPage() {
  const { code } = Route.useParams();
  const room = useRoomByCode(code);
  const session = useSession();
  const navigate = useNavigate();

  const normalizedCode = code?.trim().toUpperCase() ?? "";
  const result = session.winners[normalizedCode] ? getRoomResult(normalizedCode) : null;

  if (!room) return null;

  if (!result) {
    return (
      <EmptyState
        icon={Trophy}
        title="No winner yet"
        description="The vote has not been finalized. Head back to the voting screen to cast your votes and reveal the group's pick."
        action={
          <Button onClick={() => void navigate({ to: "/room/$code/voting", params: { code: room.code } })}>
            Go to voting
          </Button>
        }
      />
    );
  }

  const { movie, tally, groupMatch, participation } = result;

  const startAnother = async () => {
    await clearSession();
    toast.success("Session cleared — ready for the next movie night!");
    await navigate({ to: "/" });
  };

  return (
    <div className="space-y-8">
      <header className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-4 py-1.5 text-xs font-semibold text-warning">
          <Trophy size={13} /> Group winner
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Tonight you're watching…
        </h1>
      </header>

      <div className="grid items-start gap-6 rounded-3xl border border-primary/40 bg-card p-6 glow-primary sm:grid-cols-[minmax(0,240px)_1fr] sm:p-8">
        <PosterPlaceholder
          title={movie.title}
          tag={contentTypeLabel(movie.type)}
          posterPath={movie.posterPath}
          icon={movie.type === "MOVIES" ? "film" : "clapperboard"}
          className="mx-auto w-48 sm:w-full"
        />
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{movie.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {movie.year} · {movie.runtime} · {movie.language} · rated {movie.rating.toFixed(1)}/10
            </p>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{movie.overview}</p>

          <div className="flex flex-wrap items-center gap-6">
            <MatchScore value={groupMatch} size={92} label="Group match" />
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-2">
                <span className="inline-flex min-w-9 justify-center rounded-md bg-success/15 px-2 py-0.5 text-xs font-bold text-success">
                  {tally.yes} Yes
                </span>
                <span className="text-muted-foreground">+{tally.yes * 2} pts</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="inline-flex min-w-9 justify-center rounded-md bg-warning/15 px-2 py-0.5 text-xs font-bold text-warning">
                  {tally.maybe} Maybe
                </span>
                <span className="text-muted-foreground">+{tally.maybe * 1} pt{tally.maybe === 1 ? "" : "s"}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="inline-flex min-w-9 justify-center rounded-md bg-destructive/15 px-2 py-0.5 text-xs font-bold text-destructive">
                  {tally.no} No
                </span>
                <span className="text-muted-foreground">+0 pts</span>
              </p>
              <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Final score {tally.score}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/70 bg-secondary/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Why it won</p>
            <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
              {movie.why.commonInterests.map((interest) => (
                <li key={interest} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {interest}
                </li>
              ))}
              <li className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {movie.why.individualSatisfaction}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border/70 bg-card p-5">
        <h2 className="text-sm font-semibold text-foreground">Participation</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {participation.map((member) => (
            <li
              key={member.memberId}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-secondary/50 px-4 py-2.5 text-sm"
            >
              <span className="text-foreground">{member.name}</span>
              <span className="text-xs text-muted-foreground">
                voted on {member.votesCast} title{member.votesCast === 1 ? "" : "s"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap justify-center gap-3">
        <Button size="lg" onClick={() => void startAnother()}>
          <RefreshCw size={15} /> Start another movie night
        </Button>
        <Button variant="secondary" size="lg" onClick={() => void navigate({ to: "/" })}>
          Back to home
        </Button>
      </div>
    </div>
  );
}
