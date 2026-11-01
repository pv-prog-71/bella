/* Core constants shared by every module (loaded first, after lang/ and i18n) */
const W = 960,
  H = 540; // logical canvas size; the canvas is scaled to fit the window
const GY = 400; // ground line of every level (world y)
const SAVE_KEY = 'bellas_journey_save_v1';
const FONT = "'Fredoka','Trebuchet MS','Segoe UI',system-ui,sans-serif";
const BELLA_HEAD_SRC = 'assets/images/bella_bark_head.png'; // head with the mouth open (bundle builder swaps it for a data: URI too)
const BELLA_SRC = 'assets/images/bella.png'; // the bundle builder swaps this for an inline data: URI
