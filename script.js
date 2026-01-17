const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let cowAngle = 0;
let animationId;
let grazingPoints = [];
let cowTrace = [];
let showTrace = false;
let sectors = [];

function startSimulation() {
  cancelAnimationFrame(animationId);
  cowAngle = 0;
  grazingPoints = [];
  cowTrace = [];
  sectors = [];

  const barnW = Number(document.getElementById("barnWidth").value);
  const barnH = Number(document.getElementById("barnHeight").value);
  const rope = Number(document.getElementById("ropeLength").value);

  estimateArea(barnW, barnH, rope);
  calculateSectors(barnW, barnH, rope);
  animateCow(barnW, barnH, rope);
}

function toggleTrace() {
  showTrace = !showTrace;
}

function clearTrace() {
  cowTrace = [];
}

function calculateSectors(w, h, rope) {
  sectors = [];
  
  const mainArea = 0.75 * Math.PI * rope * rope;
  sectors.push({
    name: "Main 3/4 Circle",
    radius: rope,
    angle: 270,
    area: mainArea,
    color: "rgba(255, 100, 100, 0.2)"
  });

  if (rope > w) {
    sectors.push({
      name: "CW Corner 1",
      radius: rope - w,
      area: calculateCornerArea(w, h, rope, w),
      color: "rgba(100, 255, 100, 0.2)"
    });
  }
  if (rope > w + h) {
    sectors.push({
      name: "CW Corner 2", 
      radius: rope - w - h,
      area: calculateCornerArea(w, h, rope, w + h),
      color: "rgba(100, 100, 255, 0.2)"
    });
  }
  if (rope > h) {
    sectors.push({
      name: "CCW Corner 1",
      radius: rope - h,
      area: calculateCornerArea(w, h, rope, h),
      color: "rgba(255, 255, 100, 0.2)"
    });
  }
  if (rope > w + h) {
    sectors.push({
      name: "CCW Corner 2",
      radius: rope - w - h,
      area: calculateCornerArea(w, h, rope, w + h),
      color: "rgba(255, 100, 255, 0.2)"
    });
  }
}

function calculateCornerArea(w, h, rope, loss) {
  const r = rope - loss;
  if (r <= 0) return 0;
  return Math.PI * r * r * 0.25;
}

