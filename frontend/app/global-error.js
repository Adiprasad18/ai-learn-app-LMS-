"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-red-600">Error 500</p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Something went wrong</h1>
          <p className="max-w-xl text-base text-muted-foreground">
            An unexpected error occurred. Please try again later.
          </p>
          <button
            onClick={() => reset()}
            className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
