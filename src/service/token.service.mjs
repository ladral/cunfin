import fs from 'node:fs';
import crypto from 'node:crypto';
import jsonwebtoken from 'jsonwebtoken';
import {fileURLToPath} from "url";
import path from "path";

const privateKeyFileName ='cunfin_rsa_private.pem';
const publicKeyFileName ='cunfin_rsa_public.pem';
const algorithm = "RS256";


const keyPair = init();

function init() {
    const privateKey = process.env.CUNFIN_RSA_PRIVATE_KEY;
    const publicKey = process.env.CUNFIN_RSA_PUBLIC_KEY;

    if (privateKey && publicKey) {
        console.log('Using provided key to generate JWT tokens');
        return { privateKey: privateKey, publicKey: publicKey };
    } else {
        console.log('No keys provides in environment variables to generate JWT tokens');
        console.log('Using keys from filesystem as fallback');

        try {
            // try to read key pair from file system
            const privateKeyFileSystem = fs.readFileSync(getFilePath(privateKeyFileName), 'utf-8');
            const publicKeyFileSystem = fs.readFileSync(getFilePath(publicKeyFileName), 'utf-8');

            return { privateKey: privateKeyFileSystem, publicKey: publicKeyFileSystem };

        } catch (error) {
            console.log('No keys found to generate JWT tokens. Generating new keys');
            return genKeyPair();
        }
    }
}

function getFilePath(filename) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.resolve(__filename, "..", "..", "..", "keys");

    if (!fs.existsSync(__dirname)) {
        fs.mkdirSync(__dirname);
        console.log('Key folder created successfully');
    }

    return path.join(__dirname, filename);
}

function genKeyPair() {
    // Generates an object where the keys are stored in properties `privateKey` and `publicKey`
    const keyPair = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096, // bits - standard for RSA keys
        publicKeyEncoding: {
            type: "pkcs1", // "Public Key Cryptography Standards 1"
            format: "pem", // Most common formatting choice
        },
        privateKeyEncoding: {
            type: "pkcs1", // "Public Key Cryptography Standards 1"
            format: "pem", // Most common formatting choice
        },
    });

    // Create the public key file
    fs.writeFileSync(getFilePath(publicKeyFileName), keyPair.publicKey);

    // Create the private key file
    fs.writeFileSync(getFilePath(privateKeyFileName), keyPair.privateKey);

    return keyPair;
}

export function issueJWT(claims) {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const payload = {
        sub: claims.subject,
        upn: claims.user_principal_name,
        roles: claims.roles,
        iat: currentTimestamp,
        iss: 'cunfin'
    };

    const expiresIn = '1d';

    return jsonwebtoken.sign(payload, keyPair.privateKey, {expiresIn: expiresIn, algorithm: algorithm});
}

export function verify(authorizationHeader) {
    const tokenParts = authorizationHeader.split(' ');

    // pattern of which the token should begin with
    const bearerPattern = /^bearer/i;

    // expected token structure
    const tokenPattern = /\S+\.\S+\.\S+/;

    // check if the token structure is valid
    if (bearerPattern.test(tokenParts[0]) && tokenParts[1].match(tokenPattern) !== null) {

        try {
            const verification = jsonwebtoken.verify(tokenParts[1], keyPair.publicKey, { algorithms: [algorithm] });

            return  true;
        } catch(err) {
            return  false;
        }

    } else {
        return false;
    }
}
