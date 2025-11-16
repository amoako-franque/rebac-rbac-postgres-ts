import { expect } from "chai"
import request from "supertest"
import app from "./testApp"
import { seed } from "../src/seed"
import { prisma } from "../src/prisma"

describe("RBAC+ReBAC Prisma TS", function () {
	this.timeout(20000)
	before(async () => {
		await prisma.$connect()
		await seed()
	})
	it("doctor can access rbac and rebac routes", async () => {
		const login = await request(app)
			.post("/auth/login")
			.send({ email: "doc@example.com", password: "password" })
		const token = login.body.token
		const s = await seed()
		const recId = s.records[0]
		const r1 = await request(app)
			.get("/records/rbac/" + recId)
			.set("Authorization", "Bearer " + token)
		expect(r1.status).to.equal(200)
		const r2 = await request(app)
			.get("/records/rebac/" + recId)
			.set("Authorization", "Bearer " + token)
		expect(r2.status).to.equal(200)
	})
})
