(() => {
  "use strict";

  const C = window.NFD_COORDS;

  const state = {
    images: {
      makeup_ref: null,
      face1: null,
      face2: null,
      face3: null,
      eye_design: null,
      acc_extra_eyes_img: null,
      acc_props_img: null,
      hairstyle: [],
      additional: [],
    },
  };

  const MULTI_FIELDS = new Set(["hairstyle", "additional"]);

  // ---------- file upload UI ----------

  function renderThumbs(key) {
    const box = document.getElementById(key + "_thumbs");
    if (!box) return;
    box.innerHTML = "";
    const multi = MULTI_FIELDS.has(key);
    const files = multi ? state.images[key] : (state.images[key] ? [state.images[key]] : []);
    files.forEach((file, idx) => {
      const div = document.createElement("div");
      div.className = "thumb";
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      div.appendChild(img);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "×";
      btn.title = "Remove";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (multi) {
          state.images[key].splice(idx, 1);
        } else {
          state.images[key] = null;
        }
        renderThumbs(key);
      });
      div.appendChild(btn);
      box.appendChild(div);
    });
  }

  document.querySelectorAll(".file-drop").forEach((drop) => {
    const key = drop.dataset.target;
    const multi = MULTI_FIELDS.has(key);
    const input = drop.querySelector("input[type=file]");
    drop.addEventListener("click", () => input.click());
    input.addEventListener("click", (e) => e.stopPropagation());
    input.addEventListener("change", () => {
      const files = Array.from(input.files || []);
      if (files.length === 0) return;
      if (multi) {
        state.images[key] = state.images[key].concat(files);
      } else {
        state.images[key] = files[0];
      }
      input.value = "";
      renderThumbs(key);
    });
  });

  // ---------- conditional sections ----------

  function byName(name) {
    return document.querySelector(`input[name="${name}"]:checked`);
  }

  document.querySelectorAll('input[name="skin"]').forEach((r) =>
    r.addEventListener("change", () => {
      const val = byName("skin")?.value;
      document.getElementById("skin_custom_wrap").classList.toggle("show", val === "custom");
    })
  );

  document.querySelectorAll('input[name="head_type"]').forEach((r) =>
    r.addEventListener("change", () => {
      const val = byName("head_type")?.value;
      document.getElementById("faces_wrap").classList.toggle("show", val === "2");
    })
  );

  document.getElementById("acc_extra_eyes").addEventListener("change", (e) => {
    document.getElementById("acc_extra_eyes_img_wrap").classList.toggle("show", e.target.checked);
  });
  document.getElementById("acc_props").addEventListener("change", (e) => {
    document.getElementById("acc_props_img_wrap").classList.toggle("show", e.target.checked);
  });

  // ---------- validation ----------

  function collectValues() {
    const v = {};
    ["character_name", "contact_info", "source", "wig_color", "skin_custom_text",
      "head_height", "head_width", "head_circumference", "shoulder_width",
      "body_height", "body_weight"].forEach((id) => {
      v[id] = document.getElementById(id).value.trim();
    });
    v.head_type = byName("head_type")?.value || "";
    v.ordered_before = byName("ordered_before")?.value || "";
    v.proportion = byName("proportion")?.value || "standard";
    v.eye_type = byName("eye_type")?.value || "";
    v.wig_treatment = byName("wig_treatment")?.value || "default";
    v.ponytail = byName("ponytail")?.value || "";
    v.skin = byName("skin")?.value || "default";
    v.gender = byName("gender")?.value || "";
    v.acc_light_eyes = document.getElementById("acc_light_eyes").checked;
    v.acc_fan = document.getElementById("acc_fan").checked;
    v.acc_extra_eyes = document.getElementById("acc_extra_eyes").checked;
    v.acc_props = document.getElementById("acc_props").checked;
    return v;
  }

  function validate(v) {
    const errors = [];
    if (!v.character_name) errors.push("Character Name (Q1)");
    if (!v.head_type) errors.push("Head Type (Q2)");
    if (!v.contact_info) errors.push("Contact Information (Q3)");
    if (!v.source) errors.push("Source of the Character (Q4)");
    if (!v.ordered_before) errors.push("Have you ordered from us before? (Q5)");
    if (!v.proportion) errors.push("Head Proportion (Q6)");
    if (!v.eye_type) errors.push("Eye Type (Q7)");
    if (!v.wig_treatment) errors.push("Wig Treatment (Q8)");
    if (!v.ponytail) errors.push("Ponytail Options (Q9)");
    if (!v.wig_color) errors.push("Wig Color (Q10)");
    if (!v.skin) errors.push("Skin Tone (Q11)");
    if (!v.head_height) errors.push("Head Height (Q12)");
    if (!v.head_width) errors.push("Head Width (Q12)");
    if (!v.head_circumference) errors.push("Head Circumference (Q12)");
    if (!v.shoulder_width) errors.push("Shoulder Width (Q12)");
    if (!v.body_height) errors.push("Body Height (Q12)");
    if (!v.body_weight) errors.push("Body Weight (Q12)");
    if (!state.images.makeup_ref) errors.push("Modeling & Makeup Reference image (Q14)");
    if (v.head_type === "2" && !state.images.face1) errors.push("Face 1 image (Q14)");
    if (!state.images.eye_design) errors.push("Eye Design image (Q15)");
    if (state.images.hairstyle.length === 0) errors.push("Hairstyle Reference image (Q16)");
    if (v.acc_extra_eyes && !state.images.acc_extra_eyes_img) errors.push("Extra Eyes reference image (Q13)");
    if (v.acc_props && !state.images.acc_props_img) errors.push("Accessories/Props reference image (Q13)");
    return errors;
  }

  // ---------- pdf generation ----------

  async function embedImage(pdfDoc, file, bytes) {
    if (file.type === "image/png") return pdfDoc.embedPng(bytes);
    if (file.type === "image/jpeg" || file.type === "image/jpg") return pdfDoc.embedJpg(bytes);
    const converted = await convertToPngBytes(file);
    return pdfDoc.embedPng(converted);
  }

  async function convertToPngBytes(file) {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/png"));
    return new Uint8Array(await blob.arrayBuffer());
  }

  function sanitizeFilename(s) {
    return (s || "").replace(/[^a-z0-9\-_ ]/gi, "").trim().replace(/\s+/g, "-");
  }

  async function generate() {
    const v = collectValues();
    const errors = validate(v);
    const statusEl = document.getElementById("status");
    if (errors.length) {
      statusEl.className = "status error";
      statusEl.textContent = "Please complete: " + errors.join(", ");
      return;
    }

    const btn = document.getElementById("generate-btn");
    btn.disabled = true;
    statusEl.className = "status";
    statusEl.textContent = "Generating PDF…";

    try {
      const existingPdfBytes = await fetch("order-form-template.pdf").then((r) => r.arrayBuffer());
      const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(PDFLib.StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
      const ink = PDFLib.rgb(0.13, 0.18, 0.5);

      function drawBlank(key, text) {
        if (!text) return;
        const box = C.BLANKS[key];
        const rect = C.toPdfRect(box);
        const page = pages[box.page];
        let size = 10;
        const maxWidth = rect.width - 4;
        while (size > 6 && font.widthOfTextAtSize(text, size) > maxWidth) size -= 0.5;
        page.drawText(text, { x: rect.x + 2, y: rect.y + 2, size, font, color: ink });
      }

      function drawCheck(key) {
        const box = C.CHECKBOXES[key];
        if (!box) return;
        const rect = C.toPdfRect(box);
        const page = pages[box.page];
        const size = Math.min(rect.width, rect.height) - 1.5;
        page.drawText("X", {
          x: rect.x + rect.width / 2 - size * 0.32,
          y: rect.y + rect.height / 2 - size * 0.36,
          size,
          font: fontBold,
          color: ink,
        });
      }

      async function drawImageInBox(key, file) {
        if (!file) return;
        const box = C.IMAGE_BOXES[key];
        const rect = C.toPdfRect(box);
        const page = pages[box.page];
        const bytes = await file.arrayBuffer();
        const img = await embedImage(pdfDoc, file, bytes);
        const pad = 8;
        const availW = rect.width - pad * 2;
        const availH = rect.height - pad * 2;
        const scale = Math.min(availW / img.width, availH / img.height, 1) || Math.min(availW / img.width, availH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = rect.x + (rect.width - w) / 2;
        const y = rect.y + (rect.height - h) / 2;
        page.drawImage(img, { x, y, width: w, height: h });
      }

      async function drawImagesGrid(boxKeys, files) {
        if (!files || files.length === 0) return;
        const boxes = boxKeys.map((k) => C.IMAGE_BOXES[k]);
        const perBox = Math.ceil(files.length / boxes.length);
        for (let bi = 0; bi < boxes.length; bi++) {
          const group = files.slice(bi * perBox, (bi + 1) * perBox);
          if (group.length === 0) continue;
          const box = boxes[bi];
          const rect = C.toPdfRect(box);
          const page = pages[box.page];
          const cols = Math.ceil(Math.sqrt(group.length));
          const rows = Math.ceil(group.length / cols);
          const pad = 8, gap = 6;
          const cellW = (rect.width - pad * 2 - gap * (cols - 1)) / cols;
          const cellH = (rect.height - pad * 2 - gap * (rows - 1)) / rows;
          for (let i = 0; i < group.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const cellX = rect.x + pad + col * (cellW + gap);
            const cellTop = rect.y + rect.height - pad - row * (cellH + gap);
            const file = group[i];
            const bytes = await file.arrayBuffer();
            const img = await embedImage(pdfDoc, file, bytes);
            const scale = Math.min(cellW / img.width, cellH / img.height, 1) || Math.min(cellW / img.width, cellH / img.height);
            const w = img.width * scale;
            const h = img.height * scale;
            const x = cellX + (cellW - w) / 2;
            const y = cellTop - cellH + (cellH - h) / 2;
            page.drawImage(img, { x, y, width: w, height: h });
          }
        }
      }

      // --- text fields ---
      drawBlank("character_name", v.character_name);
      drawBlank("contact_info", v.contact_info);
      drawBlank("source", v.source);
      drawBlank("wig_color", v.wig_color);
      if (v.skin === "custom") drawBlank("skin_custom_text", v.skin_custom_text);
      drawBlank("head_height", v.head_height);
      drawBlank("head_width", v.head_width);
      drawBlank("head_circumference", v.head_circumference);
      drawBlank("shoulder_width", v.shoulder_width);
      drawBlank("body_height", v.body_height);
      drawBlank("body_weight", v.body_weight);

      // --- checkboxes ---
      if (v.head_type) drawCheck("head_type_" + v.head_type);
      if (v.ordered_before) drawCheck("ordered_before_" + v.ordered_before);
      drawCheck("proportion_" + v.proportion);
      if (v.eye_type) drawCheck("eye_type_" + v.eye_type);
      drawCheck("wig_treatment_" + v.wig_treatment);
      if (v.ponytail) drawCheck("ponytail_" + v.ponytail);
      drawCheck("skin_" + v.skin);
      if (v.gender) drawCheck("gender_" + v.gender);
      if (v.acc_light_eyes) drawCheck("acc_light_eyes");
      if (v.acc_fan) drawCheck("acc_fan");
      if (v.acc_extra_eyes) drawCheck("acc_extra_eyes");
      if (v.acc_props) drawCheck("acc_props");

      // --- single images ---
      await drawImageInBox("makeup_ref", state.images.makeup_ref);
      await drawImageInBox("eye_design", state.images.eye_design);
      await drawImageInBox("acc_extra_eyes_img", state.images.acc_extra_eyes_img);
      await drawImageInBox("acc_props_img", state.images.acc_props_img);
      if (v.head_type === "2") {
        await drawImageInBox("face1", state.images.face1);
        await drawImageInBox("face2", state.images.face2);
        await drawImageInBox("face3", state.images.face3);
      }

      // --- multi images ---
      await drawImagesGrid(["hairstyle_1", "hairstyle_2"], state.images.hairstyle);
      await drawImagesGrid(["additional_1", "additional_2"], state.images.additional);

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const nameBase = sanitizeFilename(v.character_name) || "order-form";
      const a = document.createElement("a");
      a.href = url;
      a.download = `NFD-${nameBase}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      statusEl.className = "status ok";
      statusEl.textContent = "PDF generated — check your downloads.";
    } catch (err) {
      console.error(err);
      statusEl.className = "status error";
      statusEl.textContent = "Something went wrong generating the PDF: " + err.message;
    } finally {
      btn.disabled = false;
    }
  }

  document.getElementById("generate-btn").addEventListener("click", generate);
})();
