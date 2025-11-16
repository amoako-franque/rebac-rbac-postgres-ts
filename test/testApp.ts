import express from "express"
import authRoutes from "../src/routes/auth"
import recordRoutes from "../src/routes/records"

const app = express()

app.use(express.json())
app.use("/auth", authRoutes)
app.use("/records", recordRoutes)

export default app
