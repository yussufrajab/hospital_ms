import { PrismaClient, UserRole } from '../node_modules/.prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL!

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Starting seed...')

  // Create Departments
  const departments = await Promise.all([
    prisma.department.upsert({
      where: { code: 'CARD' },
      update: {},
      create: {
        name: 'Cardiology',
        code: 'CARD',
        description: 'Heart and cardiovascular system',
      },
    }),
    prisma.department.upsert({
      where: { code: 'ORTH' },
      update: {},
      create: {
        name: 'Orthopedics',
        code: 'ORTH',
        description: 'Bones and musculoskeletal system',
      },
    }),
    prisma.department.upsert({
      where: { code: 'PEDS' },
      update: {},
      create: {
        name: 'Pediatrics',
        code: 'PEDS',
        description: 'Medical care of infants and children',
      },
    }),
    prisma.department.upsert({
      where: { code: 'GYNE' },
      update: {},
      create: {
        name: 'Gynecology',
        code: 'GYNE',
        description: "Women's reproductive health",
      },
    }),
    prisma.department.upsert({
      where: { code: 'GENM' },
      update: {},
      create: {
        name: 'General Medicine',
        code: 'GENM',
        description: 'General medical care',
      },
    }),
    prisma.department.upsert({
      where: { code: 'EMER' },
      update: {},
      create: {
        name: 'Emergency',
        code: 'EMER',
        description: 'Emergency and trauma care',
      },
    }),
    prisma.department.upsert({
      where: { code: 'PHARM' },
      update: {},
      create: {
        name: 'Pharmacy',
        code: 'PHARM',
        description: 'Pharmaceutical services',
      },
    }),
    prisma.department.upsert({
      where: { code: 'LAB' },
      update: {},
      create: {
        name: 'Laboratory',
        code: 'LAB',
        description: 'Medical laboratory services',
      },
    }),
    prisma.department.upsert({
      where: { code: 'RAD' },
      update: {},
      create: {
        name: 'Radiology',
        code: 'RAD',
        description: 'Medical imaging services',
      },
    }),
    prisma.department.upsert({
      where: { code: 'BILL' },
      update: {},
      create: {
        name: 'Billing',
        code: 'BILL',
        description: 'Financial services',
      },
    }),
  ])

  console.log(`Created ${departments.length} departments`)

  // Common password for all users
  const hashedPassword = await bcrypt.hash('password123', 12)

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@hms.com' },
    update: {},
    create: {
      email: 'admin@hms.com',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  // Create Hospital Admin
  const hospitalAdminUser = await prisma.user.upsert({
    where: { email: 'hospital.admin@hms.com' },
    update: {},
    create: {
      email: 'hospital.admin@hms.com',
      password: hashedPassword,
      firstName: 'Hospital',
      lastName: 'Administrator',
      role: UserRole.HOSPITAL_ADMIN,
      isActive: true,
      emailVerified: new Date(),
    },
  })

  // Create Doctors
  const doctors = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sarah.wilson@hms.com' },
      update: {},
      create: {
        email: 'sarah.wilson@hms.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Wilson',
        role: UserRole.DOCTOR,
        isActive: true,
        emailVerified: new Date(),
        staff: {
          create: {
            employeeId: 'DOC001',
            departmentId: departments[0].id,
            designation: 'Senior Cardiologist',
            specialization: 'Interventional Cardiology',
            qualification: 'MD, DM Cardiology',
            licenseNumber: 'MED-12345',
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'michael.chen@hms.com' },
      update: {},
      create: {
        email: 'michael.chen@hms.com',
        password: hashedPassword,
        firstName: 'Michael',
        lastName: 'Chen',
        role: UserRole.DOCTOR,
        isActive: true,
        emailVerified: new Date(),
        staff: {
          create: {
            employeeId: 'DOC002',
            departmentId: departments[1].id,
            designation: 'Orthopedic Surgeon',
            specialization: 'Joint Replacement',
            qualification: 'MS Orthopedics',
            licenseNumber: 'MED-12346',
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'james.taylor@hms.com' },
      update: {},
      create: {
        email: 'james.taylor@hms.com',
        password: hashedPassword,
        firstName: 'James',
        lastName: 'Taylor',
        role: UserRole.DOCTOR,
        isActive: true,
        emailVerified: new Date(),
        staff: {
          create: {
            employeeId: 'DOC003',
            departmentId: departments[4].id,
            designation: 'General Physician',
            specialization: 'Internal Medicine',
            qualification: 'MBBS, MD',
            licenseNumber: 'MED-12347',
          },
        },
      },
    }),
  ])

  // Create Nurses
  await Promise.all([
    prisma.user.upsert({
      where: { email: 'emma.johnson@hms.com' },
      update: {},
      create: {
        email: 'emma.johnson@hms.com',
        password: hashedPassword,
        firstName: 'Emma',
        lastName: 'Johnson',
        role: UserRole.NURSE,
        isActive: true,
        emailVerified: new Date(),
        staff: {
          create: {
            employeeId: 'NUR001',
            departmentId: departments[0].id,
            designation: 'Staff Nurse',
            qualification: 'BSc Nursing',
            licenseNumber: 'NUR-12345',
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: 'lisa.brown@hms.com' },
      update: {},
      create: {
        email: 'lisa.brown@hms.com',
        password: hashedPassword,
        firstName: 'Lisa',
        lastName: 'Brown',
        role: UserRole.NURSE,
        isActive: true,
        emailVerified: new Date(),
        staff: {
          create: {
            employeeId: 'NUR002',
            departmentId: departments[5].id,
            designation: 'Senior Nurse',
            qualification: 'BSc Nursing',
            licenseNumber: 'NUR-12346',
          },
        },
      },
    }),
  ])

  // Create Receptionist
  await prisma.user.upsert({
    where: { email: 'receptionist@hms.com' },
    update: {},
    create: {
      email: 'receptionist@hms.com',
      password: hashedPassword,
      firstName: 'Mary',
      lastName: 'Davis',
      role: UserRole.RECEPTIONIST,
      isActive: true,
      emailVerified: new Date(),
      staff: {
        create: {
          employeeId: 'REC001',
          departmentId: departments[4].id,
          designation: 'Front Desk Receptionist',
          qualification: 'High School Diploma',
        },
      },
    },
  })

  // Create Pharmacist
  await prisma.user.upsert({
    where: { email: 'pharmacist@hms.com' },
    update: {},
    create: {
      email: 'pharmacist@hms.com',
      password: hashedPassword,
      firstName: 'David',
      lastName: 'Miller',
      role: UserRole.PHARMACIST,
      isActive: true,
      emailVerified: new Date(),
      staff: {
        create: {
          employeeId: 'PHM001',
          departmentId: departments[6].id,
          designation: 'Chief Pharmacist',
          qualification: 'PharmD',
          licenseNumber: 'PHM-12345',
        },
      },
    },
  })

  // Create Lab Technician
  await prisma.user.upsert({
    where: { email: 'labtech@hms.com' },
    update: {},
    create: {
      email: 'labtech@hms.com',
      password: hashedPassword,
      firstName: 'Robert',
      lastName: 'Anderson',
      role: UserRole.LAB_TECHNICIAN,
      isActive: true,
      emailVerified: new Date(),
      staff: {
        create: {
          employeeId: 'LAB001',
          departmentId: departments[7].id,
          designation: 'Lab Technician',
          qualification: 'BSc Medical Lab Technology',
          licenseNumber: 'LAB-12345',
        },
      },
    },
  })

  // Create Billing Staff
  await prisma.user.upsert({
    where: { email: 'billing@hms.com' },
    update: {},
    create: {
      email: 'billing@hms.com',
      password: hashedPassword,
      firstName: 'Jennifer',
      lastName: 'White',
      role: UserRole.BILLING_STAFF,
      isActive: true,
      emailVerified: new Date(),
      staff: {
        create: {
          employeeId: 'BIL001',
          departmentId: departments[9].id,
          designation: 'Billing Officer',
          qualification: 'BCom',
        },
      },
    },
  })

  // Create Radiologist
  await prisma.user.upsert({
    where: { email: 'radiologist@hms.com' },
    update: {},
    create: {
      email: 'radiologist@hms.com',
      password: hashedPassword,
      firstName: 'Andrew',
      lastName: 'Thompson',
      role: UserRole.RADIOLOGIST,
      isActive: true,
      emailVerified: new Date(),
      staff: {
        create: {
          employeeId: 'RAD001',
          departmentId: departments[8].id,
          designation: 'Senior Radiologist',
          qualification: 'MD Radiology',
          licenseNumber: 'RAD-12345',
        },
      },
    },
  })

  // Create Insurance Officer
  await prisma.user.upsert({
    where: { email: 'insurance@hms.com' },
    update: {},
    create: {
      email: 'insurance@hms.com',
      password: hashedPassword,
      firstName: 'Patricia',
      lastName: 'Garcia',
      role: UserRole.INSURANCE_OFFICER,
      isActive: true,
      emailVerified: new Date(),
      staff: {
        create: {
          employeeId: 'INS001',
          departmentId: departments[9].id,
          designation: 'Insurance Officer',
          qualification: 'BBA',
        },
      },
    },
  })

  // Create Ward Manager
  await prisma.user.upsert({
    where: { email: 'wardmanager@hms.com' },
    update: {},
    create: {
      email: 'wardmanager@hms.com',
      password: hashedPassword,
      firstName: 'William',
      lastName: 'Martinez',
      role: UserRole.WARD_MANAGER,
      isActive: true,
      emailVerified: new Date(),
      staff: {
        create: {
          employeeId: 'WRD001',
          departmentId: departments[4].id,
          designation: 'Ward Manager',
          qualification: 'BSc Nursing',
          licenseNumber: 'NUR-12347',
        },
      },
    },
  })

  console.log('Created users with roles')

  // Create Wards
  const wards = await Promise.all([
    prisma.ward.upsert({
      where: { code: 'WARD-A' },
      update: {},
      create: {
        name: 'General Ward A',
        code: 'WARD-A',
        departmentId: departments[4].id,
        floor: 'Ground Floor',
        capacity: 20,
        type: 'General',
      },
    }),
    prisma.ward.upsert({
      where: { code: 'WARD-B' },
      update: {},
      create: {
        name: 'Private Ward B',
        code: 'WARD-B',
        departmentId: departments[4].id,
        floor: 'First Floor',
        capacity: 10,
        type: 'Private',
      },
    }),
    prisma.ward.upsert({
      where: { code: 'ICU-1' },
      update: {},
      create: {
        name: 'ICU 1',
        code: 'ICU-1',
        departmentId: departments[5].id,
        floor: 'Ground Floor',
        capacity: 8,
        type: 'ICU',
      },
    }),
  ])

  console.log(`Created ${wards.length} wards`)

  // Create Beds for each ward
  for (const ward of wards) {
    const existingBeds = await prisma.bed.count({ where: { wardId: ward.id } })
    if (existingBeds === 0) {
      for (let i = 1; i <= ward.capacity; i++) {
        await prisma.bed.create({
          data: {
            wardId: ward.id,
            bedNumber: `${ward.code}-${i.toString().padStart(2, '0')}`,
            type: ward.type === 'ICU' ? 'ICU' : ward.type === 'Private' ? 'PRIVATE' : 'GENERAL',
            status: 'AVAILABLE',
            dailyRate: ward.type === 'ICU' ? 500 : ward.type === 'Private' ? 200 : 50,
          },
        })
      }
    }
  }

  console.log('Created beds for all wards')

  // Create Lab Tests
  await Promise.all([
    prisma.labTest.upsert({
      where: { testCode: 'CBC' },
      update: {},
      create: {
        name: 'Complete Blood Count',
        testCode: 'CBC',
        category: 'Hematology',
        specimenType: 'Blood',
        turnaroundTime: 60,
        price: 25,
      },
    }),
    prisma.labTest.upsert({
      where: { testCode: 'BMP' },
      update: {},
      create: {
        name: 'Basic Metabolic Panel',
        testCode: 'BMP',
        category: 'Chemistry',
        specimenType: 'Blood',
        turnaroundTime: 90,
        price: 45,
      },
    }),
    prisma.labTest.upsert({
      where: { testCode: 'LFT' },
      update: {},
      create: {
        name: 'Liver Function Test',
        testCode: 'LFT',
        category: 'Chemistry',
        specimenType: 'Blood',
        turnaroundTime: 90,
        price: 55,
      },
    }),
  ])

  // Create Drugs
  await Promise.all([
    prisma.drug.upsert({
      where: { drugCode: 'AMOX500' },
      update: {},
      create: {
        name: 'Amoxicillin',
        genericName: 'Amoxicillin Trihydrate',
        brandName: 'Amoxil',
        drugCode: 'AMOX500',
        category: 'Antibiotics',
        form: 'Capsule',
        strength: '500mg',
        unit: 'Capsule',
        reorderLevel: 100,
      },
    }),
    prisma.drug.upsert({
      where: { drugCode: 'PARA500' },
      update: {},
      create: {
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        brandName: 'Tylenol',
        drugCode: 'PARA500',
        category: 'Analgesics',
        form: 'Tablet',
        strength: '500mg',
        unit: 'Tablet',
        reorderLevel: 200,
      },
    }),
    prisma.drug.upsert({
      where: { drugCode: 'IBU400' },
      update: {},
      create: {
        name: 'Ibuprofen',
        genericName: 'Ibuprofen',
        brandName: 'Advil',
        drugCode: 'IBU400',
        category: 'NSAIDs',
        form: 'Tablet',
        strength: '400mg',
        unit: 'Tablet',
        reorderLevel: 150,
      },
    }),
  ])

  // Create Insurance Companies
  await Promise.all([
    prisma.insuranceCompany.upsert({
      where: { code: 'INS001' },
      update: {},
      create: {
        name: 'National Health Insurance',
        code: 'INS001',
        phone: '1-800-HEALTH',
        email: 'info@nhi.com',
      },
    }),
    prisma.insuranceCompany.upsert({
      where: { code: 'INS002' },
      update: {},
      create: {
        name: 'Global Medical Insurance',
        code: 'INS002',
        phone: '1-800-GLOBAL',
        email: 'support@globalmed.com',
      },
    }),
  ])

  // Create System Settings
  await prisma.systemSetting.upsert({
    where: { key: 'hospital_name' },
    update: {},
    create: {
      key: 'hospital_name',
      value: 'General Hospital',
      description: 'Name of the hospital',
    },
  })

  console.log('Seed completed successfully!')
  console.log('\nDemo Accounts (all use password: password123):')
  console.log('Super Admin: admin@hms.com')
  console.log('Hospital Admin: hospital.admin@hms.com')
  console.log('Doctor: sarah.wilson@hms.com, michael.chen@hms.com, james.taylor@hms.com')
  console.log('Nurse: emma.johnson@hms.com, lisa.brown@hms.com')
  console.log('Receptionist: receptionist@hms.com')
  console.log('Pharmacist: pharmacist@hms.com')
  console.log('Lab Tech: labtech@hms.com')
  console.log('Radiologist: radiologist@hms.com')
  console.log('Billing: billing@hms.com')
  console.log('Insurance Officer: insurance@hms.com')
  console.log('Ward Manager: wardmanager@hms.com')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
