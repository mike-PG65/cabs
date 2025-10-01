import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const fetchCars = createAsyncThunk("cars/fetchCars",async(__, thunkAPI) => {
        try{
            const res = await axios.get(`${API_BASE_URL}/api/cars/list`);
            return res.data
        }catch(error){
            return thunkAPI.rejectWithValue(error.response?.data?.error || error.message)
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
             console.log("Cars fetched:", action.payload)
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