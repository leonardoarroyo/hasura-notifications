import { createSlice } from '@reduxjs/toolkit'

interface AuthState {
  token: string | null,
  authenticated: boolean
}

let initialState: AuthState = {
  token: null,
  authenticated: false
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken(_state, action) {
      return { token: action.payload, authenticated: true }
    }
  }
})

export const { setToken } = authSlice.actions

export default authSlice.reducer
