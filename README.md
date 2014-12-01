[![Stories in Ready](https://badge.waffle.io/lifter-cli/lifter.svg?label=ready&title=Ready)](http://waffle.io/lifter-cli/lifter)
[![Build Status](https://travis-ci.org/lifter-cli/lifter.svg?branch=master)](https://travis-ci.org/lifter-cli/lifter)

Lifter
========
Lifter is a command line tool that simplifies and automates deployment with Docker containers. Our tool is designed for software developers that use Mac OS X and have heard of Docker containers and would like to get up and running as soon as possible. 

While Docker containers can dramatically improve the predictability of deploying your application, using Docker has a steep learning curve. We have reduced the complexity of using Docker by designing a generalized Docker workflow that fits most use cases of web application development. 

Even for familiar users of Docker, our tool is designed to reduce your time managing your containers by eliminating the need to execute a series of Docker commands as part of your typical development workflow.

[View documentation](http://lifter-cli.github.io/lifter/docs/)

## Requirements
- Install the Docker and Boot2Docker package (lightweight Linux VM to run the Docker server)
  - [Download the latest version at the official Docker site](https://github.com/boot2docker/osx-installer/releases/latest)
- [Create a Docker Hub account](https://hub.docker.com/account/signup/) (free), which is the equivalent of GitHub for the Docker world

## Getting Started

### Install Lifter
0. Make sure you meet the requirements before moving on to the next steps. 
1. Install our command line tool via NPM as a global module so you can access it via the command line:
   
    ```
    npm install -g lifter
    ```

2. Run the `lifter` command to receive a quick overview of each Lifter command.

### Containerize Your Application
1. Run the `lifter config` command to configure the settings for your Docker containers.
2. Run the `lifter init` command to start the Docker containers in your local dev environment
3. Run the `lifter shell` command to learn how to enter the shell of your local Docker containers.
3. Run the `lifter push` command to save the state of your application as a Docker image and push it to Docker Hub
4. Run the `lifter deploy` command to deploy your application on a VM in your production environment

Congrats! You have deployed your application to the cloud using Docker containers.

## Monitor Your Containers
The Lifter Monitor tool which provides a dashboard view and detailed view of your Docker containers so you can see the status of your containers and troubleshoot if any issues arise.

### Local (Mac OS X)
A. Once you have run `lifter init` and have Docker containers running in your local dev environment, you can install Lifter Monitor for Mac OS X by running the following shell script via curl. Please ensure you are in the folder that you want to install Lifter Monitor in when you run the following command:
```
curl http://lifter-cli.github.io/lifter/install-lifter-monitor-osx.sh | sh
```
  - Note: You may need to execute the shell script using sudo depending on your computer's settings.
(e.g. `curl http://lifter-cli.github.io/lifter/install-lifter-monitor-osx.sh | sudo sh`) 

  - You can now monitor the status of your local development containers at: `http://localhost:3123/`

### Azure (Ubuntu)
B. Once you have run `lifter deploy` and have Docker containers running in production, you can install Lifter Monitor on Azure by SSH-ing into your VM and running the following shell script using sudo via curl:
```
curl http://lifter-cli.github.io/lifter/install-lifter-monitor-ubuntu.sh | sudo sh
```

  - Open up port 3123 for your Azure VM by [following these instructions](http://azure.microsoft.com/en-us/documentation/articles/virtual-machines-set-up-endpoints/)
  
  - You can now monitor the status of your Azure production containers at: `http://azure-vm-name.cloudapp.net:3123/`

## In Depth Guide of How Lifter Works
This section explains what exactly is happening under the hood with each Lifter command.

### Lifter Config
This prompts the user to answer a series of questions that are used in Lifter Init to set up the containers in the local dev environment. The output of this command is the `lifter.yaml` file which is read by the next step.

### Lifter Init
This will start the Docker server in your local dev environment (Mac OS X) by starting Boot2Docker, which is a lightweight Linux VM that allows you to run the Docker server because it cannot natively run on OS X (although the Docker client can run natively in in the OS X terminal).

`boot2docker init` - Creates the VM (done once)

`boot2docker up`  - Starts running the VM (done every session)

Lifter then uses the `lifter.yaml` that was created in the previous step to generate a Dockerfile. The Dockerfile is a series of steps that tells Docker how to create an image, which is a static snapshot of a container. This initial image includes a light-weight OS (in this case CentOS) as well as other dependencies such as node.js/npm.

`docker build -t image_name .`

Lifter then starts an application container that is linked to a folder with your codebase and a database container that is linked to your application container. 

```
docker run -it -d --restart=always --name shortly-deploy -p 80:4568 -v /Users/willchen/HR/2014-09-shortly-express:/src willchen90/shortly-deploy /bin/bash
```
This command starts the application container with several important settings:
 - Port 80 of your Boot2Docker VM is now connected to port 4568 of your application container
 - The local host directory with your application code is mounted in your application container inside the `src` folder. This means your container has a live reference to your application code and as you make any changes to your codebase using your favorite text editor / IDE as you normally do, all the changes will be reflected within your container
 - The container is started with a psuedo-terminal using bash so you can enter into the shell of your container

### Lifter Push
This saves the state of your application into a Docker image and then pushes this Docker image to Docker Hub. This workflow mirrors the Git workflow where you commit your changes and push to a remote repository on Git Hub. 

Before we can save your application container into a Docker image, we need to copy the files in your mounted volume into your actual application container. As mentioned earlier, the mounted volume provides a reference to the files, which mean they don't actually exist in the container yet.

`docker exec container_name cp -r src/ /prod`
This command copies the files in your application container from the `src` folder to the `prod` folder

`docker commit container_name docker_hub_username/repository:latest`
This command saves the state of our application container into an image. This is similar to the `commit` command in `git` and diffs to save only the incremental changes.

`docker push docker_hub_username/repository:latest`
Now, we can push our image onto Docker Hub which is similar to what GitHub is for Git.

### Lifter Shell
This prints the command for entering the shell of your local application containers. Once inside your application container, you can navigate to the "src" directory to find your application's codebase. Your codebase and application container are always in sync so you may choose to develop in either setting. Most often developers will enter the shell of the application container to run their application's launch command. 

`$(boot2docker shellinit) && docker exec -it shortly-deploy bash`

### Lifter Deploy
Once you are ready to deploy your application, you can either choose to create a new VM or use an existing VM on Azure to deploy to. This will copy and execute a shell script that will replicate a set-up similar to your development environment and start your application and database containers. The shell script automatically executes the launch command that you specified in the lifter config stage, which will then start the server for your app.

```
docker $DOCKER_OPTS run --name container_name -d -p 80:8080  docker_hub_username/repository:latest sh prod/.lifter/app.sh
```
This command should look similar to the one in Lifter init with a couple of notable differences:
 - the $DOCKER_OPTS option references the location of our security certificates which is necessary on Azure Ubuntu VM
 - the final argument in the command is executing a shell script in the container which executes the launch command chosen in `lifter config`

## FAQ
Q: Can I use Lifter to deploy to AWS, Google, [insert favorite cloud service provider]?

A: We currently support deployment to Microsoft Azure and may support other cloud service providers in the future.  The first three Lifter commands (config, init, and push) are applicable to deployments in any production environment and with some customization of the lifter deploy steps, our tool can be used to deploy to other cloud service providers.

## Team

  - __Product Owner__: Will Chen
  - __Scrum Master__: Urvashi Reddy
  - __Development Team Members__: Will Chen, Urvashi Reddy, Jason Erpenbeck, Greg Ferrell

