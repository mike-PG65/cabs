import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import carReducer from "./carSlice";
import cartReducer from "./cartSlice";

// Load from sessionStorage on startup
const savedAuth = sessionStorage.getItem("authState")
  ? JSON.parse(sessionStorage.getItem("authState"))
  : { userId: null, token: null };

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cars: carReducer,
    cart: cartReducer,
  },
  preloadedState: {
    auth: savedAuth, // 👈 rehydrate auth state here
  },
});

// Persist auth state into sessionStorage on changes
store.subscribe(() => {
  const { auth } = store.getState();
  sessionStorage.setItem("authState", JSON.stringify(auth));
});

export default store;
