FROM golang:1.27.3-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN --mount=type=cache,target=/root/.cache/go-build go tool templ generate && CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/style-ease ./cmd/web

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/style-ease /style-ease
USER nonroot:nonroot
ENV BIND_ADDR=0.0.0.0 PORT=8080 APP_ENV=production
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 CMD ["/style-ease", "healthcheck"]
ENTRYPOINT ["/style-ease"]
