import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useState, useRef } from "react";
import { ColDef, ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule, PaginationModule } from "ag-grid-community";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { addLab } from "../redux/LabSlice";

ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule]);


const labSchema = z.object({
  labName: z.string().min(3, "Lab Name must be at least 3 characters"),
  contactPerson: z.string().min(3, "Contact Person must be at least 3 characters"),
  contactNumber: z.string().regex(/\d{10}/, "Invalid phone number (10 digits required)"),
  location: z.string().min(3, "Location is required"),
  servicesOffered: z.array(z.string()).min(1, "At least one service is required"),
  testMethods: z.array(
    z.object({
      method: z.string().min(3, "Method is required"),
      parameters: z.array(z.string()).min(1, "At least one parameter is required"),
      sampleType: z.string().min(3, "Sample Type is required"),
    })
  ).min(1, "At least one test method is required"),
  status: z.string().optional(),
});

function LabGrid() {

  const dispatch = useDispatch<AppDispatch>();
  const labs = useSelector((state: RootState) => state.lab.labs); 
  const [rowData, setRowData] = useState([]);
  const [serviceInput, setServiceInput] = useState("");
  const [servicesList, setServicesList] = useState<string[]>([]);
  const [testMethodsList, setTestMethodsList] = useState<
    { method: string; parameters: string[]; sampleType: string }[]
  >([]);
  const [testMethodInput, setTestMethodInput] = useState({ method: "", parameters: "", sampleType: "" });

  const modalRef = useRef<HTMLDialogElement | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(labSchema),
    defaultValues: { servicesOffered: [], testMethods: [] },
  });

  useEffect(() => {
    setRowData(labs); // Update rowData when Redux store changes
  }, [labs]);

  useEffect(() => {
    setValue("servicesOffered", servicesList);
    setValue("testMethods", testMethodsList);
  }, [servicesList, testMethodsList, setValue]);

  const openModal = () => modalRef.current?.showModal();
  const closeModal = () => modalRef.current?.close();

  const addService = () => {
    if (serviceInput.trim() && !servicesList.includes(serviceInput.trim())) {
      setServicesList([...servicesList, serviceInput.trim()]);
      setServiceInput("");
    }
  };


  const addTestMethod = () => {
    if (
      testMethodInput.method.trim() &&
      testMethodInput.parameters.trim() &&
      testMethodInput.sampleType.trim()
    ) {
      const newTestMethod = {
        method: testMethodInput.method.trim(),
        parameters: testMethodInput.parameters.split(",").map((p) => p.trim()),
        sampleType: testMethodInput.sampleType.trim(),
      };

      setTestMethodsList([...testMethodsList, newTestMethod]);
      setTestMethodInput({ method: "", parameters: "", sampleType: "" });
    }
  };

  const onSubmit = (formData) => {
    if (servicesList.length === 0 || testMethodsList.length === 0) {
      alert("Please add at least one service and one test method.");
      return;
    }
  
    formData.servicesOffered = servicesList;
    formData.testMethods = testMethodsList;
  
    // Ensure ID is a valid number
    const newEntry = {
      id: rowData.length + 1, // Assign an incremented ID instead of parseInt
      ...formData,
      status: "Active"
    };
  
    console.log("new entry", newEntry);
  
    dispatch(addLab(newEntry));
    setServicesList([]);
    setTestMethodsList([]);
    reset();
    closeModal();
  };
  

  return (
    <div style={{ width: "90vw", maxWidth: "1200px", margin: "auto", position: "relative" }}>
      <button onClick={openModal} style={{ marginBottom: "10px", padding: "10px", background: "#007bff", color: "#fff", borderRadius: "5px" }}>Add Form</button>

      <div className="ag-theme-quartz" style={{ height: "80vh", width: "100%" }}>
        <AgGridReact rowData={rowData} columnDefs={[
          { field: "id", headerName: "ID", flex: 1 },
          { field: "labName", headerName: "Lab Name", flex: 2 },
          { field: "contactPerson", headerName: "Contact Person", flex: 2 },
          { field: "contactNumber", headerName: "Contact Number", flex: 2 },
          { field: "location", headerName: "Location", flex: 2 },
          { field: "servicesOffered", headerName: "Services", flex: 3, valueFormatter: params => params.value?.join(", ") || "" },
          { field: "testMethods", headerName: "Test Methods", flex: 3, valueFormatter: params => params.value?.map(tm => `${tm.method} (${tm.sampleType})`).join(", ") || "" },
          { field: "status", headerName: "Status", flex: 1 },
        ]} pagination paginationPageSize={10} domLayout="autoHeight" />
      </div>

      {/* Modal Dialog */}
      <dialog ref={modalRef} style={{ padding: "20px", borderRadius: "10px", width: "50%", maxWidth: "600px", border: "none", boxShadow: "0 5px 15px rgba(0,0,0,0.3)" }}>
        <h2>Add New Lab</h2>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input type="text" placeholder="Lab Name" {...register("labName")} />
          <p style={{ color: "red" }}>{errors.labName?.message}</p>

          <input type="text" placeholder="Contact Person" {...register("contactPerson")} />
          <p style={{ color: "red" }}>{errors.contactPerson?.message}</p>

          <input type="text" placeholder="Contact Number" {...register("contactNumber")} />
          <p style={{ color: "red" }}>{errors.contactNumber?.message}</p>

          <input type="text" placeholder="Location" {...register("location")} />
          <p style={{ color: "red" }}>{errors.location?.message}</p>

          <h4>Services Offered</h4>
          <div style={{ display: "flex", gap: "5px" }}>
            <input type="text" placeholder="Service Name" value={serviceInput} onChange={(e) => setServiceInput(e.target.value)} />
            <button type="button" onClick={addService}>+</button>
          </div>

          {servicesList.map((service, i) => (
            <p key={i}>{service} <button onClick={() => setServicesList(servicesList.filter((_, idx) => idx !== i))}>❌</button></p>
          ))}

          <h4>Test Methods</h4>
          <div style={{ display: "flex", gap: "5px" }}>
            <input type="text" placeholder="Method Name" value={testMethodInput.method} onChange={(e) => setTestMethodInput({ ...testMethodInput, method: e.target.value })} />
            <input type="text" placeholder="Parameters (comma-separated)" value={testMethodInput.parameters} onChange={(e) => setTestMethodInput({ ...testMethodInput, parameters: e.target.value })} />
            <input type="text" placeholder="Sample Type" value={testMethodInput.sampleType} onChange={(e) => setTestMethodInput({ ...testMethodInput, sampleType: e.target.value })} />
            <button type="button" onClick={addTestMethod}>+</button>
          </div>

          {testMethodsList.map((tm, i) => (
            <p key={i}>{tm.method} ({tm.sampleType}) - {tm.parameters.join(", ")} <button onClick={() => setTestMethodsList(testMethodsList.filter((_, idx) => idx !== i))}>❌</button></p>
          ))}


          <button type="submit">Submit</button>
          <button type="button" onClick={closeModal}>Close</button>
        </form>
      </dialog>
    </div>
  );
}

export default LabGrid;
