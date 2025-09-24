import { createSlice } from "@reduxjs/toolkit"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        userId: sessionStorage.getItem("userId") || null,
        token: sessionStorage.getItem("token") || null,
    },
    reducers: {
        setCredentials: (state, action) => {
            state.userId = action.payload.userId
            state.token = action.payload.token
            sessionStorage.setItem("token", action.payload.token);
            sessionStorage.setItem("userId", action.payload.userId);
        },

        logOut: (state) => {
            state.token = null
            state.userId = null
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("userId");
        }
    }
});

export const { setCredentials, logOut } = authSlice.actions;
export default authSlice.reducer