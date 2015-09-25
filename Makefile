

.PHONY: source images


all: source images

source:
	(cd source && $(MAKE))


images:
	(cd source && $(MAKE))

