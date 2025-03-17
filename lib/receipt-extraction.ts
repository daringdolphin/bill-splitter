import type { BillData } from "./types"
import { v4 as uuidv4 } from "./uuid"

export async function extractReceiptData(
  imageData: string | null
): Promise<BillData> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // In a real app, we would send the image to an API for processing
  // For this demo, we'll return mock data

  const mockItems = [
    {
      id: uuidv4(),
      name: "Margherita Pizza",
      price: 12.99,
      quantity: 1,
      shared: false,
      selectedBy: []
    },
    {
      id: uuidv4(),
      name: "Caesar Salad",
      price: 8.5,
      quantity: 1,
      shared: false,
      selectedBy: []
    },
    {
      id: uuidv4(),
      name: "Garlic Bread",
      price: 5.99,
      quantity: 1,
      shared: true,
      selectedBy: []
    },
    {
      id: uuidv4(),
      name: "Spaghetti Carbonara",
      price: 14.99,
      quantity: 1,
      shared: false,
      selectedBy: []
    },
    {
      id: uuidv4(),
      name: "Tiramisu",
      price: 7.5,
      quantity: 1,
      shared: true,
      selectedBy: []
    }
  ]

  const subtotal = mockItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return {
    sessionId: uuidv4(),
    restaurantName: "Italian Bistro",
    items: mockItems,
    tax: Number.parseFloat((subtotal * 0.08).toFixed(2)), // 8% tax
    tip: Number.parseFloat((subtotal * 0.15).toFixed(2)), // 15% tip
    total: subtotal
  }
}
