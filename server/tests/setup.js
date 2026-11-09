// Safety guard: tests delete data, so they must never run against a real database.
const databaseUrl = process.env.DATABASE_URL ?? '';
let databaseName = '';

try {
  databaseName = new URL(databaseUrl).pathname.replace('/', '');
} catch {
  // fall through to the error below
}

if (!databaseName.endsWith('_test')) {
  throw new Error(
    `Refusing to run tests: the database "${databaseName || 'unknown'}" does not end in "_test". ` +
      'Create server/.env.test with a DATABASE_URL that points at your splitmate_test database.'
  );
}