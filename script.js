const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let cowAngle = 0;
let animationId;
let grazingPoints = [];

function startSimulation() {
  cancelAnimationFrame(animationId);
  cowAngle = 0;
  grazingPoints = [];

  const barnW = Number(document.getElementById("barnWidth").value);
  const barnH = Number(document.getElementById("barnHeight").value);
  const rope = Number(document.getElementById("ropeLength").value);

  estimateArea(barnW, barnH, rope);
  animateCow(barnW, barnH, rope);
}

function drawBarn(w, h, scale = 4) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(144, 238, 144, 0.3)";
  grazingPoints.forEach(([x, y]) => {
    ctx.fillRect(300 + x * scale, 300 - y * scale, 2, 2);
  });

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 2;
  ctx.strokeRect(300, 300 - h * scale, w * scale, h * scale);

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(300, 300, 5, 0, Math.PI * 2);
  ctx.fill();
}

function animateCow(w, h, rope) {
  const scale = 4;
  cowAngle += 0.02;

  const pos = getCowPosition(w, h, rope, cowAngle);
  
  drawBarn(w, h, scale);

  ctx.strokeStyle = "rgba(100, 100, 100, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(300, 300);
  ctx.lineTo(300 + pos.x * scale, 300 - pos.y * scale);
  ctx.stroke();

  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(300 + pos.x * scale, 300 - pos.y * scale, 4, 0, Math.PI * 2);
  ctx.fill();

  animationId = requestAnimationFrame(() => animateCow(w, h, rope));
}

function getCowPosition(w, h, rope, angle) {
  const r = rope * 0.8;
  const baseAngle = angle % (Math.PI * 2);
  
  let x = Math.cos(baseAngle) * r;
  let y = Math.sin(baseAngle) * r;

  if (!reachable(x, y, w, h, rope)) {
    const scale = 0.95;
    while (!reachable(x, y, w, h, rope) && scale > 0.1) {
      x *= scale;
      y *= scale;
    }
  }
  
  return { x, y };
}

function estimateArea(w, h, rope) {
  const samples = 100000;
  let inside = 0;
  grazingPoints = [];

  const maxR = rope + Math.max(w, h);
  
  for (let i = 0; i < samples; i++) {
    const x = (Math.random() * 2 - 1) * maxR;
    const y = (Math.random() * 2 - 1) * maxR;

    if (reachable(x, y, w, h, rope)) {
      inside++;
      if (grazingPoints.length < 5000 && Math.random() < 0.05) {
        grazingPoints.push([x, y]);
      }
    }
  }

  const squareArea = (2 * maxR) ** 2;
  const estimatedArea = (inside / samples) * squareArea;

  document.getElementById("areaOutput").innerText =
    "Estimated Grazing Area: " + estimatedArea.toFixed(2) + " ft²";
}

function reachable(px, py, w, h, rope) {

  const directDist = Math.hypot(px, py);
  if (directDist <= rope) {

    if (px < 0 || py < 0 || px > w || py > h) {
      return true;
    }
    return false;
  }

  const corners = [
    { x: w, y: 0, loss: w },
    { x: w, y: h, loss: w + h },
    { x: 0, y: h, loss: w + h + w }
  ];

  for (let corner of corners) {
    const remaining = rope - corner.loss;
    if (remaining <= 0) continue;

    const distFromCorner = Math.hypot(px - corner.x, py - corner.y);
    
    if (distFromCorner <= remaining) {

      if (isInValidSector(px, py, corner, w, h)) {
        return true;
      }
    }
  }

  const cornersCC = [
    { x: 0, y: h, loss: h },
    { x: w, y: h, loss: h + w },
    { x: w, y: 0, loss: h + w + h }
  ];

  for (let corner of cornersCC) {
    const remaining = rope - corner.loss;
    if (remaining <= 0) continue;

    const distFromCorner = Math.hypot(px - corner.x, py - corner.y);
    
    if (distFromCorner <= remaining) {
      if (isInValidSectorCC(px, py, corner, w, h)) {
        return true;
      }
    }
  }

  return false;
}

function isInValidSector(px, py, corner, w, h) {
  if (corner.x === w && corner.y === 0) {
    return px >= w || py <= 0;
  }
  if (corner.x === w && corner.y === h) {
    return px >= w || py >= h;
  }
  if (corner.x === 0 && corner.y === h) {
    return px <= 0 || py >= h;
  }
  return true;
}

function isInValidSectorCC(px, py, corner, w, h) {
  if (corner.x === 0 && corner.y === h) {
    return px <= 0 || py >= h;
  }
  if (corner.x === w && corner.y === h) {
    return px >= w || py >= h;
  }
  if (corner.x === w && corner.y === 0) {
    return px >= w || py <= 0;
  }
  return true;
}