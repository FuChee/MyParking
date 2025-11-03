// src/store.js
import { configureStore } from '@reduxjs/toolkit';

import { profileApi } from './profile/profileApi';
import { loginApi } from './profile/loginApi';
import { parkingApi } from './features/parkingApi';
import { statsApi } from './features/statsApi';

export const store = configureStore({
  reducer: {
    [profileApi.reducerPath]: profileApi.reducer,
    [loginApi.reducerPath]: loginApi.reducer,
    [parkingApi.reducerPath]: parkingApi.reducer,
    [statsApi.reducerPath]: statsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      profileApi.middleware,
      loginApi.middleware,
      parkingApi.middleware,
      statsApi.middleware
    ),
});