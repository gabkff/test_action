import data from './cache/data.json'

// Ces données sont importées depuis data.json et peuvent être écrasées par l'API au runtime
export const mockApiData = data as unknown as ApiResponse