import type { ApiResponse } from 'types/api.types'
import data from './cache/data.json'

// Ces données sont importées depuis data.json et peuvent être écrasées par l'API au runtime
export const mockApiData: ApiResponse = data as ApiResponse