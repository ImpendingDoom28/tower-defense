export const loadFile = async (path: string) => {
  try {
    const response = await fetch(`${path}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load file: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(
      `Failed to load file: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
};
