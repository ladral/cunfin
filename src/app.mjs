import {loadProtoDefinition} from "./infra/proto-loader-proxy.mjs";
import {issueJWT, verify} from "./service/token.service.mjs";
import grpc from "@grpc/grpc-js";

const protoDefinition = loadProtoDefinition();

function introspect(call, callback) {
    const result = verify(call.request.token);
    callback(null, {active: result});
}

function generateToken(call, callback) {
    console.log("generating new JWT token");
    const accessToken = issueJWT(call.request);
    callback(null, { access_token: accessToken, token_type: "Bearer" });
}

const server = new grpc.Server();

/* register gRPC token service */
server.addService(protoDefinition.cunfin.v1.TokenService.service, {
    introspect,
    generateToken
});

/* start gRPC server */
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log('gRPC server started successfully.');
});