import { useMutation, useQuery } from '@tanstack/react-query'
import { getQueryClient } from '@/lib/queryclient/query-client'
import { customFetchStandard } from '@/lib/queryclient/custom-fetch'
import { type Option, useUpsertOptions, useDeleteOptions } from '@/core/common/option'
import qs from 'qs'

// ===== Types =====
//
// Payment methods are stored as common.option rows of type='payment'. The
// card-specific UI fields (label, brand, last4, is_default, ...) live on the
// Option's free-form `data` blob. This module is a thin adapter that maps
// between the FE's PaymentMethod shape and the wire-format Option, so callers
// don't have to know the underlying option model.

export type PaymentMethod = {
  id: string
  account_id: string | null
  type: "card" | "ewallet" | "bank"
  provider: string
  label: string
  data: {
    token?: string
    brand?: string
    last4?: string
    exp_month?: number
    exp_year?: number
    card_type?: "credit" | "debit"
  }
  is_default: boolean
  date_created: string
  date_updated: string
}

type PaymentOptionData = PaymentMethod['data'] & {
  fe_type?: PaymentMethod['type']
  fe_is_default?: boolean
}

// ===== Mappers =====

const optionToPaymentMethod = (o: Option): PaymentMethod => {
  const d = (o.data ?? {}) as PaymentOptionData
  return {
    id: o.id,
    account_id: o.owner_id,
    type: d.fe_type ?? "card",
    provider: o.provider,
    label: o.name,
    data: {
      token: d.token,
      brand: d.brand,
      last4: d.last4,
      exp_month: d.exp_month,
      exp_year: d.exp_year,
      card_type: d.card_type,
    },
    is_default: d.fe_is_default ?? false,
    date_created: '',
    date_updated: '',
  }
}

const paymentMethodToOption = (input: {
  id?: string
  type: PaymentMethod['type']
  provider: string
  label: string
  data: PaymentMethod['data']
  is_default?: boolean
}): Option => {
  const data: PaymentOptionData = {
    ...input.data,
    fe_type: input.type,
    fe_is_default: input.is_default ?? false,
  }
  return {
    id: input.id ?? crypto.randomUUID(),
    owner_id: null, // server should override from auth claims; included for type
    type: 'payment',
    provider: input.provider,
    is_enabled: true,
    name: input.label,
    description: '',
    priority: 0,
    logo_rs_id: null,
    data: data as Record<string, unknown>,
  }
}

// ===== Hooks =====

export const useListPaymentMethods = () =>
  useQuery({
    queryKey: ['account', 'payment-method'],
    queryFn: async () => {
      const opts = await customFetchStandard<Option[]>(
        `common/option?${qs.stringify({ category: 'payment' })}`,
      )
      return (opts ?? []).map(optionToPaymentMethod)
    },
  })

// Tokenize is provider-specific (Stripe/SePay etc.) and never had a backend
// counterpart in this branch — kept as a stub so consumers compile. Returning
// an empty config means the UI falls back to manual entry; wire to the real
// gateway once a tokenization endpoint exists.
export const useTokenizeCard = () =>
  useMutation({
    mutationFn: async (_params: { return_url?: string }) => ({
      form_url: undefined as string | undefined,
      client_config: undefined as Record<string, unknown> | undefined,
    }),
  })

export const useCreatePaymentMethod = () => {
  const upsert = useUpsertOptions()
  return useMutation({
    mutationFn: async (params: {
      type: PaymentMethod['type']
      provider: string
      label: string
      data: Record<string, unknown>
      is_default?: boolean
    }) => {
      const option = paymentMethodToOption({
        type: params.type,
        provider: params.provider,
        label: params.label,
        data: params.data as PaymentMethod['data'],
        is_default: params.is_default,
      })
      await upsert.mutateAsync({ category: 'payment', configs: [option] })
      return optionToPaymentMethod(option)
    },
    onSuccess: async () => {
      const qc = getQueryClient()
      await qc.invalidateQueries({ queryKey: ['account', 'payment-method'] })
    },
  })
}

export const useUpdatePaymentMethod = () => {
  const upsert = useUpsertOptions()
  return useMutation({
    mutationFn: async (params: {
      id: string
      type?: PaymentMethod['type']
      label?: string
      data?: Record<string, unknown>
      is_default?: boolean
    }) => {
      const opts = await customFetchStandard<Option[]>(
        `common/option?${qs.stringify({ category: 'payment' })}`,
      )
      const existing = opts?.find((o) => o.id === params.id)
      if (!existing) throw new Error('payment method not found')
      const merged = paymentMethodToOption({
        id: params.id,
        type: params.type ?? (existing.data as PaymentOptionData).fe_type ?? 'card',
        provider: existing.provider,
        label: params.label ?? existing.name,
        data: { ...(existing.data as PaymentMethod['data']), ...(params.data ?? {}) },
        is_default:
          params.is_default ?? (existing.data as PaymentOptionData).fe_is_default ?? false,
      })
      await upsert.mutateAsync({ category: 'payment', configs: [merged] })
      return optionToPaymentMethod(merged)
    },
    onSuccess: async () => {
      const qc = getQueryClient()
      await qc.invalidateQueries({ queryKey: ['account', 'payment-method'] })
    },
  })
}

export const useDeletePaymentMethod = () => {
  const remove = useDeleteOptions()
  return useMutation({
    mutationFn: async (params: { id: string }) => {
      await remove.mutateAsync({ ids: [params.id] })
      return { message: 'deleted' }
    },
    onSuccess: async () => {
      const qc = getQueryClient()
      await qc.invalidateQueries({ queryKey: ['account', 'payment-method'] })
    },
  })
}

// Sets the given option as default by toggling fe_is_default in its Data.
// Concurrency note: fetches the full payment list and rewrites every row's
// is_default flag, so concurrent setDefault calls race. Acceptable for now —
// the user can only have one default-toggle in flight at a time.
export const useSetDefaultPaymentMethod = () => {
  const upsert = useUpsertOptions()
  return useMutation({
    mutationFn: async (id: string) => {
      const opts =
        (await customFetchStandard<Option[]>(
          `common/option?${qs.stringify({ category: 'payment' })}`,
        )) ?? []
      const configs = opts.map((o) => ({
        ...o,
        data: {
          ...(o.data as Record<string, unknown>),
          fe_is_default: o.id === id,
        },
      }))
      await upsert.mutateAsync({ category: 'payment', configs })
      const target = opts.find((o) => o.id === id)
      return target ? optionToPaymentMethod({ ...target, data: { ...(target.data as Record<string, unknown>), fe_is_default: true } }) : null
    },
    onSuccess: async () => {
      const qc = getQueryClient()
      await qc.invalidateQueries({ queryKey: ['account', 'payment-method'] })
    },
  })
}
