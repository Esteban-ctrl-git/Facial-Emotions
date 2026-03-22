document.addEventListener("DOMContentLoaded", () => {

    const MODEL_URL = "https://teachablemachine.withgoogle.com/models/Lqwbi4XF7/";

    let model, webcam, labelContainer, maxPredictions;

    const upload = document.getElementById("upload");
    const preview = document.getElementById("preview");
    const result = document.getElementById("result");
    labelContainer = document.getElementById("label-container");

    console.log("JS cargado");

    // =========================
    // CARGAR MODELO
    // =========================
    async function loadModel() {
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        console.log("Modelo cargado");
    }

    // =========================
    // SUBIR IMAGEN
    // =========================
    upload.addEventListener("change", async (event) => {
        console.log("INPUT DETECTADO");

        const file = event.target.files[0];
        if (!file) return;

        const imgURL = URL.createObjectURL(file);
        preview.src = imgURL;

        console.log("Imagen cargada en preview");

        // Esperar a que cargue la imagen
        preview.onload = async () => {

            if (!model) await loadModel();

            const prediction = await model.predict(preview);

            mostrarResultados(prediction);
        };
    });

    // =========================
    // FUNCIÓN PARA MOSTRAR RESULTADOS
    // =========================
    function mostrarResultados(prediction) {
        let highest = 0;
        let bestClass = "";

        for (let i = 0; i < prediction.length; i++) {
            if (prediction[i].probability > highest) {
                highest = prediction[i].probability;
                bestClass = prediction[i].className;
            }
        }

        result.innerHTML = `${bestClass} (${(highest * 100).toFixed(1)}%)`;

        labelContainer.innerHTML = "";
        prediction.forEach(p => {
            const div = document.createElement("div");
            div.innerHTML = `${p.className}: ${(p.probability * 100).toFixed(1)}%`;
            labelContainer.appendChild(div);
        });
    }

    // =========================
    // CÁMARA
    // =========================
    window.initCamera = async function () {
        const flip = true;
        webcam = new tmImage.Webcam(300, 300, flip);

        await webcam.setup(); // pide permisos
        await webcam.play();

        document.getElementById("webcam-container").innerHTML = "";
        document.getElementById("webcam-container").appendChild(webcam.canvas);

        if (!model) await loadModel();

        window.requestAnimationFrame(loop);
    };

    // =========================
    // LOOP DE CÁMARA
    // =========================
    async function loop() {
        webcam.update();
        await predictWebcam();
        window.requestAnimationFrame(loop);
    }

    // =========================
    // PREDICCIÓN EN CÁMARA
    // =========================
    async function predictWebcam() {
        const prediction = await model.predict(webcam.canvas);
        mostrarResultados(prediction);
    }

});
