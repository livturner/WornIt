import * as ImageManipulator from 'expo-image-manipulator'

const apiKey = process.env.EXPO_PUBLIC_OPENAI_KEY

export async function identifyOutfit(photoUri) {
  const manipulated = await ImageManipulator.ImageManipulator
  .manipulate(photoUri)
  .resize({ width: 1024 })
  .renderAsync()

  const compressedUri = (await manipulated.saveAsync({
  compress: 0.8,
  format: ImageManipulator.SaveFormat.JPEG,
})).uri

  const response = await fetch(compressedUri)
  const arrayBuffer = await response.arrayBuffer()
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

  // Send to GPT-4 Vision
  const result = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
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
              text: `You are a fashion assistant for a wardrobe app. 
              Identify each visible clothing item and accessory.
              Use British English (jumper not sweater, trousers not pants, trainers not sneakers).
              This may be a mirror selfie — ignore the phone, reflections, and background.
              Be precise with colours — navy not black, mid-wash not light wash, burgundy not red.
              Category definitions:
              - tops: t-shirts, shirts, jumpers, knitwear, hoodies, cardigans, vests
              - bottoms: trousers, jeans, skirts, shorts
              - outerwear: coats, jackets, blazers only
              - shoes: any footwear
              - accessories: bags, hats, scarves, jewellery, belts
              - dresses: dresses and jumpsuits
              Only return a JSON array, no other text. Each item needs:
              - name: short natural description as a person would say it (e.g. "navy houndstooth cardigan", "light wash wide leg jeans", "brown UGG slippers")
              - category: tops | bottoms | dresses | outerwear | shoes | accessories
              - color: dominant background color as a single word — for patterns pick the background color (e.g. for navy/white houndstooth return "navy", for black/white stripes return "black")
              - confirmed: false`,
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