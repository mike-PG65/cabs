// cronJobs.js
const cron = require("node-cron");
const Hire = require("./models/Hire");
const Car = require("./models/Cars");

// Run every midnight (00:00)
cron.schedule("0 * * * *", async () => {
  console.log("⏰ Running hourly hire check...");
  try {
    const now = new Date();

    // Find hires that have ended but are still pending/confirmed
    const expiredHires = await Hire.find({
      "items.endDate": { $lte: now },
      status: { $in: ["pending", "confirmed"] }
    });

    for (const hire of expiredHires) {
      // Update hire status
      hire.status = "ended";
      await hire.save();

      // Release cars back to available
      for (const item of hire.items) {
        await Car.findByIdAndUpdate(item.carId, {
          availabilityStatus: "Available",
        });
      }
    }

    console.log(`✅ Processed ${expiredHires.length} expired hires`);
  } catch (err) {
    console.error("❌ Cron job error:", err.message);
  }
});
