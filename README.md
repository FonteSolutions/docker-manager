# Docker Manager for Linux

Manage your docker images and containers

## Requirements

### Configure Docker Remote API
* Edit to allow connections ```/etc/default/docker```
* Add the line ```DOCKER_OPTS='-H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock'```
* Restart the Docker service using: ```service docker restart```
* Verify is ok [http://localhost:2375/_ping](http://localhost:2375/_ping) 

### NodeJS
* Install nodejs: `apt-get install npm` or `yum install npm` or see here [https://nodejs.org/](https://nodejs.org/en/)


## Install

* Create /Applications directory: `mkdir /Applications`
* Enter directory: `cd /Applications`
* Clone repository: `git clone https://github.com/fontenele/docker-manager.git`
* Execute install script: `/Applications/docker-manager/install`
* Remember to set Docker to starts when boot: `systemctl enable docker.service`
* Enable DockerManager to starts when system boot: `systemctl enable docker-manager.service`
* Start service: `service docker start` then `service docker-manager start`
* Open app [http://localhost:31337](http://localhost:31337)


## Thanks
* [BrScan](http://www.brscan.com.br/)
* [Felix Garcia Borrego](https://github.com/felixgborrego) for [Docker UI Chrome App](https://github.com/felixgborrego/docker-ui-chrome-app)