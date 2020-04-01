const express = require('express');
var cors = require('cors');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const server = next({ dev });
const handle = server.getRequestHandler();

server.prepare()
    .then(() => {
        const app = express();
        app.use(cors({origin:true,credentials: true}));
        // app.use('/public', express.static('public'));

        app.get('*', (req, res) => {
            res.header("Access-Control-Allow-Origin", req.headers.origin);
            res.header("Access-Control-Allow-Headers", "x-requested-with, content-type");
            res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
            res.header("Access-Control-Allow-Credentials", "true");
            return handle(req, res)
        });

        app.listen(3000, (err) => {
            if (err) throw err;
            console.log('> Ready on http://localhost:3000')
        })
    })
    .catch((ex) => {
        console.error(ex.stack);
        process.exit(1)
    });
