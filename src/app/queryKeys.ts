export const queryKeys = {
  reasons: {
    all: ["reasons"] as const,
  },

  finedPeople: {
    all: ["fined-people"] as const,
  },

  fines: {
    root: ["fines"] as const,
    all: ["fines", "all"] as const,
    byPerson: (personId: string) => ["fines", "by-person", personId] as const,
  },

  publicSummaries: {
    all: ["public-summaries"] as const,
  },

  publicFines: {
    all: ["public-fines"] as const,
  },

  complaints: {
    all: ["complaints"] as const,
  },
} as const;
