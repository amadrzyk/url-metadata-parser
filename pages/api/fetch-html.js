import axios from 'axios'
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

export default async (req, res) => {
    // get urls
    let targetUrls = req.body.urls;
    if (targetUrls === null)
        return res.json({err: 'targetUrls is empty'});
    if (!Array.isArray(targetUrls))
        targetUrls = [targetUrls];

    // for each url, fetch html and extract metadata
    try {
        // 1. make array of promises
        const fetchHtmlPromises = targetUrls.map(targetUrl => {
            return axios.get(targetUrl, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    "Access-Control-Allow-Headers": "x-requested-with, content-type",
                    "Access-Control-Allow-Methods": "GET,PUT,POST,DELETE,OPTIONS",
                    "Access-Control-Allow-Credentials": "true"
                }
            }).catch(err => {
                throw `There was an issue with the url '${targetUrl}'. Please revise or remove and try again. Error msg: '${err}'`
            });
        });

        // 2. do promise.all, and fail fast
        let fetchedHtmlsResult = await Promise.all(fetchHtmlPromises);

        // 3. run metascraper on each result
        let metadatasPromises = fetchedHtmlsResult.map((fetchedHtmlResult, index) => {
            return metascraper({
                html: fetchedHtmlResult.data,
                url: targetUrls[index]
            })
        });
        let metadatasResult = await Promise.all(metadatasPromises);
        return res.json({metadatas: metadatasResult})

    } catch (err) {
        return res.json({err});
    }


}