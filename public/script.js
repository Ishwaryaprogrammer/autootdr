document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
        const pixelRatio = window.devicePixelRatio || 1;
        const width = window.innerWidth * 0.7;
        const height = window.innerHeight * 0.7;

        canvas.width = width * pixelRatio;
        canvas.height = height * pixelRatio;
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(pixelRatio, pixelRatio);

        drawGraph(width, height);
    }

    function drawGraph(width, height) {
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, height);

        const paddingX = 80;
        const paddingY = 60;
        const xMax = 0.46;
        const yMax = 32.0;
        const gridLines = 8;

        ctx.strokeStyle = "#444";
        ctx.lineWidth = 1;
        ctx.beginPath();

        for (let i = 0; i <= gridLines; i++) {
            let x = paddingX + (i * (width - 2 * paddingX) / gridLines);
            ctx.moveTo(x, paddingY);
            ctx.lineTo(x, height - paddingY);
        }

        for (let i = 0; i <= gridLines; i++) {
            let y = height - paddingY - (i * (height - 2 * paddingY) / gridLines);
            ctx.moveTo(paddingX, y);
            ctx.lineTo(width - paddingX, y);
        }

        ctx.stroke();

        ctx.fillStyle = "white";
        ctx.font = "18px Arial";

        for (let i = 0; i <= gridLines; i++) {
            let xValue = (xMax * i / gridLines).toFixed(2);
            let x = paddingX + (i * (width - 2 * paddingX) / gridLines);
            ctx.fillText(xValue, x - 10, height - paddingY + 30);

            let yValue = (yMax * i / gridLines).toFixed(1);
            let y = height - paddingY - (i * (height - 2 * paddingY) / gridLines);
            ctx.fillText(yValue, paddingX - 40, y + 5);
        }

        ctx.font = "20px Arial";
        ctx.fillText("Distance (km)", width / 2 - 50, height - 5);

        ctx.save();
        ctx.translate(30, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText("Loss (dB)", 0, 0);
        ctx.restore();
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const wavelengths = [1310, 1550];
    const distances = [500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 100000];

    let currentWavelengthIndex = 1;
    let currentDistanceIndex = 0;

    function updateAutoTestLabel() {
        document.getElementById("autoTestHeader").innerText =
            `Auto Test ${wavelengths[currentWavelengthIndex]}nm ${document.getElementById("distance").innerText} 3ns`;
    }

    function changeWavelength(direction) {
        currentWavelengthIndex = (currentWavelengthIndex + direction + wavelengths.length) % wavelengths.length;
        document.getElementById("wavelength").innerText = wavelengths[currentWavelengthIndex] + "nm";
        updateAutoTestLabel();
    }

    function changeDistance(direction) {
        currentDistanceIndex = (currentDistanceIndex + direction + distances.length) % distances.length;
        document.getElementById("distance").innerText =
            (distances[currentDistanceIndex] >= 1000 ? distances[currentDistanceIndex] / 1000 + "km" : distances[currentDistanceIndex] + "m");
        updateAutoTestLabel();
    }

    const autoTestButton = document.querySelector(".header-btn");
    const arrowGroup = document.querySelector(".arrow-group");
    const bottomButtons = document.querySelector(".bottom-buttons");
    const dangerIcon = document.getElementById("danger-icon");
    const graphContainer = document.getElementById("graph-container");
    const tableContainer = document.getElementById("table-container");

    let testStages = [
        "Initializing...",
        "Live Fiber Checking...",
        "Auto Parameter Checking...",
        "Fiber Testing...",
        "Curve Analysis..."
    ];

    let currentStageIndex = 0;
    let testInterval = null;

    function startAutoTest() {
        autoTestButton.innerText = "Stop";
        autoTestButton.style.backgroundColor = "red";
        autoTestButton.style.color = "white";
        autoTestButton.disabled = false;

        arrowGroup.style.visibility = "hidden";
        bottomButtons.style.visibility = "hidden";
        document.getElementById("progress-container").classList.remove("hidden");

        dangerIcon.style.display = "inline";
        currentStageIndex = 0;

        function updateProgress() {
            document.getElementById("progress-text").innerText = testStages[currentStageIndex];
            let progressPercentage = ((currentStageIndex + 1) / testStages.length) * 100;
            document.getElementById("progress-fill").style.width = progressPercentage + "%";

            currentStageIndex++;
            if (currentStageIndex >= testStages.length) {
                clearInterval(testInterval);
                completeAutoTest();
            }
        }

        updateProgress();
        testInterval = setInterval(updateProgress, 2000);
    }

    function completeAutoTest() {
        document.getElementById("progress-container").classList.add("hidden");
        dangerIcon.style.display = "none";

        resetAutoTestButton();
        
        graphContainer.style.display = "block";
        tableContainer.style.display = "block";
    }

    function stopAutoTest() {
        clearInterval(testInterval);

        document.getElementById("progress-container").classList.add("hidden");
        document.getElementById("progress-text").innerText = "";
        dangerIcon.style.display = "none";

        resetAutoTestButton();
    }
    

    function resetAutoTestButton() {
        autoTestButton.innerText = "Auto Test";
        autoTestButton.style.backgroundColor = "#ba6cd4";
        autoTestButton.style.color = "white";
        autoTestButton.disabled = false;

        arrowGroup.style.visibility = "visible";
        bottomButtons.style.visibility = "visible";
    }

    autoTestButton.addEventListener("click", function () {
        if (autoTestButton.innerText === "Auto Test") {
            startAutoTest();
        } else {
            stopAutoTest();
        }
    });

    document.getElementById("prev-wavelength").addEventListener("click", () => changeWavelength(-1));
    document.getElementById("next-wavelength").addEventListener("click", () => changeWavelength(1));
    document.getElementById("prev-distance").addEventListener("click", () => changeDistance(-1));
    document.getElementById("next-distance").addEventListener("click", () => changeDistance(1));

    document.getElementById("wavelength").innerText = wavelengths[currentWavelengthIndex] + "nm";
    document.getElementById("distance").innerText =
        (distances[currentDistanceIndex] >= 1000 ? distances[currentDistanceIndex] / 1000 + "km" : distances[currentDistanceIndex] + "m");
    updateAutoTestLabel();
});
