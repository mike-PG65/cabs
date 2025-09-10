const express = require("express");
const Car = require("../models/Cars"); // adjust path if needed

const router = express.Router();

// @route   POST /api/cars/add
// @desc    Add a new car
// @access  Public (you can add auth middleware later)
router.post("/add", async (req, res) => {
  try {
    const {
      brand,
      model,
      year,
      registrationNumber,
      vin,
      fuelType,
      transmission,
      engineCapacity,
      mileage,
      color,
      doors,
      seats,
      airConditioning,
      pricePerDay,
      pricePerHour,
      depositRequired,
      availabilityStatus,
      availableFrom,
      availableUntil,
      pickupLocation,
      dropoffOptions,
      features,
      imageUrls,
      insuranceExpiryDate,
      serviceDueDate,
      category
    } = req.body;

    // ✅ Validation
    if (
      !brand ||
      !model ||
      !year ||
      !registrationNumber ||
      !fuelType ||
      !transmission ||
      !pricePerDay ||
      !pickupLocation ||
      !imageUrls ||
      imageUrls.length === 0
    ) {
      return res.status(400).json({ error: "Required fields are missing" });
    }

    // ✅ Create new car
    const newCar = new Car({
      brand,
      model,
      year,
      registrationNumber,
      vin,
      fuelType,
      transmission,
      engineCapacity,
      mileage,
      color,
      doors,
      seats,
      airConditioning,
      pricePerDay,
      pricePerHour,
      depositRequired,
      availabilityStatus,
      availableFrom,
      availableUntil,
      pickupLocation,
      dropoffOptions,
      features,
      imageUrls,
      insuranceExpiryDate,
      serviceDueDate,
      category1
    });

    await newCar.save();

    return res.status(201).json({
      message: "Car added successfully 🚗✅",
      car: newCar,
    });
  } catch (error) {
    console.error("Error adding car:", error);
    return res.status(500).json({ error: "Server error, try again later" });
  }
});


router.get("/list", async(req, res) => {
    try{
        const cars = await Car.find();

        if (!cars){
            return res.status(404).json({message: "Cars not found!!"})
        }

        return res.status(200).json(cars)
      
    }catch(err){
        return res.status(500).json({error: "Server error finding the cars!!" || err.message})
    }

});

router.get("/:id", async (req, res) => {
    try{
        const car = await Car.findById(req.params.id)

        if(!car){
            return res.status(404).json({error: "Error finding car"})
        }

        res.status(200).json(car)
    }catch(error){
        return res.status(500).json({error: "Server error finding the cars!!" || error.message})
    }
});

router.put("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updatedCar = await Car.findByIdAndUpdate(
      id,                 // which car to update
      { $set: req.body }, // update with all fields sent in request body
      { new: true, runValidators: true } // return updated car & run schema validation
    );

    if (!updatedCar) {
      return res.status(404).json({ error: "Car not found" });
    }

    return res.status(200).json({
      message: "Car updated successfully ✅",
      car: updatedCar,
    });
  } catch (error) {
    console.error("Error updating car:", error);
    return res.status(500).json({ error: "Server error, try again later" });
  }
});

router.delete("/delete/:id", async (req, res) => {
  try{
    const deletedCar = await Car.deleteOne(req.params._id)

    if(!deletedCar){
      return res.status(404).json({error: "Car not found!!"})
    }

    return res.status(200).json({message: "Car deleted sucessfully!"})
  }catch(error){
    return res.status(500).json({error: "Server error while deleting the car"})
    };
})


module.exports = router;
