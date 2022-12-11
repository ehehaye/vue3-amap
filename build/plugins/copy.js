import fs from 'fs/promises';
import path from 'path';
import copy from 'recursive-copy';

/**
 * @type {() => import('vite').Plugin}
 */
export default () => ({
  apply: 'build',
  closeBundle() {
    /* eslint-disable global-require */
    const {
      name, description, version, keywords, author, license, repository, dependencies,
    } = require('../../package.json');

    const content = {
      name,
      description,
      version,
      keywords,
      author,
      license,
      repository,
      dependencies,
      type: 'module',
      main: './index.es.js',
      module: './index.es.js',
      exports: {
        '.': {
          import: './index.es.js',
        },
        './style.css': './style.css',
      },
    };

    return Promise.all([
      fs.writeFile(path.resolve(__dirname, '../../lib/package.json'), JSON.stringify(content, null, '\t')),
      copy(path.resolve(__dirname, '../../LICENSE'), path.resolve(__dirname, '../../lib/LICENSE'), { overwrite: true }),
      copy(path.resolve(__dirname, '../../packages/constants'), path.resolve(__dirname, '../../lib/constants'), { overwrite: true }),
    ]);
  },
});
