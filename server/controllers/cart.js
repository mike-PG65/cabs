const express = require('express');
const Cart = require('../models/Cart');
const Car = require('../models/Cars');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// ➕ Add car to cart (dates optional)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { carId } = req.body;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ error: "Car not found" });

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      cart = new Cart({
        userId: req.user.id,
        items: [{
          carId,
          pricePerDay: car.pricePerDay,
          totalPrice: 0
        }]
      });
    } else {
      const exists = cart.items.some(item => item.carId.toString() === carId);
      if (exists) return res.status(400).json({ error: "Car already in cart" });

      cart.items.push({ carId, pricePerDay: car.pricePerDay, totalPrice: 0 });
    }

    await cart.save();
    const populatedCart = await cart.populate("items.carId", "brand model imageUrls pricePerDay");
    res.status(200).json(populatedCart);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📋 Get cart
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate("items.carId", "brand model imageUrls pricePerDay");

    if (!cart) return res.status(404).json({ error: "Cart not found" });
    res.status(200).json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ✏️ Update dates for a car in the cart
router.put('/edit', authMiddleware, async (req, res) => {
  try {
    const { carId, startDate, endDate } = req.body;
    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.carId");

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.find(i => i.carId._id.toString() === carId);
    if (!item) return res.status(404).json({ error: "Car not in cart" });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days <= 0) return res.status(400).json({ error: "Invalid date range" });

    item.startDate = startDate;
    item.endDate = endDate;
    item.days = days;
    item.totalPrice = days * item.pricePerDay;

    await cart.save();
    res.status(200).json(await cart.populate("items.carId"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/clear", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id.toString();

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    cart.items = []; // clear items
    await cart.save();

    res.json({ message: "Cart cleared successfully", cart });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

router.delete('/:carId', authMiddleware, async(req, res) => {
  try{
    const {carId} = req.params

    const cart = await Cart.findOne({ userId: req.user.id })
    if(!cart) return res.status(404).json({error: "Cart not found!!"})

    const updatedItems = cart.items.filter( item => item.carId.toString() !== carId)

    if(updatedItems.length === cart.items.length) return res.status(404).json({ error: "Car not found!!"})

    cart.items = updatedItems

    await cart.save();
    return res
      .status(200)
      .json(await cart.populate("items.carId", "brand model imageUrls"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  
  }
});



module.exports = router;
