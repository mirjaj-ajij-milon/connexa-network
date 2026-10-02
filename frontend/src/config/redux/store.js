import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./reducer/authReducer/index";
/*
steps for state management
Submit action
handle action to its reducer
register here -> user

*/

export const store = configureStore({
    reducer: {
        auth: authReducer
    }
})