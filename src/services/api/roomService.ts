/**
 * Room service — mock implementation of the future Spring Boot room API
 * (POST /api/rooms, POST /api/rooms/{code}/join, GET /api/rooms/{code}).
 */

import type { ContentType, Room } from "@/types/movie-night";
import { CURRENT_MEMBER_ID, DEMO_ROOM_CODE, PERSONA_IDS } from "@/mocks/mockData";
import { store, type SessionState } from "@/mocks/mockStore";
import { delay } from "@/services/api/apiClient";

export class RoomNotFoundError extends Error {
  constructor() {
    super("No room was found for that invitation code.");
    this.name = "RoomNotFoundError";
  }
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateRoomCode(): string {
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return state().rooms[code] ? generateRoomCode() : code;
}

function state(): SessionState {
  return store.getState();
}

function updateRoom(code: string, updater: (room: Room) => Room) {
  store.setState((previous) => {
    const room = previous.rooms[code];
    if (!room) return previous;
    return { ...previous, rooms: { ...previous.rooms, [code]: updater(room) } };
  });
}

export function normalizeRoomCode(code: string): string {
  return code.trim().toUpperCase();
}

export async function createRoom(input: {
  name: string;
  contentTypes: ContentType[];
  hostName: string;
}): Promise<Room> {
  await delay(650);
  const code = generateRoomCode();
  const room: Room = {
    code,
    name: input.name.trim(),
    contentTypes: input.contentTypes,
    createdAt: Date.now(),
    members: [
      {
        id: CURRENT_MEMBER_ID,
        name: input.hostName.trim() || "Alex",
        isHost: true,
        joined: true,
        preferencesSubmitted: false,
      },
      { id: PERSONA_IDS.rahul, name: "Rahul", isHost: false, joined: false, preferencesSubmitted: false },
      { id: PERSONA_IDS.sam, name: "Sam", isHost: false, joined: false, preferencesSubmitted: false },
    ],
  };
  store.setState((previous) => ({
    ...previous,
    user: { id: CURRENT_MEMBER_ID, name: input.hostName.trim() || "Alex", email: previous.user?.email ?? null },
    rooms: { ...previous.rooms, [code]: room },
    currentRoomCode: code,
    finalized: { ...previous.finalized, [code]: false },
    winners: { ...previous.winners, [code]: null },
  }));
  return room;
}

export async function joinRoom(input: { code: string; displayName: string }): Promise<Room> {
  await delay(650);
  const code = normalizeRoomCode(input.code);
  const room = state().rooms[code];
  if (!room) throw new RoomNotFoundError();

  const name = input.displayName.trim() || "You";
  const alreadyMember = room.members.some((member) => member.id === CURRENT_MEMBER_ID);
  if (!alreadyMember) {
    updateRoom(code, (current) => {
      // Created rooms hold a "Rahul" slot for the joining friend; the demo room
      // simply gains a third member.
      const members = current.members.map((member) =>
        member.id === PERSONA_IDS.rahul ? { ...member, id: CURRENT_MEMBER_ID, name, joined: true } : member,
      );
      const withMe = members.some((member) => member.id === CURRENT_MEMBER_ID)
        ? members
        : [...members, { id: CURRENT_MEMBER_ID, name, isHost: false, joined: true, preferencesSubmitted: false }];
      return { ...current, members: withMe };
    });
  }
  store.setState((previous) => ({
    ...previous,
    user: { id: CURRENT_MEMBER_ID, name, email: previous.user?.email ?? null },
    currentRoomCode: code,
  }));
  return store.getState().rooms[code] ?? state().rooms[code];
}

export async function getRoom(code: string): Promise<Room | null> {
  const room = state().rooms[normalizeRoomCode(code)];
  return room ?? null;
}

export async function setCurrentRoom(code: string): Promise<void> {
  store.setState((previous) => ({ ...previous, currentRoomCode: normalizeRoomCode(code) }));
}

export async function setMemberJoined(roomCode: string, memberId: string): Promise<void> {
  updateRoom(normalizeRoomCode(roomCode), (room) => ({
    ...room,
    members: room.members.map((member) =>
      member.id === memberId ? { ...member, joined: true } : member,
    ),
  }));
}

export async function setMemberPreferencesSubmitted(roomCode: string, memberId: string): Promise<void> {
  updateRoom(normalizeRoomCode(roomCode), (room) => ({
    ...room,
    members: room.members.map((member) =>
      member.id === memberId ? { ...member, preferencesSubmitted: true } : member,
    ),
  }));
}

export async function setUser(user: { name: string; email: string | null }): Promise<void> {
  store.setState((previous) => ({ ...previous, user: { id: CURRENT_MEMBER_ID, ...user } }));
}

export async function clearSession(): Promise<void> {
  store.reset();
}

export function getDemoRoomCode(): string {
  return DEMO_ROOM_CODE;
}
