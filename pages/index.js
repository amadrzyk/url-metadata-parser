import Head from 'next/head'
import React from 'react'
import CsvDownloader from 'react-csv-downloader';
import axios from 'axios'

class Home extends React.Component{
    state = {
        urlText: "",
        loading: false,
        errText: "",
        csv: {
            loaded: false,
            columns: [],
            datas: []
        }
    };

    onTextChange = (e) => {
        this.setState({
            urlText: e.target.value
        })
    };

    handleConvertButtonClick = async () => {

        if (this.state.urlText === null || this.state.urlText === '')
            return;

        // change loading state to true
        this.setState({
            loading: true,
            errText: '',
            csv: {
                loaded: false
            }
        });

        // split array into chunks of 15
        let urlArray = this.state.urlText.split(/\n/);
        urlArray = urlArray.filter(url => { // remove whitespace only
            if (url !== null && /\S/.test(url)) return url
        });
        let urlArrayChunks = [];
        let chunk = 10;
        for (let i = 0; i < urlArray.length; i += chunk){
            urlArrayChunks.push(urlArray.slice(i, i + chunk))
        }

        // create array of promises
        let responseChunksResult = [];
        try {
            let responseChunksPromise = urlArrayChunks.map(arrayChunk => {
                return axios.post('/api/fetch-html',
                    {urls: arrayChunk},
                    {
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                        }
                    }
                )
            });

            // await all
            responseChunksResult = await Promise.all(responseChunksPromise);

            // check if any of the results had errors
            for (const result of responseChunksResult){
                if (result.status === 502)
                    throw `${result.data.err}. Please check your now.sh account limits.`;

                if (result.data.err)
                    throw result.data.err;
            }

        } catch (err){
            console.error(err);
            this.setState({
                loading: false,
                errText: `Sorry, there was an error getting a response from our server:\n${err}`,
                csv: {
                    loaded: false
                }
            });
            return;
        }

        // combine responses into 1 array
        let metadatas = [];
        console.log('responseChunksResult', responseChunksResult);
        for (const result of responseChunksResult){
            metadatas.push(...result.data.metadatas);
        }

        // convert to csv format
        let header = Object.keys(metadatas[0]);
        let datas = metadatas.map(row => {
            return header.map(fieldName => {
                return row.hasOwnProperty(fieldName) && row[fieldName] !== null
                    ? row[fieldName].replace(/,/g, "")
                    : ''
            })
        });

        // set state!
        this.setState({
            loading: false,
            csv: {
                loaded: true,
                columns: header,
                datas
            }
        })
    };

    render(){
        return (
            <div className="container">
                <Head>
                    <title>URL Metadata Extractor</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                <main>
                    <h1 className="title">
                        Add a list of urls on the left side,<br />
                        then download the metadata csv on the right!
                    </h1>

                    <br />

                    <div style={{width: "100%", display: "flex"}}>
                        <div style={{width: "50%", padding: 20, textAlign: "center"}}>
                            <textarea onChange={this.onTextChange} style={{width: "90%", height: 300}} placeholder="Example: &#10;https://www.cnn.com/2020/03/26/health/coronavirus-latest-updates-intl/index.html &#10;https://www.nytimes.com/2020/03/26/world/coronavirus-news.html" />
                            <br />
                            <button onClick={this.handleConvertButtonClick}>Step 1: Convert to CSV →</button>
                        </div>
                        <div style={{width: "50%", padding: 20, textAlign: "center"}}>
                            {this.state.loading && <p>Fetching your data...</p>}
                            {this.state.errText !== '' && <p style={{wordWrap: 'break-word'}}>{this.state.errText}</p>}
                            {this.state.csv.loaded &&
                                <CsvDownloader
                                    filename="myfile"
                                    separator=","
                                    wrapColumnChar=""
                                    columns={this.state.csv.columns}
                                    datas={this.state.csv.datas}
                                    text="Step 2: DOWNLOAD"
                                />
                            }
                        </div>
                    </div>
                </main>

                <footer>
                    <p style={{flex: 1}}>
                        Created by: <a href="https://twitter.com/alexmadrzyk" target="_blank">@<u>alexmadrzyk</u></a> &nbsp;//&nbsp;&nbsp;
                        <a
                            href="https://zeit.co?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Powered by <img src="/zeit.svg" alt="ZEIT Logo" />
                        </a>
                    </p>
                </footer>
            </div>
        )
    }
}

export default Home;
