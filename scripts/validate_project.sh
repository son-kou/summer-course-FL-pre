#!/usr/bin/env bash
set -euo pipefail

export HOME="${PWD}/.home"
mkdir -p "${HOME}"

QUARTO_BIN="$(command -v quarto || true)"
QUARTO_ENV=""

if [ -n "${QUARTO_BIN}" ]; then
  QUARTO_ENV="$(cd "$(dirname "${QUARTO_BIN}")/.." && pwd)"
fi

if [ -n "${QUARTO_ENV}" ]; then
  if [ -x "${QUARTO_ENV}/bin/deno" ]; then
    export QUARTO_DENO="${QUARTO_DENO:-${QUARTO_ENV}/bin/deno}"
  fi

  if [ -d "${QUARTO_ENV}/share/quarto" ]; then
    export QUARTO_SHARE_PATH="${QUARTO_SHARE_PATH:-${QUARTO_ENV}/share/quarto}"
  fi

  if [ -x "${QUARTO_ENV}/bin/typst" ]; then
    export QUARTO_TYPST="${QUARTO_TYPST:-${QUARTO_ENV}/bin/typst}"
  fi

  if [ -x "${QUARTO_ENV}/bin/pandoc" ]; then
    export QUARTO_PANDOC="${QUARTO_PANDOC:-${QUARTO_ENV}/bin/pandoc}"
  fi
fi

if [ -x "${PWD}/node_modules/.bin/sass" ]; then
  export QUARTO_DART_SASS="${QUARTO_DART_SASS:-${PWD}/node_modules/.bin/sass}"
fi

python3 scripts/generate_qr.py
python3 scripts/generate_checklist_pdf.py
quarto render
python3 scripts/check_links.py _site
