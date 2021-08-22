.PHONY: all

build-all:
	yarn --cwd packages/dom-router build && \
	yarn --cwd packages/dom-router-react build && \
	yarn --cwd packages/forms build && \
	yarn --cwd packages/forms-react build && \
	yarn --cwd packages/persist build && \
	yarn --cwd packages/restapi build && \
	yarn --cwd packages/time build

test-all:
	yarn --cwd packages/dom-router test && \
	yarn --cwd packages/dom-router-react test && \
	yarn --cwd packages/forms test && \
	yarn --cwd packages/forms-react test && \
	yarn --cwd packages/persist test && \
	yarn --cwd packages/restapi test && \
	yarn --cwd packages/time test

upgrade-deps-all:
	yarn --cwd packages/dom-router upgrade --latest && \
	yarn --cwd packages/dom-router-react upgrade --latest && \
	yarn --cwd packages/forms upgrade --latest && \
	yarn --cwd packages/forms-react upgrade --latest && \
	yarn --cwd packages/persist upgrade --latest && \
	yarn --cwd packages/restapi upgrade --latest && \
	yarn --cwd packages/time upgrade --latest
	yarn --cwd examples upgrade --latest
