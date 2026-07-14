import os
import re

replacements = {
    r'\bbg-white\b(?!/| dark:)': 'bg-white dark:bg-slate-900',
    r'\bbg-\[\#f0fdfa\]\b': 'bg-[#f0fdfa] dark:bg-slate-800',
    r'\bbg-\[\#f8fafc\]\b': 'bg-[#f8fafc] dark:bg-slate-800/80',
    r'\btext-slate-900\b': 'text-slate-900 dark:text-slate-100',
    r'\btext-slate-800\b': 'text-slate-800 dark:text-slate-100',
    r'\btext-slate-600\b': 'text-slate-600 dark:text-slate-300',
    r'\btext-teal-900\b': 'text-teal-900 dark:text-teal-100',
    r'\bborder-teal-100\b': 'border-teal-100 dark:border-teal-900',
    r'\bborder-teal-50\b': 'border-teal-50 dark:border-teal-900',
    r'\bbg-teal-50\b': 'bg-teal-50 dark:bg-teal-900/30',
    r'\bbg-teal-100\b': 'bg-teal-100 dark:bg-teal-900/50',
    r'\bborder-slate-100\b': 'border-slate-100 dark:border-slate-700',
    r'\bborder-slate-200\b': 'border-slate-200 dark:border-slate-700',
    r'\bbg-slate-50\b': 'bg-slate-50 dark:bg-slate-800',
    r'\bbg-slate-100\b': 'bg-slate-100 dark:bg-slate-800',
    r'\bshadow-2xl\b': 'shadow-2xl dark:shadow-none',
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    for pattern, repl in replacements.items():
        # Avoid replacing if it already has the dark version right next to it
        # The regexes above handle this somewhat, but doing a simple string replace if it doesn't already contain the replacement.
        # It's safer to just run regex.
        content = re.sub(pattern, repl, content)
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('d:/navibharat/src/app'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))
