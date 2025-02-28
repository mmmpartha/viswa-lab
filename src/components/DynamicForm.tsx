import React from "react";
import { useForm } from "react-hook-form";

interface FormProps {
  defaultValues?: any;
  onSubmit: (data: any) => void;
}

const DynamicForm: React.FC<FormProps> = ({ defaultValues, onSubmit }) => {
  const { handleSubmit, register, watch } = useForm({
    defaultValues,
  });

  const sampleType = watch("sampleType");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <label>Lab Name:</label>
      <input {...register("labName")} required className="border p-2 mb-2 w-full" />

      <label>Location:</label>
      <input {...register("location")} required className="border p-2 mb-2 w-full" />

      <label>Contact Person:</label>
      <input {...register("contactPerson")} required className="border p-2 mb-2 w-full" />

      <label>Sample Type:</label>
      <select {...register("sampleType")} className="border p-2 mb-2 w-full">
        <option value="Oil">Oil</option>
        <option value="Water">Water</option>
      </select>

      {sampleType === "Oil" && (
        <>
          <label>Viscosity:</label>
          <input {...register("viscosity")} className="border p-2 mb-2 w-full" />
        </>
      )}

      {sampleType === "Water" && (
        <>
          <label>Turbidity:</label>
          <input {...register("turbidity")} className="border p-2 mb-2 w-full" />
        </>
      )}

      <button type="submit" className="bg-blue-500 text-white p-2 mt-2">Submit</button>
    </form>
  );
};

export default DynamicForm;