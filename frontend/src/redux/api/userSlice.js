import { createSlice } from '@reduxjs/toolkit';

const item = localStorage.getItem('userData');

const initialState = {
  user: item ? JSON.parse(item) : null
};

export const userSlice = createSlice({
  name: 'userSlice',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    }
  }
});

export default userSlice.reducer;

export const { logout, setUser } = userSlice.actions;
