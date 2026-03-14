import React from "react";

function LandingPage({ handleReportClick, handleVolunteerClick }) {
  return (
    <div style={{ textAlign: "center", padding: "60px" }}>
      <h1>CleanSweep Connect</h1>
      <p>Report issues or volunteer to help clean the city.</p>

      <div style={{ marginTop: "40px" }}>
        <button
          onClick={handleReportClick}
          style={{
            padding: "12px 25px",
            marginRight: "20px",
            background: "#0d9488",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Report Issue
        </button>

        <button
          onClick={handleVolunteerClick}
          style={{
            padding: "12px 25px",
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Join as Volunteer
        </button>
      </div>
    </div>
  );
}

export default LandingPage;