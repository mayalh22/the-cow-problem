const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let cowAngle = 0;
let animationId;

function startSimulation() {
  cancelAnimationFrame(animationId);
  cowAngle = 0;

  const barnW = Number(document.getElementById("barnWidth").value);
  const barnH = Number(document.getElementById("barnHeight").value);
  const rope = Number(document.getElementById("ropeLength").value);

  drawBarn(barnW, barnH);
  estimateArea(barnW, barnH, rope);
  animateCow(barnW, barnH, rope);
}

function drawBarn(w, h) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const scale = 4;
  ctx.strokeRect(
    300,
    300 - h * scale,
    w * scale,
    h * scale
  );

  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(300, 300, 5, 0, Math.PI * 2);
  ctx.fill();
}

function animateCow(w, h, rope) {
  const scale = 4;

  cowAngle += 0.01;

  const x = Math.cos(cowAngle) * rope;
  const y = Math.sin(cowAngle) * rope;

  drawBarn(w, h);

  ctx.fillStyle = "blue";
  ctx.beginPath();
  ctx.arc(
    300 + x * scale,
    300 - y * scale,
    4,
    0,
    Math.PI * 2
  );
  ctx.fill();

  animationId = requestAnimationFrame(() =>
    animateCow(w, h, rope)
  );
}

function estimateArea(w, h, rope) {
  const samples = 50000;
  let inside = 0;

  const maxR = rope;
  for (let i = 0; i < samples; i++) {
    const x = (Math.random() * 2 - 1) * maxR;
    const y = (Math.random() * 2 - 1) * maxR;

    if (reachable(x, y, w, h, rope)) {
      inside++;
    }
  }

  const squareArea = (2 * maxR) ** 2;
  const estimatedArea = (inside / samples) * squareArea;

  document.getElementById("areaOutput").innerText =
    "Estimated Grazing Area: " +
    estimatedArea.toFixed(2) +
    " ft²";
}

function reachable(x, y, w, h, rope) {
  let cx = 0;
  let cy = 0;
  let remaining = rope;

  const corners = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
    [0, 0]
  ];

  for (let i = 1; i < corners.length; i++) {
    const nx = corners[i][0];
    const ny = corners[i][1];

    const dx = nx - cx;
    const dy = ny - cy;
    const dist = Math.hypot(dx, dy);

    if (remaining >= dist) {
      remaining -= dist;
      cx = nx;
      cy = ny;
    } else {
      break;
    }
  }

  return Math.hypot(x - cx, y - cy) <= remaining;
}
