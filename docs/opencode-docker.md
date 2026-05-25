# OpenCode Docker Runtime

The runner starts OpenCode inside Docker for solver and judge model calls. This page describes how credentials and config reach the container, and how to turn on extra logging.

## What gets mounted

Each worker session bind-mounts three things into the container:

| Host source                                           | Container path                          | Mode                           | Purpose                            |
| ----------------------------------------------------- | --------------------------------------- | ------------------------------ | ---------------------------------- |
| Eval workspace directory                              | `/workspace`                            | read-write                     | Files the agent reads and edits    |
| Copy of `~/.local/share/opencode/auth.json`           | `/root/.local/share/opencode/auth.json` | read-write (isolated temp dir) | OpenCode provider credentials      |
| Repo `opencode.json` or `opencode.jsonc` (if present) | `/root/.config/opencode/<filename>`     | read-only                      | Provider/model config (no secrets) |

The auth file is copied into a per-container temp directory before mount so concurrent workers do not share or overwrite the same host file.

Provider access depends on 3 optional sources:

1. `~/.local/share/opencode/auth.json`
2. passthrough env vars
3. config referenced from `opencode.json`/`opencode.jsonc` placed in this repo root

## Environment variable passthrough

The runner forwards matching host environment variables into the container with `docker run -e`.

A variable is passed when:

1. It is set and non-empty in the host process environment, and
2. Its name matches one of the default prefixes:

- `OPENCODE_`
- `OPENAI_`
- `ANTHROPIC_`
- `GOOGLE_`
- `GEMINI_`
- `AZURE_`
- `PARASAIL_`
- `CLOUDFLARE_`

Examples that are forwarded: `OPENAI_API_KEY`, `CLOUDFLARE_API_TOKEN`, `OPENCODE_SERVER_LOG_LEVEL`.

Unrelated variables (for example `PATH`, `HOME`, `GITHUB_TOKEN`) are not forwarded.

### Extra prefixes

To forward additional prefixes, set a comma-separated list before running:

```bash
export OPENCODE_DOCKER_EXTRA_ENV_PREFIXES='MY_PROVIDER_,CUSTOM_GATEWAY_'
bun runner/run.ts --model openai/gpt-4.1-mini --output generated/my-generated
```

Extra prefixes are merged with the defaults above.

## Debugging flags

Both `bun runner/run.ts` and `bun runner/judge.ts` accept:

### `--agent-logs`

Streams OpenCode agent activity from the server SSE feed. Log lines are prefixed with `[opencode-docker][...][agent]` and include session lifecycle events, tool calls, and session errors.

This flag also:

- Sets the in-container server log level to `DEBUG`
- Enables `--print-logs` on the OpenCode server process

Use this when you need provider or session error details that do not appear in default output.

### `--verbose`

Enables `[opencode-trace]` diagnostics for each OpenCode model call:

- Call start/stop with model, port, timeout, and workspace directory
- Phase transitions (`structured-output`, `json-fallback`, and so on)
- Session ID when available
- Heartbeats every 3 seconds with session status, message count, and latest assistant activity (tool runs, text, errors)

`--verbose` also turns on agent logging (equivalent to passing `--agent-logs`).

Example:

```bash
bun runner/run.ts \
  --model openai/gpt-4.1-mini \
  --output generated/my-generated \
  --agent-logs \
  --verbose
```

For judge runs:

```bash
bun runner/judge.ts \
  --model openai/gpt-5.3-codex \
  --input generated/my-generated \
  --agent-logs \
  --verbose
```

## Related environment variables

| Variable                             | Default                                  | Effect                                                     |
| ------------------------------------ | ---------------------------------------- | ---------------------------------------------------------- |
| `OPENCODE_STREAM_CONTAINER_LOGS`     | enabled                                  | Set to `0` to stop streaming `[container]` docker logs     |
| `OPENCODE_SERVER_LOG_LEVEL`          | `INFO`                                   | Server log level when `--agent-logs` is off                |
| `OPENCODE_SERVER_PRINT_LOGS`         | off                                      | Set to `1` to enable `--print-logs` without `--agent-logs` |
| `OPENCODE_DOCKER_EXTRA_ENV_PREFIXES` | unset                                    | Comma-separated extra env key prefixes to forward          |

When a run starts, the runner prints a single line summarizing the effective logging settings (`serve log level`, `agent logs`, `verbose`).
