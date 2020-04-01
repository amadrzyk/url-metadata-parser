import { NowRequest, NowResponse } from '@now/node'
const qs = require('querystring');
const axios = require('axios');
const metascraper = require('metascraper')([
    require('metascraper-title')(),
    require('metascraper-author')(),
    require('metascraper-date')(),
    require('metascraper-description')(),
    require('metascraper-image')(),
    require('metascraper-logo')(),
    require('metascraper-publisher')(),
    require('metascraper-url')(),
    require('metascraper-lang')(),
]);

export default async (req: NowRequest, res: NowResponse) => {
    // get urls
    const urlsText = req.query.urls;
    if (urlsText === null || urlsText === '')
        return res.json({});

    // @ts-ignore / split urls to array
    const targetUrls = urlsText.split(/\r?[\n,\s]/);
    let metadatas = [];

    // for each url, fetch html and extract metadata
    for (const targetUrl of targetUrls){
        let result = await axios.get(targetUrl, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                "Access-Control-Allow-Headers": "x-requested-with, content-type",
                "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
                "Access-Control-Allow-Credentials": "true"
            }
        });

        const html = result.data;
        const url = result.config.url;
        const metadata = await metascraper({ html, url });
        metadatas.push(metadata)
    }

    return res.json({metadatas})
}