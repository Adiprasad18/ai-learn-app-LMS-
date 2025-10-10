"use client";

export default function NotFound() {
  if (typeof window === "undefined") {
    // prevent rendering during build (server)
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
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>404 – Page Not Found</h1>
      <p style={{ color: "#666" }}>The page you’re looking for doesn’t exist.</p>
    </div>
  );
}
