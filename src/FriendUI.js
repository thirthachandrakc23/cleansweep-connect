import React from "react";

export default function FriendUI() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <iframe
        src={process.env.PUBLIC_URL + "/friend-ui.html"}
        title="Friend UI"
        style={{
          width: "100%",
          height: "100%",
          border: "none"
        }}
      />
    </div>
  );
}