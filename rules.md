# Rules

- Max code 70 lines per function and 150 lines per file. Except for UI codes (.tsx) -> max 150 per function and 250 lines per file
- Divide the code into smaller functions if it exceeds the limit
- try to keep minimal backend code (50 lines max) if needed for context

# Dir struct:

- /app for all pages
- /components for all shared components
- /backend for all backend related code (api handlers, server actions, db queries, auth, etc)
- /server-utils for all server side utilities (db schema, db client, helpers, etc)
- /hooks for all react hooks
- /context for all react context providers

# Treat Error as values - avoid throwing exceptions

use `{error, data, success}` return types instead of throwing exceptions. This makes error handling more explicit and easier to manage.

# react-query

- use react query for all data fetching and mutations in the frontend
- use `useQuery` for data fetching and `useMutation` for data mutations
- use `useQueryClient` to invalidate queries after mutations

# Typing

- Always use types and never use `any`
- Prefer modifying existing types/interfaces over creating new ones
- Use utility types like `Pick`, `Omit`, `Partial`, etc to modify existing
- Use `zod` schemas to define types for request/response payloads and validate data
- checkout /app/types/db for db related types

## DB query

- Try to use relations as much as possible to reduce number of queries. Check the schema files to view all the relations defined. so-> db.query.courses.findMany({ with: { modules: true } }) // instead of querying modules separately

```ts
// ❌ BAD
const course = await db.query.courseSchema.findFirst({
  where: eq(courseSchema.id, courseId),
});

if (!course) {
  notFound();
}

const modules = await db.query.moduleSchma.findMany({
  where: eq(moduleSchma.courseId, courseId),
});

✅ Good
const course = await db.query.courseSchema.findFirst({
  where: eq(courseSchema.id, courseId),
  with: {
    modules: true,
  },
});

✅ Even better
const course = await db.query.courseSchema.findFirst({
  where: eq(courseSchema.id, courseId),
  columns: {id: true, title: true}, // select only needed columns
  with: {
    modules: true,
    columns: {id: true, title: true}, // select only needed columns
  },
});
```

- Try to put queries in backend files with good names instead of inline queries in server actions or api handlers. e.g. create-course-action.ts, get-user-enrollments.ts etc.

- When using raw queries, try to import `tables` from the db and use `tables.tableName` instead of importing schema directly.
