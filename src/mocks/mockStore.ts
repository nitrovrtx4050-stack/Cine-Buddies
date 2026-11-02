/**
 * Session-persisted mock store.
 *
 * The whole prototype state lives here (rooms, members, preferences, votes)
 * and is mirrored into sessionStorage so a page refresh keeps the demo
 * running. React reads it through `useSyncExternalStore` in RoomProvider.
 * When the real backend arrives, this store is replaced by server state.
 */

import type { Preferences, Room, VoteChoice } from "@/types/movie-night";
import { DEFAULT_PREFERENCES, DEMO_ROOM_CODE, PERSONA_IDS } from "@/mocks/mockData";

const STORAGE_KEY = "mnp.session.v1";

export interface SessionState {
  hydrated: boolean;
  user: { id: string; name: string; email: string | null } | null;
  rooms: Record<string, Room>;
  currentRoomCode: string | null;
  /** roomCode -> memberId -> preferences */
  preferences: Record<string, Record<string, Preferences>>;
  /** roomCode -> movieId -> memberId -> choice */
  votes: Record<string, Record<string, Record<string, VoteChoice>>>;
  /** Guards so simulated member activity only ever runs once per room. */
  simulated: Record<string, boolean>;
  finalized: Record<string, boolean>;
  winners: Record<string, string | null>;
}

export function createInitialSession(): SessionState {
  return {
    hydrated: false,
    user: null,
    rooms: {},
    currentRoomCode: null,
    preferences: {},
    votes: {},
    simulated: {},
    finalized: {},
    winners: {},
  };
}

let state: SessionState = createInitialSession();
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    const { hydrated: _hydrated, ...rest } = state;
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {
    // Storage may be unavailable (private mode); the demo keeps working in memory.
  }
}

function ensureDemoRoom() {
  if (state.rooms[DEMO_ROOM_CODE]) return;
  const demoRoom: Room = {
    code: DEMO_ROOM_CODE,
    name: "Friday Flicks (demo)",
    contentTypes: ["MOVIES", "TV_SERIES", "WEB_SERIES"],
    createdAt: Date.now(),
    members: [
      { id: PERSONA_IDS.alex, name: "Alex", isHost: true, joined: true, preferencesSubmitted: true },
      { id: PERSONA_IDS.sam, name: "Sam", isHost: false, joined: true, preferencesSubmitted: true },
    ],
  };
  state = { ...state, rooms: { ...state.rooms, [DEMO_ROOM_CODE]: demoRoom } };
}

function notify() {
  listeners.forEach((listener) => listener());
}

export const store = {
  getState(): SessionState {
    return state;
  },
  setState(updater: (previous: SessionState) => SessionState) {
    state = updater(state);
    persist();
    notify();
  },
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  /** Called once on the client after mount; safe for SSR (no hydration mismatch). */
  hydrate() {
    if (state.hydrated || typeof window === "undefined") return;
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      state = raw ? { ...createInitialSession(), ...JSON.parse(raw), hydrated: true } : { ...createInitialSession(), hydrated: true };
    } catch {
      state = { ...createInitialSession(), hydrated: true };
    }
    ensureDemoRoom();
    persist();
    notify();
  },
  /** Start Another Movie Night: clears session state but keeps the demo room. */
  reset() {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
    state = { ...createInitialSession(), hydrated: true };
    ensureDemoRoom();
    persist();
    notify();
  },
  /** Default preferences used whenever a member has not submitted yet. */
  preferencesFor(roomCode: string, memberId: string): Preferences {
    return state.preferences[roomCode]?.[memberId] ?? DEFAULT_PREFERENCES;
  },
};
