.PHONY: all

build-all:
	yarn --cwd packages/dom-router build && \
	yarn --cwd packages/dom-router-react build && \
	yarn --cwd packages/forms build && \
	yarn --cwd packages/forms-react build && \
	yarn --cwd packages/persist build && \
	yarn --cwd packages/restapi build && \
	yarn --cwd packages/time build
