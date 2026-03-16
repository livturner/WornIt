const apiKey = process.env.EXPO_PUBLIC_OPENAI_KEY

export async function identifyOutfit(photoUri) {
  // Convert the photo to base64
  const response = await fetch(photoUri)
  const blob = await response.blob()
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

  // Send to GPT-4 Vision
  const result = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
              },
            },
            {
              type: 'text',
              text: `You are a fashion assistant helping build a wardrobe app. 
              Identify each visible clothing item and accessory in this outfit photo.
              Return a JSON array only, no other text. Each item should have:
              - name: short descriptive name (e.g. "white linen shirt")
              - category: one of [tops, bottoms, dresses, outerwear, shoes, accessories]
              - color: primary color
              - confirmed: false
              Example: [{"name":"white linen shirt","category":"tops","color":"white","confirmed":false}]`,
            },
          ],
        },
      ],
    }),
  })

  const data = await result.json()
  const content = data.choices[0].message.content
  const cleaned = content.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}