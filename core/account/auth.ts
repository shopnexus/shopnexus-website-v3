import { useMutation } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryclient/query-client'
import { customFetchStandard } from '@/lib/queryclient/custom-fetch'

// ===== Helpers =====

const saveAuthTokens = (data: { access_token: string; refresh_token: string }) => {
  // TODO: save to httpOnly cookie instead
  globalThis?.localStorage?.setItem?.('token', data.access_token)
  globalThis?.localStorage?.setItem?.('refresh_token', data.refresh_token)
}

const removeAuthTokens = () => {
  globalThis?.localStorage?.removeItem?.('token')
  globalThis?.localStorage?.removeItem?.('refresh_token')
}

// ===== Hooks =====
export const useRegisterBasic = () =>
  useMutation({
    mutationFn: async (params: {
      type: 'Customer' | 'Vendor'
      username?: string | null
      email?: string | null
      phone?: string | null
      password: string
    }) => customFetchStandard<{
      access_token: string
      refresh_token: string
    }>('account/auth/register/basic', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    onSuccess: saveAuthTokens,
  })

export const useLoginBasic = () =>
  useMutation({
    mutationFn: async (params: {
      id: string
      password: string
    }) => customFetchStandard<{
      access_token: string
      refresh_token: string
    }>('account/auth/login/basic', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    onSuccess: saveAuthTokens,
  })

export const useRefreshToken = () =>
  useMutation({
    mutationFn: async (params: {
      refresh_token: string
    }) => customFetchStandard<{
      access_token: string
      refresh_token: string
    }>('account/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    onSuccess: saveAuthTokens,
  })

export const useSignOut = () =>
  useMutation({
    mutationFn: async () => {
      removeAuthTokens()

      const queryClient = getQueryClient()
      await queryClient.setQueryData(['account', 'me'], null)
      return Promise.resolve()
    },
    onSuccess: async () => {
      await getQueryClient().invalidateQueries({ queryKey: ['account', 'me'] })
    },
  })


