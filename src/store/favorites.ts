import { create } from 'zustand';
type FavoritesStore = { ids: string[]; toggle: (id: string) => void };
export const useFavorites = create<FavoritesStore>((set) => ({ ids: [], toggle: (id) => set((state) => ({ ids: state.ids.includes(id) ? state.ids.filter((item) => item !== id) : [...state.ids, id] })) }));
