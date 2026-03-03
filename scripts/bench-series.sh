#!/usr/bin/env bash
#
# Orchestrates repeated benchmark runs: for each of RUN_COUNT iterations,
# runs bench:run then bench:judge. If either fails, retries up to 3 times
# before failing the script.
#
# Usage:
#   ./scripts/bench-series.sh <model>
#
# Arguments:
#   model           - solver model for bench:run (required)
#
# Configure via environment variables:
#   RUN_COUNT       - number of run+judge iterations (default: 10)
#
# Example:
#   ./scripts/bench-series.sh gpt-4o
#

set -euo pipefail

MODEL="${1:-}"
if [[ -z "$MODEL" ]]; then
  echo "usage: $0 <model>"
  echo "  model: solver model for bench:run (required)"
  exit 1
fi

RUN_COUNT="${RUN_COUNT:-10}"
MAX_RETRIES=3

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUTPUT_PARENT="$REPO_ROOT/runs"

echo "bench-series: model=${MODEL} RUN_COUNT=${RUN_COUNT} MAX_RETRIES=${MAX_RETRIES}"
echo "bench-series: output parent ${OUTPUT_PARENT}"
mkdir -p "$OUTPUT_PARENT"

cd "$REPO_ROOT"

for ((i = 1; i <= RUN_COUNT; i++)); do
  run_dir="${OUTPUT_PARENT}/run-${i}"
  attempt=1

  while true; do
    echo ""
    echo "[run ${i}/${RUN_COUNT}] attempt ${attempt}/$((MAX_RETRIES + 1))"
    if bun run bench:run --model "$MODEL" --output "$run_dir" && \
       bun run bench:judge --input "$run_dir"; then
      echo "[run ${i}/${RUN_COUNT}] ok"
      break
    fi

    if [[ $attempt -gt $MAX_RETRIES ]]; then
      echo "error: run ${i} failed after $((MAX_RETRIES + 1)) attempts"
      exit 1
    fi

    echo "[run ${i}/${RUN_COUNT}] failed, retrying..."
    ((attempt++)) || true
  done
done

echo ""
echo "bench-series: all ${RUN_COUNT} runs completed successfully"
echo "bench-series: outputs in ${OUTPUT_PARENT}"
