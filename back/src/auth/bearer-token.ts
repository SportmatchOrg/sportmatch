export function extractBearerToken(
  authorizationHeader: string | undefined,
): string | undefined {
  const [scheme, token] = authorizationHeader?.split(' ') ?? [];

  return scheme === 'Bearer' && token ? token : undefined;
}
