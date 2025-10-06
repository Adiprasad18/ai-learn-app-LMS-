const { defineConfig } = require("drizzle-kit");
const { loadEnvConfig } = require("@next/env");
const path = require("path");

const projectRoot = path.resolve(__dirname, "../");
loadEnvConfig(projectRoot);

const schemaPath = path.resolve(__dirname, "configs/schema.js");
const outputDir = "./drizzle";

module.exports = defineConfig({
  dialect: "postgresql",
  schema: schemaPath,
  out: outputDir,
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      process.env.NEXT_PUBLIC_DATABASE_CONNECTION_STRING,
  },
  verbose: true,
  strict: true,
});
