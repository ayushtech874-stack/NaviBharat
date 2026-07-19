async function test() {
    try {
        console.log("Calling Production API...");
        const res = await fetch("https://navibharat.vercel.app/api/day-plan-chat", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                city: "Delhi",
                date: "Tomorrow",
                presentLocation: "India Gate",
                messages: [{ role: 'user', content: 'hello' }]
            })
        });
        
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Response:", data);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

test();
