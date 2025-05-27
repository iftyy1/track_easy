import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.ts",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_7rRuzhoW4pEA@ep-cool-queen-a17wwhur-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
  }
})
