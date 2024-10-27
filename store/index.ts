import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
  regions: null as { [region: string]: boolean },
  detailRegions: null as { [region: string]: boolean },
  genre: '',
  updt: null as number,
};

export const slice = createSlice({
  name: 'slice',
  initialState,
  reducers: {
    sendRegions(state, action: PayloadAction<{ [region: string]: boolean }>) {
      state.regions = action.payload;
    },
    sendDetailRegions(state, action: PayloadAction<{ [region: string]: boolean }>) {
      state.detailRegions = action.payload;
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