const itinerary = {
  "transit_options": [
    { "mode": "Flight", "estimated_cost": "₹5000", "duration": "2 hrs" }
  ],
  "itinerary": [
    {
      "day": 1,
      "activities": [
        { "time_of_day": "Morning", "place": "Place 1", "description": "Desc", "historical_significance": "Hist", "transport_to_place": "Walk", "time_to_spend_there": "2 hrs" },
        { "time_of_day": "Afternoon", "place": "Place 2", "description": "Desc", "historical_significance": "Hist", "transport_to_place": "Walk", "time_to_spend_there": "2 hrs" }
      ]
    },
    {
      "day": 2,
      "activities": [
        { "time_of_day": "Morning", "place": "Place 3", "description": "Desc", "historical_significance": "Hist", "transport_to_place": "Walk", "time_to_spend_there": "2 hrs" },
        { "time_of_day": "Afternoon", "place": "Place 4", "description": "Desc", "historical_significance": "Hist", "transport_to_place": "Walk", "time_to_spend_there": "2 hrs" }
      ]
    },
    {
      "day": 3,
      "activities": [
        { "time_of_day": "Morning", "place": "Place 5", "description": "Desc", "historical_significance": "Hist", "transport_to_place": "Walk", "time_to_spend_there": "2 hrs" },
        { "time_of_day": "Afternoon", "place": "Place 6", "description": "Desc", "historical_significance": "Hist", "transport_to_place": "Walk", "time_to_spend_there": "2 hrs" }
      ]
    }
  ],
  "hidden_gems": ["Gem 1"],
  "top_3_places": [{"name": "Place 1", "reason": "Reason"}],
  "food_recommendations": ["Food 1"],
  "cultural_experiences": ["Culture 1"],
  "budget_saving_tips": ["Tip 1"],
  "estimated_cost": { "stay": "100", "food": "100", "transport": "100", "entry_fees": "100", "total": "400" }
};

async function test() {
    try {
        console.log("Calling Production API...");
        const res = await fetch("https://navibharat.vercel.app/api/adjust-itinerary", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentItinerary: itinerary,
                prompt: "i already visited all the places on day 1"
            })
        });
        
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", JSON.stringify(data).substring(0, 500));
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

test();
