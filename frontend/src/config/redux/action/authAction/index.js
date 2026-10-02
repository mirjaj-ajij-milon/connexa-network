import { clientServer } from "@/config/index.jsx";
import {
    createAsyncThunk
} from "@reduxjs/toolkit";


export const loginUser = createAsyncThunk(
    "user/login",
    async (user, thunkAPI) => {
        try {
            const response = await clientServer.post("/auth/login", {
                email: user.email,
                password: user.password
            })
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            } else {
                return thunkAPI.rejectWithValue({
                    message: "token not provide!"
                })
            }
            return thunkAPI.fulfillWithValue(response.data.token);

        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data)
        }
    }
)

export const registerUser = createAsyncThunk(
    "user/register",
    async (userData, thunkAPI) => {
        try {
            const response = await clientServer.post("/auth/register", {

            })
        } catch (error) {

        }
    }
)