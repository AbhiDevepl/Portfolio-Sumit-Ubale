const fs = require('fs');
const path = require('path');

// Mock a minimal environment to test media type detection in the new logic
const regex = /(\d+)\.(jpe?g|mp4|mov)$/i;

function testTypeDetection() {
  const testCases = [
    { src: '1.jpg', expected: 'image' },
    { src: '2.jpeg', expected: 'image' },
    { src: '3.mp4', expected: 'video' },
    { src: '4.MOV', expected: 'video' },
    { src: '5.jpg?w=800', expected: 'image' },
    { src: '6.MP4?q=80', expected: 'video' }
  ];

  testCases.forEach(tc => {
    const srcWithoutParams = tc.src.split('?')[0];
    const lowerSrc = srcWithoutParams.toLowerCase();
    const isVideo = lowerSrc.endsWith('.mp4') || lowerSrc.endsWith('.mov');
    const isJpg = lowerSrc.endsWith('.jpg') || lowerSrc.endsWith('.jpeg');
    const type = isVideo ? 'video' : (isJpg ? 'image' : 'unknown');

    if (type !== tc.expected) {
      console.error(`FAIL: Expected ${tc.expected} for ${tc.src}, but got ${type}`);
      process.exit(1);
    }
  });
  console.log('Type detection test PASSED');
}

testTypeDetection();
