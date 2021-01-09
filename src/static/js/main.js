function insertLoader() {

    const loader = document.createElement('div');
    loader.classList.add('loadingContainer');
    loader.innerHTML = `<div class='loader'><span></span></div>
    <h2>AI가 당신과 닮은 래퍼를 분석 중입니다.</h2>`;
    document.querySelector('.mainContainer').after(loader);
}

function removeLoader() {
    const loader = document.querySelector('.loadingContainer');
    document.body.removeChild(loader);
}


function imagePreview(e) {

    const imageContainer = document.querySelector('.imageContainer');
    const file = e.target.files[0];
    if (file === null) return;

    if (!file.type.match('image/.*')) {
        alert('이미지만 업로드 가능합니다!');
        return;
    }

    var fileReader = new FileReader();
    fileReader.onload = function (e) {

        disableImageInput(imageContainer);
        insertLoader();
        window.scrollTo(0, imageContainer.offsetTop - 150);
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

function disableImageInput(imageContainer) {
    const imageInput = document.querySelector('.imageInput');
    imageInput.disabled = true;
    imageInput.classList.add('disabled');
    imageContainer.classList.add('disabled');
    // document.querySelector('.imageContainer').style.cursor = 'default';
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

    const resultContainer = createResultContainer();
    document.querySelector('.mainContainer').after(resultContainer);
    resultContainer.innerHTML = `<div class='matchContainer'>
    <img src='src/static/img/profile/${resultObjects[0].name}.jpg'>
    <p>당신과 닮은 래퍼는</p>
    <div><p class='matchName'>'${resultObjects[0].name}'</p></div>
    <div class='matchDescription'>쇼미더머니4 참가자. 1990년 5월 30일생(30세)이며, 밀리언 뭘리 소속이다.
    <a href='https://namu.wiki/w/${resultObjects[0].name}' target='_blank'>more<i class="fas fa-external-link-alt"></i></a></div>
    </div>`;
    for (let i = 0; i <= 3; i++) {
        resultContainer.appendChild(createResultLabel(resultObjects[i], i));
        enlargeResultImage(resultObjects[i], i);
    }

    afterPredict(resultContainer);
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
    resultLabel.innerHTML = `<img src='src/static/img/profile/${resultObject.name}.jpg'>
        <div class='resultName'>${resultObject.name}</div>
        <div class='probabilityContainer'>
            <div class='probabilityBox'></div>
            <div class='resultProbability probability${index+1}' style='width:${(resultProbability > 0) ? ((resultProbability > 5) ? resultProbability-0.5 : 5) : 3}%'>${resultProbability}%</div>
        </div>`;

    return resultLabel;
}

function enlargeResultImage(resultObject, index){
    const resultImage = document.querySelectorAll('.resultLabel img');
    resultImage[index].addEventListener('click', ()=>{
        const imageModal = document.createElement('div');
        imageModal.classList.add('imageModal');
        const enlargeImage = `<img src='src/static/img/profile/${resultObject.name}.jpg'>`;
        imageModal.innerHTML = enlargeImage;
        imageModal.addEventListener('click', ()=>{
            document.querySelector('body').removeChild(imageModal);
        })
        document.querySelector('body').appendChild(imageModal);
    })
}

const footerEmail = document.querySelector('.footerEmail');
const email = footerEmail.innerText;
footerEmail.addEventListener('click', ()=>copyText(email, '이메일 복사 완료.'));

function copyText(copyText, alertText='복사 되었습니다.') {
    const createInput = document.createElement('input');
    createInput.setAttribute('type', 'text');
    document.body.appendChild(createInput);

    createInput.value = copyText;
    createInput.select();
    document.execCommand('copy');
    document.body.removeChild(createInput);

    alert(alertText);
}

function afterPredict(resultContainer){

    const shareBtns = document.createElement('div');
    shareBtns.classList.add('shareBtns');
    resultContainer.appendChild(shareBtns);

    const linkShareBtn = document.createElement('button');
    linkShareBtn.innerHTML = `<i class="fas fa-link"></i>`;
    linkShareBtn.addEventListener('click', ()=> copyText('https://resemble.ga/', 'URL 복사 완료'));
    
    const addthisDiv = document.createElement('div');
    addthisDiv.classList.add('addthis_inline_share_toolbox');

    shareBtns.append(linkShareBtn, addthisDiv);

    setTimeout(() => {
        const addthisScript = document.createElement('script');
        addthisScript.setAttribute('src', '//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-5ff986321bc6dd4b');
        document.querySelector('body').appendChild(addthisScript);
    }, 500);

    const retryBtn = document.createElement('button');
    retryBtn.classList.add('retryBtn');
    retryBtn.innerText = '다시 해보기';
    retryBtn.addEventListener('click', () => {
        window.scrollTo(0, 0);
        setTimeout(() => {
            location.reload();
        }, 1000);
    });
    resultContainer.appendChild(retryBtn);    
    
    window.scrollTo(0, resultContainer.offsetTop -20);
}