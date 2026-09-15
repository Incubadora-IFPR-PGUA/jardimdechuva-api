#!/usr/bin/env bash
set -euo pipefail

# Gera PDF enxuto (versão cliente) a partir das fichas de sensores.
# Remove blocos marcados como interno e concatena tudo via Pandoc.
#
# Dependências: pandoc + um engine LaTeX (ex: texlive-xetex)
#   sudo apt install pandoc texlive-xetex

cd "$(dirname "$0")"

SAIDA="sensores-jardim-de-chuva.pdf"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Ordem dos arquivos no PDF: README primeiro, depois as fichas em ordem alfabética
ARQUIVOS=(README.md)
for f in *.md; do
  [[ "$f" == "README.md" || "$f" == "_template.md" ]] && continue
  ARQUIVOS+=("$f")
done

# Remove blocos internos de cada arquivo
FILTRADOS=()
for f in "${ARQUIVOS[@]}"; do
  out="$TMP/$f"
  sed '/<!-- interno:início -->/,/<!-- interno:fim -->/d' "$f" > "$out"
  FILTRADOS+=("$out")
done

pandoc "${FILTRADOS[@]}" \
  -o "$SAIDA" \
  --pdf-engine=xelatex \
  --toc \
  --toc-depth=1 \
  -V geometry:margin=2.5cm \
  -V mainfont="DejaVu Sans" \
  -V title="Sensores — Jardim de Chuva" \
  -V subtitle="Documentação técnica dos nós sensores" \
  -V date="$(date +%d/%m/%Y)"

echo "PDF gerado: $SAIDA"