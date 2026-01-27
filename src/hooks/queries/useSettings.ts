import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchShippingSettings,
  upsertShippingSettings,
  fetchTierSettings,
  upsertTierSettings,
  fetchSiteSettings,
  upsertSiteSettings,
} from '../../services/settings'
import type { ShippingSettings, TierSettings, SiteSettings } from '../../admin/types/admin'

// --- Shipping Settings ---

export function useShippingSettings() {
  return useQuery({ queryKey: ['shippingSettings'], queryFn: fetchShippingSettings })
}

export function useUpdateShippingSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (settings: Partial<ShippingSettings>) => upsertShippingSettings(settings),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['shippingSettings'] }),
  })
}

// --- Tier Settings ---

export function useTierSettings() {
  return useQuery({ queryKey: ['tierSettings'], queryFn: fetchTierSettings })
}

export function useUpdateTierSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (settings: Partial<TierSettings>) => upsertTierSettings(settings),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tierSettings'] }),
  })
}

// --- Site Settings ---

export function useSiteSettings() {
  return useQuery({ queryKey: ['siteSettings'], queryFn: fetchSiteSettings })
}

export function useUpdateSiteSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (settings: Partial<SiteSettings>) => upsertSiteSettings(settings),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['siteSettings'] }),
  })
}
