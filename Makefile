

.PHONY: source images


all: update
update: source images

source:
	-(cd source && $(MAKE))


images:
	-(cd images && $(MAKE))

