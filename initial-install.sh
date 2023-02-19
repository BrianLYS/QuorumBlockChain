#!/bin/bash

sudo apt-get install apt-utils

# install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash 
. ~/.nvm/nvm.sh
nvm install 16

# install docker
apt update
apt install docker.io

# install docker-compose
curl -L "https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# install go
apt install golang-go

# install git
apt install git

# install truffle
npm install -g truffle

# install ganache-cli
npm install -g ganache-cli

