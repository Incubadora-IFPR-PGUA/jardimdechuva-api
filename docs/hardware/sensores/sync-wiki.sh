#!/usr/bin/env bash
set -euo pipefail

# Sincroniza a documentação para o GitHub Wiki.
# O Wiki é um repositório Git separado (.wiki.git) do mesmo projeto.
#
# Publica:
#   - docs/hardware/sensores/*.md    -> Sensores / Sensor-*
#
# O Wiki mostra o conteúdo COMPLETO dos .md (inclusive blocos internos),
# diferente do PDF do cliente. Uso interno/técnico.

WIKI_URL="https://github.com/Incubadora-IFPR-PGUA/jardimdechuva-api.wiki.git"

# Pasta das fichas de sensores (onde este script está)
SRC="$(cd "$(dirname "$0")" && pwd)"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "Clonando o Wiki..."
git clone "$WIKI_URL" "$TMP"

# Remove o frontmatter YAML (bloco entre as duas primeiras linhas ---).
# O Wiki do GitHub não interpreta frontmatter e o exibiria como texto solto.
remover_frontmatter() {
  # Remove o frontmatter YAML apenas se o arquivo COMEÇAR com '---'.
  # Arquivos sem frontmatter passam inteiros; a 1a linha de conteudo e preservada.
  awk '
    NR==1 && $0!="---" { plain=1 }
    plain { print; next }
    NR==1 && $0=="---" { infm=1; next }
    infm && $0=="---" { infm=0; next }
    infm { next }
    { print }
  '
}

# Reescreve links locais para o padrão de página do Wiki.
# Ex.: (temt6000.md) -> (Sensor-temt6000)   e   (README.md) -> (Sensores)
ajustar_links() {
  sed -E \
    -e 's/\(README\.md\)/(Sensores)/g' \
    -e 's/\(([a-zA-Z0-9_-]+)\.md\)/(Sensor-\1)/g'
}

# --- Fichas de sensores ---
echo "Copiando fichas..."
for f in "$SRC"/*.md; do
  nome="$(basename "$f")"
  case "$nome" in
    README.md)     destino="Sensores.md" ;;          # índice vira a página "Sensores"
    _template.md)  continue ;;                        # template não vai pro Wiki
    *)             destino="Sensor-${nome%.md}.md" ;; # ex: fd10.md -> Sensor-fd10.md
  esac
  remover_frontmatter < "$f" | ajustar_links > "$TMP/$destino"
  echo "  $nome -> $destino"
done

cd "$TMP"

# Só faz commit/push se houve mudança
if [ -z "$(git status --porcelain)" ]; then
  echo "Nada mudou. Wiki já está atualizado."
  exit 0
fi

git add -A
git commit -m "docs: sincroniza documentação ($(date +%d/%m/%Y))"
git push

echo "Wiki sincronizado."
