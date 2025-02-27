import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TestMethod {
  method: string;
  parameters: string[];
  sampleType: string;
}

interface Lab {
  id: number;
  labName: string;
  location: string;
  contactPerson: string;
  contactNumber: string;
  servicesOffered: string[];
  status: string;
  testMethods: TestMethod[];
}

interface LabState {
  labs: Lab[];
}

const initialState: LabState = {
  labs: [
    {
      id: 1,
      labName: "Viswa Lab Chennai",
      location: "Chennai",
      contactPerson: "Dr. Ramesh",
      contactNumber: "9876543210",
      servicesOffered: ["Chemical Analysis", "Oil Testing", "Water Quality"],
      status: "Active",
      testMethods: [
        {
          method: "ASTM D445",
          parameters: ["Viscosity", "Temperature"],
          sampleType: "Oil",
        },
      ],
    },
  ],
};

const labSlice = createSlice({
  name: 'labs',
  initialState,
  reducers: {
    addLab: (state, action: PayloadAction<Lab>) => {
      state.labs.push(action.payload);
    },
    updateLab: (state, action: PayloadAction<Lab>) => {
      const index = state.labs.findIndex(lab => lab.id === action.payload.id);
      if (index !== -1) {
        state.labs[index] = action.payload;
      }
    },
  },
});

export const { addLab, updateLab } = labSlice.actions;
export default labSlice.reducer;
