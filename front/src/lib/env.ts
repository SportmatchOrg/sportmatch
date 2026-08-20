export function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy front/.env.example to front/.env and fill it in.`,
    );
  }

  return value;
}
