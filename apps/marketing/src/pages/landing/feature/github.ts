export const GITHUB_REPO = "pkhemae/atlas";
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
export const COMMUNITY_URL = `${GITHUB_URL}/discussions`;
// placeholder until the Discord server exists
export const DISCORD_URL = "#";

// fetched in the route loader so the count is server-rendered with the page —
// the navbar never paints a placeholder that later swaps to the real number
export async function fetchGithubStars(): Promise<number | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`);
    if (!response.ok) return null;
    const repo = (await response.json()) as { stargazers_count: number };
    return repo.stargazers_count;
  } catch {
    return null;
  }
}
