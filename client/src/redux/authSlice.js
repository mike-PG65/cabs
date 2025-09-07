import { createSlice } from  "@reduxjs/toolkit"

const authSlice = createSlice({
    name: "auth",
    initialState: {
        userId: null,
        token: null
    },
    reducers: {
        setCredentials:(state, action) => {
            state.userId = action.payload.userId
            state.token = action.payload.token
        },

        logOut: (state) => {
            state.token = null
            state.userId = null
        }
    }
});

export const { setCredentials, logOut} = authSlice.actions;
export default authSlice.reducer