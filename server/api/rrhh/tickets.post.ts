import { proxyTicketsJsonOrMultipart } from '../../utils/rrhhTicketsProxy'

export default defineEventHandler(event => proxyTicketsJsonOrMultipart(event, '/tickets', 'POST'))
