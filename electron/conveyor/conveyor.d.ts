import type { ConveyorApi } from '@/electron/conveyor/api'

declare global {
  interface Window {
    conveyor: ConveyorApi
  }
}
