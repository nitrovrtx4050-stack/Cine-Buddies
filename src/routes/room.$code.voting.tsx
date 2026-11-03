import { useEffect, useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import { LoadingState } from "@/components/common/LoadingState";
import { MovieCard } from "@/components/movie-night/MovieCard";
import { MovieDetailsModal } from "@/components/movie-night/MovieDetailsModal";
import { VoteControls } from "@/components/movie-night/VoteControls";
import { CURRENT_MEMBER_ID, PERSONA_VOTES, RECOMMENDATIONS } from "@/mocks/mockData";
import { useRoomByCode, useSession } from "@/context/RoomContext";
import { VOTE_POINTS, calculateScores, castVote, determineWinner, finalizeVoting, schedulePersonaVotes } from "@/services/api/votingService";
import type { Movie, VoteChoice } from "@/types/movie-night";

export const Route = createFileRoute("/room/$code/voting")({
  component: VotingPage,
});

function VotingPage() {
  const { code } = Route.useParams();
  const [selected, setSelected] = useState<Movie | null>(null);
  const { code } = Route.useParams();
  const room = useRoomByCode(code);
  const session = useSession();
  const navigate = useNavigate();

  const normalizedCode = code?.trim().toUpperCase() ?? "";
  const votes = session.votes[normalizedCode] ?? {};
  const finalized = session.finalized[normalizedCode] ?? false;

  // Sample participants vote on a stagger so the screen feels live.
  useEffect(() => {
    if (!room) return;
    const personaIds = room.members
      .filter((member) => member.id !== CURRENT_MEMBER_ID && PERSONA_VOTES[member.id])
      .map((member) => member.id);
    const cancel = schedulePersonaVotes(room.code, personaIds, (name, movie) => {
      toast(`${name} voted on “${movie}”`);
    });
    return cancel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.code]);

  useEffect(() => {
    if (finalized) {
      void navigate({ to: "/room/$code/result", params: { code } });
    }
  }, [finalized, code, navigate]);

  if (!room) return null;

  const myVotes = votes[CURRENT_MEMBER_ID] ?? {};
  const votedCount = Object.keys(myVotes).length;

  const handleVote = (movieId: string, choice: VoteChoice) => {
    void castVote(normalizedCode, movieId, CURRENT_MEMBER_ID, choice);
  };

  const handleFinalize = async () => {
    const tallies = calculateScores(votes);
    const winner = determineWinner(tallies, RECOMMENDATIONS);
    if (!winner) {
      toast.error("Cast at least one vote before revealing the winner.");
      return;
    }
    await finalizeVoting(normalizedCode, winner.id);
    toast.success(`Winner locked in: ${winner.title}`);
    await navigate({ to: "/room/$code/result", params: { code } });
  };

  const tallyFor = (movie: Movie) => {
    const movieVotes = Object.values(votes[movie.id] ?? {});
    const yes = movieVotes.filter((choice) => choice === "YES").length;
    const maybe = movieVotes.filter((choice) => choice === "MAYBE").length;
    const no = movieVotes.filter((choice) => choice === "NO").length;
    return { yes, maybe, no, score: yes * VOTE_POINTS.YES + maybe * VOTE_POINTS.MAYBE };
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Group Voting</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Yes = 2 points · Maybe = 1 point · No = 0 points. You have voted on {votedCount} of{" "}
            {RECOMMENDATIONS.length} titles.
          </p>
        </div>
        <Button size="lg" onClick={() => void handleFinalize()}>
          <Trophy size={16} /> Reveal the winner
        </Button>
      </header>

      {!room ? (
        <LoadingState />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RECOMMENDATIONS.map((movie, index) => {
            const tally = tallyFor(movie);
            return (
              <MovieCard
                key={movie.id}
                movie={movie}
                rank={index + 1}
                onDetails={setSelected}
                below={
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                      <span className="rounded-md bg-success/10 px-2 py-0.5 text-success">{tally.yes} Yes</span>
                      <span className="rounded-md bg-warning/10 px-2 py-0.5 text-warning">{tally.maybe} Maybe</span>
                      <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-destructive">{tally.no} No</span>
                      <span className="ml-auto rounded-md bg-primary/10 px-2 py-0.5 text-lavender">
                        {tally.score} pts
                      </span>
                    </div>
                    <VoteControls value={myVotes[movie.id]} onVote={(choice) => handleVote(movie.id, choice)} />
                  </div>
                }
              />
            );
          })}
        </div>
      )}

      <MovieDetailsModal movie={selected} onClose={() => setSelected(null)} />

      <p className="text-center text-xs text-muted-foreground">
        Anyone can reveal the winner in this prototype — the highest score takes it, ties break on the
        better group match.
      </p>
    </div>
  );
}

