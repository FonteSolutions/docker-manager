# Docker Manager

Manage your docker images and containers with this app made in nodeJs

## Install
* Clone repository
* Enter docker-manager directory
* Install dependences ```$ npm install```
* Start DockerManager ```$ ./docker-manager```

## Configure Docker Remote API
* Edit to allow connections ```/etc/default/docker```
* Add the line ```DOCKER_OPTS='-H tcp://0.0.0.0:2375 -H unix:///var/run/docker.sock'```
* Restart the Docker service using: ```service docker restart```
* Verify is ok [http://localhost:2375/_ping](http://localhost:2375/_ping) 
