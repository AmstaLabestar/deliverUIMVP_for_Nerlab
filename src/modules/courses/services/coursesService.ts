import { CoursesRepository } from "@/src/modules/courses/repositories/coursesRepository";
import {
  Course,
  CursorPage,
  PaginationParams,
} from "@/src/modules/courses/types/courseTypes";

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const now = Date.now();

const AVAILABLE_COURSES_SEED: Course[] = [
  {
    id: "course_001",
    quartierDepart: "Goudrin",
    quartierArrivee: "Karpala",
    distance: 3.5,
    montant: 15000,
    typeLivraison: "colis",
    statut: "disponible",
    dateCreation: new Date(now - 5 * 60 * 1000).toISOString(),
    clientId: "client_001",
    infosClient: {
      nom: "Sana Aminata",
      telephone: "77111111",
      adresse: "123 Rue Karpala, Ouagadougou",
    },
    typePaiement: "deja_paye",
  },
  {
    id: "course_002",
    quartierDepart: "Dapoya",
    quartierArrivee: "1200 Logements",
    distance: 5.2,
    montant: 20000,
    typeLivraison: "nourriture",
    statut: "disponible",
    dateCreation: new Date(now - 10 * 60 * 1000).toISOString(),
    clientId: "client_002",
    infosClient: {
      nom: "Kabore Moussa",
      telephone: "77222222",
      adresse: "456 Avenue Khawme Kurma, Ouagadougou",
    },
    typePaiement: "deja_paye",
  },
  {
    id: "course_003",
    quartierDepart: "Tanghin",
    quartierArrivee: "Gounghin",
    distance: 8,
    montant: 30000,
    typeLivraison: "documents",
    statut: "disponible",
    dateCreation: new Date(now - 15 * 60 * 1000).toISOString(),
    clientId: "client_003",
    infosClient: {
      nom: "Diallo Aissatou",
      telephone: "77333333",
      adresse: "789 Rue Gounghin, Ouagadougou",
    },
    typePaiement: "a_la_livraison",
  },
  {
    id: "course_004",
    quartierDepart: "Karpala",
    quartierArrivee: "Nongr-Massom",
    distance: 6.5,
    montant: 25000,
    typeLivraison: "colis",
    statut: "disponible",
    dateCreation: new Date(now - 2 * 60 * 1000).toISOString(),
    clientId: "client_004",
    infosClient: {
      nom: "Koanda Moussa",
      telephone: "77444444",
      adresse: "321 Boulevard Nongr-Massom, Ouagadougou",
    },
    typePaiement: "deja_paye",
  },
  {
    id: "course_005",
    quartierDepart: "Pissy",
    quartierArrivee: "Kossodo",
    distance: 7,
    montant: 28000,
    typeLivraison: "colis",
    statut: "disponible",
    dateCreation: new Date(now - 20 * 60 * 1000).toISOString(),
    clientId: "client_005",
    infosClient: {
      nom: "Sana Fatoumata",
      telephone: "77555555",
      adresse: "Route Kaya Kossodo, Ouagadougou",
    },
    typePaiement: "deja_paye",
  },
  {
    id: "course_006",
    quartierDepart: "Ouaga 2000",
    quartierArrivee: "Patte d'Oie",
    distance: 4.4,
    montant: 16500,
    typeLivraison: "nourriture",
    statut: "disponible",
    dateCreation: new Date(now - 25 * 60 * 1000).toISOString(),
    clientId: "client_006",
    infosClient: {
      nom: "Nadine Ouedraogo",
      telephone: "77666666",
      adresse: "Ouaga 2000, Ouagadougou",
    },
    typePaiement: "a_la_livraison",
  },
];

