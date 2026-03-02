import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET - Patient statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : new Date(new Date().setMonth(new Date().getMonth() - 12))
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : new Date()

    // Patient demographics
    const [
      totalPatients,
      genderDistribution,
      bloodGroupDistribution,
      patientTypeDistribution,
      newPatientsByMonth,
      topDiagnoses,
      admissionsByDepartment,
    ] = await Promise.all([
      // Total patients
      prisma.patient.count({ where: { isDeleted: false } }),

      // Gender distribution
      prisma.patient.groupBy({
        by: ['gender'],
        where: { isDeleted: false },
        _count: true,
      }),

      // Blood group distribution
      prisma.patient.groupBy({
        by: ['bloodGroup'],
        where: { isDeleted: false, bloodGroup: { not: null } },
        _count: true,
      }),

      // Patient type (OPD/IPD/EMERGENCY) from admissions
      prisma.admission.groupBy({
        by: ['admissionType'],
        _count: true,
      }),

      // New patients by month (last 12 months)
      prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`
        SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
        FROM patients
        WHERE created_at >= ${startDate}
          AND created_at <= ${endDate}
          AND is_deleted = false
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      `,

      // Top diagnoses
      prisma.diagnosis.groupBy({
        by: ['diagnosisText'],
        _count: true,
        orderBy: { _count: { diagnosisText: 'desc' } },
        take: 10,
      }),

      // Admissions by department
      prisma.$queryRaw<Array<{ department: string; count: bigint }>>`
        SELECT d.name as department, COUNT(a.id) as count
        FROM admissions a
        JOIN wards w ON a.ward_id = w.id
        JOIN departments d ON w.department_id = d.id
        WHERE a.admission_date >= ${startDate}
          AND a.admission_date <= ${endDate}
          AND a.is_deleted = false
        GROUP BY d.name
        ORDER BY count DESC
        LIMIT 10
      `,
    ])

    // Age distribution
    const ageGroups = await prisma.$queryRaw<Array<{ age_group: string; count: bigint }>>`
      SELECT 
        CASE 
          WHEN age < 18 THEN '0-17'
          WHEN age BETWEEN 18 AND 30 THEN '18-30'
          WHEN age BETWEEN 31 AND 45 THEN '31-45'
          WHEN age BETWEEN 46 AND 60 THEN '46-60'
          ELSE '60+'
        END as age_group,
        COUNT(*) as count
      FROM (
        SELECT 
          EXTRACT(YEAR FROM AGE(date_of_birth))::int as age
        FROM patients
        WHERE is_deleted = false
          AND date_of_birth IS NOT NULL
      ) ages
      GROUP BY age_group
      ORDER BY 
        CASE age_group
          WHEN '0-17' THEN 1
          WHEN '18-30' THEN 2
          WHEN '31-45' THEN 3
          WHEN '46-60' THEN 4
          ELSE 5
        END
    `

    // Average length of stay
    const avgLengthOfStay = await prisma.$queryRaw<Array<{ avg: number }>>`
      SELECT AVG(EXTRACT(DAY FROM (discharge_date - admission_date)))::numeric(10,2) as avg
      FROM admissions
      WHERE discharge_date IS NOT NULL
        AND admission_date >= ${startDate}
        AND admission_date <= ${endDate}
        AND is_deleted = false
    `

    // Readmission rate (patients admitted more than once in period)
    const readmissions = await prisma.$queryRaw<Array<{ patient_count: bigint; admission_count: bigint }>>`
      SELECT 
        COUNT(DISTINCT patient_id) as patient_count,
        COUNT(*) as admission_count
      FROM admissions
      WHERE admission_date >= ${startDate}
        AND admission_date <= ${endDate}
        AND is_deleted = false
    `

    const uniquePatients = Number(readmissions[0]?.patient_count || 0)
    const totalAdmissionsCount = Number(readmissions[0]?.admission_count || 0)

    return NextResponse.json({
      period: { startDate, endDate },
      summary: {
        totalPatients,
        newPatients: newPatientsByMonth.reduce((sum, m) => sum + Number(m.count), 0),
        averageLengthOfStay: Number(avgLengthOfStay[0]?.avg || 0),
        readmissionRate: uniquePatients > 0 
          ? Math.round(((totalAdmissionsCount - uniquePatients) / uniquePatients) * 100)
          : 0,
      },
      demographics: {
        gender: genderDistribution.map(g => ({
          gender: g.gender,
          count: g._count,
        })),
        bloodGroup: bloodGroupDistribution.map(b => ({
          bloodGroup: b.bloodGroup,
          count: b._count,
        })),
        ageGroups: ageGroups.map(a => ({
          group: a.age_group,
          count: Number(a.count),
        })),
      },
      patientTypes: patientTypeDistribution.map(p => ({
        type: p.admissionType,
        count: p._count,
      })),
      trends: {
        newPatientsByMonth: newPatientsByMonth.map(m => ({
          month: m.month,
          count: Number(m.count),
        })),
      },
      topDiagnoses: topDiagnoses.map(d => ({
        diagnosis: d.diagnosisText,
        count: d._count,
      })),
      admissionsByDepartment: admissionsByDepartment.map(a => ({
        department: a.department,
        count: Number(a.count),
      })),
    })
  } catch (error) {
    console.error('Error fetching patient statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch patient statistics' },
      { status: 500 }
    )
  }
}
