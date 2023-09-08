import { it } from "node:test";

const express = require('express');
const { compile } = require('html-to-text');
const { RecursiveUrlLoader } = require('langchain/document_loaders/web/recursive_url');
const fs = require('fs');
const cors = require('cors'); 

const app = express();
const port = 3000; // You can change this to your desired port

app.use(express.json());
app.use(cors());


app.post('/scraping', async (req:any, res:any) => {
    let data: any[] = [];
    const { url, maxDepth }: { url: string, maxDepth?: number } = req.body;

    const compiledConvert: (html: string) => string = compile({selectors: [ { selector: 'img', format: 'skip' },{ selector: 'a', options: { ignoreHref: true } } ]},
    );

    const loader = new RecursiveUrlLoader(url, {
        extractor: compiledConvert,
        maxDepth: maxDepth || 1,
    });
    
    try {
        const docs = await loader.load();
        const outputPath = 'output3.txt';
        
        const combinedText = docs.map((doc: any) => doc.pageContent).join('\n');

        fs.writeFile(outputPath, combinedText, (err: any) => {
            if (err) {
                console.error("Error writing to file:", err);
            } else {
                console.log("Text data written to file:", outputPath);
            }
        }
        );
        
       
        
        if (docs.length > 0) {
            const responseMessage = 'Scraping completed and files saved.';
            const responseSources = docs.map((doc: any) => doc.metadata.source);
            const responseContent = docs.map((doc: any) => doc.pageContent);
            const responseTitle = docs.map((doc: any) => doc.metadata.title);
            const responseLanguage = docs.map((doc: any) => doc.metadata.language);
            const responseUrls= docs.map((doc: any) => doc.metadata.source);
            data.push(responseContent);
            const responseData = {
               //message: responseMessage[0],
                sources: responseSources[0],
                content: responseContent[0],
                title: responseTitle[0],
                language: responseLanguage[0],
                urls: responseUrls,
                Urlcontent: responseContent,
            };
            res.status(200).json(responseData);
        } else {
            res.status(500).json({ message: 'No documents found.' });
        }
       
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred during scraping.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
