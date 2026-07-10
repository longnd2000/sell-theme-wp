import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { themeApi } from './themeApi';
import themeUIReducer from './themeSlice';

export const store = configureStore({
  reducer: {
    [themeApi.reducerPath]: themeApi.reducer,
    themeUI: themeUIReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(themeApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
