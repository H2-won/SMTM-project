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

let model, maxPredictions;

initTeachablemachine();

async function initTeachablemachine() {
    const URL = "https://teachablemachine.withgoogle.com/models/iZhv2fYu3/";
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

async function predict() {

    const userImage = document.querySelector('.userImage');
    const prediction = await model.predict(userImage, false);

    const resultObjects = createResultObject(prediction);
    resultObjects.sort((a, b) => parseFloat(b.probability - a.probability));
    console.log(resultObjects);

    const resultContainer = createResultContainer();
    document.querySelector('.mainContainer').after(resultContainer);
    resultContainer.innerHTML = `<div class='matchContainer'>
    <img src='/static/img/profile/${resultObjects[0].name}.jpg'>
    <p>당신과 닮은 래퍼는</p>
    <div><p class='matchName'>'${resultObjects[0].name}'</p><p>입니다.</p></div>
    </div>`;
    for (let i = 0; i <= 3; i++) {
        resultContainer.appendChild(createResultLabel(resultObjects[i], i));
    }

    const retryBtn = document.createElement('button');
    retryBtn.classList.add('retryBtn');
    retryBtn.innerText = '재시도';
    retryBtn.addEventListener('click', () => location.reload());
    resultContainer.appendChild(retryBtn);

    window.scrollTo(0, resultContainer.offsetTop + 50);
}

function createResultContainer() {
    const resultContainer = document.createElement("div");
    resultContainer.classList.add("resultContainer");
    return resultContainer;
}

function createResultObject(prediction) {
    const resultObjects = [];
    for (let i = 0; i < maxPredictions; i++) {
        const rapperName = prediction[i].className;
        const probability = prediction[i].probability.toFixed(2);
        resultObjects.push({
            name: rapperName,
            probability: probability
        });
    }
    return resultObjects;
}

function createResultLabel(resultObject, index) {
    const resultProbability = Math.floor(resultObject.probability * 100);
    resultLabel = document.createElement('div');
    resultLabel.classList.add('resultLabel');
    resultLabel.innerHTML = `<div class='resultName'>${resultObject.name}</div>
        <div class='probabilityBox'>
        <div class='resultProbability probability${index+1}' style='width:${(resultProbability > 0) ? ((resultProbability > 5) ? resultProbability : 5) : 3}%'>${resultProbability}%</div>
        </div>`;

    return resultLabel;
}