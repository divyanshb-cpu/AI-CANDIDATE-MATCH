
export interface Candidate {
  candidateName: string;
  matchPercentage: number;
  keyNotes: string;
}

export interface ParsedResume {
  fileName: string;
  content: string;
}
