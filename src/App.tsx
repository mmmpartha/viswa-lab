import React from "react";
import LabGrid from "./components/LabGrid";

const App: React.FC = () => {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", flexDirection: "column" }}>
      <h2 style={{ marginBottom: "20px" }}>Lab Data</h2>
      <div style={{ width: "80%", maxWidth: "1200px" }}>
        <LabGrid />
      </div>
    </div>
  );
};

export default App;
