.PHONY: generate check test integration run migrate seed
generate:
	go tool templ generate
check: generate
	go vet ./cmd/... ./internal/... ./views/...
	go test ./cmd/... ./internal/... ./views/...
integration:
	test -n "$$TEST_DATABASE_URL"
	go test -count=1 ./internal/...
run:
	go run ./cmd/web
migrate:
	go run ./cmd/web migrate
seed:
	go run ./cmd/web seed
