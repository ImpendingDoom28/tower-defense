const env = (import.meta as any).env;

export const GAME_NAME_ID = env.VITE_GAME_NAME_ID;
export const GAME_NAME = env.VITE_GAME_NAME;

const rawRepoUrl = env.VITE_REPOSITORY_URL;
export const REPOSITORY_URL =
  typeof rawRepoUrl === "string" ? rawRepoUrl.trim() : "";
