#!/bin/bash
# Linux-Aequivalent zu build.bat - identische JSX-Reihenfolge
set -e
cd "$(dirname "$0")"

echo "== TW Baustellen-App - Build =="

# 1. Template kopieren
cp index-template.html index.html

# 2. Babel-Block oeffnen
{
    echo ""
    echo "<script type=\"text/babel\">"
} >> index.html

# 3. JSX in korrekter Reihenfolge anhaengen
for f in \
    jsx/tw-ma-shared-components.jsx \
    jsx/tw-ma-onboarding.jsx \
    jsx/tw-ma-startseite.jsx \
    jsx/tw-ma-baustellen.jsx \
    jsx/tw-ma-kalender.jsx \
    jsx/tw-ma-fotos.jsx \
    jsx/tw-ma-stunden.jsx \
    jsx/tw-ma-nachrichten.jsx \
    jsx/tw-ma-app.jsx; do
    cat "$f" >> index.html
    echo "" >> index.html
done

# 4. Babel-Block schliessen + Render
{
    echo "ReactDOM.createRoot(document.getElementById('root')).render(<MAApp />);"
    echo "</script>"
    echo "</body>"
    echo "</html>"
} >> index.html

echo "Fertig: index.html ($(wc -c < index.html) Bytes, $(wc -l < index.html) Zeilen)"
