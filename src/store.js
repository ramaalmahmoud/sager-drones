import { create } from "zustand";

export const useDroneStore = create((set) => ({
  drones: [],
  addDrone: (drone) =>
    set((state) => ({
      drones: [...state.drones, drone],
    })),
}));
