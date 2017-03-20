const WHITE = 255;
const BLACK = 0;
const LOCAL_IMAGES = [
  './images/tree.jpg',
  './images/three.png',
  './images/mar.jpg',
  './images/bird.png',
  './images/ballon.png',
  './images/a_starry_night.png',
  './images/Vincent_van_Gogh.png',
  './images/lady.png',
  './images/obama.png'
];

let local_image_idx = -1; // the idx into LOCAL_IMAGES if it is being used.
let default_local_image_idx = 8;

let canvas = null;
let ctx = null;
let ori_data = []; // a flat list of pixels from the original image: [pixel1.R, pixel1.G, pixel1.B, pixel1.A, pixel2.R, pixel2.G, pixel2.B, pixel2.A, ...]
let imageData = null; // the imageData from canvas.getContext('2d').getImageData(...)

let displayIntervalId = null;
let displaySpeed = 300;
let processingIntervalId = null;
let processingSpeed = 800;

let dotSize = 2;
// the surrounding pixels:
// A B C
// D _ E
// F G H
let surroundingPixels = generateSurronding(dotSize * 2 - 1);

// imageData is flat array and every group of four indicies denotes the RGBA values for a pixel
function get_pixel_count() {
  return imageData.data.length / 4;
}

function get_row_count() {
  return canvas.height;
}

function get_col_count() {
  return canvas.width;
}

function putImage(imgSource, isWeb) {
  // Create an image object.
  let image = new Image();

  // Can't do anything until the image loads.
  // Hook its onload event before setting the src property.
  image.onload = () => {

    if (ctx == null) {
      // Create a canvas
      canvas = $('#canvas')[0];

      // Get the drawing context.
      ctx = canvas.getContext('2d');
    }

    // Get the width/height of the image and set
    // the canvas to the same size.
    let width = image.width;
    let height = image.height;

    canvas.width = width;
    canvas.height = height;

    // Draw the image to the canvas.
    ctx.drawImage(image, 0, 0);

    // Get the image data from the canvas, which now contains the contents of the image.
    imageData = ctx.getImageData(0, 0, width, height);

    // The actual RGBA values are stored in the data property.
    let pixelData = imageData.data;

    // Loop through every pixel - this could be slow for huge images.
    for (let startIdx = 0; startIdx < imageData.data.length; startIdx += 4) {
      // Get the alpha and if it is 0 (no color at all then set the pixel to white)
      let red;
      let green;
      let blue;
      let alpha = pixelData[startIdx + 3];
      if (alpha === 0) {
        red = pixelData[startIdx] = WHITE;
        green = pixelData[startIdx + 1] = WHITE;
        blue = pixelData[startIdx + 2] = WHITE;
      } else {
        red = pixelData[startIdx];
        green = pixelData[startIdx + 1];
        blue = pixelData[startIdx + 2];
      }
      pixelData[startIdx + 3] = 255; // opaque
      ori_data.push(red);
      ori_data.push(green);
      ori_data.push(blue);
      ori_data.push(255);
    }

    if (isWeb) {
      local_image_idx = -1;
    }

    var id = setTimeout(function() {
      computeFrame();
    }, 100);
  };

  image.onerror = () => {
    console.error('Failed to load image');
    alert('I couldn\'t load the image.');
  };

  // Load an image to convert.
  if (imgSource == null) {
    local_image_idx = default_local_image_idx;
    image.src = LOCAL_IMAGES[local_image_idx];
  } else {
    image.src = imgSource;
  }

  // this line helps allow loading images
  if (isWeb) {
    image.crossOrigin = ''; // no credentials flag. Same as img.crossOrigin='anonymous'
  }
}

