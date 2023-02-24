filediff := $(shell git diff --name-only HEAD | grep --color=never content/post | sed -e 's/content\/post\///')
push: 
	git add .
	git commit -m "$(filediff)"
	git push

diff:
	@echo "$(filediff)"

tree: 
	tree content/post | less
	# tree -d content/post

build:
	hugo --minify --gc
.PHONY: push tree build diff