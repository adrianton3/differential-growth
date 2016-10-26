#!/usr/bin/env bash
git checkout gh-pages

git rm index.html
git rm -r lib/
git rm -r res/
git rm -r src/
git rm -r style/

git checkout master -- index.html
git checkout master -- lib/
git checkout master -- res/
git checkout master -- src/
git checkout master -- style/