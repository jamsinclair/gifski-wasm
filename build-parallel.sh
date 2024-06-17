#!/bin/sh
RUSTFLAGS='-C target-feature=+atomics,+bulk-memory,+mutable-globals' \
  wasm-pack build --target web -d pkg-parallel . \
  -- -Z build-std=panic_abort,std --features=parallel
