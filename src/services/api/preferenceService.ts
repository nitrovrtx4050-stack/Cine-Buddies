/**
 * Preference service — mock implementation of the future Spring Boot
 * preference API (PUT /api/rooms/{code}/members/{memberId}/preferences).
 */

import type { Preferences } from "@/types/movie-night";
import { PERSONA_PREFERENCES } from "@/mocks/mockData";
import { store } from "@/mocks/mockStore";
import { delay } from "@/services/api/apiClient";
import { normalizeRoomCode } from "@/services/api/roomService";

export async function submitPreferences(
  roomCode: string,
  memberId: string,
  preferences: Preferences,
): Promise<Preferences> {
  await delay(700);
  const code = normalizeRoomCode(roomCode);
  store.setState((previous) => ({
    ...previous,
    preferences: {
      ...previous.preferences,
      [code]: { ...(previous.preferences[code] ?? {}), [memberId]: preferences },
    },
  }));
  return preferences;
}

export function getPreferences(roomCode: string, memberId: string): Preferences {
  return store.preferencesFor(normalizeRoomCode(roomCode), memberId);
}

/** Sample preferences for the mock participants (Alex, Rahul, Sam). */
export function getPersonaPreferences(memberId: string): Preferences {
  return PERSONA_PREFERENCES[memberId] ?? PERSONA_PREFERENCES["member-alex"];
}
