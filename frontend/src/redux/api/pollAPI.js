import { createApi } from '@reduxjs/toolkit/query/react';
import defaultFetchBase from './defaultFetchBase';

export const pollAPI = createApi({
    reducerPath: 'pollAPI',
    baseQuery: defaultFetchBase,
    tagTypes: ['Polls'],
    endpoints: (builder) => ({
        createPoll: builder.mutation({
            query(payload) {
                return {
                    url: '/polls/create',
                    method: 'POST',
                    credentials: 'include',
                    body: payload
                };
            },
            invalidatesTags: [{ type: 'Polls', id: 'LIST' }],
            transformResponse: (result) => result
        }),
    }),
});

export const {
    useCreatePollMutation,
} = pollAPI;
