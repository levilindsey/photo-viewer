/**
 * This static module drives the PhotoViewer app.
 * @module app
 */
(function() {
  var SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

  var animate, ProgressCircle, PhotoLightbox, PhotoGrid;

  window.addEventListener('load', onDocumentLoad, false);

  function onDocumentLoad() {
    animate = window.app.animate;
    ProgressCircle = window.app.ProgressCircle;
    PhotoLightbox = window.app.PhotoLightbox;
    PhotoGrid = window.app.PhotoGrid;
    ProgressCircle.initStaticFields();
    PhotoLightbox.initStaticFields();
    PhotoGrid.initStaticFields();

    // TODO: remove the following
    var progressCircle, body, svg, left, top, diameter, dotRadius;

    body = document.getElementsByTagName('body')[0];
    body.style.width = '100%';
    body.style.height = '100%';
    body.style.margin = '0px';
    body.style.backgroundColor = '#202020';

    svg = document.createElementNS(SVG_NAMESPACE, 'svg');
    svg.style.position = 'absolute';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.zIndex = '2147483647';
    body.appendChild(svg);

    left = 100;
    top = 100;
    diameter = 300;
    dotRadius = 10;
    progressCircle = new ProgressCircle(svg, left, top, diameter, dotRadius);
    setTimeout(function() {
      progressCircle.close();
    }, 1000);
  }

  function onImageLoad() {
    // TODO: hide (and delete) the progress circle for this image
  }

  function onImageError() {
    // TODO:
    // - try again a couple times
    // - then display some error svg image that is generated from the code
    // - and make sure to also display the error image in the lightbox
    // - hide (and delete) the progress circle for this image
  }

// TODO: PLAN OF ATTACK
//  - simple grid of thumbnails
//  - then click on one to enlarge it into a lightbox
//    - this should animate the large image from the small position to the new large position
//    - there should be a progress circle--for the loading of the large image--that I display either over the small image (when first opening the lightbox) or over the large image (when switching to previous or next)
//    - will need to store the photos on another server
//      - GoDaddy? Gandi? AWS?
//      - take this opportunity to straighten out my GoDaddy woes
//  - will need to have two folders
//    - the main one has the actual original images, the other has the thumbnails
//    - the thumbnail folder must have the same name as the main folder
//    - the thumbnail folder must have a tiny copy of each of the images in the main folder, each with the exact same name, but with a suffix of "-thumbnail"
//    - will need to create a script to automatically generate the thumbnails
//    - document this (in addition to how to set up the other parameters of the viewer (like full/main image size, or whether the full image should be full screen, and small/grid/thumbnail image size)
//  - will need all images to be pre-rotated
//  - must set up CORS
//  - add the ability to group the photos
//    - this will require the server to hold a different pair of folders for each group
//    - the groups dynamically and smoothly enlarge/shrink as the user changes group selections
//  - place this app at jackieandlevi.com/wedding/photos
//    - add a link on the home page
//    - add a link on my projects page
//    - add a link, in the form of an eight bubble, to the invite page
//      - this may require fixing some bugs in the wedding swoosh logic...
//  - move the invite page to /wedding/invite
//    - but also show the invite page whenever anyone goes to /wedding

  if (!window.app) window.app = {};

  console.log('app module loaded');
})();
