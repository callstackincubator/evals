FROM debian:bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl git \
  && rm -rf /var/lib/apt/lists/*

ARG TARGETARCH
ARG OPENCODE_VERSION=v1.15.10
RUN ARCH="${TARGETARCH:-amd64}" \
  && case "$ARCH" in \
    amd64) OPENCODE_ASSET=opencode-linux-x64.tar.gz ;; \
    arm64) OPENCODE_ASSET=opencode-linux-arm64.tar.gz ;; \
    *) echo "unsupported docker arch: $ARCH" >&2 && exit 1 ;; \
  esac \
  && curl -fsSL "https://github.com/anomalyco/opencode/releases/download/${OPENCODE_VERSION}/${OPENCODE_ASSET}" \
  | tar -xz -C /usr/local/bin opencode

WORKDIR /workspace
ENTRYPOINT ["opencode"]
CMD ["serve", "--hostname=0.0.0.0", "--port=4096"]
