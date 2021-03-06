'use strict';

const path = require('path');
const chalk = require('chalk');
const glob = require('../glob');
const { reporter } = require('../reporter');
const compile = require('../tools/compile');

async function check(pattern, { ignore, cwd } = {}) {
  reporter.info(`Running in: ${cwd}`);
  reporter.info(`Checking pattern: '${pattern}', ignoring: '${ignore}'`);
  // Assume globs are for checking scss files for now
  const files = await glob(pattern, {
    cwd,
    ignore,
  });
  const defaultOptions = {
    includePaths: ['node_modules', '../../node_modules'],
  };

  reporter.info(`Compiling ${files.length} files...`);

  const results = await Promise.all(
    compile(files.map(file => path.join(cwd, file)))
  );

  const errors = results.reduce((acc, result) => {
    if (result.error) {
      const error = result.error;
      error.filepath = result.filepath;
      return acc.concat(error);
    }
    return acc;
  }, []);

  if (errors.length > 0) {
    errors.forEach(error => {
      const { formatted, filepath } = error;
      reporter.error(`Error compiling ${path.relative(cwd, filepath)}`);
      console.log(chalk.gray(formatted));
    });
    process.exit(1);
    return;
  }

  reporter.success(`Successfully compiled ${files.length} files! 🎉`);
  process.exit(0);
}

module.exports = check;
