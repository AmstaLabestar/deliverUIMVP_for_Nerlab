import { z } from "zod";

export const vehicleTypeSchema = z.enum([
  "moto",
  "voiture",
  "fourgonnette",
  "tricycle",
]);

const backendDriverSchema = z
  .object({
    id: z.string().min(1).optional(),
    nom: z.string().min(1).optional(),
    telephone: z.string().min(1).optional(),
    niveauEtoile: z.number().nonnegative().optional(),
    typeVehicule: z.string().min(1).optional(),
    totalCoursesCompletees: z.number().int().nonnegative().optional(),
    coursesPayees: z.number().int().nonnegative().optional(),
  })
  .strip();

const backendUserSchema = z
  .object({
    id: z.string().min(1).optional(),
    telephone: z.string().min(1).optional(),
    livreur: backendDriverSchema.optional(),
  })
  .strip();

export const loginCredentialsSchema = z.object({
  telephone: z
    .string()
    .trim()
    .regex(/^[0-9]{8,10}$/, "Numero de telephone invalide."),
  password: z.string().trim().min(4, "Le mot de passe doit contenir au moins 4 caracteres."),
});

export const authTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresAt: z.string().datetime(),
});

export const authUserSchema = z.object({
  id: z.string().min(1),
  telephone: z.string().min(1),
  livreur: z.object({
    id: z.string().min(1),
    nom: z.string().min(1),
    telephone: z.string().min(1),
    niveauEtoile: z.number(),
    typeVehicule: vehicleTypeSchema,
    totalCoursesCompletees: z.number().int().nonnegative(),
    coursesPayees: z.number().int().nonnegative(),
  }),
});

export const authSessionSchema = z.object({
  tokens: authTokensSchema,
  user: authUserSchema,
});

export const loginApiResponseSchema = z
  .object({
    user: backendUserSchema.optional(),
    token: z.string().min(1).optional(),
    accessToken: z.string().min(1).optional(),
    refreshToken: z.string().min(1).optional(),
    expiresIn: z.number().int().positive().optional(),
    expiresInSeconds: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
  })
  .strip()
  .refine((value) => Boolean(value.accessToken || value.token), {
    message: "Access token manquant.",
  });

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const refreshTokenResponseSchema = z
  .object({
    token: z.string().min(1).optional(),
    accessToken: z.string().min(1).optional(),
    refreshToken: z.string().min(1).optional(),
    expiresIn: z.number().int().positive().optional(),
    expiresInSeconds: z.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
  })
  .strip()
  .refine((value) => Boolean(value.accessToken || value.token), {
    message: "Access token manquant dans la reponse de refresh.",
  });

export type LoginApiResponse = z.infer<typeof loginApiResponseSchema>;
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
