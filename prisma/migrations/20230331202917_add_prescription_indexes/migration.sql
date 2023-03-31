-- CreateIndex
CREATE INDEX "Prescription_customerId_renewalDate_idx" ON "Prescription"("customerId", "renewalDate");
