const canvas = document.getElementById('canvas');
const codeArea = document.getElementById('code-area');
const GAP = 40;
const INCREMENT = 1;
const INITIALIZE_WHEN = GAP - INCREMENT;
const TIME_INTERVAL = 100;
const LINE_OFFSET = 0.5;
let count = 0;

canvas.cctx2d = canvas.getContext('2d');
canvas.width = codeArea.offsetWidth;
canvas.height = codeArea.offsetHeight;

function updateCanvas() {
    canvas.cctx2d.clearRect(0, 0, canvas.width, canvas.height);
    
    canvas.cctx2d.beginPath();
    canvas.cctx2d.strokeStyle = 'navy';

    for (let horizontalCount = 0; horizontalCount <= Math.ceil(canvas.height / GAP); horizontalCount++) {
        const yPosition = LINE_OFFSET + (GAP * horizontalCount) - count;

        canvas.cctx2d.moveTo(LINE_OFFSET, yPosition);
        canvas.cctx2d.lineTo(LINE_OFFSET + canvas.width, yPosition);
    }

    for (let verticalCount = 0; verticalCount < canvas.width / GAP; verticalCount++) {
        const xPosition = LINE_OFFSET + (GAP * verticalCount) + count;

        canvas.cctx2d.moveTo(xPosition, LINE_OFFSET);
        canvas.cctx2d.lineTo(xPosition, LINE_OFFSET + canvas.height);
    }

    canvas.cctx2d.stroke();
    canvas.cctx2d.closePath();
}

updateCanvas();
count += INCREMENT;

window.setInterval(() => {
    updateCanvas();

    if (count < INITIALIZE_WHEN) {
        count += INCREMENT;
    } else if (count === INITIALIZE_WHEN) {
        count = 0;
    }
}, TIME_INTERVAL);