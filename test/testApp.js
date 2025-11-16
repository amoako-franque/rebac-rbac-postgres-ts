"use strict"
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod }
}
Object.defineProperty(exports, "__esModule", { value: true })
const express_1 = __importDefault(require("express"))
const body_parser_1 = __importDefault(require("body-parser"))
const auth_1 = __importDefault(require("../src/routes/auth"))
const records_1 = __importDefault(require("../src/routes/records"))

const app = (0, express_1.default)()


app.use(body_parser_1.default.json())
app.use('/auth', auth_1.default)
app.use('/records', records_1.default)
exports.default = app
