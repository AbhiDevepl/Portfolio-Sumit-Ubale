import servicesJson from '../../public/data/services.json'
import type { Service, ServicesData } from '../types/portfolio'

/**
 * services.json holds four records and drives a prerendered route, so it is
 * imported at build time rather than fetched. The file itself is still shipped
 * at /data/services.json, untouched.
 */
const data = servicesJson as ServicesData

export function useServicesData(): Service[] {
  return data.services
}

export function getServices(): Service[] {
  return data.services
}

export function getService(slug: string | undefined): Service | undefined {
  return data.services.find(service => service.slug === slug)
}
