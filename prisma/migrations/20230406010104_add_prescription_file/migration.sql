-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Prescription" (
    "customerId" INTEGER NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "notes" TEXT NOT NULL,
    "renewalDate" DATETIME NOT NULL,
    "prescription" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Prescription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Prescription" ("customerId", "id", "notes", "renewalDate") SELECT "customerId", "id", "notes", "renewalDate" FROM "Prescription";
DROP TABLE "Prescription";
ALTER TABLE "new_Prescription" RENAME TO "Prescription";
CREATE INDEX "Prescription_customerId_renewalDate_idx" ON "Prescription"("customerId", "renewalDate");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
