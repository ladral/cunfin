# cunfin

## Installation guide
1. Install npm (shipped with node, nvm recommended for node install)
2. Install all dependencies: `npm install`
3. Install [Kreya App](https://kreya.app) for local testing (optional)


## Testing
1. Build & serve web application: `npm run start`

   Build & serve web application in development mode: `npm run dev`

2. Open Kreya App and open Kreya Project file from `cunfin/kreya/cunfin.krproj`

3. Use GenerateToken gRPC call to generate new JWT token

4. Validate JWT token with the Introspect gRPC call 

4. stop application `npm run stop`
    - if started in development mode use `ctrl + c` to stop the application

## Docker
1. install docker on your host
   - ubuntu server installation using snap: `sudo snap install docker`
2. start docker
3. fire up your terminal and go to the root directory of the project
4. build the docker image: `docker build -t cunfin .`
   - alternatively skipp this step and use the official docker image form the Docker Hub in the next step
5. start the docker container: `docker run cunfin`
   - start the docker container with the official image from the Docker Hub: `docker run ladral/cunfin:latest`
6. terminate the docker container: `ctrl + c`
7. remove docker container `docker rm $(docker ps -a --filter "ancestor=cunfin" -q)`
   - remove docker container created form official image `docker rm $(docker ps -a --filter "ancestor=ladral/cunfin" -q)`
8. remove docker image: `docker rmi cunfin`
   - remove docker image if started from official Docker Hub image: `docker rmi ladral/cunfin`

It's also possible to provide own private and public keys to generate the JWT tokens.
5. Just mount the keys (type:pkcs1, format: pem) on container startup (step 5):  `docker run -v <host_path>:/app/keys cunfin`
   - example for unix systems (linux/mac): `docker run -v $(pwd)/keys:/app/keys cunfin`
   - example for Windows: `MSYS_NO_PATHCONV=1 docker run -v $(pwd)/keys:/app/keys cunfin`
