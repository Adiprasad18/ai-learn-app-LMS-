"use client";

export default function GlobalError({ error, reset }) {
  console.error(error);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
      }}
    >
      <h2>Something went wrong!</h2>
      <button
        onClick={() => reset?.()}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          border: "1px solid #ccc",
          background: "#fafafa",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
