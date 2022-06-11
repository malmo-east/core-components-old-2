#!/bin/bash

set -e

git config lfs.allowincompletepush true

# Релизим рут-пакет с помощью semantic-release
semantic_output=$(yarn semantic-release --debug)

# Выводим логи семантика
echo $semantic_output
