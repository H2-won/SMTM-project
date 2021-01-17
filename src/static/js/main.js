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

        window.scrollTo(0, imageContainer.offsetTop - 150);
        imageContainer.classList.add('disabled');
        imageContainer.removeChild(document.querySelector('.description'));
        imageContainer.removeChild(document.querySelector('.imageInput'));
        imageContainer.appendChild(createImage(e));

        setRelatedCropper();

    };
    fileReader.readAsDataURL(file);
}

function createImage(e) {
    let img = document.createElement('img');
    img.setAttribute('src', e.target.result);
    img.classList.add('userImage');
    return img;
}

function setRelatedCropper() {
    const mainContainer = document.querySelector('.mainContainer');
    const imageContainer = document.querySelector('.imageContainer');
    const image = document.querySelector('.imageContainer img');
    const cropper = new Cropper(image, {
        viewMode: 1,
        aspectRatio: 1 / 1,
        dragMode: false,
        zoomOnTouch: false,
        zoomOnWheel: false,
        autoCrop: true,
        crop() {}
    });

    const helpCrop = document.createElement('p');
    helpCrop.classList.add('helpCrop');
    helpCrop.innerHTML = '<i class="fas fa-long-arrow-alt-down"></i>회전 / 편집 박스 조절 후 분석<i class="fas fa-long-arrow-alt-down"></i>';

    const cropBtnDiv = document.createElement('div');
    cropBtnDiv.classList.add('cropBtnDiv');

    const rotateBtn = document.createElement('button');
    rotateBtn.classList.add('rotateBtn');
    rotateBtn.innerHTML = '<i class="fas fa-redo"></i>';
    rotateBtn.addEventListener('click', () => cropper.rotate(90));

    const cropBtn = document.createElement('button');
    cropBtn.innerText = '분석하기';
    cropBtn.classList.add('cropBtn');
    cropBtn.addEventListener('click', () => {
        cropImage(cropper, cropBtnDiv, helpCrop, mainContainer, imageContainer);
        insertLoader();
        setTimeout(() => {
            removeLoader();
            predict();
        }, 1000);
    });
    
    cropBtnDiv.append(rotateBtn, cropBtn);
    mainContainer.append(helpCrop, cropBtnDiv);
}

function cropImage(cropper, cropBtnDiv, helpCrop, mainContainer, imageContainer) {
    const croppedCanvas = cropper.getCroppedCanvas();
    imageContainer.removeChild(document.querySelector('.cropper-container'));
    mainContainer.removeChild(helpCrop);
    mainContainer.removeChild(cropBtnDiv);

    const croppedImg = document.createElement('img');
    croppedImg.classList.add('croppedUserImg');
    croppedImg.setAttribute('src', croppedCanvas.toDataURL("image/jpg"));
    imageContainer.appendChild(croppedImg);
}

// ---------------------------- teachable machine ---------------------------
let model, maxPredictions;

initTeachablemachine();

async function initTeachablemachine() {
    const URL = "https://teachablemachine.withgoogle.com/models/hkhdXFrtT/";
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
}