// 0 indexed
function getPixel (row, col) {
  let minRow = 0;
  let maxRow = get_row_count() - 1;
  let minCol = 0;
  let maxCol = get_col_count() - 1;

  if (row < minRow || row > maxRow || col < minCol || col > maxCol) {
    return null;
  } else {
    let pixelsPerCol = 4;
    let pixelsPerRow = get_col_count() * pixelsPerCol;
    let basePixelIdx = (row * pixelsPerRow) + (col * pixelsPerCol);
    return [
      imageData.data[basePixelIdx],
      imageData.data[basePixelIdx + 1],
      imageData.data[basePixelIdx + 2],
      imageData.data[basePixelIdx + 3]
    ];
  }
}
// a0 a1 a2 a3 b0 b1 b2 b3 c0 c1 c2 c3 d0 d1 d2 d3
// e0 e1 e2 e3 f0 f1 f2 f3 g0 g1 g2 g3 h0 h1 h2 h3
// i0 i1 i2 i3 j0 j1 j2 j3 k0 k1 k2 k3 l0 l1 l2 l3
// m0 m1 m2 m3 n0 n1 n2 n3 o0 o1 o2 o3 p0 p1 p2 p3

// a b c d
// e f g h
// i j k l
// m n o p

function generateSurronding(radius) {
  var result = [];

  for (var row = -radius; row <= radius; ++row) {
    for (var col = -radius; col <= radius; ++col) {
      if (row !== 0 || col !== 0) {
        result.push({
          row: row,
          col: col
        });
      }
    }
  }

  return result;
}

function computeFrame() {
  console.log('computeFrame >');
  // loop through all the pixels
  let stepSize = Math.floor(dotSize / 2);
  console.log(get_row_count());
  console.log(get_col_count());
  let rowIdx;
  let colIdx;
  for (rowIdx = 0; rowIdx < get_row_count(); rowIdx += stepSize) {
  // for (let rowIdx = 0; rowIdx < 100; ++rowIdx) {
    console.log('Row start');
  
    for (colIdx = 0; colIdx < get_col_count(); colIdx += stepSize) {
    // for (let colIdx = 0; colIdx < 30; ++colIdx) {
      let shuffeledSurrounding = randomSortArray(surroundingPixels);
      let clean = [];
      for (var i=0; i < shuffeledSurrounding.length && clean.length < 3; ++i) {
        var cords = shuffeledSurrounding[i];
        // var pixel = getPixel(colIdx - cords.col, rowIdx - cords.row);
        var pixel = getPixel(rowIdx - cords.row, colIdx - cords.col);
        if (pixel !== null) {
          clean.push(pixel);
        }
      }
      for (var i=0; i < clean.length; ++i) {
        var color = rgbToHex(clean[i][0], clean[i][1], clean[i][2]); // '#ff0000';
        ctx.fillStyle = color;
        ctx.beginPath();
        var rowRand = Math.floor(Math.random() * 3);
        var rowChange;
        if (rowRand === 0) {
          rowChange = -1;
        } else if (rowRand === 1) {
          rowChange = 0;
        } else {
          rowChange = 1;
        }
        var colRand = Math.floor(Math.random() * 3);
        var colChange;
        if (rowRand === 0) {
          colChange = -1;
        } else if (rowRand === 1) {
          colChange = 0;
        } else {
          colChange = 1;
        }
        var row = Math.max(0, rowIdx + rowChange);
        var col = Math.max(0, colIdx + colChange);
        ctx.arc(col, row, dotSize, 0, Math.PI * 2, true);
        ctx.fill();
        // console.log('color: ' + color);
        // console.log('row: ' + row);
        // console.log('col: ' + col);
      } 
    } 
  }
  console.log(rowIdx);
  console.log(colIdx);

  // for (var k=0; k < 3000; k += 4) {
  //   imageData.data[k] = 255;
  //   imageData.data[k + 1] = 0;
  //   imageData.data[k + 2] = 0;
  //   // imageData.data[basePixelIdx + 3]  
  // }
  // ctx.putImageData(imageData, 0, 0);
  
  console.log('< computeFrame');
}

function displayFrame() {
  console.log('displayFrame >');
  ctx.putImageData(imageData, 0, 0);
  console.log('< displayFrame');
}

$(document).ready(() => {
  putImage(null, false);
});
