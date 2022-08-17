main:
	hugo server --buildDrafts

dev: dev-no-tidy tidy
