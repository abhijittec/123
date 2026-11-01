export type Registration = {
  id: string;
  event_id: string;
  flat_number: string;
  flat_number_display: string;
  resident_name: string | null;
  head_count: number;
  kids_under_10: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PublicRegistrationView = {
  id: string;
  flatNumber: string;
  residentName: string | null;
  headCount: number;
  kidsUnder10: number;
  updatedAt: string;
};

export type CommunityStats = {
  totalFlats: number;
  totalParticipants: number;
  totalKidsUnder10: number;
  updatedAt: string;
};

export type AdminRegistration = Registration;

export type ApiErrorBody = {
  error: string;
  code?: string;
  details?: Record<string, string[] | undefined>;
  alreadyRegistered?: boolean;
};
