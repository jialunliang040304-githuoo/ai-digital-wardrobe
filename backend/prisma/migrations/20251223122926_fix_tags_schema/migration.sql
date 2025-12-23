-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_clothing_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "meshData" TEXT,
    "texture" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "clothing_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_clothing_items" ("category", "createdAt", "id", "meshData", "name", "tags", "texture", "type", "updatedAt", "userId") SELECT "category", "createdAt", "id", "meshData", "name", "tags", "texture", "type", "updatedAt", "userId" FROM "clothing_items";
DROP TABLE "clothing_items";
ALTER TABLE "new_clothing_items" RENAME TO "clothing_items";
CREATE TABLE "new_saved_looks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "screenshot" TEXT,
    "tags" TEXT NOT NULL DEFAULT '',
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "saved_looks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_saved_looks" ("createdAt", "id", "isPublic", "name", "screenshot", "tags", "updatedAt", "userId") SELECT "createdAt", "id", "isPublic", "name", "screenshot", "tags", "updatedAt", "userId" FROM "saved_looks";
DROP TABLE "saved_looks";
ALTER TABLE "new_saved_looks" RENAME TO "saved_looks";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