const HISTORY_SEED: Course[] = [
  {
    id: "history_001",
    quartierDepart: "Somgande",
    quartierArrivee: "Sankare Yaare",
    distance: 4.2,
    montant: 18000,
    typeLivraison: "colis",
    statut: "terminee",
    dateCreation: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    dateAcceptation: new Date(now - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    dateTerminaison: new Date(now - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
    livreurId: "driver_seed",
    clientId: "client_101",
    infosClient: {
      nom: "Sanogo Samira",
      telephone: "77666666",
      adresse: "Centre-ville, Ouagadougou",
    },
    typePaiement: "deja_paye",
  },
  {
    id: "history_002",
    quartierDepart: "Pissy",
    quartierArrivee: "Koulouba",
    distance: 6.8,
    montant: 24000,
    typeLivraison: "nourriture",
    statut: "terminee",
    dateCreation: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
    dateAcceptation: new Date(now - 4 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    dateTerminaison: new Date(now - 4 * 24 * 60 * 60 * 1000 + 35 * 60 * 1000).toISOString(),
    livreurId: "driver_seed",
    clientId: "client_102",
    infosClient: {
      nom: "Traore Ibrahim",
      telephone: "77101010",
      adresse: "Koulouba, Ouagadougou",
    },
    typePaiement: "deja_paye",
  },
  {
    id: "history_003",
    quartierDepart: "Tanghin",
    quartierArrivee: "Hamdalaye",
    distance: 12,
    montant: 45000,
    typeLivraison: "colis",
    statut: "terminee",
    dateCreation: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString(),
    dateAcceptation: new Date(now - 6 * 24 * 60 * 60 * 1000 + 4 * 60 * 1000).toISOString(),
    dateTerminaison: new Date(now - 6 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000).toISOString(),
    livreurId: "driver_seed",
    clientId: "client_103",
    infosClient: {
      nom: "Mohamed Ali",
      telephone: "77777777",
      adresse: "Hamdalaye, Ouagadougou",
    },
    typePaiement: "deja_paye",
  },
  {
    id: "history_004",
    quartierDepart: "Boulmionghin",
    quartierArrivee: "Benenyogo",
    distance: 20,
    montant: 70000,
    typeLivraison: "colis",
    statut: "terminee",
    dateCreation: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dateAcceptation: new Date(now - 10 * 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
    dateTerminaison: new Date(now - 10 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    livreurId: "driver_seed",
    clientId: "client_104",
    infosClient: {
      nom: "Awa Sana",
      telephone: "77999999",
      adresse: "Benenyogo, Ouagadougou",
    },
    typePaiement: "deja_paye",
  },
];

const cloneCourse = (course: Course): Course => ({
  ...course,
  infosClient: { ...course.infosClient },
});

const cloneCourseList = (courses: Course[]): Course[] => courses.map(cloneCourse);

const paginateWithCursor = <T>(
  source: T[],
  params?: PaginationParams,
): CursorPage<T> => {
  const limit = params?.limit ?? 10;
  const cursorValue = params?.cursor ?? null;
  const startIndex = cursorValue ? Number(cursorValue) : 0;
  const safeStart = Number.isFinite(startIndex) && startIndex >= 0 ? startIndex : 0;
  const items = source.slice(safeStart, safeStart + limit);
  const nextStartIndex = safeStart + items.length;
  const nextCursor = nextStartIndex < source.length ? String(nextStartIndex) : null;

  return {
    items,
    nextCursor,
  };
};

const fetchAvailableCoursesPage = async (
  params?: PaginationParams,
): Promise<CursorPage<Course>> => {
  await wait(350);
  return paginateWithCursor(cloneCourseList(AVAILABLE_COURSES_SEED), params);
};

const fetchHistoryPage = async (
  params?: PaginationParams,
): Promise<CursorPage<Course>> => {
  await wait(250);
  return paginateWithCursor(cloneCourseList(HISTORY_SEED), params);
};

const fetchAvailableCourses = async (): Promise<Course[]> => {
  const page = await fetchAvailableCoursesPage();
  return page.items;
};

const fetchHistory = async (): Promise<Course[]> => {
  const page = await fetchHistoryPage();
  return page.items;
};

export const coursesRepository: CoursesRepository = {
  fetchAvailableCoursesPage,
  fetchHistoryPage,
};

export const coursesService = {
  fetchAvailableCourses,
  fetchHistory,
  fetchAvailableCoursesPage,
  fetchHistoryPage,
};
