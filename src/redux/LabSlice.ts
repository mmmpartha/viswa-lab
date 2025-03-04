import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import data from "../lab.json";

interface TestMethod {
  method: string;
  parameters: string[];
  sampleType: string;
}

interface Lab {
  id: number;
  labName: string;
  contactPerson: string;
  contactNumber: string;
  location: string;
  servicesOffered: string[];
  testMethods: TestMethod[];
  status: string;
}

interface LabState {
  labs: Lab[];
}

const initialState: LabState = {
  labs: data, 
};

const labSlice = createSlice({
  name: "lab",
  initialState,
  reducers: {
    addLab: (state, action: PayloadAction<Lab>) => {
      state.labs.push(action.payload);
    },
    setLabs: (state, action: PayloadAction<Lab[]>) => {
      state.labs = action.payload;
    },
    updateLab: (state, action: PayloadAction<Lab>) => {
      const index = state.labs.findIndex(lab => lab.id === action.payload.id);
      if (index !== -1) {
        state.labs[index] = action.payload;
      }
    },
  },
});

export const { addLab, setLabs, updateLab } = labSlice.actions;
export default labSlice.reducer;