async function predict() {

    const userImage = document.querySelector('.croppedUserImg');
    const prediction = await model.predict(userImage, false);

    const resultObjects = createResultObject(prediction);
    resultObjects.sort((a, b) => parseFloat(b.probability - a.probability));
    const rapperName = namuwikiExceptionHandling(resultObjects[0].name);
    const rapperDescription = getRapperDescriptionAPI(resultObjects[0].name);

    const resultContainer = createResultContainer();
    document.querySelector('.kakaoMiddle').after(resultContainer);
    resultContainer.innerHTML = `<div class='matchContainer'>
    <img src='src/static/img/profile/${resultObjects[0].name}.jpg'>
    <p>당신과 닮은 래퍼는</p>
    <div><p class='matchName'>'${resultObjects[0].name}'</p></div>
    <div class='matchDescription'>
    ${rapperDescription}
    <a href='https://namu.wiki/w/${rapperName}' target='_blank'>more<i class="fas fa-external-link-alt"></i></a>
    </div>
    </div>`;

    for (let i = 0; i < 5; i++) {
        const createdLabel = createResultLabel(resultObjects[i], i);
        if (!createdLabel) continue;
        resultContainer.appendChild(createdLabel);
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

    if (index > 2 && resultProbability < 2) return null;

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

function enlargeResultImage(resultObject, index) {
    const resultImage = document.querySelectorAll('.resultLabel img');
    resultImage[index].addEventListener('click', () => {
        createImageModal(resultObject.name);
    })
}

function createImageModal(rapperName) {
    const imageModal = document.createElement('div');
    imageModal.classList.add('imageModal');
    const enlargeImage = `<img src='src/static/img/profile/${rapperName}.jpg'>`;
    imageModal.innerHTML = enlargeImage;
    imageModal.addEventListener('click', () => {
        document.querySelector('body').removeChild(imageModal);
    })
    document.querySelector('body').appendChild(imageModal);
}

const footerEmail = document.querySelector('.footerEmail');
const email = footerEmail.innerText;
footerEmail.addEventListener('click', () => copyText(email, '이메일이 복사 되었습니다.'));

function copyText(copyText, alertText = '복사 되었습니다.') {
    const createInput = document.createElement('input');
    createInput.setAttribute('type', 'text');
    document.body.appendChild(createInput);

    createInput.value = copyText;
    createInput.select();
    document.execCommand('copy');
    document.body.removeChild(createInput);

    alert(alertText);
}

function afterPredict(resultContainer) {

    const shareBtns = document.createElement('div');
    shareBtns.classList.add('shareBtns');
    resultContainer.appendChild(shareBtns);

    const linkShareBtn = document.createElement('button');
    linkShareBtn.innerHTML = `<i class="fas fa-link"></i>`;
    linkShareBtn.addEventListener('click', () => copyText('https://resemble.ga/', '주소(URL) 복사 완료'));

    const addthisDiv = document.createElement('div');
    addthisDiv.classList.add('addthis_inline_share_toolbox');

    shareBtns.append(linkShareBtn, addthisDiv);

    const addthisScript = document.createElement('script');
    addthisScript.setAttribute('src', '//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-5ff986321bc6dd4b');
    addthisScript.setAttribute('type', 'text/javascript');
    document.querySelector('body').appendChild(addthisScript);

    const retryBtn = document.createElement('button');
    retryBtn.classList.add('retryBtn');
    retryBtn.innerText = '다시 해보기';
    retryBtn.addEventListener('click', () => {
        window.scrollTo(0, 0);
        setTimeout(() => {
            location.reload();
        }, 800);
    });

    const helpText = document.createElement('p');
    helpText.classList.add('imageHelp');
    helpText.innerHTML = `얼굴만 나올수록 정확도가 올라갑니다.`;
    const imageExample = document.createElement('p');
    imageExample.innerHTML = `<i class="fas fa-hand-point-right"></i>예시`;
    imageExample.addEventListener('click', () => {
        createImageModal('기리보이_example');
    })
    helpText.appendChild(imageExample);

    resultContainer.append(retryBtn, helpText);

    window.scrollTo(0, resultContainer.offsetTop - 20);
}

function namuwikiExceptionHandling(name){
    if(name === 'G2') return '지투(래퍼)';
    else if(name === '길') return '길(가수)';
    else if(name === '노엘') return 'NO:EL';
    else if(name === '루피') return '루피(래퍼)';
    else if(name === '바스코') return 'BILL STAX';
    else if(name === '션') return '션(지누션)';
    else if(name === '아웃사이더') return '아웃사이더(래퍼)';
    else if(name === '이노베이터') return '이노베이터(래퍼)';
    else if(name === '행주') return 'HANGZOO';
    else if(name === '개코') return '개코(래퍼)';
    else if(name === '규정') return '박규정';
    else if(name === '그레이') return 'GRAY';
    else if(name === '도끼') return 'dok2';
    else if(name === '디보') return 'Dbo';
    else if(name === '디아크') return 'D.ark';
    else if(name === '면도') return 'myundo';
    else if(name === '비지') return 'Bizzy';
    else if(name === '원') return '원(래퍼)';
    else if(name === '치타') return '치타(가수)';
    else if(name === '쿠시') return 'KUSH';
}

function getRapperDescriptionAPI(rapperName) {
    const url = 'https://resemble.ga/api/description';
    fetch(url, {
            method: 'POST',
            body: JSON.stringify(rapperName),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.json())
        .then(res => {
            if(res.status == 200) return res;
            else return '';
        })
        .catch(err => errorHandler(err));
}

function errorHandler(error) {
    if (!error || !(error.res)) {
        console.log(error);
        alert('에러가 발생하였습니다. 다시 시도해주세요.');
    }
}