// Maps a scholar code (e.g. "2018/050/14879") to a synthetic email used as the
// Supabase auth identifier. Members never see this email — they sign in with
// the scholar code itself.
export function scholarCodeToEmail(code: string): string {
  const slug = code.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug}@elp.local`;
}

export function normalizeScholarCode(code: string): string {
  return code.trim();
}
