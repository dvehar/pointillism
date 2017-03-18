'use strict';

var WHITE = 255;
var LOCAL_IMAGES = ['./images/tree.jpg', './images/three.png', './images/mar.jpg', './images/bird.png', './images/ballon.png', './images/a_starry_night.png', './images/Vincent_van_Gogh.png'];

var local_image_idx = -1; // the idx into LOCAL_IMAGES if it is being used.

var canvas = null;
var ctx = null;
var ori_data = []; // a flat list of pixels from the original image: [pixel1.R, pixel1.G, pixel1.B, pixel1.A, pixel2.R, pixel2.G, pixel2.B, pixel2.A, ...]
var imageData = null;function putImage(imgSource, isWeb) {
  // Create an image object.
  var image = new Image();

  // Can't do anything until the image loads.
  // Hook its onload event before setting the src property.
  image.onload = function () {

    if (ctx == null) {
      // Create a canvas
      canvas = $('#canvas')[0];

      // Get the drawing context.
      ctx = canvas.getContext('2d');
    }

    // Get the width/height of the image and set
    // the canvas to the same size.
    var width = image.width;
    var height = image.height;

    canvas.width = width;
    canvas.height = height;

    // Draw the image to the canvas.
    ctx.drawImage(image, 0, 0);

    // Get the image data from the canvas, which now contains the contents of the image.
    imageData = ctx.getImageData(0, 0, width, height);

    // The actual RGBA values are stored in the data property.
    var pixelData = imageData.data;

    // Loop through every pixel - this could be slow for huge images.
    for (var startIdx = 0; startIdx < imageData.data.length; startIdx += 4) {
      // Get the alpha and if it is 0 (no color at all then set the pixel to white)
      var red = void 0;
      var green = void 0;
      var blue = void 0;
      var alpha = pixelData[startIdx + 3];
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
      var grayScale = red * 0.2989 + green * 0.5870 + blue * 0.1140;
    }

    if (isWeb) {
      local_image_idx = -1;
    }

    // start the processing and display intervals.
    if (isProcessing()) {
      alert('the processing interval should not be set'); // debugging
    } else if (isDrawing()) {
        alert('the display interval should not be set'); // debugging
      } else {
          if (selectedDirectionFillButton == CENTER_FILL_BUTTON) {
            processingSpeed = FRAME_PROCESSING_SPEED;
            displaySpeed = FRAME_DISPLAY_SPEED;
            pixelsPerProcessingInterval = imageData.data.length / 4; // all the pixels
          } else {
              processingSpeed = LINE_PROCESSING_SPEED;
              displaySpeed = LINE_DISPLAY_SPEED;
              if (selectedDirectionFillButton == $('#RightFillButton')[0] || selectedDirectionFillButton == $('#LeftFillButton')[0]) {
                pixelsPerProcessingInterval = canvas.height;
              } else if (selectedDirectionFillButton == $('#UpFillButton')[0] || selectedDirectionFillButton == $('#DownFillButton')[0]) {
                pixelsPerProcessingInterval = canvas.width;
              } else {
                //} else if (selectedDirectionFillButton == $('#LeftDownFillButton') || selectedDirectionFillButton == $('#RightDownFillButton') ) {
                // diagonal
                updatePixelsPerProcessingInterval();
              }
            }
          toggleProcessing();
          toggleDrawing();
        }
  };

  image.onerror = function () {
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

  //console.log('out putImage');
}

$(document).ready(function () {
  putImage(null, false);
});
