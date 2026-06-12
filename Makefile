SHELL := /bin/bash

NPM ?= npm
VERCEL ?= vercel
CODEX ?= codex
HOST ?= 0.0.0.0
DEV_PORT ?= 5173
PREVIEW_PORT ?= 4173
MSG ?=

.PHONY: help install dev build preview deploy deploy-preview push push-ai clean

help:
	@printf "\nPlay or Pass\n"
	@printf "============\n"
	@printf "make install                         Install dependencies\n"
	@printf "make dev                             Start Vite dev server on port $(DEV_PORT)\n"
	@printf "make build                           Build the production app into dist/\n"
	@printf "make preview                         Build and preview production app on port $(PREVIEW_PORT)\n"
	@printf "make deploy                          Deploy production to Vercel\n"
	@printf "make deploy-preview                  Deploy a Vercel preview build\n"
	@printf "make push MSG='commit message'       Commit current changes and push current branch\n"
	@printf "make push-ai                         Ask Codex for a commit message, then push\n"
	@printf "make clean                           Remove generated build output\n\n"

install:
	$(NPM) install

dev:
	$(NPM) run dev -- --host $(HOST) --port $(DEV_PORT)

build:
	$(NPM) run build

preview: build
	$(NPM) run preview -- --host $(HOST) --port $(PREVIEW_PORT)

deploy: build
	@if ! command -v $(VERCEL) >/dev/null 2>&1; then \
		echo "Vercel CLI is required. Install it or set VERCEL=/path/to/vercel."; \
		exit 1; \
	fi
	$(VERCEL) deploy --prod --yes

deploy-preview: build
	@if ! command -v $(VERCEL) >/dev/null 2>&1; then \
		echo "Vercel CLI is required. Install it or set VERCEL=/path/to/vercel."; \
		exit 1; \
	fi
	$(VERCEL) deploy --yes

push:
	@if [ -z "$(MSG)" ]; then \
		echo "MSG is required. Use: make push MSG='commit message'"; \
		exit 1; \
	fi
	git add -A
	git commit -m "$(MSG)"
	git push

push-ai:
	@if ! command -v $(CODEX) >/dev/null 2>&1; then \
		echo "Codex CLI is required. Install it or set CODEX=/path/to/codex."; \
		exit 1; \
	fi
	git add -A
	@if git diff --cached --quiet; then \
		echo "No changes to commit."; \
		exit 0; \
	fi
	@tmp_msg=$$(mktemp); \
	{ \
		printf "Generate a concise conventional commit message for the staged git diff. "; \
		printf "Return only one line, with no quotes, no markdown, and no explanation.\n\n"; \
		printf "Diff stat:\n"; \
		git diff --cached --stat; \
		printf "\nDiff:\n"; \
		git diff --cached --; \
	} | $(CODEX) -a never exec --sandbox read-only --output-last-message "$$tmp_msg" - >/dev/null 2>&1; \
	msg=$$(tr '\n\r\t' '   ' < "$$tmp_msg" | sed 's/  */ /g; s/^ //; s/ $$//'); \
	rm -f "$$tmp_msg"; \
	if [ -z "$$msg" ]; then \
		echo "Codex did not generate a commit message."; \
		exit 1; \
	fi; \
	echo "Commit message: $$msg"; \
	git commit -m "$$msg"; \
	git push

clean:
	rm -rf dist
