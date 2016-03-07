'use strict';

import commander from 'commander';
import mkdirp from 'mkdirp';

export function mkdir (path) {
  mkdirp(path);
}

export function cmd () {
  commander.version('0.0.1')
    .option('-b, --begin <n>', 'Begin page num', parseInt)
    .option('-e, --end <n>', 'End page num', parseInt)
    .parse(process.argv);

  if (!commander.begin || !commander.end || commander.begin > commander.end) {
    console.log('argument wrong.');
    commander.outputHelp();
    process.exit();
  }

  return {
    beginPage: commander.begin,
    endPage: commander.end
  };
}
