import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const fetchCars = createAsyncThunk(
    "cars/fetchCars",
    async(__, thunkAPI) => {
        try{
            const res = await axios.get("http://localhost:4051/api/cars/list");
            return res.data
        }catch(error){
            return thunkAPI.rejectWithValue(error.response?.data?.error || err.message)
        }
    }
);

const carSlice = createSlice({
    name: "cars",
    initialState: {
        list: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchCars.pending, (state) => {
            state.loading = true
            state.error = null
        })

        .addCase(fetchCars.fulfilled, (state, action) => {
            state.loading = false
            state.list = action.payload
        })
        .addCase(fetchCars.rejected, (state, action) => {
            state.loading = false
            state.error = action.payload
        })
    }
    
})

export default carSlice.reducer;