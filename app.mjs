import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let PROTO_PATH = __dirname + '/protos/cunfin/v1/token_service.proto';

// Suggested options for similarity to existing grpc.load behavior
let packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

let protoDescriptor  = grpc.loadPackageDefinition(packageDefinition);

function introspect(call, callback) {
    callback(null, {active: true});
}

/**
 * Starts an RPC server
 */
function main() {
    let server = new grpc.Server();
    server.addService(protoDescriptor.cunfin.v1.TokenService.service, { introspect });
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        server.start();
        console.log('gRPC server started successfully.');
    });
}

main();