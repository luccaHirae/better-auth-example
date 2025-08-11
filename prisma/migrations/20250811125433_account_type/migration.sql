-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_accounts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "type" TEXT,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" DATETIME,
    "refreshTokenExpiresAt" DATETIME,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_accounts" ("accessToken", "accessTokenExpiresAt", "access_token", "accountId", "createdAt", "expires_at", "id", "idToken", "id_token", "password", "provider", "providerId", "provider_account_id", "refreshToken", "refreshTokenExpiresAt", "refresh_token", "scope", "session_state", "token_type", "type", "updatedAt", "user_id") SELECT "accessToken", "accessTokenExpiresAt", "access_token", "accountId", "createdAt", "expires_at", "id", "idToken", "id_token", "password", "provider", "providerId", "provider_account_id", "refreshToken", "refreshTokenExpiresAt", "refresh_token", "scope", "session_state", "token_type", "type", "updatedAt", "user_id" FROM "accounts";
DROP TABLE "accounts";
ALTER TABLE "new_accounts" RENAME TO "accounts";
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
