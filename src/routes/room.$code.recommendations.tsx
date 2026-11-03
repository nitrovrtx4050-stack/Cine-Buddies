import { useEffect, useState } from "react";
import { useNavigate, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/common/Button";
import { LoadingState } from "@/components/common/LoadingState";
import { MovieCard } from "@/components/movie-night/MovieCard";
import { MovieDetailsModal } from "@/components/movie-night/MovieDetailsModal";
import { CURRENT_MEMBER_ID } from "@/mocks/mockData";
import { useRoomByCode } from "@/context/RoomContext";
import { getRecommendations } from "@/services/api/recommendationService";
import type { Movie } from "@/types/movie-night";

export const Route = createFileRoute("/room/$code/recommendations")({
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { code } = Route.useParams();
  const room = useRoomByCode(code);
  const navigate = useNavigate();
  const [movies, setMovies] = useState<Movie[] | null>(null);
  const [selected, setSelected] = useState<Movie | null>(null);

  useEffect(() => {
    let active = true;
    void getRecommendations().then((result) => {
      if (active) setMovies(result);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!room) return null;

  const members = room.members.map((member) => ({ id: member.id, name: member.name }));
  const myMember = room.members.find((member) => member.id === CURRENT_MEMBER_ID);

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">Recommendations</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Ranked by group match for “{room.name}”. Open any card to see why it made the list.
          </p>
        </div>
        <Button size="lg" onClick={() => void navigate({ to: "/room/$code/voting", params: { code: room.code } })}>
          Start the group vote <ArrowRight size={15} />
        </Button>
      </header>

      {!movies ? (
        <LoadingState label="Generating recommendations…" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              rank={index + 1}
              onDetails={setSelected}
              below={
                myMember && !myMember.preferencesSubmitted ? (
                  <p className="rounded-lg bg-warning/10 px-2.5 py-1.5 text-[11px] font-medium text-warning">
                    Submit your preferences for sharper matches.
                  </p>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      <MovieDetailsModal movie={selected} members={members} onClose={() => setSelected(null)} />
    </div>
  );
}
