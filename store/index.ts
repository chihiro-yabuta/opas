import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  region: '',
  genre: '',
  updt: null as number,
};

export const slice = createSlice({
  name: 'slice',
  initialState,
  reducers: {
    sendRegion(state, action: PayloadAction<string>) {
      state.region = action.payload;
    },
    sendGenre(state, action: PayloadAction<string>) {
      state.genre = action.payload;
    },
    sendUpdt(state, action: PayloadAction<number>) {
      state.updt = action.payload;
    },
  },
});

export const store = configureStore({
  reducer: slice.reducer
});

export type RootState = ReturnType<typeof store.getState>;