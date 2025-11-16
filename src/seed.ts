import { prisma } from "./prisma"
import bcrypt from "bcrypt"

export async function seed() {
	await prisma.permission.deleteMany()
	await prisma.rolePermission.deleteMany()
	await prisma.role.deleteMany()
	await prisma.userRole.deleteMany()
	await prisma.user.deleteMany()
	await prisma.patientRecord.deleteMany()
	await prisma.relationship.deleteMany()

	const permRead = await prisma.permission.create({
		data: { name: "record:read" },
	})
	const permWrite = await prisma.permission.create({
		data: { name: "record:write" },
	})

	const doctor = await prisma.role.create({ data: { name: "doctor" } })
	const nurse = await prisma.role.create({ data: { name: "nurse" } })
	const admin = await prisma.role.create({ data: { name: "admin" } })

	await prisma.rolePermission.createMany({
		data: [
			{ roleId: doctor.id, permissionId: permRead.id },
			{ roleId: doctor.id, permissionId: permWrite.id },
			{ roleId: nurse.id, permissionId: permRead.id },
			{ roleId: admin.id, permissionId: permRead.id },
			{ roleId: admin.id, permissionId: permWrite.id },
		],
	})

	const hashedPassword = await bcrypt.hash("password", 10)

	const docUser = await prisma.user.create({
		data: {
			email: "doc@example.com",
			password: hashedPassword,
			name: "Dr Alice",
		},
	})
	const nurseUser = await prisma.user.create({
		data: {
			email: "nurse@example.com",
			password: hashedPassword,
			name: "Nora Nurse",
		},
	})
	const patient = await prisma.user.create({
		data: {
			email: "patient@example.com",
			password: hashedPassword,
			name: "Patient Paul",
		},
	})

	await prisma.userRole.createMany({
		data: [
			{ userId: docUser.id, roleId: doctor.id },
			{ userId: nurseUser.id, roleId: nurse.id },
		],
	})

	const rec1 = await prisma.patientRecord.create({
		data: {
			patientName: "Patient Paul",
			data: "Record A",
			ownerId: patient.id,
		},
	})
	const rec2 = await prisma.patientRecord.create({
		data: {
			patientName: "Patient Paul",
			data: "Record B",
			ownerId: patient.id,
		},
	})

	await prisma.relationship.create({
		data: { subjectId: docUser.id, objectId: patient.id, type: "assigned_to" },
	})

	return {
		users: { doctor: docUser.id, nurse: nurseUser.id, patient: patient.id },
		records: [rec1.id, rec2.id],
	}
}
if (require.main === module) {
	;(async () => {
		const out = await seed()
		console.log(out)
		process.exit(0)
	})()
}
