const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDb = require('./config/db')

// Load environment variables
dotenv.config();

const app = express();

app.use(cors());

app.use(express.json())

const port = process.env.PORT || 4052

const runServer = async () => {
    await connectDb();
    app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
})
}

runServer()

const carRoutes = require('./cars/cars')
const usersRoutes = require('./users/user')

app.use("/api/cars", carRoutes)
app.use('/api/auth', usersRoutes)
