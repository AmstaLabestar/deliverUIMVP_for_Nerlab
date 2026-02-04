// Types pour les courses
export interface Course {
  id: string;
  quartierDepart: string;
  quartierArrivee: string;
  distance: number; // en km
  montant: number; // en FCFA
  typeLivraison: "colis" | "nourriture" | "documents" | "autre";
  statut: "disponible" | "en_attente" | "en_cours" | "terminee" | "refusee";
  dateCreation: string;
  dateAcceptation?: string;
  dateTerminaison?: string;
  livreurId?: string;
  clientId: string;
  infosClient: {
    nom: string;
    telephone: string;
    adresse: string;
  };
  typePaiement: "deja_paye" | "a_la_livraison";
  notes?: string;
}

// Types pour le livreur
export interface Livreur {
  id: string;
  nom: string;
  telephone: string;
  email: string;
  typeVehicule: "moto" | "voiture";
  niveauEtoile: number; // 1-5
  totalCoursesCompletees: number;
  totalGagnes: number;
  soldeDisponible: number;
  coursesPayees: number;
  photoUrl?: string;
  dateInscription: string;
}

// Types pour l'authentification
export interface AuthUser {
  id: string;
  telephone: string;
  role: "livreur"; // futur: 'client', 'admin'
  token: string;
  livreur: Livreur;
}

// Types pour la session
export interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  user: AuthUser | null;
}

// Types pour les actions auth
export type AuthAction =
  | { type: "RESTORE_TOKEN"; payload: string | null }
  | { type: "SIGN_IN"; payload: AuthUser }
  | { type: "SIGN_OUT" }
  | { type: "SIGN_UP"; payload: AuthUser };

// Types pour les transactions
export interface Transaction {
  id: string;
  courseId: string;
  livreurId: string;
  montant: number;
  dateTransaction: string;
  statut: "en_attente" | "complete" | "refusee";
  typePaiement: "deja_paye" | "a_la_livraison";
}

// Types pour les statistiques
export interface Stats {
  totalGagnes: number;
  coursesCompletees: number;
  coursesRefusees: number;
  etoileMoyenne: number;
  tauxAcceptation: number;
  dernier7jours: {
    coursesCompletees: number;
    montantGagne: number;
  };
}
