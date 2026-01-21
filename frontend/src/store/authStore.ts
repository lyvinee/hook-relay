import { create } from 'zustand';
import axios from 'axios';
import type { MeResponseDto } from '../gen/client/model';

interface AuthState {
    accessToken: string | null;
    user: MeResponseDto | null;
    setAccessToken: (token: string | null) => void;
    setUser: (user: MeResponseDto | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    user: null,
    isLoading: true,

    setAccessToken: (token) => {
        if (token) {
            console.debug("Setting access token:", token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            console.debug("Removing access token");
            delete axios.defaults.headers.common['Authorization'];
        }
        set({ accessToken: token });
    },
    setUser: (user) => set({ user }),
    logout: () => {
        console.debug("Removing access token on logout");
        delete axios.defaults.headers.common['Authorization'];
        set({
            accessToken: null,
            user: null,
        });
    },
}));
