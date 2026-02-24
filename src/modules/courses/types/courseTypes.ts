import { VehicleType } from "@/src/modules/auth/types/authTypes";

export type DeliveryType = "colis" | "nourriture" | "documents" | "pressing";

export type CourseStatus =
  | "disponible"
  | "en_attente"
  | "en_cours"
  | "terminee"
  | "refusee";

export type PaymentType = "deja_paye" | "a_la_livraison";

export interface ClientInfo {
  nom: string;
  telephone: string;
  adresse: string;
}

export interface Course {
  id: string;
  quartierDepart: string;
  quartierArrivee: string;
  distance: number;
  montant: number;
  typeLivraison: DeliveryType;
  statut: CourseStatus;
  dateCreation: string;
  dateAcceptation?: string;
  dateTerminaison?: string;
  livreurId?: string;
  clientId: string;
  infosClient: ClientInfo;
  typePaiement: PaymentType;
  notes?: string;
  vehiculeAttribue?: VehicleType;
}

export type Cursor = string | null;

export interface PaginationParams {
  cursor?: Cursor;
  limit?: number;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: Cursor;
}

export interface CoursesState {
  availableCourses: Course[];
  activeCourse: Course | null;
  history: Course[];
  isLoading: boolean;
  error: string | null;
}

export interface CoursesContextValue extends CoursesState {
  refreshCourses: () => Promise<void>;
  loadMoreAvailableCourses: () => Promise<void>;
  hasNextAvailablePage: boolean;
  isFetchingMoreAvailableCourses: boolean;
  loadMoreHistory: () => Promise<void>;
  hasNextHistoryPage: boolean;
  isFetchingMoreHistory: boolean;
  acceptCourse: (courseId: string) => Promise<Course>;
  rejectCourse: (courseId: string) => Promise<void>;
  assignExternalCourse: (course: Course) => Promise<Course>;
  startActiveCourse: () => Promise<void>;
  completeActiveCourse: () => Promise<Course | null>;
}
