const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI('AIzaSyCb47h0ieAwFDd1WXR24g9lJADF4l0TiKY');
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: 'application/json',
    responseSchema: {
      type: SchemaType.OBJECT,
      properties: {
        itinerary: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              day: { type: SchemaType.INTEGER },
              morning: { type: SchemaType.STRING },
              afternoon: { type: SchemaType.STRING },
              night: { type: SchemaType.STRING },
              places: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    name: { type: SchemaType.STRING },
                    description: { type: SchemaType.STRING },
                    type: { type: SchemaType.STRING }
                  },
                  required: ['name', 'description', 'type']
                }
              }
            },
            required: ['day', 'morning', 'afternoon', 'night', 'places']
          }
        },
        hidden_gems: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        food_recommendations: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        cultural_experiences: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        estimated_cost: {
          type: SchemaType.OBJECT,
          properties: {
            stay: { type: SchemaType.STRING },
            food: { type: SchemaType.STRING },
            transport: { type: SchemaType.STRING },
            entry_fees: { type: SchemaType.STRING },
            total: { type: SchemaType.STRING }
          },
          required: ['stay', 'food', 'transport', 'entry_fees', 'total']
        }
      },
      required: ['itinerary', 'hidden_gems', 'food_recommendations', 'cultural_experiences', 'estimated_cost']
    }
  }
});
model.generateContent('Generate a 1 day trip to Delhi')
  .then(r => console.log('SUCCESS'))
  .catch(e => console.error('ERROR:', e.message));
