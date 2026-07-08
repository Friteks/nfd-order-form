// Coordinate map extracted from assets/order-form-template.pdf (14 pages, A4 595.32 x 841.92 pt)
// via pdfplumber. All top/bottom values are measured from the TOP of the page (pdfplumber
// convention). Helper functions below convert to pdf-lib's bottom-left origin.

const PAGE_W = 595.32;
const PAGE_H = 841.92;

// page indices are 0-based (page 1 of the PDF = index 0)
const CHECKBOXES = {
  head_type_1: { page: 0, x0: 424.9, top: 380.9, x1: 433.1, bottom: 391.9 },
  head_type_2: { page: 0, x0: 424.9, top: 401.6, x1: 433.1, bottom: 412.6 },
  head_type_3: { page: 0, x0: 424.9, top: 422.1, x1: 433.2, bottom: 433.1 },
  ordered_before_yes: { page: 0, x0: 318.7, top: 640.6, x1: 327.0, bottom: 651.6 },
  ordered_before_no: { page: 0, x0: 318.8, top: 661.1, x1: 327.0, bottom: 672.2 },
  proportion_standard: { page: 0, x0: 318.8, top: 718.2, x1: 327.1, bottom: 729.3 },
  proportion_larger: { page: 0, x0: 318.8, top: 738.8, x1: 327.1, bottom: 749.8 },
  proportion_smaller: { page: 0, x0: 318.8, top: 759.3, x1: 327.1, bottom: 770.3 },
  eye_type_1: { page: 1, x0: 318.6, top: 273.2, x1: 327.6, bottom: 285.2 },
  eye_type_2: { page: 1, x0: 318.6, top: 294.4, x1: 326.9, bottom: 305.4 },
  wig_treatment_default: { page: 1, x0: 318.6, top: 351.4, x1: 326.9, bottom: 362.4 },
  wig_treatment_noheat: { page: 1, x0: 318.6, top: 371.9, x1: 326.9, bottom: 383.0 },
  ponytail_loose: { page: 1, x0: 318.6, top: 576.0, x1: 326.9, bottom: 587.1 },
  ponytail_glued: { page: 1, x0: 318.6, top: 596.6, x1: 326.9, bottom: 607.6 },
  ponytail_detachable: { page: 1, x0: 318.6, top: 617.2, x1: 326.9, bottom: 628.2 },
  skin_default: { page: 2, x0: 247.8, top: 105.4, x1: 256.1, bottom: 116.4 },
  skin_custom: { page: 2, x0: 247.8, top: 125.9, x1: 256.1, bottom: 137.0 },
  gender_male: { page: 2, x0: 300.7, top: 618.3, x1: 308.9, bottom: 629.3 },
  gender_female: { page: 2, x0: 380.5, top: 618.3, x1: 388.7, bottom: 629.3 },
  acc_light_eyes: { page: 3, x0: 354.0, top: 105.4, x1: 362.3, bottom: 116.4 },
  acc_fan: { page: 3, x0: 354.1, top: 125.9, x1: 362.3, bottom: 137.0 },
  acc_extra_eyes: { page: 3, x0: 354.1, top: 146.4, x1: 362.3, bottom: 157.5 },
  acc_props: { page: 4, x0: 354.0, top: 76.8, x1: 362.3, bottom: 87.9 },
};

const BLANKS = {
  character_name: { page: 0, x0: 70.8, top: 161.2, x1: 430.1, bottom: 172.2 },
  contact_info: { page: 0, x0: 70.9, top: 497.9, x1: 430.2, bottom: 508.9 },
  source: { page: 0, x0: 70.9, top: 585.9, x1: 430.2, bottom: 596.9 },
  wig_color: { page: 1, x0: 70.8, top: 692.9, x1: 430.1, bottom: 704.0 },
  skin_custom_text: { page: 2, x0: 70.8, top: 173.2, x1: 430.1, bottom: 184.2 },
  head_height: { page: 2, x0: 250.2, top: 447.0, x1: 325.9, bottom: 458.1 },
  head_width: { page: 2, x0: 247.9, top: 475.6, x1: 323.7, bottom: 486.6 },
  head_circumference: { page: 2, x0: 247.9, top: 504.2, x1: 323.7, bottom: 515.2 },
  shoulder_width: { page: 2, x0: 247.9, top: 532.6, x1: 323.7, bottom: 543.6 },
  body_height: { page: 2, x0: 247.9, top: 561.2, x1: 323.7, bottom: 572.2 },
  body_weight: { page: 2, x0: 247.9, top: 589.7, x1: 323.7, bottom: 600.8 },
};

// image placeholder boxes
const IMAGE_BOXES = {
  acc_extra_eyes_img: { page: 3, x0: 72.0, top: 165.7, x1: 525.5, bottom: 761.0 },
  acc_props_img: { page: 4, x0: 70.5, top: 99.8, x1: 524.0, bottom: 751.7 },
  makeup_ref: { page: 5, x0: 70.5, top: 144.0, x1: 524.0, bottom: 753.4 },
  face1: { page: 6, x0: 70.5, top: 145.5, x1: 524.0, bottom: 754.9 },
  face2: { page: 7, x0: 70.5, top: 93.0, x1: 524.0, bottom: 759.1 },
  face3: { page: 8, x0: 70.8, top: 90.3, x1: 524.4, bottom: 756.4 },
  eye_design: { page: 9, x0: 70.5, top: 142.5, x1: 524.0, bottom: 751.9 },
  hairstyle_1: { page: 10, x0: 70.5, top: 141.7, x1: 524.0, bottom: 751.1 },
  hairstyle_2: { page: 11, x0: 70.5, top: 72.0, x1: 524.0, bottom: 752.3 },
  additional_1: { page: 12, x0: 70.5, top: 140.6, x1: 524.0, bottom: 750.0 },
  additional_2: { page: 13, x0: 70.5, top: 72.0, x1: 524.0, bottom: 752.3 },
};

// Convert a {page,x0,top,x1,bottom} box (top-origin) into pdf-lib bottom-left-origin rect
function toPdfRect(box) {
  return {
    page: box.page,
    x: box.x0,
    y: PAGE_H - box.bottom,
    width: box.x1 - box.x0,
    height: box.bottom - box.top,
  };
}

window.NFD_COORDS = { PAGE_W, PAGE_H, CHECKBOXES, BLANKS, IMAGE_BOXES, toPdfRect };
