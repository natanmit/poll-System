/* eslint-disable no-undef */
import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { authAPI } from './api/authAPI';
import { questionAPI } from './api/questionAPI';
import userReducer from './api/userSlice';
import { getMeAPI } from './api/getMeAPI';
import { pollAPI } from './api/pollAPI';
import { statisticAPI } from './api/statisticAPI';

export const store = configureStore({
    reducer: {
        [authAPI.reducerPath]: authAPI.reducer,
        [getMeAPI.reducerPath]: getMeAPI.reducer,
        [questionAPI.reducerPath]: questionAPI.reducer,
        [pollAPI.reducerPath]: pollAPI.reducer,
        [statisticAPI.reducerPath]: statisticAPI.reducer,
        userState: userReducer,
    },
    devTools: process.env.NODE_ENV === 'development',
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({}).concat([
            authAPI.middleware,
            getMeAPI.middleware,
            questionAPI.middleware,
            pollAPI.middleware,
            statisticAPI.middleware,
        ])
});

export var RootState = store.getState();
export var AppDispatch = store.dispatch;
export function useAppDispatch() {
    return useDispatch(AppDispatch);
}
export function useAppSelector(selector) {
    return useSelector(selector);
}
