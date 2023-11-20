import fs from 'node:fs';
import path from "path";
import {fileURLToPath} from "url";

const privateKeyFileName = 'key.pem';
const certFileName = 'cert.pem';


export function loadSslCert() {

    const certData = process.env.TLS_CERT;
    const keyData = process.env.TLS_PRIVATE_KEY;

    if (certData && keyData)
        return {cert: Buffer.from(certData), key: Buffer.from(keyData)};

    console.log('No TLS cert provides in environment variables');
    console.log('Using cert from filesystem as fallback');

    try {
        // try to read key pair from file system
        const certData = fs.readFileSync(getFilePath(certFileName), 'utf-8');
        const keyData = fs.readFileSync(getFilePath(privateKeyFileName), 'utf-8');

        return {cert: Buffer.from(certData), key: Buffer.from(keyData)};

    } catch (error) {
        console.log('No fallback TLS cert found');
        return null;
    }
}

function getFilePath(filename) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.resolve(__filename, "..", "..", "..", "certs");

    return path.join(__dirname, filename);
}
