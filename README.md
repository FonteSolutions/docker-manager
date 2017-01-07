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

## Test DockerManager
* Start service: `service docker start` then `service docker-manager start`
* Open app [http://localhost:31337](http://localhost:31337)

## Screenshots
#### How to pull new image
![How to pull new image](http://fontesolutions.com.br/docker-manager/imgs/images-list-how-pull-new.png)
#### Search image
![Search image](http://fontesolutions.com.br/docker-manager/imgs/images-list-search.png)
#### Select version
![Select version to install](http://fontesolutions.com.br/docker-manager/imgs/images-list-pull.png)
#### Image pulled with success
![Image pulled](http://fontesolutions.com.br/docker-manager/imgs/images-list-pulled.png)
#### Run DB image selecting preset configurations
![Run image selecting preset configurations](http://fontesolutions.com.br/docker-manager/imgs/images-run-db-select-preset.png)
#### View volumes tab
![Volumes tab](http://fontesolutions.com.br/docker-manager/imgs/images-run-db-volumes.png)
#### Run HTTP image selecting preset configurations
![Run HTTP image selecting preset configuration](http://fontesolutions.com.br/docker-manager/imgs/images-run-web-select-preset.png)
#### View volumes tab
![View volumes tab](http://fontesolutions.com.br/docker-manager/imgs/images-run-web-volumes.png)
#### View links tab
![View links tab](http://fontesolutions.com.br/docker-manager/imgs/images-run-web-links.png)
#### View envs tab
![View envs tab](http://fontesolutions.com.br/docker-manager/imgs/images-run-web-envs.png)
#### How to view All Containers Stats
![How to view All Containers Stats](http://fontesolutions.com.br/docker-manager/imgs/containers-how-view-stats.png)
#### View Container Stats
![View Container Stats](http://fontesolutions.com.br/docker-manager/imgs/containers-view-stats.png)
#### How to view Container Info
![How to view Container Info](http://fontesolutions.com.br/docker-manager/imgs/containers-how-view-info.png)
#### View Container Info
![View Container Info](http://fontesolutions.com.br/docker-manager/imgs/containers-view-info.png)
#### View Container Info CPU and Network Stats
![View Container Info CPU and Network Stats](http://fontesolutions.com.br/docker-manager/imgs/containers-view-info-stats.png)
#### View Container Top Process
![View Container Top Process](http://fontesolutions.com.br/docker-manager/imgs/containers-view-info-top.png)
#### View Container Logs
![View Container Logs](http://fontesolutions.com.br/docker-manager/imgs/containers-view-logs.png)
#### How to access Container Terminal
![How to access Container Terminal](http://fontesolutions.com.br/docker-manager/imgs/containers-how-view-term.png)
#### Verifying container and env params
![Verifying container and env params](http://fontesolutions.com.br/docker-manager/imgs/containers-term.png)
#### Multiple terminals of different containers with top running
![Multiple terminals of different containers with top running](http://fontesolutions.com.br/docker-manager/imgs/containers-term-top-all.png)
#### Server Info
![Server Info](http://fontesolutions.com.br/docker-manager/imgs/server-info.png)


## Thanks
* [BrScan](http://www.brscan.com.br/)
* [Felix Garcia Borrego](https://github.com/felixgborrego) for [Docker UI Chrome App](https://github.com/felixgborrego/docker-ui-chrome-app)
