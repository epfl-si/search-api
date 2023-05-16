SHELL := /bin/bash

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
mkfile_dir := $(dir $(mkfile_path))

HADOLINT_IMAGE = hadolint/hadolint
HADOLINT_VERSION = 2.12.0-alpine
HADOLINT_VLOCAL = -v ${mkfile_dir}:/host:ro
HADOLINT = @docker run --rm ${HADOLINT_VLOCAL} ${HADOLINT_IMAGE}:${HADOLINT_VERSION}

TRIVY_IMAGE = aquasec/trivy
TRIVY_VERSION = 0.40.0
TRIVY_VCACHE = -v /tmp/trivy/:/root/.cache/
TRIVY_VLOCAL = -v /var/run/docker.sock:/var/run/docker.sock
TRIVY = @docker run --rm ${TRIVY_VCACHE} ${TRIVY_VLOCAL} ${TRIVY_IMAGE}:${TRIVY_VERSION}

.PHONY: help
help:
	@echo "Main:"
	@echo "  make help             — Display this help"
	@echo "Utilities:"
	@echo "  make print-env        — Print environment variables"
	@echo "  make hadolint         — Lint Dockerfile with hadolint"
	@echo "  make scan             — Scan latest image"
	@echo "Local development:"
	@echo "  make start            — Launch search-api"
	@echo "Local production Docker:"
	@echo "  make build            — Build search-api"
	@echo "  make build-force      — Force build search-api"
	@echo "  make up               — Brings up search-api"
	@echo "  make exec             — Enter the container"

# To add all variable to your shell, use
# export $(xargs < /keybase/team/epfl_search/api/env);
check-env:
ifeq ($(wildcard /keybase/team/epfl_search/api/env),)
	@echo "Be sure to have access to /keybase/team/epfl_search/api/env"
	@exit 1
else
include /keybase/team/epfl_search/api/env
export
endif

.PHONY: print-env
print-env: check-env
	@echo "SEARCH_API_CSE_API_KEY=${SEARCH_API_CSE_API_KEY}"
	@echo "SEARCH_API_CSE_CX=${SEARCH_API_CSE_CX}"

.PHONY: hadolint
hadolint:
	@${HADOLINT} sh -c "hadolint -c /host/.hadolint.yml /host/docker/Dockerfile"

.PHONY: scan
scan:
	@${TRIVY} image --clear-cache
	@${TRIVY} image --severity HIGH,CRITICAL search-api:latest

.PHONY: start
start:
	@npm start

.PHONY: build
build:
	@docker compose build

.PHONY: build-force
build-force:
	@docker compose build --force-rm --no-cache --pull

.PHONY: up
up:
	@docker compose up

.PHONY: exec
exec:
	@docker exec -it --user root search-api sh
