import { ElectionStatus } from '../../../../types/types'
import { api } from '../api'

export const fetchStatus = () => {
  return api<{ status: ElectionStatus }>(`/api/admin/status`)
}
