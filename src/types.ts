export type AppScreen =
  | 'home'
  | 'routes'
  | 'gems'
  | 'solo-match'
  | 'chats'
  | 'pricing'
  | 'login'
  | 'register'
  | 'terms'
  | 'collaborator';

export interface ProofDocument {
  id: string;
  type: 'govt_id' | 'property_proof' | 'tourism_license' | 'geotagged_photos';
  title: string;
  description: string;
  required: boolean;
  fileName?: string;
  fileSize?: string;
  status: 'pending' | 'uploaded' | 'verified';
  uploadedAt?: string;
  previewUrl?: string;
}

export interface CollaboratorProfile {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  corridor: string;
  isVerified: boolean;
  verificationTier: string;
  documents: ProofDocument[];
  activeListingsCount: number;
}

export interface GemEvaluationResult {
  isGem: boolean;
  gemScore: number;
  safetyScore: number;
  offbeatRating: number;
  womenSafe: boolean;
  verdictTitle: string;
  analysis: string;
  curatorBadge: string;
  recommendedTags: string[];
  improvementSuggestions: string[];
}

export interface HiddenGem {
  id: string;
  name: string;
  category: string;
  categoryIcon: string;
  categoryColor: 'primary' | 'secondary' | 'tertiary';
  description: string;
  image: string;
  distanceKm: number;
  gemScore: number;
  safetyScore: number;
  womenSafe?: boolean;
  costLabel: string;
  hikeDurationOrFeature: string;
  badgeLabel?: string;
  tags: string[];
  lat?: number;
  lng?: number;
  isCollaboratorListed?: boolean;
  curatorHost?: string;
  aiEvaluation?: GemEvaluationResult;
  nearestHospitalKm?: number;
  nearestPharmacyKm?: number;
  routeTag?: string; // e.g. 'bengaluru-goa', 'coorg-chikmagalur', 'all'
}


export interface Waypoint {
  id: string;
  label: string;
  location: string;
  isOrigin?: boolean;
}

export interface SoloPeer {
  id: string;
  name: string;
  age: number;
  location: string;
  image: string;
  verifiedBadge: string;
  matchScore: number;
  travelDates: string;
  overlapDaysText: string;
  sharedPassions: string[];
  statsText: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'peer';
  text: string;
  time: string;
  read?: boolean;
  waypointCard?: {
    title: string;
    gemScore: number;
    kmMark: string;
    description: string;
    image: string;
    activeNearby: number;
  };
}
