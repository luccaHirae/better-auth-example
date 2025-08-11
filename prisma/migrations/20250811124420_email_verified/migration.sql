/*
  Warnings:

  - You are about to alter the column `emailVerified` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime` to `Boolean`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_users" ("createdAt", "email", "emailVerified", "id", "image", "name", "updatedAt") SELECT "createdAt", "email", coalesce("emailVerified", false) AS "emailVerified", "id", "image", "name", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
