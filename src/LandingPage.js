function LandingPage({ handleReportClick, handleVolunteerClick }) {

  const goLogin = () => {
    alert("Login page will open");
  };

  const goRegister = () => {
    alert("Register page will open");
  };

  return (
    <div style={{ textAlign: "center", padding: "60px" }}>

      {/* LOGIN + REGISTER */}
      <div style={{ position: "absolute", top: "20px", right: "20px" }}>
        <button
          onClick={goRegister}
          style={{
            padding: "10px 18px",
            marginRight: "10px",
            background: "#0d9488",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Register
        </button>

        <button
          onClick={goLogin}
          style={{
            padding: "10px 18px",
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Login
        </button>
      </div>

      <h1>CleanSweep Connect</h1>

      <p>
        Report issues or volunteer to help clean the city.
      </p>

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