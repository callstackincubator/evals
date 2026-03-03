#!/usr/bin/env bash
#
# Orchestrates repeated benchmark runs: for each of RUN_COUNT iterations,
# runs bench:run then bench:judge. If either fails, retries up to 3 times
# before failing the script.
#
# Usage:
#   ./scripts/bench-series.sh --model <model> --judge-model <judge-model> [--runs <n>]
#
# Arguments:
#   --model         - solver model for bench:run (required)
#   --judge-model   - judge model for bench:judge (required)
#   --runs          - number of run+judge iterations (default: 10)
#
# Example:
#   ./scripts/bench-series.sh --model gpt-4o --judge-model gpt-4o --runs 5
#

set -euo pipefail

MODEL=""
JUDGE_MODEL=""
RUNS=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --model)
      MODEL="$2"
      shift 2
      ;;
    --judge-model)
      JUDGE_MODEL="$2"
      shift 2
      ;;
    --runs)
      RUNS="$2"
      shift 2
      ;;
    *)
      echo "unknown option: $1"
      echo "usage: $0 --model <model> --judge-model <judge-model> [--runs <n>]"
      exit 1
      ;;
  esac
done

if [[ -z "$MODEL" ]] || [[ -z "$JUDGE_MODEL" ]]; then
  echo "usage: $0 --model <model> --judge-model <judge-model>"
  echo "  --model: solver model for bench:run (required)"
  echo "  --judge-model: judge model for bench:judge (required)"
  exit 1
fi

RUN_COUNT="${RUNS:-10}"
MAX_RETRIES=0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_PARENT="$REPO_ROOT/runs"

echo "bench-series: model=${MODEL} judge-model=${JUDGE_MODEL} RUN_COUNT=${RUN_COUNT} MAX_RETRIES=${MAX_RETRIES}"
echo "bench-series: output parent ${OUTPUT_PARENT}"
mkdir -p "$OUTPUT_PARENT"

cd "$REPO_ROOT"

for ((i = 1; i <= RUN_COUNT; i++)); do
  run_artifacts_dir="${OUTPUT_PARENT}/${MODEL}/run-${i}/generated"
  attempt=1

  max_attempts=$((MAX_RETRIES + 1))
  while true; do
    echo ""
    echo "[run ${i}/${RUN_COUNT}] attempt ${attempt}/${max_attempts}"
    if bun run bench:run --model "$MODEL" --output "$run_artifacts_dir" && \
       bun run bench:judge --model "$JUDGE_MODEL" --input "$run_artifacts_dir"; then
      echo "[run ${i}/${RUN_COUNT}] ok"
      break
    fi

    if [[ $attempt -gt $MAX_RETRIES ]]; then
      echo "error: run ${i} failed after ${max_attempts} attempts"
      exit 1
    fi

    echo "[run ${i}/${RUN_COUNT}] failed, retrying..."
    ((attempt++)) || true
  done
done

echo ""
echo "bench-series: all ${RUN_COUNT} runs completed successfully"
echo "bench-series: outputs in ${OUTPUT_PARENT}"
