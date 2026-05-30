// ─────────────────────────────────────────
// GEARUP — Global TypeScript Types
// ─────────────────────────────────────────

// ── USER TYPES ───────────────────────────
export type UserRole = 'CAR_OWNER' | 'MECHANIC' | 'PARTS_DEALER';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// ── VEHICLE TYPES ────────────────────────
export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID';

export interface Vehicle {
  id: string;
  ownerId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  regNumber: string;
  fuelType: FuelType;
  isPrimary: boolean;
}

// ── MECHANIC TYPES ───────────────────────
export type Specialization =
  | 'ENGINE'
  | 'ELECTRICAL'
  | 'TYRES'
  | 'AC'
  | 'BODYWORK'
  | 'BRAKES'
  | 'TRANSMISSION'
  | 'GENERAL';

export interface MechanicProfile {
  id: string;
  userId: string;
  name: string;
  bio?: string;
  specializations: Specialization[];
  latitude: number;
  longitude: number;
  address: string;
  isAvailable: boolean;
  isSosAvailable: boolean;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  distanceKm?: number; // computed on frontend
}

// ── JOB TYPES ────────────────────────────
export type JobType = 'STANDARD' | 'SOS';
export type JobStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface JobRequest {
  id: string;
  ownerId: string;
  mechanicId?: string;
  vehicleId: string;
  type: JobType;
  title: string;
  description: string;
  photoUrls: string[];
  ownerLatitude: number;
  ownerLongitude: number;
  estimatedCost?: number;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

// ── SERVICE HISTORY ──────────────────────
export interface ServiceRecord {
  id: string;
  vehicleId: string;
  jobId?: string;
  mechanicId?: string;
  description: string;
  partsUsed: string[];
  cost: number;
  serviceDate: string;
  nextServiceDate?: string;
  mileage?: number;
}

// ── TRANSACTION TYPES ────────────────────
export type PaymentMethod = 'PAYSTACK' | 'MTN_MOMO';
export type TransactionStatus = 'PENDING' | 'HELD' | 'RELEASED' | 'REFUNDED';

export interface Transaction {
  id: string;
  jobId: string;
  grossAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  paidAt?: string;
  releasedAt?: string;
}

// ── REVIEW TYPES ─────────────────────────
export interface Review {
  id: string;
  jobId: string;
  reviewerId: string;
  mechanicId: string;
  rating: number; // 1–5
  comment?: string;
  createdAt: string;
}

// ── MESSAGE TYPES ─────────────────────────
export interface Message {
  id: string;
  jobId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  sentAt: string;
}

// ── SPARE PARTS ───────────────────────────
export interface SparePart {
  id: string;
  dealerId: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  quantityAvailable: number;
  photoUrls: string[];
  latitude: number;
  longitude: number;
  isAvailable: boolean;
}

// ── API RESPONSE WRAPPER ──────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// ── NAVIGATION TYPES ─────────────────────
export type RootStackParamList = {
  // Auth screens
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  OtpVerification: { phone: string };

  // Owner screens
  OwnerHome: undefined;
  OwnerSearch: undefined;
  OwnerJobs: undefined;
  OwnerMessages: undefined;
  OwnerProfile: undefined;
  MechanicDetail: { mechanicId: string };
  NewJob: { mechanicId?: string; isSos?: boolean };
  JobDetail: { jobId: string };
  VehicleList: undefined;
  AddVehicle: undefined;
  ServiceHistory: { vehicleId: string };
  SosScreen: undefined;

  // Mechanic screens
  MechanicHome: undefined;
  MechanicJobs: undefined;
  MechanicMessages: undefined;
  MechanicProfile: undefined;
  JobRequest: { jobId: string };
};