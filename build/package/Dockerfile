# Frontend
FROM node:22-slim AS frontend

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /frontend

COPY web/pnpm-lock.yaml .

RUN pnpm fetch

COPY web .

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build


# Backend
FROM golang:1.24 AS backend

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

COPY --from=frontend /frontend/dist internal/http/dist

ENV CGO_ENABLED=0
RUN go build -o /app/main ./cmd/lite/lite.go

# Application
FROM gcr.io/distroless/static-debian12

WORKDIR /app

COPY --from=backend /app/main /app/main

EXPOSE 8080

USER nonroot:nonroot

CMD ["/app/main"]
