#!/bin/bash

. ./partisan-openrc.sh; ansible-playbook --ask-become-pass nectar.yaml
