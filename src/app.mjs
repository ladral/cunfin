import { loadProtoDefinition } from "./infra/proto-loader-proxy.mjs";
import grpc from "@grpc/grpc-js";

const protoDefinition = loadProtoDefinition();

function introspect(call, callback) {
    callback(null, {active: true});
}

const server = new grpc.Server();
server.addService(protoDefinition.cunfin.v1.TokenService.service, {introspect});


 /* start gRPC server */
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
    server.start();
    console.log('gRPC server started successfully.');
});