import {
  defaultShouldDehydrateQuery,
  isServer,
  MutationCache,
  QueryCache,
  QueryClient,
} from '@tanstack/react-query'

type ErrorObject = {
  code: string
  message: string
}

function handleErrorQuery(error: ErrorObject) {
  if (error.code === "401") {
    // window.location.href = "/login"
    // alert("Unauthorized")
  }
}

function handleErrorMutation(error: ErrorObject) {
  if (error.code === "401") {
    window.location.href = "/login"
  }
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
        staleTime: 60 * 1000,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: query =>
          defaultShouldDehydrateQuery(query)
          || query.state.status === 'pending',
        shouldRedactErrors: (_error: unknown) => {
          // We should not catch Next.js server errors
          // as that's how Next.js detects dynamic pages
          // so we cannot redact them.
          // Next.js also automatically redacts errors for us
          // with better digests.
          return false
        },
      },
    },
    queryCache: new QueryCache({
      onError(error: unknown) {
        handleErrorQuery(error as ErrorObject)
      },
    }),
    mutationCache: new MutationCache({
      onError(error: unknown) {
        handleErrorMutation(error as ErrorObject)
      },
    }),
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  }
  else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    browserQueryClient ??= makeQueryClient()
    return browserQueryClient
  }
}
