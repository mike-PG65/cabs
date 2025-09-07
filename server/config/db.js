const mongoose = require('mongoose')

const connectDb = async () => {
    try {

         console.log("Mongo URI:", process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI)

        console.log("Connected to the database sucessefully")
    } catch (error) {
        console.error("❌ MongoDB connection error:", error.message);
        process.exit(1); // Exit process if connection fails
    }
}
 
module.exports = connectDb;
