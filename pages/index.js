import Head from 'next/head'
import React from 'react'
import CsvDownloader from 'react-csv-downloader';
const axios = require('axios');
const qs = require('querystring');

class Home extends React.Component{
    state = {
        urlText: "",
        loading: false,
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
        this.setState({loading: true});

        // fetch metadata for all URLs
        const response = await axios.get('/api/fetch-html?' + qs.encode({
            urls: this.state.urlText
        }), {
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        });

        // convert to csv format
        let metadatas = response.data.metadatas;
        let header = Object.keys(metadatas[0]);
        let datas = metadatas.map(row => header.map(fieldName => row[fieldName] === null ? '' : row[fieldName].replace(/,/g, "")));

        this.setState({
            loading: false,
            csv: {
                loaded: true,
                columns: header, datas
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
                        <div style={{flex: 1, padding: 20, textAlign: "center"}}>
                            <textarea onChange={this.onTextChange} style={{width: "90%", height: 300}} placeholder="Example: &#10;https://www.cnn.com/2020/03/26/health/coronavirus-latest-updates-intl/index.html &#10;https://www.nytimes.com/2020/03/26/world/coronavirus-news.html" />
                            <br />
                            <button onClick={this.handleConvertButtonClick}>Step 1: Convert to CSV →</button>
                        </div>
                        <div style={{flex: 1, padding: 20, textAlign: "center"}}>
                            {this.state.loading && <p>Fetching your data...</p>}
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
                        Created by: <a href="https://twitter.com/alexmadrzyk" target="_blank">@alexmadrzyk</a> &nbsp;//&nbsp;&nbsp;
                        <a
                            href="https://zeit.co?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Powered by <img src="/zeit.svg" alt="ZEIT Logo" />
                        </a>
                    </p>

                </footer>

                <style jsx>{`
          .container {
            min-height: 100vh;
            padding: 0 0.5rem;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
    
          main {
            padding: 5rem 0;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
    
          footer {
            width: 100%;
            height: 100px;
            border-top: 1px solid #eaeaea;
            display: flex;
            text-align: center;
            align-items: center;
          }
    
          footer img {
            margin-left: 0.5rem;
          }
    
          a {
            color: inherit;
            text-decoration: none;
          }
    
          .title a {
            color: #0070f3;
            text-decoration: none;
          }
    
          .title a:hover,
          .title a:focus,
          .title a:active {
            text-decoration: underline;
          }
    
          .title {
            margin: 0;
            line-height: 1.15;
            font-size: 4rem;
          }
    
          .title,
          .description {
            text-align: center;
          }
    
          .description {
            line-height: 1.5;
            font-size: 1.5rem;
          }
    
          code {
            background: #fafafa;
            border-radius: 5px;
            padding: 0.75rem;
            font-size: 1.1rem;
            font-family: Menlo, Monaco, Lucida Console, Liberation Mono,
              DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
          }
    
          .grid {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
    
            max-width: 800px;
            margin-top: 3rem;
          }
    
          .card {
            margin: 1rem;
            flex-basis: 45%;
            padding: 1.5rem;
            text-align: left;
            color: inherit;
            text-decoration: none;
            border: 1px solid #eaeaea;
            border-radius: 10px;
            transition: color 0.15s ease, border-color 0.15s ease;
          }
    
          .card:hover,
          .card:focus,
          .card:active {
            color: #0070f3;
            border-color: #0070f3;
          }
    
          .card h3 {
            margin: 0 0 1rem 0;
            font-size: 1.5rem;
          }
    
          .card p {
            margin: 0;
            font-size: 1.25rem;
            line-height: 1.5;
          }
    
          @media (max-width: 600px) {
            .grid {
              width: 100%;
              flex-direction: column;
            }
          }
        `}</style>

                <style jsx global>{`
          html,
          body {
            padding: 0;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
              Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
          }
    
          * {
            box-sizing: border-box;
          }
        `}</style>
            </div>
        )
    }
}

export default Home;
