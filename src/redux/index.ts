import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  str: '',
};

export const slice = createSlice({
  name: 'slice',
  initialState,
  reducers: {
    sendstr(state, action: PayloadAction<string>) {
      state.str = action.payload;
    },
  },
});

export const store = configureStore({
  reducer: slice.reducer
});