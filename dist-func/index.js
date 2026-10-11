import { onRequest } from 'firebase-functions/v2/https';
import next from 'next';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dev = false;
const dir = __dirname;
// .next is in the same directory because we copied it there.
const conf = {
    distDir: '.next',
    compress: true,
};

const app = next({ dev, conf, dir });
const handle = app.getRequestHandler();

export const ssrcortexdcweb = onRequest({ region: 'us-central1' }, (req, res) => {
    return app.prepare().then(() => handle(req, res));
});
