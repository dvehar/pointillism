import { DO_NOTHING, hexToRgb, myXor, randomInt } from './util';

const WHITE = 255;
const BLACK = 0;
const LOCAL_IMAGES = [
  './images/tree.jpg',
  './images/three.png',
  './images/mar.jpg',
  './images/bird.png',
  './images/ballon.png',
  './images/a_starry_night.png',
  './images/Vincent_van_Gogh.png'
];

let local_image_idx = -1; // the idx into LOCAL_IMAGES if it is being used.

let canvas = null;
let ctx = null;
let ori_data = []; // a flat list of pixels from the original image: [pixel1.R, pixel1.G, pixel1.B, pixel1.A, pixel2.R, pixel2.G, pixel2.B, pixel2.A, ...]
let imageData = null; // the imageData from canvas.getContext('2d').getImageData(...)

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

function set_random_image_source() {
  let tmp_idx = Math.floor(Math.random() * LOCAL_IMAGES.length);
  if (tmp_idx == local_image_idx) {
    tmp_idx = (tmp_idx + 1) % LOCAL_IMAGES.length;
  }
  local_image_idx = tmp_idx;

  let imgSource = LOCAL_IMAGES[local_image_idx];
  // stop the processing and display intervals. start once new image is loaded.
  // big reason to stop is because the image might fail to load
  if (isProcessing()) {
    clearInterval(processingIntervalId);
    processingIntervalId = null;
  }
  if (isDrawing()) {
    clearInterval(displayIntervalId);
    displayIntervalId = null;
  }

  ori_data = [];

  putImage(imgSource, false);
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

      // Convert to grayscale.
      let grayScale = red * 0.2989 + green * 0.5870 + blue * 0.1140;
    }

    if (isWeb) {
      local_image_idx = -1;
    }
  };

  image.onerror = () => {
    console.error('Failed to load image');
    alert('I couldn\'t load the image.');
  };

  // Load an image to convert.
  if (imgSource == null) {
    local_image_idx = 0;
    image.src = LOCAL_IMAGES[local_image_idx];
  } else {
    image.src = imgSource;
  }

  // this line helps allow loading images
  if (isWeb) {
    image.crossOrigin = ''; // no credentials flag. Same as img.crossOrigin='anonymous'
  }
}



$(document).ready(() => {
  putImage(null, false);
});
