"use client";

export default function ServerError() {
  if (typeof window === "undefined") {
    // prevent rendering during static build
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>500 – Internal Server Error</h1>
      <p style={{ color: "#666" }}>
        Something went wrong on our end. Please try again later.
      </p>
    </div>
  );
}
