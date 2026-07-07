export type PotentialLeadStatus = "new" | "contacted" | "scheduled" | "converted" | "lost";

export type PotentialLeadView = {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  interestedIn: string;
  status: PotentialLeadStatus;
  note: string;
  nextFollowUpAt: string | null;
  score: number;
  owner: string;
  lastActivity: string;
};

export type PotentialLeadViewMode = "board" | "table" | "timeline";

export type PotentialLeadSortKey = "name" | "score" | "nextFollowUpAt" | "source";
