document.addEventListener("DOMContentLoaded", () => {

    const MODEL_URL = "https://teachablemachine.withgoogle.com/models/Lqwbi4XF7/";

    let model, webcam, labelContainer, maxPredictions;

    const upload = document.getElementById("upload");
    const preview = document.getElementById("preview");
    const result = document.getElementById("result");
    labelContainer = document.getElementById("label-container");

    console.log("JS cargado");

    async function loadModel() {
        const modelURL = MODEL_URL + "model.json";
        const metadataURL = MODEL_URL + "metadata.json";

        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        console.log("Modelo cargado");
    }

    upload.addEventListener("change", async (event) => {
        console.log("INPUT DETECTADO");

        const file = event.target.files[0];
        if (!file) return;

        const imgURL = window.URL.createObjectURL(file);
        preview.src = imgURL;

        console.log("Imagen cargada en preview");

        setTimeout(async () => {

            if (!model) await loadModel();

            const prediction = await model.predict(preview);

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

        }, 300);
    });

});