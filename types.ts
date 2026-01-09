
export interface WorkerStyleOverrides {
  nameFontSize?: number;
  jobFontSize?: number;
  companyFontSize?: number;
  taxCodeFontSize?: number;
  verticalOffset?: number;
  qrSize?: number;
  showLogoOnBadge?: boolean;
}

export type WorkerType = 'DIPENDENTE' | 'AUTONOMO' | 'TECNICO' | 'VISITATORE';
export type ComplianceStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface TrainingRecord {
  id: string;
  name: string;
  completionDate: string;
  expiryDate: string;
}

export interface QualificationRecord {
  id: string;
  name: string;
  expiryDate: string;
}

export interface Worker {
  id: string; // Codice Fiscale
  firstName: string;
  lastName: string;
  taxCode: string;
  jobTitle: string;
  jobTitles?: string[];
  companyName: string;
  photoUrl: string;
  birthDate: string;
  birthPlace?: string;
  emergencyContact?: string;
  bloodType?: string;
  issueDate: string;
  expiryDate: string;
  isArchived: boolean;
  notes?: string;
  equipment?: string[];
  userId: string;
  workerUserId?: string;
  styleOverrides?: WorkerStyleOverrides;
  associatedSiteIds?: string[];
  
  workerType: WorkerType;
  trainings: TrainingRecord[];
  medicalFitness?: {
    lastCheckDate: string;
    expiryDate: string;
    judgment: string;
  };
  qualifications: QualificationRecord[];
  insuranceData?: string;
  complianceStatus?: ComplianceStatus;
}

export interface Cantiere {
  id: string;
  name: string;
  address: string;
  city: string;
  active: boolean;
  joinCode: string;
  createdAt: string;
  updatedAt?: string;
  userId: string;
  geo?: { lat: number; lng: number; };
  photoUrl?: string;
  clientName?: string;
  cup?: string;
  cig?: string;
  mainContractor?: string;
  subContractors?: string[];
  rupName?: string;
  direttoreLavoriName?: string;
  cseName?: string;
  notes?: string;
}

export interface Presence {
  id: string;
  workerId: string;
  workerName: string;
  siteId: string;
  siteName: string;
  type: 'IN' | 'OUT';
  jobTitle: string;
  timestamp: any;
  userId: string;
  geo?: { lat: number; lng: number; };
  accuracy?: number;
  isOffline?: boolean;
  isManual?: boolean; 
  isEdited?: boolean;
  lastEditedBy?: string;
  lastEditedAt?: any;
}

export interface CorrectionRequest {
  id: string;
  workerId: string;
  workerName: string;
  userId: string;
  requesterId: string;
  requesterRole: 'ADMIN' | 'WORKER';
  type: 'IN' | 'OUT';
  requestedTime: string;
  requestedDate: string;
  siteId: string;
  siteName: string;
  jobTitle: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: any;
}

export interface User {
  id: string;
  email: string;
  companyName: string;
  vatNumber: string;
  role: 'ADMIN' | 'WORKER' | 'SUPER_ADMIN';
  logoUrl?: string;
  durcFileUrl?: string; // Nuova proprietà per l'allegato DURC
  legalAddress?: string;
  city?: string;
  cap?: string;
  province?: string;
  phone?: string;
  pecEmail?: string;
  responsibleName?: string;
  inailPos?: string;
  inpsPos?: string;
  cassaEdile?: string;
  durcStatus?: 'REGOLARE' | 'IRREGOLARE' | 'SCADUTO';
  durcExpiryDate?: string;
  ccnlApplied?: string;
  rsppName?: string;
  rsppAppointmentDate?: string;
  medicoCompetenteName?: string;
  medicoAppointmentDate?: string;
  privacyConsent?: boolean;
  dataProcessingConsent?: boolean;
  marketingConsent?: boolean;
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  WORKER_LIST = 'WORKER_LIST',
  ADD_WORKER = 'ADD_WORKER',
  VERIFY = 'VERIFY',
  COMPANY_PROFILE = 'COMPANY_PROFILE',
  CANTIERI = 'CANTIERI',
  PRESENZE_WORKER = 'PRESENZE_WORKER',
  QR_GENERATOR = 'QR_GENERATOR',
  GENERAL_LOG = 'GENERAL_LOG',
  CALENDAR = 'CALENDAR',
  REQUESTS = 'REQUESTS',
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  AI_ADVISOR = 'AI_ADVISOR',
  STATISTICS = 'STATISTICS',
  COMPANY_LIST = 'COMPANY_LIST'
}
