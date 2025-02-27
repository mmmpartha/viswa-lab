import "ag-grid-community/styles/ag-theme-quartz.css";
import { AgGridReact } from "ag-grid-react";
import { useEffect, useState } from "react";
import { ColDef, ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule, PaginationModule } from "ag-grid-community";
import { ValidationModule } from "ag-grid-enterprise";

// ✅ Register required modules
ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule, ValidationModule]);

import data from "../lab.json";

function LabGrid() {
  const [rowData, setRowData] = useState([]);
  const [colDefs] = useState<ColDef[]>([
    { field: "id", headerName: "ID", flex: 1 },
    { field: "labName", headerName: "Lab Name", flex: 2 },
    { field: "contactPerson", headerName: "Contact Person", flex: 2 },
    { field: "contactNumber", headerName: "Contact Number", flex: 2 },
    { field: "location", headerName: "Location", flex: 2 },
    {
      field: "servicesOffered",
      headerName: "Services Offered",
      valueGetter: (params) =>
        params.data?.servicesOffered?.join(", ") || "",
      flex: 3
    },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "testMethods",
      headerName: "Test Methods",
      valueGetter: (params) =>
        params.data?.testMethods
          ?.map((tm) => `${tm.method} (${tm.sampleType})`)
          .join(", ") || "",
      flex: 3
    },
  ]);

  useEffect(() => {
    console.log("Fetched Data:", data);
    if (Array.isArray(data)) {
      setRowData(data);
    } else {
      console.error("Invalid data format");
    }
  }, []);
  

  return (
    <div className="ag-theme-quartz" style={{ height: "80vh", width: "90vw", maxWidth: "1200px", margin: "auto" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        pagination={true}
        paginationPageSize={10}
        domLayout="autoHeight"
      />
    </div>
  );
}

export default LabGrid;
