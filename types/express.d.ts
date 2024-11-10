import { Request } from 'express'

export type RequestBody<T> = Request<object, object, T>

export type RequestBodyParams<TBody, TParams> = Request<TParams, object, TBody>
