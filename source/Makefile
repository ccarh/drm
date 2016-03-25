#
# Programmer:    Craig Stuart Sapp <craig@ccrma.stanford.edu>
# Creation Date: Thu Sep 24 08:41:27 PDT 2015
# Last Modified: Thu Sep 24 08:41:30 PDT 2015
# Filename:      drm/source/Makefile
# Syntax:        GNU Makefile
#
# Description:   Extract source files from Wiki pages.
#


.PHONY: drm eve

all: drm


drm:
	-(cd drm; ../getsource Digital_Resources_for_Musicology)

eve:
	-(cd eve; ../getsource 'EVE_(Electronic_and_Virtual_Editions)')

clean:
	-(cd drm; -rm *.template)
	-(cd drm; -rm main.wiki)
	-(cd eve; -rm *.template)
	-(cd eve; -rm main.wiki)
