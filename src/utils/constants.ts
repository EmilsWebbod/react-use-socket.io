interface IERROR {
  STATUS: { [key: number]: string };
}

export const ERROR: IERROR = {
  STATUS: {
    400: 'Ikke godkjent. Mangler data eller er eksisterer allerede',
    401: 'Ikke autorisert',
    402: 'Kontoen din må oppgraderes',
    403: 'Forbudt',
    404: 'Fant ikke ressurs',
    408: 'Server tidsavbrudd',
    410: 'Denne eksisterer ikke lengre.',
    451: 'Utilgjengelig av juridiske årsaker (RFC 7725)'
  }
};
