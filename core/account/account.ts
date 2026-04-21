import { useMutation, useQuery } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryclient/query-client'
import { customFetchStandard } from '@/lib/queryclient/custom-fetch'
import { useIsAuthenticated } from '@/core/account/auth'

// ===== Types =====

export enum AccountGender {
  Male,
  Female,
  Other,
}

export enum AccountStatus {
  Active = 'Active',
  Suspended = 'Suspended',
}

export type ProfileSettings = {
  preferred_currency?: string
}

export type AccountProfile = {
  id: string // UUID
  date_created: string
  date_updated: string

  status: AccountStatus
  phone: string | null
  email: string | null
  username: string | null

  gender: AccountGender | null
  name: string | null
  date_of_birth: string | null // Can be null
  email_verified: boolean
  phone_verified: boolean
  default_contact_id: string | null // UUID, can be null
  avatar_url: string | null

  description: string | null
  country: string | null // ISO 3166-1 alpha-2
  settings: ProfileSettings
}

export type UpdateCountryResponse = {
  country: string
  inferred_currency: string
}

// ===== Hooks =====
export const useGetAccount = (accountId: string) =>
  useQuery({
    queryKey: ['account', accountId],
    queryFn: async () => customFetchStandard<AccountProfile>(`account?account_id=${accountId}`),
    enabled: !!accountId,
  })

export const useGetMe = () => {
  const isAuthenticated = useIsAuthenticated()
  return useQuery({
    queryKey: ['account', 'me'],
    queryFn: async () => customFetchStandard<AccountProfile>('account/me'),
    enabled: !!isAuthenticated,
  })
}

export const useUpdateMe = () =>
  useMutation({
    mutationFn: async (params: {
      status?: 'Active' | 'Inactive' | 'Banned'
      username?: string | null
      phone?: string | null
      email?: string | null
      gender?: 'Male' | 'Female' | 'Other'
      name?: string | null
      date_of_birth?: string | null
      avatar_rs_id?: string | null
      default_contact_id?: string | null // UUID
      description?: string | null
    }) =>
      customFetchStandard<AccountProfile>('account/me', {
        method: 'PATCH',
        body: JSON.stringify(params),
      }),
    onSuccess: async () => {
      await getQueryClient().invalidateQueries({ queryKey: ['account', 'me'] })
    },
  })

/**
 * PATCH /account/profile/country — change the account's country.
 * Backend returns 409 with code "wallet_not_empty" if the wallet has a
 * non-zero balance; callers should inspect `ResponseError.code` to surface
 * that to the user.
 */
export const useUpdateCountry = () =>
  useMutation({
    mutationFn: (country: string) =>
      customFetchStandard<UpdateCountryResponse>('account/profile/country', {
        method: 'PATCH',
        body: JSON.stringify({ country }),
      }),
    onSuccess: async () => {
      const qc = getQueryClient()
      await qc.invalidateQueries({ queryKey: ['account', 'me'] })
      await qc.invalidateQueries({ queryKey: ['common', 'exchange-rates'] })
    },
  })


