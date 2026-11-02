/**
 * Session context for Movie Night Planner.
 *
 * Bridges the observable mock store into React via useSyncExternalStore and
 * runs the "live multiplayer" simulation: sample participants join the room
 * and submit preferences a few seconds after the host arrives.
 */

import * as React from "react";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";

import { store, createInitialSession, type SessionState } from "@/mocks/mockStore";
import { CURRENT_MEMBER_ID } from "@/mocks/mockData";
import { getPersonaPreferences } from "@/services/api/preferenceService";
import * as preferenceService from "@/services/api/preferenceService";
import * as roomService from "@/services/api/roomService";
import type { Room } from "@/types/movie-night";

const serverSnapshot = createInitialSession();

export function useSession(): SessionState {
  return useSyncExternalStore(store.subscribe, store.getState, () => serverSnapshot);
}

export function useRoomByCode(roomCode: string | undefined): Room | undefined {
  const session = useSession();
  if (!roomCode) return undefined;
  return session.rooms[roomCode.trim().toUpperCase()];
}

/**
 * Runs once on the client: restores the session from sessionStorage so a
 * refresh does not destroy the demo state.
 */
export function RoomProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    store.hydrate();
  }, []);
  return <>{children}</>;
}

/**
 * Simulates the sample participants joining and submitting preferences while
 * the group waits in the lobby. Runs once per member per room.
 */
export function useRoomSimulation(roomCode: string | undefined) {
  const session = useSession();
  const room = useRoomByCode(roomCode);
  const joinedSignature = room?.members.map((m) => `${m.id}:${m.joined}`).join(",") ?? "";
  const simulated = session.simulated;

  React.useEffect(() => {
    if (!room) return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    room.members
      .filter((member) => member.id !== CURRENT_MEMBER_ID && !member.joined)
      .forEach((member, index) => {
        const key = `${room.code}:${member.id}`;
        if (simulated[key]) return;
        store.setState((previous) => ({
          ...previous,
          simulated: { ...previous.simulated, [key]: true },
        }));
        timers.push(
          setTimeout(() => {
            void roomService.setMemberJoined(room.code, member.id);
            toast.success(`${member.name} joined the room`);
            timers.push(
              setTimeout(() => {
                void preferenceService.submitPreferences(
                  room.code,
                  member.id,
                  getPersonaPreferences(member.id),
                );
                void roomService.setMemberPreferencesSubmitted(room.code, member.id);
                toast(`${member.name} submitted their preferences`);
              }, 3400 + index * 1800),
            );
          }, 2600 + index * 2600),
        );
      });

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.code, joinedSignature]);
}
