function insertLoader() {

    const loader = document.createElement('div');
    loader.classList.add('loadingContainer');
    loader.innerHTML = `<div class="loader"><span></span></div>
    <h2>AI가 당신과 닮은 래퍼를 분석 중입니다.</h2>`;
    document.body.appendChild(loader);
}

function removeLoader() {
    const loader = document.querySelector('.loadingContainer');
    document.body.removeChild(loader);
}


function imagePreview(e) {

    const imageContainer = document.querySelector('.imageContainer');
    const file = e.target.files[0];
    if (!file.type.match('image/.*')) {
        alert('이미지만 업로드 가능합니다!');
        return;
    }

    var fileReader = new FileReader();
    fileReader.onload = function (e) {

        insertLoader();
        window.scrollTo(0, imageContainer.offsetTop - 40);
        document.querySelector('.description').style.opacity = '0';
        imageContainer.appendChild(createImage(e));

        setTimeout(() => {
            removeLoader();
            predict();
        }, 1500);

    };
    fileReader.readAsDataURL(file);
}

function createImage(e) {
    let img = document.createElement('img');
    img.setAttribute('src', e.target.result);
    img.classList.add('userImage');
    return img;
}

// ---------------------------- teachablemachine ---------------------------

let model, resultContainer, maxPredictions;

initTeachablemachine();

async function initTeachablemachine() {
    const URL = "https://teachablemachine.withgoogle.com/models/iZhv2fYu3/";
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

async function predict() {
    const resultContainer = createResultContainer();
    document.body.appendChild(resultContainer);
    const userImage = document.querySelector('.userImage');
    const prediction = await model.predict(userImage, false);
    for (let i = 0; i < maxPredictions; i++) {
        const probability = prediction[i].probability.toFixed(2);
        if (probability >= 0.01) {
            resultContainer.appendChild(createResultLabel(prediction[i], probability));
        }
    }
}

function createResultContainer() {
    resultContainer = document.createElement("div");
    resultContainer.classList.add("resultContainer");
    return resultContainer;
}

function createResultLabel(prediction, probability) {
    const p = Math.floor(probability * 100) + '%';
    resultLabel = document.createElement('div');
    resultLabel.classList.add('resultLabel');
    resultLabel.innerHTML = `<div class='resultName'>${prediction.className}</div>
        <div class='resultProbability'>${p}</div>`;

    return resultLabel;
}