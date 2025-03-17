export interface BillItem {
  id: string
  name: string
  price: number
  quantity: number
  shared: boolean
  selectedBy: string[]
}

export interface BillData {
  sessionId: string
  restaurantName?: string
  hostName?: string
  items: BillItem[]
  tax?: number
  tip?: number
  total: number
  participants?: string[]
}
