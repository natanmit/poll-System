import { createApi } from '@reduxjs/toolkit/query/react';
import defaultFetchBase from './defaultFetchBase';

export const statisticAPI = createApi({
    reducerPath: 'statisticAPI',
    baseQuery: defaultFetchBase,
    tagTypes: ['Statistics'],
    endpoints: (builder) => ({
        getStatistics: builder.query({
            query(args) {
                return {
                    url: `/statistics/questions/summary`,
                    method: 'GET',
                    credentials: 'include',
                };
            },
            providesTags: (result, error, id) => {
                return [{ type: 'Statistics', id }];
            },
            transformResponse: (results) => results,
        }),
    }),
});

export const {
    useGetStatisticsQuery,
} = statisticAPI;
