import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:4051/api/cart";

// Add to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ carId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("No token found");

      const res = await axios.post(`${API_URL}/`, { carId }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// Fetch cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("No token found");

      const res = await axios.get(`${API_URL}/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ( carId, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("No token found!!")

      const res = await axios.delete(`${API_URL}/${carId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }catch(err){
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
)

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("No token found");

      const res = await axios.delete(`${API_URL}/clear`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return res.data.items; // should contain updated cart (empty)
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || err.message);
    }
  }
);

// Edit dates
export const editCartDates = createAsyncThunk(
  "cart/editCartDates",
  async ({ carId, startDate, endDate }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return rejectWithValue("No token found");

      const res = await axios.put(`${API_URL}/edit`, { carId, startDate, endDate }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.items; // only items array
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || "Failed to add to cart");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, state => { state.loading = true; })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.error = null
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
      })
      .addCase(editCartDates.fulfilled, (state, action) => {
        state.items = action.payload || [];
      })

      // Remove from cart
    .addCase(removeFromCart.fulfilled, (state, action) => {
      state.items = action.payload.items || [];
    })
    .addCase(removeFromCart.rejected, (state, action) => {
      state.error = action.payload;
    })
    // Clear cart
    .addCase(clearCart.fulfilled, (state, action) => {
      state.items = []; // just empty the items
    })
    .addCase(clearCart.rejected, (state, action) => {
      state.error = action.payload;
    })      
  }
});

export default cartSlice.reducer;
