import { Sparkles, Star } from "lucide-react";

import { Modal } from "@/components/common/Modal";
import { MatchScore } from "@/components/common/MatchScore";
import { PosterPlaceholder } from "@/components/common/PosterPlaceholder";
import { contentTypeLabel } from "@/lib/movie-format";
import type { Movie } from "@/types/movie-night";

export interface MovieDetailsModalProps {
  movie: Movie | null;
  onClose: () => void;
  /** Room members used to label the individual satisfaction scores. */
  members?: { id: string; name: string }[];
}

/** "Why recommended" details modal for a recommendation. */
export function MovieDetailsModal({ movie, onClose, members = [] }: MovieDetailsModalProps) {
  if (!movie) return null;

  return (
    <Modal open={Boolean(movie)} onOpenChange={(open) => !open && onClose()} title={movie.title} className="sm:max-w-xl">
      <div className="grid gap-5 sm:grid-cols-[minmax(0,150px)_1fr]">
        <PosterPlaceholder
          title={movie.title}
          tag={contentTypeLabel(movie.type)}
          posterPath={movie.posterPath}
          icon={movie.type === "MOVIES" ? "film" : "clapperboard"}
        />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 rounded-md bg-warning/10 px-2 py-0.5 font-semibold text-warning">
              <Star size={11} className="fill-warning" /> {movie.rating.toFixed(1)}
            </span>
            <span>{movie.year}</span>
            <span>·</span>
            <span>{movie.runtime}</span>
            <span>·</span>
            <span>{movie.language}</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">{movie.overview}</p>
          <div className="flex items-center gap-3">
            <MatchScore value={movie.groupMatch} size={56} label="Group match" />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4 rounded-xl border border-border/70 bg-secondary/60 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-lavender">
          <Sparkles size={15} /> Why this works for your group
        </p>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {movie.why.commonInterests.map((interest) => (
            <li key={interest} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {interest}
            </li>
          ))}
        </ul>
        <dl className="space-y-2 text-xs">
          {(
            [
              ["Individual satisfaction", movie.why.individualSatisfaction],
              ["Language compatibility", movie.why.languageCompatibility],
              ["Rating compatibility", movie.why.ratingCompatibility],
            ] as const
          ).map(([term, detail]) => (
            <div key={term}>
              <dt className="font-semibold text-foreground">{term}</dt>
              <dd className="text-muted-foreground">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      {members.length > 0 ? (
        <div className="mt-5 space-y-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Projected satisfaction per member
          </p>
          {members.map((member) => {
            const score = movie.individualScores[member.id] ?? 0;
            return (
              <div key={member.id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 truncate text-xs text-muted-foreground">{member.name}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.min(100, score)}%` }}
                  />
                </div>
                <span className="w-9 text-right text-xs font-semibold text-foreground">{score}%</span>
              </div>
            );
          })}
        </div>
      ) : null}
    </Modal>
  );
}
