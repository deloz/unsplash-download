'use strict';

import 'babel-polyfill';
import path from 'path';
import Spider from  './lib/spider';
import * as utils from './lib/utils';

let {beginPage, endPage} = utils.cmd();
let downloadPath = path.join(process.cwd(), 'unsplash');
utils.mkdir(downloadPath);

const spider = new Spider(downloadPath, beginPage, endPage);
spider.start();
