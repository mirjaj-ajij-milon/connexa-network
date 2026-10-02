import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "../../action/authAction";

const initialState = {
    user: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    isLoggedIn: false,
    message: "",
    profileFetched: false,
    connections: [],
    connectionRequests: [],
    searchData: [],
    pendingRequests: [],
    sentRequests: [],
    receivedRequests: [],
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset: () => initialState,
        handleLoginUser: (state) => {
            state.message = "hello"
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.message = "waiting for response"
            })
            .addCase(loginUser.fulfilled, (state, actions) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.isLoggedIn = true;
                state.message = "logged in Successfully";
            })

            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.isSuccess = false;
            })
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.message = "Please wait for the response";
            })
            .addCase(registerUser.fulfilled, (state, actions) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.isLoggedIn = false;
                state.message = "Registered Successfully";
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.isSuccess = false;
                state.message = action.payload;
            })
    }
})

export const { reset } = authSlice.actions;
export default authSlice.reducer;