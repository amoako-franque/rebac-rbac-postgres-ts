"use strict"
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod }
}
Object.defineProperty(exports, "__esModule", { value: true })
const chai_1 = require("chai")
const supertest_1 = __importDefault(require("supertest"))
const testApp_1 = __importDefault(require("./testApp"))
const seed_1 = require("../src/seed")
const prisma_1 = require("../src/prisma")

describe('RBAC+ReBAC Prisma TS', function () {
    this.timeout(20000)
    before(async () => { await prisma_1.prisma.$connect(); await (0, seed_1.seed)() })
    it('doctor can access rbac and rebac routes', async () => {
        const login = await (0, supertest_1.default)(testApp_1.default).post('/auth/login').send({ email: 'doc@example.com', password: 'password' })
        const token = login.body.token
        const s = await (0, seed_1.seed)()
        const recId = s.records[0]
        const r1 = await (0, supertest_1.default)(testApp_1.default).get('/records/rbac/' + recId).set('Authorization', 'Bearer ' + token);
        (0, chai_1.expect)(r1.status).to.equal(200)
        const r2 = await (0, supertest_1.default)(testApp_1.default).get('/records/rebac/' + recId).set('Authorization', 'Bearer ' + token);
        (0, chai_1.expect)(r2.status).to.equal(200)
    })
})
