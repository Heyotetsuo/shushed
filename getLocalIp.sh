#!/usr/bin/env bash

ifconfig | grep en0 -A 1 | tail -1 | cut -d ' ' -f 2
