import { useQuery } from '@tanstack/react-query'
import type { PortfolioData } from '../types/portfolio'

/** Same URL the static site fetched — public/data/portfolio.json is served as-is. */
export const PORTFOLIO_URL = '/data/portfolio.json'

async function fetchPortfolio(): Promise<PortfolioData> {
  const response = await fetch(PORTFOLIO_URL)
  if (!response.ok) throw new Error(`portfolio.json ${response.status}`)
  return response.json() as Promise<PortfolioData>
}

/**
 * portfolio.json is a static, developer-maintained file: fetch it once and
 * keep it for the session. React Query replaces the hand-rolled
 * sessionStorage cache the three old loaders each had their own copy of.
 */
export function usePortfolioData() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 1,
  })
}
