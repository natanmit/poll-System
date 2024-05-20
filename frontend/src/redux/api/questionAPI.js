import { createApi } from '@reduxjs/toolkit/query/react';
import defaultFetchBase from './defaultFetchBase';

export const questionAPI = createApi({
    reducerPath: 'questionAPI',
    baseQuery: defaultFetchBase,
    tagTypes: ['Questions'],
    endpoints: (builder) => ({
        getQuestions: builder.query({
            query(args) {
                return {
                    url: `/questions`,
                    method: 'GET',
                    params: { ...args },
                    credentials: 'include',
                };
            },
            providesTags: (result, error, id) => {
                return [{ type: 'Questions', id }];
            },
            transformResponse: (results) => results,
        }),
    }),
});

export const {
    useGetQuestionsQuery,
} = questionAPI;
