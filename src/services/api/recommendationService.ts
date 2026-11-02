/**
 * Recommendation service — mock implementation of the future Spring Boot +
 * Gemini/TMDB recommendation API (GET /api/rooms/{code}/recommendations,
 * GET /api/rooms/{code}/analysis).
 */

import type { GroupAnalysis, MemberPreferenceSummary, Movie } from "@/types/movie-night";
import { buildGroupAnalysis, RECOMMENDATIONS } from "@/mocks/mockData";
import { store } from "@/mocks/mockStore";
import { delay } from "@/services/api/apiClient";
import { normalizeRoomCode } from "@/services/api/roomService";
import { getPersonaPreferences } from "@/services/api/preferenceService";
import type { Room } from "@/types/movie-night";

export async function getRecommendations(): Promise<Movie[]> {
  await delay(500);
  return RECOMMENDATIONS;
}

export async function getGroupAnalysis(roomCode: string): Promise<GroupAnalysis> {
  await delay(900);
  const code = normalizeRoomCode(roomCode);
  const room: Room | undefined = store.getState().rooms[code];
  if (!room) {
    return buildGroupAnalysis([]);
  }

  const summaries: MemberPreferenceSummary[] = room.members.map((member) => {
    const preferences =
      member.id === "member-me"
        ? store.preferencesFor(code, member.id)
        : store.preferencesFor(code, member.id).genres.length
          ? store.preferencesFor(code, member.id)
          : getPersonaPreferences(member.id);
    return {
      memberId: member.id,
      name: member.name,
      isHost: member.isHost,
      contentTypes: preferences.contentTypes,
      genres: preferences.genres,
      languages: preferences.languages,
      minRating: preferences.minRating,
      releasePeriod: preferences.releasePeriod,
      excludedGenres: preferences.excludedGenres,
    };
  });
  return buildGroupAnalysis(summaries);
}
