/**
 * Voting service — mock implementation of the future Spring Boot voting API
 * (POST /api/rooms/{code}/votes, POST /api/rooms/{code}/finalize).
 *
 * Scoring rules from the specification: Yes = 2 points, Maybe = 1, No = 0.
 */

import type { Movie, RoomResult, VoteChoice, VoteTally } from "@/types/movie-night";
import { PERSONA_VOTES, RECOMMENDATIONS } from "@/mocks/mockData";
import { store } from "@/mocks/mockStore";
import { delay } from "@/services/api/apiClient";
import { normalizeRoomCode } from "@/services/api/roomService";

export const VOTE_POINTS: Record<VoteChoice, number> = { YES: 2, MAYBE: 1, NO: 0 };

export function getVotes(roomCode: string): Record<string, Record<string, VoteChoice>> {
  return store.getState().votes[normalizeRoomCode(roomCode)] ?? {};
}

export async function castVote(
  roomCode: string,
  movieId: string,
  memberId: string,
  choice: VoteChoice,
): Promise<void> {
  const code = normalizeRoomCode(roomCode);
  store.setState((previous) => ({
    ...previous,
    votes: {
      ...previous.votes,
      [code]: {
        ...(previous.votes[code] ?? {}),
        [movieId]: { ...(previous.votes[code]?.[movieId] ?? {}), [memberId]: choice },
      },
    },
  }));
  await delay(120);
}

/**
 * Staggers the sample participants' votes so the voting screen feels live.
 * Returns a cancel function; votes are applied once per room per persona.
 */
export function schedulePersonaVotes(
  roomCode: string,
  personaIds: string[],
  onVote?: (personaName: string, movieTitle: string) => void,
): () => void {
  const code = normalizeRoomCode(roomCode);
  const state = store.getState();
  const timers: ReturnType<typeof setTimeout>[] = [];

  personaIds.forEach((personaId, index) => {
    const key = `${code}:${personaId}`;
    if (state.simulated[key]) return;
    const votes = PERSONA_VOTES[personaId];
    if (!votes) return;
    const personaName = personaId === "member-alex" ? "Alex" : personaId === "member-rahul" ? "Rahul" : "Sam";

    store.setState((previous) => ({
      ...previous,
      simulated: { ...previous.simulated, [key]: true },
    }));

    Object.entries(votes).forEach(([movieId, choice], voteIndex) => {
      timers.push(
        setTimeout(() => {
          void castVote(code, movieId, personaId, choice);
          const movie = RECOMMENDATIONS.find((m) => m.id === movieId);
          onVote?.(personaName, movie?.title ?? movieId);
        }, 1400 * (index + 1) + 900 * voteIndex),
      );
    });
  });

  return () => timers.forEach(clearTimeout);
}

/** Pure score calculation: Yes = 2, Maybe = 1, No = 0, tallied per movie. */
export function calculateScores(votes: Record<string, Record<string, VoteChoice>>): VoteTally[] {
  return RECOMMENDATIONS.map((movie) => {
    const movieVotes = Object.values(votes[movie.id] ?? {});
    const yes = movieVotes.filter((choice) => choice === "YES").length;
    const maybe = movieVotes.filter((choice) => choice === "MAYBE").length;
    const no = movieVotes.filter((choice) => choice === "NO").length;
    const score = yes * VOTE_POINTS.YES + maybe * VOTE_POINTS.MAYBE + no * VOTE_POINTS.NO;
    return { movieId: movie.id, yes, maybe, no, score };
  });
}

/** Highest score wins; ties are broken by the higher group match percentage. */
export function determineWinner(tallies: VoteTally[], movies: Movie[]): Movie | null {
  const eligible = tallies.filter((tally) => tally.yes + tally.maybe + tally.no > 0);
  if (eligible.length === 0) return null;
  const best = eligible.reduce((top, tally) => {
    if (tally.score > top.score) return tally;
    if (tally.score < top.score) return top;
    const tallyMovie = movies.find((m) => m.id === tally.movieId);
    const topMovie = movies.find((m) => m.id === top.movieId);
    return (tallyMovie?.groupMatch ?? 0) > (topMovie?.groupMatch ?? 0) ? tally : top;
  });
  return movies.find((movie) => movie.id === best.movieId) ?? null;
}

export function hasFinalized(roomCode: string): boolean {
  return store.getState().finalized[normalizeRoomCode(roomCode)] ?? false;
}

export async function finalizeVoting(roomCode: string, winnerMovieId: string): Promise<void> {
  await delay(600);
  const code = normalizeRoomCode(roomCode);
  store.setState((previous) => ({
    ...previous,
    finalized: { ...previous.finalized, [code]: true },
    winners: { ...previous.winners, [code]: winnerMovieId },
  }));
}

export function getRoomResult(roomCode: string): RoomResult | null {
  const code = normalizeRoomCode(roomCode);
  const state = store.getState();
  const winnerId = state.winners[code];
  if (!winnerId) return null;
  const movie = RECOMMENDATIONS.find((m) => m.id === winnerId);
  if (!movie) return null;
  const votes = state.votes[code] ?? {};
  const tallyForWinner = calculateScores(votes).find((t) => t.movieId === winnerId);
  if (!tallyForWinner) return null;
  const room = state.rooms[code];
  const participation = (room?.members ?? []).map((member) => ({
    memberId: member.id,
    name: member.name,
    votesCast: Object.keys(votes).filter((movieId) => votes[movieId][member.id]).length,
  }));
  return { movie, tally: tallyForWinner, groupMatch: movie.groupMatch, participation };
}
