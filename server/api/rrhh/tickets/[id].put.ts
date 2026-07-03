import { proxyTicketsJsonOrMultipart } from '../../../utils/rrhhTicketsProxy'
import { createError, getRouterParam } from 'h3'

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'El id del ticket es obligatorio.',
    })
  }

  return proxyTicketsJsonOrMultipart(event, `/tickets/${id}`, 'PUT')
})
