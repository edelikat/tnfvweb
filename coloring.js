document.addEventListener("DOMContentLoaded", function() {

  const canvas = document.getElementById("coloringCanvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = "https://static1.squarespace.com/static/62fbea7068011603a90aa6d2/t/698ad6e4d909386af6f72d34/1770706660749/valentine.png";

  function resizeCanvas() {
    const ratio = img.height / img.width;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.width * ratio;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }

  img.onload = resizeCanvas;
  window.addEventListener("resize", resizeCanvas);

  let drawing = false;
  let brushColor = document.getElementById("colorPicker").value;
  let brushSize = document.getElementById("brushSize").value;
  let tool = "brush";
  let history = [];

  function saveState() {
    history.push(canvas.toDataURL());
    if (history.length > 50) history.shift();
  }

  function undo() {
    if (history.length === 0) return;
    const last = history.pop();
    const imgUndo = new Image();
    imgUndo.src = last;
    imgUndo.onload = () => ctx.drawImage(imgUndo, 0, 0, canvas.width, canvas.height);
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x, y };
  }

  canvas.addEventListener("mousedown", start);
  canvas.addEventListener("mouseup", stop);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("touchstart", start);
  canvas.addEventListener("touchend", stop);
  canvas.addEventListener("touchmove", draw);

  function start(e) {
    saveState();
    drawing = true;
    ctx.beginPath();
    const pos = getPos(e);
    ctx.moveTo(pos.x, pos.y);

    if (tool === "fill") {
      floodFill(pos.x, pos.y, hexToRgb(brushColor));
      drawing = false;
    }
  }

  function stop() {
    drawing = false;
  }

  function draw(e) {
    if (!drawing || tool === "fill") return;

    const pos = getPos(e);
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";

    ctx.strokeStyle = tool === "eraser" ? "white" : brushColor;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function floodFill(startX, startY, fillColor) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    const startPos = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
    const startColor = data.slice(startPos, startPos + 4);

    function colorsMatch(a, b) {
      return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }

    const stack = [[Math.floor(startX), Math.floor(startY)]];

    while (stack.length) {
      const [x, y] = stack.pop();
      const pos = (y * canvas.width + x) * 4;

      if (colorsMatch(data.slice(pos, pos + 4), startColor)) {
        data[pos] = fillColor.r;
        data[pos + 1] = fillColor.g;
        data[pos + 2] = fillColor.b;
        data[pos + 3] = 255;

        if (x > 0) stack.push([x - 1, y]);
        if (x < canvas.width - 1) stack.push([x + 1, y]);
        if (y > 0) stack.push([x, y - 1]);
        if (y < canvas.height - 1) stack.push([x, y + 1]);
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
  }

  document.getElementById("colorPicker").oninput = e => brushColor = e.target.value;
  document.getElementById("brushSize").oninput = e => brushSize = e.target.value;

  document.getElementById("brushBtn").onclick = () => tool = "brush";
  document.getElementById("fillBtn").onclick = () => tool = "fill";
  document.getElementById("eraserBtn").onclick = () => tool = "eraser";
  document.getElementById("undoBtn").onclick = undo;

  document.getElementById("resetBtn").onclick = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    history = [];
  };

  document.getElementById("downloadBtn").onclick = () => {
    const link = document.createElement("a");
    link.download = "colored-valentine.png";
    link.href = canvas.toDataURL();
    link.click();
  };

});

