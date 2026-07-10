require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

// 1. Connect to MongoDB Atlas
connectToDB()

// 2. Use process.env.PORT for Cloud Deployment
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

// 3. Keep your AI timeout setting
server.timeout = 120000;