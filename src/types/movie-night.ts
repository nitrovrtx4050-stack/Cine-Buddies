/**
 * Domain types for Movie Night Planner.
 *
 * These shapes intentionally mirror the DTOs the future Java Spring Boot
 * backend will expose, so swapping the mock services for REST calls later
 * should not require UI changes.
 */

export type ContentType = "MOVIES" | "TV_SERIES" | "WEB_SERIES";

export type VoteChoice = "YES" | "MAYBE" | "NO";

export type ReleasePeriod = "ANY_YEAR" | "LAST_5_YEARS" | "LAST_10_YEARS" | "CLASSIC";

export interface Member {
  id: string;
  name: string;
  isHost: boolean;
  joined: boolean;
  preferencesSubmitted: boolean;
}

export interface Room {
  code: string;
  name: string;
  contentTypes: ContentType[];
  createdAt: number;
  members: Member[];
}

export interface Preferences {
  contentTypes: ContentType[];
  genres: string[];
  languages: string[];
  minRating: number;
  releasePeriod: ReleasePeriod;
  excludedGenres: string[];
  watchedTitles: string[];
}

export interface WhyRecommended {
  commonInterests: string[];
  individualSatisfaction: string;
  languageCompatibility: string;
  ratingCompatibility: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  type: ContentType;
  genres: string[];
  language: string;
  rating: number;
  runtime: string;
  overview: string;
  /** Future TMDB integration: poster path, e.g. "/poster.jpg". Absent in the prototype. */
  posterPath?: string;
  groupMatch: number;
  /** Keyed by member id. */
  individualScores: Record<string, number>;
  why: WhyRecommended;
  featured?: boolean;
}

export interface MemberPreferenceSummary {
  memberId: string;
  name: string;
  isHost: boolean;
  contentTypes: ContentType[];
  genres: string[];
  languages: string[];
  minRating: number;
  releasePeriod: ReleasePeriod;
}

export interface GroupAnalysis {
  memberSummaries: MemberPreferenceSummary[];
  commonGenres: string[];
  commonLanguages: string[];
  averageMinRating: number;
  contentTypeDistribution: { type: ContentType; count: number }[];
  genreConflicts: string[];
  insight: string;
}

export interface VoteTally {
  movieId: string;
  yes: number;
  maybe: number;
  no: number;
  score: number;
}

export interface RoomResult {
  movie: Movie;
  tally: VoteTally;
  groupMatch: number;
  participation: { memberId: string; name: string; votesCast: number }[];
}
