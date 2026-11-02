/**
 * Centralised mock data for the Movie Night Planner prototype.
 *
 * Every screen reads its sample content from this file (through the mock
 * services) so no mock values are duplicated across components. When the
 * Spring Boot backend arrives, this module is deleted and the services in
 * `src/services/api` switch to real REST calls.
 */

import type {
  ContentType,
  GroupAnalysis,
  Movie,
  Preferences,
  ReleasePeriod,
  VoteChoice,
} from "@/types/movie-night";

export const DEMO_ROOM_CODE = "DEMO42";

export const CONTENT_TYPE_OPTIONS: { value: ContentType; label: string; description: string }[] = [
  { value: "MOVIES", label: "Movies", description: "Feature films from every era" },
  { value: "TV_SERIES", label: "TV Series", description: "Binge-worthy episodic shows" },
  { value: "WEB_SERIES", label: "Web Series", description: "Streaming originals and indies" },
];

export const GENRE_OPTIONS = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Science Fiction",
  "Thriller",
];

export const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Korean",
  "Japanese",
  "Spanish",
  "Other",
];

export const RELEASE_PERIOD_OPTIONS: { value: ReleasePeriod; label: string }[] = [
  { value: "ANY_YEAR", label: "Any year" },
  { value: "LAST_5_YEARS", label: "Last 5 years" },
  { value: "LAST_10_YEARS", label: "Last 10 years" },
  { value: "CLASSIC", label: "Classic content" },
];

export const WATCHED_SUGGESTIONS = [
  "Inception",
  "The Dark Knight",
  "Interstellar",
  "Stranger Things",
  "Squid Game",
  "Dune",
  "Parasite",
  "The Bear",
];

/** The three sample participants used across every room screen. */
export const PERSONA_IDS = {
  alex: "member-alex",
  rahul: "member-rahul",
  sam: "member-sam",
} as const;

export const CURRENT_MEMBER_ID = "member-me";

export const PERSONA_PREFERENCES: Record<string, Preferences> = {
  [PERSONA_IDS.alex]: {
    contentTypes: ["MOVIES", "TV_SERIES"],
    genres: ["Science Fiction", "Thriller", "Drama"],
    languages: ["English"],
    minRating: 7.5,
    releasePeriod: "LAST_10_YEARS",
    excludedGenres: ["Horror"],
    watchedTitles: ["Inception", "The Dark Knight"],
  },
  [PERSONA_IDS.rahul]: {
    contentTypes: ["MOVIES", "WEB_SERIES"],
    genres: ["Action", "Comedy", "Science Fiction"],
    languages: ["English", "Hindi"],
    minRating: 6.5,
    releasePeriod: "ANY_YEAR",
    excludedGenres: [],
    watchedTitles: ["Dune", "Squid Game"],
  },
  [PERSONA_IDS.sam]: {
    contentTypes: ["MOVIES", "TV_SERIES"],
    genres: ["Science Fiction", "Mystery", "Thriller"],
    languages: ["English", "Korean"],
    minRating: 8,
    releasePeriod: "LAST_5_YEARS",
    excludedGenres: ["Romance"],
    watchedTitles: ["Parasite", "Stranger Things"],
  },
};

export const DEFAULT_PREFERENCES: Preferences = {
  contentTypes: [],
  genres: [],
  languages: [],
  minRating: 0,
  releasePeriod: "ANY_YEAR",
  excludedGenres: [],
  watchedTitles: [],
};

/** Deterministic votes cast by the sample participants (the current user votes live). */
export const PERSONA_VOTES: Record<string, Record<string, VoteChoice>> = {
  [PERSONA_IDS.alex]: {
    "interstellar": "YES",
    "parasite": "MAYBE",
    "stranger-things": "YES",
    "dune-part-two": "YES",
    "the-bear": "NO",
  },
  [PERSONA_IDS.rahul]: {
    "interstellar": "YES",
    "parasite": "MAYBE",
    "stranger-things": "MAYBE",
    "dune-part-two": "MAYBE",
    "the-bear": "MAYBE",
  },
  [PERSONA_IDS.sam]: {
    "interstellar": "YES",
    "parasite": "YES",
    "stranger-things": "MAYBE",
    "dune-part-two": "YES",
    "the-bear": "NO",
  },
};

export const AI_INSIGHT =
  "Your group shares an interest in highly rated English-language content, with science " +
  "fiction and thriller elements emerging as strong common interests. Sam's preference for " +
  "recent releases slightly narrows the pool, but the overlap on ambitious, story-driven " +
  "picks is unusually strong.";