function drawBarn(w, h, scale = 4) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (document.getElementById("showSectors").checked) {
    const corners = [
      [0, 0], [w, 0], [w, h], [0, h]
    ];
    
    sectors.forEach((sector, i) => {
      ctx.strokeStyle = sector.color.replace('0.2', '0.5');
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      
      if (i === 0) {
        ctx.arc(300, 300, sector.radius * scale, 0, Math.PI * 2);
      } else {
        const cornerIdx = Math.min(i - 1, corners.length - 1);
        const cx = 300 + corners[cornerIdx][0] * scale;
        const cy = 300 - corners[cornerIdx][1] * scale;
        ctx.arc(cx, cy, sector.radius * scale, 0, Math.PI * 2);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    });
  }

  ctx.fillStyle = "rgba(144, 238, 144, 0.4)";
  grazingPoints.forEach(([x, y]) => {
    ctx.fillRect(300 + x * scale, 300 - y * scale, 2, 2);
  });

  if (showTrace && cowTrace.length > 1) {
    ctx.strokeStyle = "rgba(0, 100, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300 + cowTrace[0][0] * scale, 300 - cowTrace[0][1] * scale);
    for (let i = 1; i < cowTrace.length; i++) {
      ctx.lineTo(300 + cowTrace[i][0] * scale, 300 - cowTrace[i][1] * scale);
    }
    ctx.stroke();
  }

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 3;
  ctx.strokeRect(300, 300 - h * scale, w * scale, h * scale);

  ctx.fillStyle = "rgba(139, 69, 19, 0.3)";
  ctx.fillRect(300, 300 - h * scale, w * scale, h * scale);

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(300, 300, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "darkred";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function animateCow(w, h, rope) {
  const scale = 4;
  const speed = document.getElementById("speedSlider").value / 1000;
  cowAngle += speed;

  const pos = getCowPosition(w, h, rope, cowAngle);

  if (showTrace) {
    cowTrace.push([pos.x, pos.y]);
    if (cowTrace.length > 500) {
      cowTrace.shift();
    }
  }
  
  drawBarn(w, h, scale);

  drawRope(w, h, rope, pos, scale);

  ctx.save();
  ctx.translate(300 + pos.x * scale, 300 - pos.y * scale);
  ctx.rotate(-cowAngle);

  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(0, 0, 8, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(-2, -2, 2, 0, Math.PI * 2);
  ctx.arc(3, 1, 1.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "white";
  ctx.strokeStyle = "black";
  ctx.beginPath();
  ctx.arc(8, 0, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  
  ctx.restore();

  animationId = requestAnimationFrame(() => animateCow(w, h, rope));
}

function drawRope(w, h, rope, cowPos, scale) {
  ctx.strokeStyle = "rgba(139, 69, 19, 0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(300, 300);

  const path = getRopePath(w, h, rope, cowPos);
  
  path.forEach(point => {
    ctx.lineTo(300 + point.x * scale, 300 - point.y * scale);
  });
  
  ctx.lineTo(300 + cowPos.x * scale, 300 - cowPos.y * scale);
  ctx.stroke();
}

function getRopePath(w, h, rope, cowPos) {
  const path = [];

  const distDirect = Math.hypot(cowPos.x, cowPos.y);
  
  if (distDirect > rope) {
    if (cowPos.x > w && cowPos.y < h) {
      path.push({ x: w, y: 0 });
    } else if (cowPos.x < 0 && cowPos.y > 0) {
      path.push({ x: 0, y: h });
    }
  }
  
  return path;
}

function getCowPosition(w, h, rope, angle) {
  const maxDist = rope + Math.max(w, h);
  const samples = 200;
  const angleSegment = (Math.PI * 2) / samples;
  const targetAngle = angle % (Math.PI * 2);

  let bestDist = 0;
  let bestPos = { x: 0, y: 0 };
  
  for (let d = rope * 0.5; d <= maxDist; d += 2) {
    const x = Math.cos(targetAngle) * d;
    const y = Math.sin(targetAngle) * d;
    
    if (reachable(x, y, w, h, rope)) {
      if (d > bestDist) {
        bestDist = d;
        bestPos = { x, y };
      }
    } else if (bestDist > 0) {
      break;
    }
  }
  
  return bestPos;
}

function estimateArea(w, h, rope) {
  const samples = Number(document.getElementById("sampleCount").value);
  let inside = 0;
  grazingPoints = [];

  const maxR = rope + Math.max(w, h);
  
  const startTime = performance.now();
  
  for (let i = 0; i < samples; i++) {
    const x = (Math.random() * 2 - 1) * maxR;
    const y = (Math.random() * 2 - 1) * maxR;

    if (reachable(x, y, w, h, rope)) {
      inside++;
      if (grazingPoints.length < 8000 && Math.random() < 0.08) {
        grazingPoints.push([x, y]);
      }
    }
  }

  const endTime = performance.now();
  const squareArea = (2 * maxR) ** 2;
  const estimatedArea = (inside / samples) * squareArea;

  document.getElementById("areaOutput").innerText =
    "Estimated Grazing Area: " + estimatedArea.toFixed(2) + " ft²";
  
  document.getElementById("statsOutput").innerText =
    `Samples: ${samples.toLocaleString()} | Hit Rate: ${((inside/samples)*100).toFixed(1)}% | Compute Time: ${(endTime - startTime).toFixed(0)}ms`;
}

function reachable(px, py, w, h, rope) {

  const directDist = Math.hypot(px, py);
  if (directDist <= rope) {
    if (px < 0 || py < 0 || px > w || py > h) {
      return true;
    }
    return false;
  }

  const cornersC = [
    { x: w, y: 0, loss: w },
    { x: w, y: h, loss: w + h },
    { x: 0, y: h, loss: w + h + w }
  ];

  for (let corner of cornersC) {
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