# Project Documentation

This folder contains a complete operational and architectural guide for the benchmark runner in this repository.

Read in this order:

1. [`01-overview.md`](./01-overview.md) - what the project does, key concepts, and repository layout
2. [`02-setup-and-quickstart.md`](./02-setup-and-quickstart.md) - install, local setup, and first runs
3. [`03-runner-cli-reference.md`](./03-runner-cli-reference.md) - full CLI reference for benchmark and judge-only runs
4. [`04-benchmark-ui.md`](./04-benchmark-ui.md) - local web UI usage, modes, and controls
5. [`05-results-and-resume.md`](./05-results-and-resume.md) - results format, summaries, judge-only reuse, and resume
6. [`06-troubleshooting-and-tuning.md`](./06-troubleshooting-and-tuning.md) - common failures, concurrency, and local model tuning

Related docs already in `docs/`:

- [`../adding-new-eval.md`](../adding-new-eval.md) - eval authoring contract (`prompt.md`, `requirements.yaml`, `app/`, `reference/`)
- [`../testing-your-evals.md`](../testing-your-evals.md) - placeholder (currently `TBD`)
- [`../benchmarking-selected-models.md`](../benchmarking-selected-models.md) - placeholder (currently `TBD`)
- [`../adding-new-category.md`](../adding-new-category.md) - category authoring workflow and research requirements
