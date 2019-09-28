#!/bin/bash

. ./partisan-openrc.sh; ansible-playbook -i hosts -u ubuntu --key-file=~/deployment_key.txt nectar.yaml
