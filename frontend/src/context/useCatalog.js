import { useContext } from 'react'
import { CatalogContext } from './catalogContext.js'
export function useCatalog() { return useContext(CatalogContext) }
