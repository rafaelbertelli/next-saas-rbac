-- CreateIndex
CREATE INDEX "invites_organization_id_status_idx" ON "invites"("organization_id", "status");
