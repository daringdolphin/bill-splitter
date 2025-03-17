"use server"

import { ActionState } from "@/types"
import { BillData } from "@/lib/types"
import { v4 as uuidv4 } from "@/lib/uuid"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { uploadReceiptStorage } from "@/actions/storage/receipt-storage-actions"

export async function extractReceiptDataAction(
  imageData: string | null,
  sessionId?: string
): Promise<ActionState<BillData>> {
  // Generate a session ID if not provided
  const billSessionId = sessionId || uuidv4()

  // If no image data is provided, return mock data
  if (!imageData) {
    return {
      isSuccess: true,
      message: "Generated mock data",
      data: getMockData(billSessionId)
    }
  }

  try {
    // Initialize the Gemini API
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined in environment variables")
      throw new Error("GEMINI_API_KEY is not defined")
    }

    const genAI = new GoogleGenerativeAI(apiKey)

    // Upload the image to Supabase
    let imageUrl: string | null = null

    // Upload the image to Supabase
    const uploadResult = await uploadReceiptStorage(imageData, billSessionId)

    if (!uploadResult.isSuccess) {
      throw new Error(`Failed to upload receipt: ${uploadResult.message}`)
    }

    imageUrl = uploadResult.data.url

    // Configure the model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json"
      }
    })

    // Define the schema in the prompt
    const schemaPrompt = `
Extract the following details from this receipt and format the response as a JSON object with this structure:
{
  "restaurantName": "string",
  "items": [
    {
      "name": "string",
      "price": number,
      "quantity": number
    }
  ],
  "tax": number,
  "tip": number,
  "total": number
}
`

    // Fetch the image from URL and convert to base64
    const imageResp = await fetch(imageUrl).then(response =>
      response.arrayBuffer()
    )

    // Send the prompt with the image from URL
    const result = await model.generateContent([
      {
        text: schemaPrompt
      },
      {
        inlineData: {
          data: Buffer.from(imageResp).toString("base64"),
          mimeType: "image/jpeg"
        }
      }
    ])

    // Parse the response
    const responseData = result.response.text()
    const parsedData = JSON.parse(responseData)

    // Format the data to match BillData structure
    const formattedItems = parsedData.items.map((item: any) => ({
      id: uuidv4(),
      name: item.name,
      price: item.price,
      quantity: item.quantity || 1,
      shared: false,
      selectedBy: []
    }))

    // Calculate subtotal if not provided
    const subtotal = formattedItems.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    )

    const billData = {
      sessionId: billSessionId,
      restaurantName: parsedData.restaurantName,
      items: formattedItems,
      tax: parsedData.tax || 0,
      tip: parsedData.tip || 0,
      total: parsedData.total || subtotal
    }

    return {
      isSuccess: true,
      message: "Receipt data extracted successfully",
      data: billData
    }
  } catch (error) {
    console.error("Error extracting receipt data:", error)
    // Fallback to mock data if extraction fails
    return {
      isSuccess: false,
      message: "Failed to extract receipt data, using mock data instead"
    }
  }
}

// Helper function to generate mock data for fallback
function getMockData(sessionId: string): BillData {
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
    sessionId,
    restaurantName: "Italian Bistro",
    items: mockItems,
    tax: Number.parseFloat((subtotal * 0.08).toFixed(2)), // 8% tax
    tip: Number.parseFloat((subtotal * 0.15).toFixed(2)), // 15% tip
    total: subtotal
  }
} 