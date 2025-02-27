import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useState } from "react";
import { ColDef, ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule, PaginationModule } from "ag-grid-community";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule]);

import data from "../lab.json";

const labSchema = z.object({
  labName: z.string().min(3, "Lab Name must be at least 3 characters"),
  contactPerson: z.string().min(3, "Contact Person must be at least 3 characters"),
  contactNumber: z.string().regex(/^\d{10}$/, "Invalid phone number (10 digits required)"),
  location: z.string().min(3, "Location is required"),
  servicesOffered: z.array(z.string()).min(1, "At least one service is required"),
  status: z.string().optional(),
});

function LabGrid() {
  const [rowData, setRowData] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [serviceInput, setServiceInput] = useState(""); 
  const [servicesList, setServicesList] = useState<string[]>([]); 

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(labSchema),
    defaultValues: {
      servicesOffered: [], 
    },
  });

  const [colDefs] = useState<ColDef[]>([
    { field: "id", headerName: "ID", flex: 1 },
    { field: "labName", headerName: "Lab Name", flex: 2 },
    { field: "contactPerson", headerName: "Contact Person", flex: 2 },
    { field: "contactNumber", headerName: "Contact Number", flex: 2 },
    { field: "location", headerName: "Location", flex: 2 },
    {
      field: "servicesOffered",
      headerName: "Services",
      flex: 3,
      valueFormatter: (params) => params.value?.join(", ") || "", 
    },
    { field: "status", headerName: "Status", flex: 1 },
  ]);

  useEffect(() => {
    console.log("Fetched Data:", data);
    if (Array.isArray(data)) {
      setRowData(data);
    } else {
      console.error("Invalid data format");
    }
  }, []);

  const onSubmit = async (formData) => {
    console.log("Form Submission Triggered:", formData);
  
    if (servicesList.length === 0) {
      alert("Please add at least one service.");
      return;
    }
  
    formData.servicesOffered = servicesList;
  
    const newId = rowData.length > 0 ? Math.max(...rowData.map(item => parseInt(item.id))) + 1 : 1;
    const newEntry = {
      id: newId.toString(),
      ...formData,
      status: "Active",
    };
  
    console.log("Final Data:", newEntry);
  
    setRowData([...rowData, newEntry]);
    setFormOpen(false);
    setServicesList([]);
    reset();
  };
  
  useEffect(() => {
    setValue("servicesOffered", servicesList);
  }, [servicesList, setValue]);




  const addService = () => {
    if (serviceInput.trim() && !servicesList.includes(serviceInput.trim())) {
      setServicesList([...servicesList, serviceInput.trim()]);
      setServiceInput("");
    }
  };

  const removeService = (service) => {
    setServicesList(servicesList.filter(item => item !== service));
  };

  return (
    <div style={{ width: "90vw", maxWidth: "1200px", margin: "auto", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <button
          onClick={() => setFormOpen(true)}
          style={{ padding: "10px 15px", background: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Add Form
        </button>
      </div>

      <div className="ag-theme-quartz" style={{ height: "80vh", width: "100%" }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={colDefs}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
        />
      </div>

      {formOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "white", padding: "30px", width: "50%", maxWidth: "600px",
            boxShadow: "0 0 15px rgba(0,0,0,0.3)", borderRadius: "10px", position: "relative"
          }}>
            <h2>Add New Lab</h2>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Lab Name" {...register("labName")} style={{ padding: "10px", width: "100%" }} />
              {errors.labName && <p style={{ color: "red" }}>{errors.labName.message}</p>}

              <input type="text" placeholder="Contact Person" {...register("contactPerson")} style={{ padding: "10px", width: "100%" }} />
              {errors.contactPerson && <p style={{ color: "red" }}>{errors.contactPerson.message}</p>}

              <input type="text" placeholder="Contact Number" {...register("contactNumber")} style={{ padding: "10px", width: "100%" }} />
              {errors.contactNumber && <p style={{ color: "red" }}>{errors.contactNumber.message}</p>}

              <input type="text" placeholder="Location" {...register("location")} style={{ padding: "10px", width: "100%" }} />
              {errors.location && <p style={{ color: "red" }}>{errors.location.message}</p>}

              <div>
                <input type="text" value={serviceInput} onChange={(e) => setServiceInput(e.target.value)} placeholder="Add Service" style={{ padding: "10px", width: "80%" }} />
                <button type="button" onClick={addService} style={{ padding: "10px", marginLeft: "5px", background: "#28a745", color: "white" }}>+</button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {servicesList.map((service, index) => (
                  <span key={index} style={{ background: "#ddd", padding: "5px 10px", borderRadius: "5px", display: "flex", alignItems: "center" }}>
                    {service} <button type="button" onClick={() => removeService(service)} style={{ marginLeft: "5px", background: "red", color: "white", border: "none", cursor: "pointer" }}>❌</button>
                  </span>
                ))}
              </div>
              <button type="submit" style={{ background: "#007bff", color: "white", padding: "10px 20px", borderRadius: "5px" }}>Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LabGrid;
