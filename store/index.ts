import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { regionMap } from './data';

const initialState = {
  regions: null as typeof regionMap,
  detailRegions: null as typeof regionMap,
  genre: '',
  updt: null as number,
};

export const slice = createSlice({
  name: 'slice',
  initialState,
  reducers: {
    sendRegions(state, action: PayloadAction<typeof regionMap>) {
      state.regions = action.payload;
    },
    sendDetailRegions(state, action: PayloadAction<typeof regionMap>) {
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