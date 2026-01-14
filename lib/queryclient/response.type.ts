export type PaginationParams<TEntity = Record<string, any>> = {
  page?: number
  cursor?: string
  limit: number
  order?: 'asc' | 'desc'
  sortBy?: keyof TEntity
} & {
  [K in keyof TEntity]?: TEntity[K]
}
export type SuccessResponse<Data = any> = {
  data: Data
}

export type SuccessPaginationRes<Item> = SuccessResponse<Item[]> & {
  pagination: {
    total: number
    page?: number
    cursor?: string
    limit: number
    next_page?: number
    next_cursor?: string
  }
}

export enum ErrorCode {
  "auth.invalid_credentials",
  "auth.account_not_found",
  "auth.missing_identifier"
}

export class ResponseError extends Error {
  constructor(public code: ErrorCode, public message: string) {
    super(message)

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ResponseError.prototype)
  }
}