export const RECOMMENDATIONS: Movie[] = [
  {
    id: "interstellar",
    title: "Interstellar",
    year: 2014,
    type: "MOVIES",
    genres: ["Science Fiction", "Adventure", "Drama"],
    language: "English",
    rating: 8.7,
    runtime: "2h 49m",
    overview:
      "When Earth becomes uninhabitable, a team of explorers travels through a wormhole in " +
      "search of a new home for humanity — trading love, time and gravity along the way.",
    groupMatch: 94,
    individualScores: { "member-alex": 96, "member-rahul": 91, "member-sam": 88 },
    why: {
      commonInterests: [
        "Science fiction with an emotional core — loved by all three members",
        "Adventure and drama blend covers Alex's, Rahul's and Sam's top genres",
      ],
      individualSatisfaction: "Projected satisfaction above 88% for every member of the group.",
      languageCompatibility: "English-language original, matching the group's shared language.",
      ratingCompatibility: "8.7 rating clears the group's highest minimum-rating preference.",
    },
    featured: true,
  },
  {
    id: "parasite",
    title: "Parasite",
    year: 2019,
    type: "MOVIES",
    genres: ["Thriller", "Drama", "Comedy"],
    language: "Korean",
    rating: 8.5,
    runtime: "2h 12m",
    overview:
      "Greed and class discrimination threaten the newly formed symbiotic relationship between " +
      "the wealthy Park family and the destitute Kim clan.",
    groupMatch: 89,
    individualScores: { "member-alex": 87, "member-rahul": 84, "member-sam": 96 },
    why: {
      commonInterests: ["Thriller pacing with dark comedy beats"],
      individualSatisfaction: "Sam's top pick; Alex and Rahul stay above 84%.",
      languageCompatibility: "Korean audio — Sam watches Korean content weekly.",
      ratingCompatibility: "8.5 rating comfortably above the group average threshold.",
    },
  },
  {
    id: "stranger-things",
    title: "Stranger Things",
    year: 2016,
    type: "TV_SERIES",
    genres: ["Science Fiction", "Mystery", "Drama"],
    language: "English",
    rating: 8.7,
    runtime: "4 seasons",
    overview:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, " +
      "terrifying supernatural forces and one strange little girl.",
    groupMatch: 86,
    individualScores: { "member-alex": 90, "member-rahul": 78, "member-sam": 89 },
    why: {
      commonInterests: ["Mystery-driven sci-fi mystery box storytelling"],
      individualSatisfaction: "Strong for Alex and Sam; a lighter fit for Rahul.",
      languageCompatibility: "English-language original.",
      ratingCompatibility: "8.7 rating above every member's minimum.",
    },
  },
  {
    id: "dune-part-two",
    title: "Dune: Part Two",
    year: 2024,
    type: "MOVIES",
    genres: ["Science Fiction", "Adventure"],
    language: "English",
    rating: 8.5,
    runtime: "2h 46m",
    overview:
      "Paul Atreides unites with the Fremen to wage war against House Harkonnen, torn between " +
      "the love of his life and the fate of the known universe.",
    groupMatch: 85,
    individualScores: { "member-alex": 88, "member-rahul": 86, "member-sam": 80 },
    why: {
      commonInterests: ["Large-scale science fiction spectacle"],
      individualSatisfaction: "Balanced 80–88% across the group.",
      languageCompatibility: "English-language original.",
      ratingCompatibility: "8.5 rating clears the group threshold.",
    },
  },
  {
    id: "the-bear",
    title: "The Bear",
    year: 2022,
    type: "TV_SERIES",
    genres: ["Drama", "Comedy"],
    language: "English",
    rating: 8.6,
    runtime: "3 seasons",
    overview:
      "A young chef from the fine dining world returns to Chicago to run his family's " +
      "sandwich shop — and confront everything he left behind.",
    groupMatch: 83,
    individualScores: { "member-alex": 84, "member-rahul": 85, "member-sam": 79 },
    why: {
      commonInterests: ["Character-driven drama with comedy undertones"],
      individualSatisfaction: "Rahul's comfort pick; solid for the others.",
      languageCompatibility: "English-language original.",
      ratingCompatibility: "8.6 rating above the group's average minimum.",
    },
  },
];

export function contentTypeLabel(type: ContentType): string {
  switch (type) {
    case "MOVIES":
      return "Movie";
    case "TV_SERIES":
      return "TV Series";
    case "WEB_SERIES":
      return "Web Series";
  }
}

export function releasePeriodLabel(period: ReleasePeriod): string {
  const option = RELEASE_PERIOD_OPTIONS.find((o) => o.value === period);
  return option ? option.label : "Any year";
}

/** Builds the analysis payload shown on the Group Analysis screen. */
export function buildGroupAnalysis(summaries: GroupAnalysis["memberSummaries"]): GroupAnalysis {
  const first = summaries[0];
  const commonGenres = first ? first.genres.filter((g) => summaries.every((s) => s.genres.includes(g))) : [];
  const commonLanguages = first
    ? first.languages.filter((l) => summaries.every((s) => s.languages.includes(l)))
    : [];
  const averageMinRating = summaries.length
    ? Math.round((summaries.reduce((sum, s) => sum + s.minRating, 0) / summaries.length) * 10) / 10
    : 0;

  const counts = new Map<ContentType, number>();
  for (const summary of summaries) {
    for (const type of summary.contentTypes) {
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
  }
  const contentTypeDistribution = CONTENT_TYPE_OPTIONS.map((o) => ({
    type: o.value,
    count: counts.get(o.value) ?? 0,
  }));

  const genreConflicts: string[] = [];
  for (const summary of summaries) {
    for (const genre of summary.genres) {
      const someoneExcludes = summaries.some(
        (s) => s.memberId !== summary.memberId && s.excludedGenres?.includes(genre),
      );
      if (someoneExcludes && !genreConflicts.includes(genre)) {
        genreConflicts.push(genre);
      }
    }
  }

  return {
    memberSummaries: summaries,
    commonGenres,
    commonLanguages,
    averageMinRating,
    contentTypeDistribution,
    genreConflicts,
    insight: AI_INSIGHT,
  };
}
