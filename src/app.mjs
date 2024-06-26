import 'dotenv/config';
import {loadProtoDefinition} from "./infra/proto-loader-proxy.mjs";
import {issueJWT, verify, getPublicVerificationKey} from "./service/token.service.mjs";
import {loadSslCert} from "./infra/tls-cert-loader.mjs";
import grpc from "@grpc/grpc-js";

const protoDefinition = loadProtoDefinition();

function introspect(call, callback) {
    console.debug("introspect token");
    const result = verify(call.request.token);
    callback(null, {active: result});
}

function generateToken(call, callback) {
    console.log("generating new JWT token");
    const accessToken = issueJWT(call.request);
    callback(null, { access_token: accessToken, token_type: "Bearer" });
}

function getPublicKey(call, callback) {
    console.debug("get public key");
    const publicKey = getPublicVerificationKey();
    callback(null, {public_key: publicKey});
}

const server = new grpc.Server();

/* register gRPC token service */
server.addService(protoDefinition.cunfin.v1.TokenService.service, {
    introspect,
    generateToken,
    getPublicKey
});

/* start gRPC server */
const keyCertPairs = loadSslCert();

if (keyCertPairs) {
    console.log('Using provided certificates for TLS connection');
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createSsl(keyCertPairs.cert,  [{ private_key: keyCertPairs.key, cert_chain: keyCertPairs.cert }]), () => {
        console.log('gRPC server started successfully');
    });
} else {
    console.log("Starting gRPC server in insecure mode without TLS cert");
    server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
        console.log('gRPC server started successfully');
    });
}

async function closeGracefully(signal) {
    console.log(`Received signal to terminate: ${signal}`);
    return new Promise((resolve, reject) => {
        server.tryShutdown((error) => {
            if (error) {
                console.error('Error during graceful shutdown:', error);
                reject(error);
            } else {
                console.log('gRPC server shut down gracefully');
                resolve();
            }
        });
    });
}

process.on('SIGINT', () => {
        closeGracefully('SIGINT').then(() => {
            process.exit(0);
        }).catch(() => {
            server.forceShutdown();
            process.exit(1);
        });
});

process.on('SIGTERM', () => {
    closeGracefully('SIGINT').then(() => {
        process.exit(0);
    }).catch(() => {
        server.forceShutdown();
        process.exit(1);
    });
});

