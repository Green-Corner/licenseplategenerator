const canvas = document.getElementById("plateCanvas");
const ctx = canvas.getContext("2d");

const backgroundColorInputs = Array.from(document.querySelectorAll("input[name='backgroundColor']"));
const textColorInputs = Array.from(document.querySelectorAll("input[name='textColor']"));
const presetOverlayInput = document.getElementById("presetOverlay");
const textLine1Input = document.getElementById("textLine1");
const textLine2Input = document.getElementById("textLine2");
const textLine3Input = document.getElementById("textLine3");
const downloadBtn = document.getElementById("downloadBtn");

let presetOverlayImage = null;
const presetOverlayCache = {};

function roundedRectPath(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawOverlayCover(image, targetX, targetY, targetWidth, targetHeight) {
  const imageRatio = image.width / image.height;
  const targetRatio = targetWidth / targetHeight;

  let drawWidth = targetWidth;
  let drawHeight = targetHeight;
  let offsetX = targetX;
  let offsetY = targetY;

  if (imageRatio > targetRatio) {
    drawWidth = targetHeight * imageRatio;
    offsetX = targetX - (drawWidth - targetWidth) / 2;
  } else {
    drawHeight = targetWidth / imageRatio;
    offsetY = targetY - (drawHeight - targetHeight) / 2;
  }

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function getSelectedBackgroundColor() {
  const selected = backgroundColorInputs.find((input) => input.checked);
  return selected ? selected.value : "#8C1D40";
}

function getSelectedTextColor() {
  const selected = textColorInputs.find((input) => input.checked);
  return selected ? selected.value : "#000000";
}

function syncSelectedOptionClass(inputs) {
  inputs.forEach((input) => {
    const option = input.closest(".color-option");
    if (!option) return;
    option.classList.toggle("selected", input.checked);
  });
}

function drawPlate() {
  const width = canvas.width;
  const height = canvas.height;
  const cornerRadius = 48;

  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  roundedRectPath(ctx, 10, 10, width - 20, height - 20, cornerRadius);
  ctx.fillStyle = getSelectedBackgroundColor();
  ctx.fill();

  ctx.save();
  roundedRectPath(ctx, 10, 10, width - 20, height - 20, cornerRadius);
  ctx.clip();

  if (presetOverlayImage) {
    drawOverlayCover(presetOverlayImage, 0, 0, width, height);
  }

  ctx.restore();

  ctx.lineWidth = 8;
  ctx.strokeStyle = "#000000";
  roundedRectPath(ctx, 10, 10, width - 20, height - 20, cornerRadius);
  ctx.stroke();

  ctx.fillStyle = getSelectedTextColor();
  ctx.textAlign = "center";
  const licensePlateNumber = (textLine3Input.value || "").toUpperCase().slice(0, 6);

  ctx.font = "bold 72px Arial, sans-serif";
  ctx.fillText(textLine1Input.value || " ", width / 2, 108);

  ctx.font = "400 352px 'Zurich Extra Condensed Regular', Arial, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText(licensePlateNumber || " ", width / 2, height / 2);
  ctx.textBaseline = "alphabetic";

  ctx.font = "600 54px Arial, sans-serif";
  ctx.fillText(textLine2Input.value || " ", width / 2, 548);
}

function handlePresetOverlay() {
  const selectedPath = presetOverlayInput.value;

  if (!selectedPath) {
    presetOverlayImage = null;
    drawPlate();
    return;
  }

  if (presetOverlayCache[selectedPath]) {
    presetOverlayImage = presetOverlayCache[selectedPath];
    drawPlate();
    return;
  }

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    presetOverlayCache[selectedPath] = img;
    presetOverlayImage = img;
    drawPlate();
  };
  img.onerror = () => {
    presetOverlayImage = null;
    drawPlate();
  };
  img.src = selectedPath;
}

function downloadPlate() {
  const safeSuffix = (textLine3Input.value || "plate").slice(0, 6).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const filename = `arizona-plate-${safeSuffix || "custom"}.png`;

  try {
    canvas.toBlob((blob) => {
      if (!blob) {
        window.alert("Could not generate PNG from canvas.");
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  } catch (error) {
    window.alert("Download failed. If you opened this file directly, run it from a local server (for example: python3 -m http.server 8080).");
  }
}

[textLine1Input, textLine2Input].forEach((input) => {
  input.addEventListener("input", drawPlate);
});
textLine3Input.addEventListener("input", () => {
  textLine3Input.value = textLine3Input.value.slice(0, 6);
  drawPlate();
});
backgroundColorInputs.forEach((input) => {
  input.addEventListener("change", () => {
    syncSelectedOptionClass(backgroundColorInputs);
    drawPlate();
  });
});
textColorInputs.forEach((input) => {
  input.addEventListener("change", () => {
    syncSelectedOptionClass(textColorInputs);
    drawPlate();
  });
});

presetOverlayInput.addEventListener("change", handlePresetOverlay);
downloadBtn.addEventListener("click", downloadPlate);

syncSelectedOptionClass(backgroundColorInputs);
syncSelectedOptionClass(textColorInputs);
handlePresetOverlay();

if (document.fonts && document.fonts.load) {
  document.fonts.load("400 352px 'Zurich Extra Condensed Regular'").then(() => {
    drawPlate();
  });
}
