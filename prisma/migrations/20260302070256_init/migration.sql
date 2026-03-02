-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PHARMACIST', 'LAB_TECHNICIAN', 'RADIOLOGIST', 'BILLING_STAFF', 'INSURANCE_OFFICER', 'WARD_MANAGER', 'PATIENT');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE');

-- CreateEnum
CREATE TYPE "PatientType" AS ENUM ('OPD', 'IPD', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "AdmissionStatus" AS ENUM ('ADMITTED', 'DISCHARGED', 'TRANSFERRED', 'ON_LEAVE');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "AppointmentPriority" AS ENUM ('ROUTINE', 'URGENT', 'STAT');

-- CreateEnum
CREATE TYPE "PrescriptionStatus" AS ENUM ('PENDING', 'DISPENSED', 'PARTIALLY_DISPENSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LabTestStatus" AS ENUM ('PENDING', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "LabResultStatus" AS ENUM ('NORMAL', 'ABNORMAL', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RadiologyStatus" AS ENUM ('PENDING', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('DRAFT', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'MOBILE_MONEY', 'BANK_TRANSFER', 'INSURANCE', 'CHEQUE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "InsuranceClaimStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "BedType" AS ENUM ('GENERAL', 'PRIVATE', 'ICU', 'SEMI_PRIVATE');

-- CreateEnum
CREATE TYPE "BedStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'DIRTY');

-- CreateEnum
CREATE TYPE "InventoryStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PATIENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "specialization" TEXT,
    "qualification" TEXT,
    "licenseNumber" TEXT,
    "licenseExpiry" TIMESTAMP(3),
    "joiningDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "salary" DECIMAL(12,2),
    "shift" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "patientId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "bloodGroup" "BloodGroup",
    "nationality" TEXT,
    "nationalId" TEXT,
    "passportNumber" TEXT,
    "phone" TEXT,
    "alternatePhone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "maritalStatus" TEXT,
    "occupation" TEXT,
    "religion" TEXT,
    "ethnicity" TEXT,
    "photo" TEXT,
    "patientType" "PatientType" NOT NULL DEFAULT 'OPD',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admission" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admissionType" "PatientType" NOT NULL,
    "status" "AdmissionStatus" NOT NULL DEFAULT 'ADMITTED',
    "wardId" TEXT,
    "bedId" TEXT,
    "attendingDoctorId" TEXT,
    "referringDoctorId" TEXT,
    "admissionReason" TEXT,
    "diagnosis" TEXT,
    "dischargeDate" TIMESTAMP(3),
    "dischargeSummary" TEXT,
    "dischargeInstructions" TEXT,
    "followUpDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Admission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "appointmentDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "priority" "AppointmentPriority" NOT NULL DEFAULT 'ROUTINE',
    "type" TEXT,
    "reason" TEXT,
    "notes" TEXT,
    "cancellationReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "tokenNumber" INTEGER,
    "queuePosition" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorSchedule" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 15,
    "maxPatients" INTEGER NOT NULL DEFAULT 20,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorLeave" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "type" TEXT,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorLeave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnosis" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "admissionId" TEXT,
    "icdCode" TEXT,
    "snomedCode" TEXT,
    "diagnosisText" TEXT NOT NULL,
    "diagnosisType" TEXT,
    "notes" TEXT,
    "diagnosedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VitalSign" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "admissionId" TEXT,
    "recordedBy" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "temperature" DECIMAL(5,2),
    "bloodPressureSystolic" INTEGER,
    "bloodPressureDiastolic" INTEGER,
    "pulseRate" INTEGER,
    "respiratoryRate" INTEGER,
    "spO2" INTEGER,
    "weight" DECIMAL(5,2),
    "height" DECIMAL(5,2),
    "bmi" DECIMAL(5,2),
    "bloodGlucose" DECIMAL(5,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VitalSign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allergy" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "allergenType" TEXT,
    "severity" TEXT,
    "reaction" TEXT,
    "diagnosedDate" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Allergy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "conditionType" TEXT,
    "diagnosedDate" TIMESTAMP(3),
    "resolvedDate" TIMESTAMP(3),
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NursingNote" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "admissionId" TEXT,
    "nurseId" TEXT NOT NULL,
    "noteType" TEXT,
    "note" TEXT NOT NULL,
    "shift" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NursingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drug" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "genericName" TEXT,
    "brandName" TEXT,
    "drugCode" TEXT NOT NULL,
    "category" TEXT,
    "form" TEXT,
    "strength" TEXT,
    "unit" TEXT,
    "manufacturer" TEXT,
    "description" TEXT,
    "sideEffects" TEXT,
    "contraindications" TEXT,
    "interactions" TEXT,
    "storageConditions" TEXT,
    "reorderLevel" INTEGER NOT NULL DEFAULT 10,
    "maxStockLevel" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Drug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugInventory" (
    "id" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "lotNumber" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "sellingPrice" DECIMAL(10,2) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "manufacturingDate" TIMESTAMP(3),
    "supplier" TEXT,
    "location" TEXT,
    "status" "InventoryStatus" NOT NULL DEFAULT 'IN_STOCK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DrugInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prescription" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "prescriptionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "PrescriptionStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "validUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrescriptionItem" (
    "id" TEXT NOT NULL,
    "prescriptionId" TEXT NOT NULL,
    "drugId" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT,
    "quantity" INTEGER NOT NULL,
    "instructions" TEXT,
    "isDispensed" BOOLEAN NOT NULL DEFAULT false,
    "dispensedQuantity" INTEGER,
    "dispensedAt" TIMESTAMP(3),
    "dispensedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrescriptionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicationAdministration" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "admissionId" TEXT,
    "medicationId" TEXT,
    "administeredBy" TEXT NOT NULL,
    "administeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dosage" TEXT NOT NULL,
    "route" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicationAdministration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "testCode" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "specimenType" TEXT,
    "normalRangeMin" DECIMAL(10,2),
    "normalRangeMax" DECIMAL(10,2),
    "unit" TEXT,
    "turnaroundTime" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LabTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTestOrder" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" TEXT,
    "status" "LabTestStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "LabTestOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabTestOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "status" "LabTestStatus" NOT NULL DEFAULT 'PENDING',
    "result" TEXT,
    "resultStatus" "LabResultStatus",
    "normalRange" TEXT,
    "notes" TEXT,
    "collectedAt" TIMESTAMP(3),
    "collectedBy" TEXT,
    "reportedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LabTestOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadiologyTest" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "testCode" TEXT NOT NULL,
    "category" TEXT,
    "modality" TEXT,
    "description" TEXT,
    "preparation" TEXT,
    "turnaroundTime" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RadiologyTest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadiologyOrder" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "orderDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priority" TEXT,
    "status" "RadiologyStatus" NOT NULL DEFAULT 'PENDING',
    "clinicalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RadiologyOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RadiologyOrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "status" "RadiologyStatus" NOT NULL DEFAULT 'PENDING',
    "report" TEXT,
    "reportUrl" TEXT,
    "reportedAt" TIMESTAMP(3),
    "reportedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RadiologyOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "admissionId" TEXT,
    "billNumber" TEXT NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "subtotal" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "tax" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "BillingStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillItem" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "itemType" TEXT,
    "referenceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "paidAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "contactPerson" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "InsuranceCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePolicy" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "policyName" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "coverageAmount" DECIMAL(12,2) NOT NULL,
    "copayPercentage" DECIMAL(5,2),
    "deductible" DECIMAL(12,2),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceClaim" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "billId" TEXT,
    "claimNumber" TEXT NOT NULL,
    "claimDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL(12,2) NOT NULL,
    "approvedAmount" DECIMAL(12,2),
    "status" "InsuranceClaimStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "notes" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceClaim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ward" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "floor" TEXT,
    "capacity" INTEGER NOT NULL,
    "type" TEXT,
    "inchargeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Ward_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bed" (
    "id" TEXT NOT NULL,
    "wardId" TEXT NOT NULL,
    "bedNumber" TEXT NOT NULL,
    "type" "BedType" NOT NULL DEFAULT 'GENERAL',
    "status" "BedStatus" NOT NULL DEFAULT 'AVAILABLE',
    "dailyRate" DECIMAL(10,2),
    "features" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientDocument" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PatientDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");

-- CreateIndex
CREATE INDEX "Department_name_idx" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Department_code_idx" ON "Department"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_userId_key" ON "Staff"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_employeeId_key" ON "Staff"("employeeId");

-- CreateIndex
CREATE INDEX "Staff_employeeId_idx" ON "Staff"("employeeId");

-- CreateIndex
CREATE INDEX "Staff_departmentId_idx" ON "Staff"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_key" ON "Patient"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_patientId_key" ON "Patient"("patientId");

-- CreateIndex
CREATE INDEX "Patient_patientId_idx" ON "Patient"("patientId");

-- CreateIndex
CREATE INDEX "Patient_firstName_lastName_idx" ON "Patient"("firstName", "lastName");

-- CreateIndex
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");

-- CreateIndex
CREATE INDEX "Admission_patientId_idx" ON "Admission"("patientId");

-- CreateIndex
CREATE INDEX "Admission_status_idx" ON "Admission"("status");

-- CreateIndex
CREATE INDEX "Admission_admissionDate_idx" ON "Admission"("admissionDate");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE INDEX "Appointment_doctorId_idx" ON "Appointment"("doctorId");

-- CreateIndex
CREATE INDEX "Appointment_appointmentDate_idx" ON "Appointment"("appointmentDate");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "DoctorSchedule_doctorId_idx" ON "DoctorSchedule"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorSchedule_doctorId_dayOfWeek_key" ON "DoctorSchedule"("doctorId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "DoctorLeave_doctorId_idx" ON "DoctorLeave"("doctorId");

-- CreateIndex
CREATE INDEX "DoctorLeave_startDate_endDate_idx" ON "DoctorLeave"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Diagnosis_patientId_idx" ON "Diagnosis"("patientId");

-- CreateIndex
CREATE INDEX "Diagnosis_doctorId_idx" ON "Diagnosis"("doctorId");

-- CreateIndex
CREATE INDEX "VitalSign_patientId_idx" ON "VitalSign"("patientId");

-- CreateIndex
CREATE INDEX "VitalSign_recordedAt_idx" ON "VitalSign"("recordedAt");

-- CreateIndex
CREATE INDEX "Allergy_patientId_idx" ON "Allergy"("patientId");

-- CreateIndex
CREATE INDEX "MedicalHistory_patientId_idx" ON "MedicalHistory"("patientId");

-- CreateIndex
CREATE INDEX "NursingNote_patientId_idx" ON "NursingNote"("patientId");

-- CreateIndex
CREATE INDEX "NursingNote_nurseId_idx" ON "NursingNote"("nurseId");

-- CreateIndex
CREATE UNIQUE INDEX "Drug_drugCode_key" ON "Drug"("drugCode");

-- CreateIndex
CREATE INDEX "Drug_name_idx" ON "Drug"("name");

-- CreateIndex
CREATE INDEX "Drug_drugCode_idx" ON "Drug"("drugCode");

-- CreateIndex
CREATE INDEX "DrugInventory_drugId_idx" ON "DrugInventory"("drugId");

-- CreateIndex
CREATE INDEX "DrugInventory_expiryDate_idx" ON "DrugInventory"("expiryDate");

-- CreateIndex
CREATE INDEX "DrugInventory_status_idx" ON "DrugInventory"("status");

-- CreateIndex
CREATE INDEX "Prescription_patientId_idx" ON "Prescription"("patientId");

-- CreateIndex
CREATE INDEX "Prescription_doctorId_idx" ON "Prescription"("doctorId");

-- CreateIndex
CREATE INDEX "Prescription_status_idx" ON "Prescription"("status");

-- CreateIndex
CREATE INDEX "PrescriptionItem_prescriptionId_idx" ON "PrescriptionItem"("prescriptionId");

-- CreateIndex
CREATE INDEX "PrescriptionItem_drugId_idx" ON "PrescriptionItem"("drugId");

-- CreateIndex
CREATE INDEX "MedicationAdministration_patientId_idx" ON "MedicationAdministration"("patientId");

-- CreateIndex
CREATE INDEX "MedicationAdministration_administeredAt_idx" ON "MedicationAdministration"("administeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "LabTest_testCode_key" ON "LabTest"("testCode");

-- CreateIndex
CREATE INDEX "LabTest_name_idx" ON "LabTest"("name");

-- CreateIndex
CREATE INDEX "LabTest_testCode_idx" ON "LabTest"("testCode");

-- CreateIndex
CREATE INDEX "LabTestOrder_patientId_idx" ON "LabTestOrder"("patientId");

-- CreateIndex
CREATE INDEX "LabTestOrder_doctorId_idx" ON "LabTestOrder"("doctorId");

-- CreateIndex
CREATE INDEX "LabTestOrder_status_idx" ON "LabTestOrder"("status");

-- CreateIndex
CREATE INDEX "LabTestOrderItem_orderId_idx" ON "LabTestOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "LabTestOrderItem_testId_idx" ON "LabTestOrderItem"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "RadiologyTest_testCode_key" ON "RadiologyTest"("testCode");

-- CreateIndex
CREATE INDEX "RadiologyTest_name_idx" ON "RadiologyTest"("name");

-- CreateIndex
CREATE INDEX "RadiologyTest_testCode_idx" ON "RadiologyTest"("testCode");

-- CreateIndex
CREATE INDEX "RadiologyOrder_patientId_idx" ON "RadiologyOrder"("patientId");

-- CreateIndex
CREATE INDEX "RadiologyOrder_doctorId_idx" ON "RadiologyOrder"("doctorId");

-- CreateIndex
CREATE INDEX "RadiologyOrder_status_idx" ON "RadiologyOrder"("status");

-- CreateIndex
CREATE INDEX "RadiologyOrderItem_orderId_idx" ON "RadiologyOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "RadiologyOrderItem_testId_idx" ON "RadiologyOrderItem"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_billNumber_key" ON "Bill"("billNumber");

-- CreateIndex
CREATE INDEX "Bill_patientId_idx" ON "Bill"("patientId");

-- CreateIndex
CREATE INDEX "Bill_billNumber_idx" ON "Bill"("billNumber");

-- CreateIndex
CREATE INDEX "Bill_status_idx" ON "Bill"("status");

-- CreateIndex
CREATE INDEX "BillItem_billId_idx" ON "BillItem"("billId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentNumber_key" ON "Payment"("paymentNumber");

-- CreateIndex
CREATE INDEX "Payment_billId_idx" ON "Payment"("billId");

-- CreateIndex
CREATE INDEX "Payment_patientId_idx" ON "Payment"("patientId");

-- CreateIndex
CREATE INDEX "Payment_paymentNumber_idx" ON "Payment"("paymentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_code_key" ON "InsuranceCompany"("code");

-- CreateIndex
CREATE INDEX "InsuranceCompany_name_idx" ON "InsuranceCompany"("name");

-- CreateIndex
CREATE INDEX "InsuranceCompany_code_idx" ON "InsuranceCompany"("code");

-- CreateIndex
CREATE INDEX "InsurancePolicy_patientId_idx" ON "InsurancePolicy"("patientId");

-- CreateIndex
CREATE INDEX "InsurancePolicy_policyNumber_idx" ON "InsurancePolicy"("policyNumber");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceClaim_claimNumber_key" ON "InsuranceClaim"("claimNumber");

-- CreateIndex
CREATE INDEX "InsuranceClaim_policyId_idx" ON "InsuranceClaim"("policyId");

-- CreateIndex
CREATE INDEX "InsuranceClaim_claimNumber_idx" ON "InsuranceClaim"("claimNumber");

-- CreateIndex
CREATE INDEX "InsuranceClaim_status_idx" ON "InsuranceClaim"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Ward_code_key" ON "Ward"("code");

-- CreateIndex
CREATE INDEX "Ward_name_idx" ON "Ward"("name");

-- CreateIndex
CREATE INDEX "Ward_code_idx" ON "Ward"("code");

-- CreateIndex
CREATE INDEX "Bed_wardId_idx" ON "Bed"("wardId");

-- CreateIndex
CREATE INDEX "Bed_status_idx" ON "Bed"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Bed_wardId_bedNumber_key" ON "Bed"("wardId", "bedNumber");

-- CreateIndex
CREATE INDEX "PatientDocument_patientId_idx" ON "PatientDocument"("patientId");

-- CreateIndex
CREATE INDEX "PatientDocument_documentType_idx" ON "PatientDocument"("documentType");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_key_idx" ON "SystemSetting"("key");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerificationToken" ADD CONSTRAINT "VerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_attendingDoctorId_fkey" FOREIGN KEY ("attendingDoctorId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_referringDoctorId_fkey" FOREIGN KEY ("referringDoctorId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VitalSign" ADD CONSTRAINT "VitalSign_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VitalSign" ADD CONSTRAINT "VitalSign_recordedBy_fkey" FOREIGN KEY ("recordedBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allergy" ADD CONSTRAINT "Allergy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalHistory" ADD CONSTRAINT "MedicalHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NursingNote" ADD CONSTRAINT "NursingNote_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NursingNote" ADD CONSTRAINT "NursingNote_nurseId_fkey" FOREIGN KEY ("nurseId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrugInventory" ADD CONSTRAINT "DrugInventory_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES "Prescription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrescriptionItem" ADD CONSTRAINT "PrescriptionItem_drugId_fkey" FOREIGN KEY ("drugId") REFERENCES "Drug"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationAdministration" ADD CONSTRAINT "MedicationAdministration_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicationAdministration" ADD CONSTRAINT "MedicationAdministration_administeredBy_fkey" FOREIGN KEY ("administeredBy") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestOrder" ADD CONSTRAINT "LabTestOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestOrder" ADD CONSTRAINT "LabTestOrder_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestOrderItem" ADD CONSTRAINT "LabTestOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "LabTestOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LabTestOrderItem" ADD CONSTRAINT "LabTestOrderItem_testId_fkey" FOREIGN KEY ("testId") REFERENCES "LabTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadiologyOrder" ADD CONSTRAINT "RadiologyOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadiologyOrder" ADD CONSTRAINT "RadiologyOrder_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadiologyOrderItem" ADD CONSTRAINT "RadiologyOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "RadiologyOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RadiologyOrderItem" ADD CONSTRAINT "RadiologyOrderItem_testId_fkey" FOREIGN KEY ("testId") REFERENCES "RadiologyTest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePolicy" ADD CONSTRAINT "InsurancePolicy_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "InsuranceCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceClaim" ADD CONSTRAINT "InsuranceClaim_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "InsurancePolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ward" ADD CONSTRAINT "Ward_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_wardId_fkey" FOREIGN KEY ("wardId") REFERENCES "Ward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientDocument" ADD CONSTRAINT "PatientDocument_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
