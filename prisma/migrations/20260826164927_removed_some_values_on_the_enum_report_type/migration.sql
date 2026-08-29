/*
  Warnings:

  - The values [MEMBER_PRODUCTIVITY,PROJECT_HEALTH,STORAGE_AND_ATTACHMENTS,SUBSCRIPTION_AND_BILLING,FULL_AUDIT_LOG] on the enum `ReportType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReportType_new" AS ENUM ('WORKSPACE_SUMMARY');
ALTER TABLE "Report" ALTER COLUMN "type" TYPE "ReportType_new" USING ("type"::text::"ReportType_new");
ALTER TYPE "ReportType" RENAME TO "ReportType_old";
ALTER TYPE "ReportType_new" RENAME TO "ReportType";
DROP TYPE "public"."ReportType_old";
COMMIT;
