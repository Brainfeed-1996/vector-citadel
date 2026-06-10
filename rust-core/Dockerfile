FROM rust:1.85-slim AS builder
WORKDIR /app
COPY rust-core/Cargo.toml rust-core/Cargo.lock* ./
COPY rust-core/src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/vector-citadel /usr/local/bin/
EXPOSE 8080
CMD ["vector-citadel"]