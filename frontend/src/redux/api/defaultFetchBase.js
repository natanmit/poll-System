// Import statements remain the same
import {
    fetchBaseQuery
} from '@reduxjs/toolkit/query/react'; // Ensure you're importing from /react if you're using RTK Query with React
import { Mutex } from 'async-mutex';
import { logout } from './userSlice';
import {
    getToken,
    removeToken,
    removeUserData,
    setToken,
    setUserData
} from '../../utils/Utils';

const baseUrl = `${process.env.REACT_APP_SERVER_ENDPOINT}/api`;

// Create a new mutex
const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers) => {
        const accessToken = getToken();
        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }
        return headers;
    },
});

const defaultFetchBase = async (args, api, extraOptions) => {
    await mutex.waitForUnlock();
    let result = await baseQuery(args, api, extraOptions);
    if (result.error && (result.error.status === 401 || result.error.originalStatus === 401)) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                const refreshResponse = await baseQuery(
                    { credentials: 'include', url: 'auth/refreshToken' },
                    api,
                    extraOptions
                );

                if (refreshResponse.data) {
                    const refreshResult = refreshResponse.data;
                    setToken(refreshResult.accessToken);
                    setUserData(JSON.stringify(refreshResult.userData));
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    // Handle failed refresh here
                    removeToken();
                    removeUserData();
                    api.dispatch(logout());
                }
            } finally {
                release();
            }
        } else {
            await mutex.waitForUnlock();
            result = await baseQuery(args, api, extraOptions);
        }
    }

    return result;
};

export default defaultFetchBase;
