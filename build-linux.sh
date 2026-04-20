#!/bin/bash
# Linux-Aequivalent von build.bat
set -e
cd "$(dirname "$0")"

echo "[1/4] Kopiere Template ..."
cp index-template.html index.html

echo "[2/4] Haenge Babel-Block an ..."
echo "" >> index.html
echo '<script type="text/babel">' >> index.html

echo "[3/4] Haenge JSX-Module an ..."
# Reihenfolge ist wichtig: shared-components zuerst, app zuletzt.
# Auth- und Onboarding-Komponenten nach shared-components, bevor sie
# in MAApp verwendet werden.
cat jsx/tw-ma-shared-components.jsx >> index.html
echo "" >> index.html
cat jsx/tw-ma-auth.jsx >> index.html
echo "" >> index.html
cat jsx/tw-ma-onboarding.jsx >> index.html
echo "" >> index.html
cat jsx/tw-ma-startseite.jsx >> index.html
echo "" >> index.html
cat jsx/tw-ma-baustellen.jsx >> index.html
echo "" >> index.html
cat jsx/tw-ma-nachrichten.jsx >> index.html
echo "" >> index.html
cat jsx/tw-ma-app.jsx >> index.html

echo "[4/4] Schreibe Render-Aufruf ..."
echo "" >> index.html
echo '</script>' >> index.html
echo "" >> index.html
echo '<script type="text/babel">' >> index.html
echo '  ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(MAApp));' >> index.html
echo '</script>' >> index.html
echo '</body>' >> index.html
echo '</html>' >> index.html

BYTES=$(wc -c < index.html)
echo ""
echo "============================================"
echo "  Build fertig: index.html ($BYTES Bytes)"
echo "============================================"
