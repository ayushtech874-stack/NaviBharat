const fs = require('fs');
let c = fs.readFileSync('src/app/itinerary/[id]/page.tsx', 'utf8');

c = c.replace(/<\/Card className=\"bg-black\/60 text-white border-white\/10\">/g, '</Card>');

// Also check for any `<Card className="bg-black/60 text-white border-white/10" ...>` that might be broken
// Because `<Card>` replacement made it `<Card className="bg-black/60 text-white border-white/10"> className="..."`
// Wait, my python script did `c.replace('Card>', 'Card className="bg-black/60 text-white border-white/10">')`
// This replaced `<Card>` with `<Card className="...">` AND `</Card>` with `</Card className="...">`!
// Let's fix `<Card className="..."> className="other"` if there was any.
// Ah, the python script did `c.replace('Card className="border-t-4', ...)` which was fine.
// And it did `c.replace('Card>', 'Card className="bg-black/60 text-white border-white/10">')` which matched both `<Card>` and `</Card>`.
// So only `<Card>` and `</Card>` are affected. `<Card>` became `<Card className="...">` which is CORRECT.
// `</Card>` became `</Card className="...">` which is INCORRECT.

fs.writeFileSync('src/app/itinerary/[id]/page.tsx', c);
console.log('Fixed cards syntax');
