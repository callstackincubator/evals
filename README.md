![React Native Evals banner](./assets/banner.jpg)

A benchmark suite for evaluating how coding models solve real React Native tasks.

## Available Evals

Groups map to top-level folders under `evals/`. The current suite contains 138 evals.

| Group             | Path                      | Evals | Status |
| ----------------- | ------------------------- | ----: | ------ |
| animation         | `evals/animation`         |    13 | Active |
| async-state       | `evals/async-state`       |    17 | Active |
| expo-router       | `evals/expo-router`       |    11 | Active |
| expo-sdk          | `evals/expo-sdk`          |    25 | Active |
| expo-ui           | `evals/expo-ui`           |     7 | Active |
| lists             | `evals/lists`             |    18 | Active |
| navigation        | `evals/navigation`        |    13 | Active |
| react-native-apis | `evals/react-native-apis` |     9 | Active |
| skia              | `evals/skia`              |    25 | Active |

> Want a group that is not listed here? [Open an issue](https://github.com/callstackincubator/evals/issues/new/choose) to request it. Contributions are also welcome.

## Getting Started

```bash
bun install
bun runner/run.ts --model openai/gpt-4.1-mini --output generated/my-generated
bun runner/judge.ts --model openai/gpt-5.3-codex --input generated/my-generated
```

OpenCode runs in Docker for solver and judge calls. Credentials reach containers via copied `~/.local/share/opencode/auth.json`, passthrough env vars (`OPENAI_*`, `CLOUDFLARE_*`, and others), and an optional repo-level `opencode.json`. See [docs/opencode-docker.md](./docs/opencode-docker.md) for the full mount and secrets reference.

For debugging OpenCode runs, pass `--agent-logs` to stream agent/session events, or `--verbose` for per-call session heartbeats and phase traces (`--verbose` also enables agent logs). Both flags work on `run.ts` and `judge.ts`.

For full command reference and workflows, see [docs](./docs) and [CONTRIBUTING.md](./CONTRIBUTING.md).

## Whitepaper

Methodology and scoring details are documented in the [benchmark methodology whitepaper](./paper/benchmark-methodology-whitepaper.tex).

The benchmark evaluates model-generated React Native implementations using requirement-based assessment. Each eval specifies a fixed task context and a set of explicit, judgeable requirements. Model outputs are judged against these requirements using file-level evidence, and per-eval scores are computed from requirement outcomes with optional weighting. Aggregate run metrics summarize performance across evals under a consistent evaluation protocol.

## Requests And Contributions

If you want to request new features to be evaluated, [open an issue](https://github.com/callstackincubator/evals/issues/new/choose). We are open to covering the most popular ecosystem libraries and will continue expanding coverage.

Contributions are welcome. Start with [CONTRIBUTING.md](./CONTRIBUTING.md) and [`AGENTS.md`](./AGENTS.md).

## License

MIT (`LICENSE`)
