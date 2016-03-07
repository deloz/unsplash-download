'use strict';

import "babel-polyfill";
import request from 'request';
import cheerio from 'cheerio';
import url from 'url';
import fs from 'fs';

const BASE_URL = 'https://unsplash.com/';

export default class Spider {
  constructor (downloadPath, begin = 1, end = 1) {
    this.downloadPath = downloadPath;
    this.beginPage = begin;
    this.endPage = end;
    this.totalItemCount = 0;
    this.downloadCompleteItemCount = 0;
  }

  async fetch (uri, encoding = undefined) {
    return new Promise((resolve, reject) => {
      console.log('start -> request url: ', uri);
      request({
        uri: uri,
        headers: {
          Accept: '*/*; q=0.01',
          'Accept-Encoding': 'gzip,deflate',
          'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.4',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          Referer: 'https://unsplash.com/',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.116 Safari/537.36',
        },
        encoding: encoding
      }, (error, response) => {
        if (!error && response.statusCode === 200) {
          resolve(response);
        } else {
          reject(error);
        }
        console.log('over -> request url: %s\n', uri);
      });
    });
  }

  async fetchPages () {
    let promises = new Array(this.endPage + 2 - this.beginPage)
      .fill({}, this.beginPage)
      .map((_, page) => {
        return this.fetch(`https://unsplash.com/?page=${page}`);
      });

    return await Promise.all(promises);
  }

  parsePictureUrls (pages) {
    let picUrls = [];
    for (let page of pages) {
      if (page) {
        let $ = cheerio.load(page.body);
        picUrls = $('.photo-description__download a').map((i, el) => {
          return url.resolve(BASE_URL, $(el).attr('href'));
        }).get();
      }
    }

    return picUrls;
  }

  downloadPicture (picUrl, callback) {
    let filename = picUrl.match(/photos\/([^/]*)\/download/)[ 1 ];

    request(picUrl)
      .on('error', (err) => {
        callback(err);
      })
      .on('end', () => {
        callback(null, picUrl);
      })
      .pipe(fs.createWriteStream(`${this.downloadPath}/${filename}.jpg`));
  }

  async start () {
    try {
      console.log('spider start');
      let pages = await this.fetchPages();
      let picUrls = this.parsePictureUrls(pages);
      this.totalItemCount = picUrls.length;
      console.log('total picture url: [ %d ]', this.totalItemCount);
      console.log('begin download pictures...');
      for (let i = 0; i< this.totalItemCount; i++) {
        this.downloadPicture(picUrls[i], (err) => {
          if (err) {
            throw err;
          } else {
            this.downloadCompleteItemCount++;
            console.log('done downloading. [%d/%d]', this.downloadCompleteItemCount, this.totalItemCount);
          }
        });
      }
    } catch (e) {
      console.log('error=>', e.message);
      process.exit(0);
    }
  }
}
