#!/usr/bin/env bash
set -euo pipefail

npx create-expo-module@latest expo-audit-module --platforms ios,android --package-name expo-audit-module --no-install
