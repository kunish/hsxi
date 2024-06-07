FROM oven/bun as builder

WORKDIR /build

COPY . .

ENV HUSKY=0

RUN bun install
RUN bun run build

FROM oven/bun

WORKDIR /app

EXPOSE 3000

COPY --from=builder /build/.output/. .

CMD bun run --bun server/index.mjs