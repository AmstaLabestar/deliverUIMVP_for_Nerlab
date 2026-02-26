import { APP_CONFIG } from "@/src/core/config/env";

type TokenTtlPayload = {
    expiresInSeconds?: number;
    expiresIn?: number;
};

/**
 * Resolves access token TTL from a backend payload.
 * Checks `expiresInSeconds`, then `expiresIn`, then falls back to the app config default.
 */
export const resolveTokenTtlSeconds = (payload: TokenTtlPayload): number => {
    const ttlFromSeconds = payload.expiresInSeconds;
    if (
        typeof ttlFromSeconds === "number" &&
        Number.isFinite(ttlFromSeconds) &&
        ttlFromSeconds > 0
    ) {
        return ttlFromSeconds;
    }

    const ttlFromExpiresIn = payload.expiresIn;
    if (
        typeof ttlFromExpiresIn === "number" &&
        Number.isFinite(ttlFromExpiresIn) &&
        ttlFromExpiresIn > 0
    ) {
        return ttlFromExpiresIn;
    }

    return APP_CONFIG.auth.accessTokenTtlSeconds;
};
