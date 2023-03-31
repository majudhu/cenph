-- CreateTable
CREATE TABLE "User" (
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "nid" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "photo" TEXT NOT NULL,
    "notes" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Prescription" (
    "customerId" INTEGER NOT NULL,
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "notes" TEXT NOT NULL,
    "renewalDate" DATETIME NOT NULL,
    CONSTRAINT "Prescription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "Customer_name_nid_phone_idx" ON "Customer"("name", "nid", "phone");

-- CreateIndex
CREATE INDEX "Prescription_customerId_renewalDate_idx" ON "Prescription"("customerId", "renewalDate");
