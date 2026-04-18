const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><div id="gallery-grid"></div>');
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.HTMLElement = dom.window.HTMLElement;
global.NodeList = dom.window.NodeList;
global.HTMLVideoElement = dom.window.HTMLVideoElement;
global.HTMLImageElement = dom.window.HTMLImageElement;

// Mock fetch
global.fetch = () => Promise.resolve({
  ok: true,
  json: () => Promise.resolve(require('./data/portfolio.json'))
});

// Mock Core
global.Core = {
  DOM: {
    createFragment: (items, renderer) => {
      const fragment = document.createDocumentFragment();
      items.forEach((item, idx) => {
        const rendered = renderer(item, idx);
        if (rendered) fragment.appendChild(rendered);
      });
      return fragment;
    }
  },
  Media: {
    createItem: (image, index, allItems, categoryFormatter) => {
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.dataset.index = index;

      const media = document.createElement(image.type === 'video' ? 'video' : 'img');
      item.appendChild(media);

      const overlay = document.createElement('div');
      overlay.className = 'gallery-overlay';
      item.appendChild(overlay);

      item.onclick = () => {}; // Simulating the listener attachment overhead
      return item;
    }
  },
  VideoHover: { init: () => {} },
  VideoObserver: { observe: () => {} }
};

const fs = require('fs');
const contentLoaderCode = fs.readFileSync('./scripts/content-loader.js', 'utf8');

// Use eval to load the class but avoid the DOMContentLoaded part
const ContentLoader = (function() {
    // Remove the auto-init part at the end
    const code = contentLoaderCode.split('// Initialize content loader')[0];
    eval(code + '\n module.exports = ContentLoader;');
    return module.exports;
})();

async function runBenchmark() {
    const loader = new ContentLoader();
    await loader.loadData();

    console.time('populateGallery');
    loader.populateGallery();
    console.timeEnd('populateGallery');
}

runBenchmark();
