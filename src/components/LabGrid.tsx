import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useState, useRef } from "react";
import {ColDef, ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule, PaginationModule } from "ag-grid-community";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { addLab, updateLab } from "../redux/LabSlice";
import { LabInterface } from "../validators/lab.interface";

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
  const [rowData, setRowData] = useState<LabInterface[]>([]);
  const [serviceInput, setServiceInput] = useState("");
  const [servicesList, setServicesList] = useState<string[]>([]);
  const [testMethodsList, setTestMethodsList] = useState<
    { method: string; parameters: string[]; sampleType: string }[]
  >([]);
  const [testMethodInput, setTestMethodInput] = useState({ method: "", parameters: "", sampleType: "" });
  const [editMode, setEditMode] = useState<number | null>(null);
  const [editedRow, setEditedRow] = useState<Partial<LabInterface>>({});

  const modalRef = useRef<HTMLDialogElement | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(labSchema),
    defaultValues: { servicesOffered: [], testMethods: [] },
  });

  useEffect(() => {
    setRowData(labs); 
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

  const columnDefs: ColDef<LabInterface>[] = [
    {
      field: "id",
      headerName: "ID",
      flex: 1,
      cellRenderer: (params: any) => (
        <button
          onClick={() => onRowClicked(params)}
          style={{
            background: '#000',
            color: '#fff',
            padding: '5px 10px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {params.value}
        </button>
      ),
    },
    {
      field: "labName",
      headerName: "Lab Name",
      flex: 2,
      editable: (params: any) => params.data.id === editMode,
      cellRenderer: (params: any) =>
        editMode === params.data.id ? (
          <input
            type="text"
            value={editedRow.labName || ""}
            onChange={(e) => handleInputChange("labName", e.target.value)}
          />
        ) : (
          params.value
        ),
    },
    {
      field: "contactPerson",
      headerName: "Contact Person",
      flex: 2,
      editable: (params: any) => params.data.id === editMode,
      cellRenderer: (params: any) =>
        editMode === params.data.id ? (
          <input
            type="text"
            value={editedRow.contactPerson || ""}
            onChange={(e) => handleInputChange("contactPerson", e.target.value)}
          />
        ) : (
          params.value
        ),
    },
    {
      field: "contactNumber",
      headerName: "Contact Number",
      flex: 2,
      editable: (params: any) => params.data.id === editMode,
      cellRenderer: (params: any) =>
        editMode === params.data.id ? (
          <input
            type="text"
            value={editedRow.contactNumber || ""}
            onChange={(e) => handleInputChange("contactNumber", e.target.value)}
          />
        ) : (
          params.value
        ),
    },
    {
      field: "location",
      headerName: "Location",
      flex: 2,
      editable: (params: any) => params.data.id === editMode,
      cellRenderer: (params: any) =>
        editMode === params.data.id ? (
          <input
            type="text"
            value={editedRow.location || ""}
            onChange={(e) => handleInputChange("location", e.target.value)}
          />
        ) : (
          params.value
        ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      editable: (params: any) => params.data.id === editMode,
      cellRenderer: (params: any) =>
        editMode === params.data.id ? (
          <select
            value={editedRow.status || "Active"}
            onChange={(e) => handleInputChange("status", e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        ) : (
          params.value
        ),
    },
    {
      //@ts-ignore
      field: "actions",
      headerName: "Actions",
      flex: 1,
      cellRenderer: (params: any) =>
        editMode === params.data.id ? (
          <button
            onClick={saveEdit}
            style={{
              background: '#000',
              color: '#fff',
              padding: '5px 10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >Save</button>
        ) : null,
    },
    {
      field: "servicesOffered",
      headerName: "Services Offered",
      flex: 2,
      editable: false,
      valueFormatter: (params: any) => params.value.join(", "),
    },
    {
      field: "testMethods",
      headerName: "Test Methods",
      flex: 3,
      editable: false,
      cellRenderer: (params: any) => {
        return params.value.map((tm: any) =>
          `${tm.method} (${tm.parameters.join(", ")}) - ${tm.sampleType}`
        ).join("; ");
      }
    },
  ];


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

  const onRowClicked = (params: any) => {
    setEditMode(params.data.id);
    setEditedRow(params.data);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedRow((prev: any) => ({ ...prev, [field]: value }));
  };

  // Save edited data
  const saveEdit = () => {
    if (editedRow.id) {
      dispatch(updateLab(editedRow as LabInterface));
      setEditMode(null);
    }
  };


  const onSubmit = (formData: z.infer<typeof labSchema>) => {
    if (servicesList.length === 0 || testMethodsList.length === 0) {
      alert("Please add at least one service and one test method.");
      return;
    }

    formData.servicesOffered = servicesList;
    formData.testMethods = testMethodsList;

    // Ensure ID is a valid number
    const newEntry: LabInterface = {
      id: rowData.length + 1,
      ...formData,
      servicesOffered: servicesList,
      testMethods: testMethodsList,
      status: "Active"
    };

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
        <AgGridReact rowData={rowData} columnDefs={columnDefs} pagination paginationPageSize={10} />
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
