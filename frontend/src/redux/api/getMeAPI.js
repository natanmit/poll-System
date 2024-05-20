import { createApi } from "@reduxjs/toolkit/query/react";
import { setUser, logout } from "./userSlice";
import defaultFetchBase from "./defaultFetchBase";
import { removeToken, removeUserData } from "../../utils/Utils";

export const getMeAPI = createApi({
    reducerPath: "getMeAPI",
    baseQuery: defaultFetchBase,
    tagTypes: ["User"],
    endpoints: (builder) => ({
        getMe: builder.query({
            query() {
                return {
                    url: "/users/personal/me",
                    credentials: "include",
                };
            },
            transformResponse: (result) => result,
            async onQueryStarted(_args, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    dispatch(setUser(data));
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        logoutUser: builder.mutation({
            query() {
                return {
                    url: '/users/logout',
                    credentials: 'include'
                };
            },
            async onQueryStarted(args, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    removeToken();
                    removeUserData();
                    dispatch(logout());
                } catch (error) {
                    console.log(error);
                }
            }
        }),
    }),
});

export const {
    useLogoutUserMutation,
} = getMeAPI;
