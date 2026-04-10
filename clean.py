import re

with open('src/app/itinerary/[id]/page.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

# Make the page header/sticky nav black
c = c.replace('bg-white/80 dark:bg-slate-900/80', 'bg-black/60')
# Timeline sticky header
c = c.replace('bg-slate-50/90 dark:bg-slate-950/90', 'bg-black/60')
# Text colors inside cards and timeline
c = c.replace('text-slate-600 dark:text-slate-400', 'text-slate-300')
c = c.replace('text-slate-600', 'text-slate-300')
c = c.replace('text-slate-700 font-medium', 'text-slate-200 font-medium')
c = c.replace('text-slate-700 dark:text-slate-300', 'text-slate-200')
c = c.replace('text-slate-500', 'text-slate-300')

# Card overrides
c = c.replace('Card className="flex-1 shadow-sm border-slate-200 dark:border-slate-800', 'Card className="flex-1 shadow-sm border-white/10 bg-black/60 text-white')
c = c.replace('Card>', 'Card className="bg-black/60 text-white border-white/10">')
c = c.replace('Card className="border-t-4', 'Card className="bg-black/60 text-white border-l-white/10 border-r-white/10 border-b-white/10 border-t-4')
c = c.replace('Card className="shadow-md border-slate-200 dark:border-slate-800"', 'Card className="shadow-md border-white/10 bg-black/60 text-white"')

# Misc borders and backgrounds
c = c.replace('border-slate-200 dark:border-slate-800', 'border-white/10')
c = c.replace('border-slate-100 dark:border-slate-800', 'border-white/10')
c = c.replace('bg-slate-200 dark:bg-slate-800', 'bg-white/20')
c = c.replace('bg-white dark:bg-slate-900', 'bg-black')

with open('src/app/itinerary/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("done")
