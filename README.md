# cunfin

Cunfin is a gRPC-based JWT Token Microservice that generates JWT (JSON Web Token) tokens and provides an introspect endpoint to validate these tokens. 
This microservice is designed to be integrated into a microservice architecture, providing a secure and efficient authentication mechanism for your applications.

## Installation guide

1. Install npm (shipped with node, nvm recommended for node install)
2. Install all dependencies: `npm install`
3. Install [Kreya App](https://kreya.app) for local testing (optional)

## Start application and testing

1. Build & serve web application: `npm run start`
   Build & serve web application in development mode: `npm run dev`

2. Open Kreya App and open Kreya Project file from `cunfin/kreya/cunfin.krproj`
3. Use GenerateToken gRPC call to generate new JWT token
4. Validate JWT token with the Introspect gRPC call
5. stop application `npm run stop`
    - if started in development mode use `ctrl + c` to stop the application

## Docker

1. install docker on your host
    - ubuntu server installation using snap: `sudo snap install docker`
2. start docker
3. fire up your terminal and go to the root directory of the project
4. build the docker image: `docker build -t cunfin .`
    - alternatively skipp this step and use the official docker image form the Docker Hub in the next step
5. start the docker container: `docker run -p 50051:50051 cunfin`
    - start the docker container with the official image from the Docker
      Hub: `docker run -p 50051:50051 ladral/cunfin:latest`
6. terminate the docker container: `ctrl + c`
7. remove docker container `docker rm $(docker ps -a --filter "ancestor=cunfin" -q)`
    - remove docker container created form official
      image `docker rm $(docker ps -a --filter "ancestor=ladral/cunfin" -q)`
8. remove docker image: `docker rmi cunfin`
    - remove docker image if started from official Docker Hub image: `docker rmi ladral/cunfin`

## Environment variables

It's also possible to provide own private and public keys to generate the JWT tokens and it's also possible to provide
own certificate and private key for TLS connection.

### local (nodejs/npm)

1. copy the dev.env file and save it as .env: `cp dev.env .env`
2. provide the values within the .env file.

If the application is started locally with npm/nodejs, the .env file is automatically loaded form the application.

### docker

Unfortunately the docker run option `--env-file` can not handle multiline string. This means, the keys and certificates
within the .env file may not be loaded correctly.

To work around this, you can either append the environment variables directly to the run command or pass the keys and
certificate through volume mounts.

To mount the keys (type: pkcs1, format: pem) on container startup (step 5 of the Docker instructions), use the following
command:

```
docker run -p 50051:50051 -v <host_path>:/app/keys cunfin -v <host_path>:/app/certs
```

- example for unix systems (
  linux/mac): `docker run -p 50051:50051 -v $(pwd)/keys:/app/keys -v $(pwd)/certs:/app/certs cunfin`
- example for
  Windows: `MSYS_NO_PATHCONV=1 docker run -p 50051:50051 -v $(pwd)/keys:/app/keys -v $(pwd)/certs:/app/certs cunfin`
- the RSA keys must be named as followed: **cunfin_rsa_private.pem** and **cunfin_rsa_public.pem**
- the TLS certificate and private key must be named as followed: **cert.pem** and **key.pem**

## Using the application from another service

The gRPC API specification for this application is published on
the [buf schema registry](https://buf.build/ladral/cunfin).

The buf schema registry also provides [SDK's](https://buf.build/ladral/cunfin/sdks/main) generated for several
programming languages, making it easier to work with the gRPC API.

### Example (nodejs - CommonjS)

Using the Application from another node.js service:

1. Make sure you have Node.js installed on your system.
2. Set your registry

```
npm config set @buf:registry https://buf.build/gen/npm/v1/
```

3. Install the necessary dependencies by running the following command in your project directory:

```
npm install @grpc/grpc-js @buf/ladral_cunfin.grpc_node
```

4. Import the required modules and define the getToken function in your JavaScript code:

```javascript
const grpc = require('@grpc/grpc-js');
const tokenServiceProto = require('@buf/ladral_cunfin.grpc_node/cunfin/v1/token_service_pb');
const tokenServiceGrpc = require('@buf/ladral_cunfin.grpc_node/cunfin/v1/token_service_grpc_pb');


function getToken(callback) {
    const client = new tokenServiceGrpc.TokenServiceClient('localhost:50051', grpc.credentials.createInsecure());

    const request = new tokenServiceProto.GenerateTokenRequest();
    request.setSubject('John Doe');
    request.setUserPrincipalName('john.doe@example.com');
    request.addRoles("Admin")

    client.generateToken(request, (err, res) => {
        if (err) {
            console.error(err);
            return callback(err);
        }

        console.log(`Token generated successfully`);
        callback(null, res.getAccessToken());
    });
}
```

If you have initiated the cunfin application with a TLS connection certificate, please add the certificate to the client as shown below:

```javascript
  const tlsCert = fs.readFileSync(getFilePath(certFileName), 'utf-8');
  const client = new tokenServiceGrpc.TokenServiceClient('localhost:50051', grpc.credentials.createSsl(Buffer.from(tlsCert)));
```


5. Call the getToken function from your code, passing a callback function to handle the response:

```javascript
getToken((err, token) => {
    if (err) {
        console.error('Error generating token:', err);
        return;
    }

    console.log('Generated token:', token);

// Use the token in your application logic
// ...
});
```

This code will connect to the cunfin service running on localhost:50051 using an insecure gRPC connection and generate a
token by making a request to the generateToken method.

Customize the request parameters according to your needs. For example, you can change the subject, user principal name,
and roles to match your application's requirements.

6. Run your JavaScript code and observe the generated token in the console.
