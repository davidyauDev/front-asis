import { proxyTicketsGet } from '../../utils/rrhhTicketsProxy'

export default defineEventHandler(event => proxyTicketsGet(event, '/tickets'))
