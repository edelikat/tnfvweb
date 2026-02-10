// Canvas + context
const canvas = document.getElementById("coloringCanvas");
const ctx = canvas.getContext("2d");

// Load background image
const img = new Image();
img.src = "https://static1.squarespace.com/static/62fbea7068011603a90aa6d2/t/698ad6e4d909386af6f72d34/1770706660749/valentine.png";

// Resize canvas responsively
function resizeCanvas() {
  const ratio = img.height / img.width;
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.width * ratio;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}
img.onload = resizeCanvas;
window.addEventListener("resize", resizeCanvas);

// Tools + state
let drawing = false;
let brushColor = document.getElementById("colorPicker").value;
let brushSize = document.getElementById("brushSize").value;
let tool = "brush"; // brush, fill, eraser
let history = [];

// Save state for undo
function saveState() {
  history.push(canvas.toDataURL());
  if (history.length > 50) history.shift();
}

// Undo last action
function undo() {
  if (history.length === 0) return;
  const last = history.pop();
  const imgUndo = new Image();
  imgUndo.src = last;
  imgUndo.onload = () => ctx.drawImage(imgUndo, 0, 0, canvas.width, canvas.height);
}

// Get pointer position
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  return { x, y };
}

// Drawing events
canvas.addEventListener("mousedown", start);
canvas.addEventListener("mouseup", stop
