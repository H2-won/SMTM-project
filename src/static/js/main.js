function insertLoader() {
  const loader = document.createElement("div");
  loader.classList.add("loadingContainer");
  loader.innerHTML = `<div class='loader'><span></span></div>
    <h2>AI가 당신과 닮은 래퍼를 분석 중입니다.</h2>`;
  document.querySelector(".mainContainer").after(loader);
}

function removeLoader() {
  const loader = document.querySelector(".loadingContainer");
  document.body.removeChild(loader);
}

function imagePreview(e) {
  const imageContainer = document.querySelector(".imageContainer");
  const file = e.target.files[0];
  if (file === null) return;

  if (!file.type.match("image/.*")) {
    alert("이미지만 업로드 가능합니다!");
    return;
  }

  var fileReader = new FileReader();
  fileReader.onload = function (e) {
    window.scrollTo(0, imageContainer.offsetTop - 150);
    imageContainer.classList.add("disabled");
    imageContainer.removeChild(document.querySelector(".description"));
    imageContainer.removeChild(document.querySelector(".imageInput"));
    imageContainer.appendChild(createImage(e));

    setRelatedCropper();
  };
  fileReader.readAsDataURL(file);
}

function createImage(e) {
  let img = document.createElement("img");
  img.setAttribute("src", e.target.result);
  img.classList.add("userImage");
  return img;
}

function setRelatedCropper() {
  const mainContainer = document.querySelector(".mainContainer");
  const imageContainer = document.querySelector(".imageContainer");
  const image = document.querySelector(".imageContainer img");
  const cropper = new Cropper(image, {
    viewMode: 1,
    aspectRatio: 1 / 1,
    dragMode: false,
    zoomOnTouch: false,
    zoomOnWheel: false,
    autoCrop: true,
    crop() {},
  });

  const helpCrop = document.createElement("p");
  helpCrop.classList.add("helpCrop");
  helpCrop.innerHTML =
    '<i class="fas fa-long-arrow-alt-down"></i>회전 / 편집 박스 조절 후 분석<i class="fas fa-long-arrow-alt-down"></i>';

  const cropBtnDiv = document.createElement("div");
  cropBtnDiv.classList.add("cropBtnDiv");

  const rotateBtn = document.createElement("button");
  rotateBtn.classList.add("rotateBtn");
  rotateBtn.innerHTML = '<i class="fas fa-redo"></i>';
  rotateBtn.addEventListener("click", () => cropper.rotate(90));

  const cropBtn = document.createElement("button");
  cropBtn.innerText = "분석하기";
  cropBtn.classList.add("cropBtn");
  cropBtn.addEventListener("click", () => {
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

function cropImage(
  cropper,
  cropBtnDiv,
  helpCrop,
  mainContainer,
  imageContainer
) {
  const croppedCanvas = cropper.getCroppedCanvas();
  imageContainer.removeChild(document.querySelector(".cropper-container"));
  mainContainer.removeChild(helpCrop);
  mainContainer.removeChild(cropBtnDiv);

  const croppedImg = document.createElement("img");
  croppedImg.classList.add("croppedUserImg");
  croppedImg.setAttribute("src", croppedCanvas.toDataURL("image/jpg"));
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
  const userImage = document.querySelector(".croppedUserImg");
  const prediction = await model.predict(userImage, false);

  const resultObjects = createResultObject(prediction);
  resultObjects.sort((a, b) => parseFloat(b.probability - a.probability));
  const rapperName = namuwikiExceptionHandling(resultObjects[0].name);
  const rapperDescription = getRapperDescription(resultObjects[0].name);

  const resultContainer = createResultContainer();
  document.querySelector(".kakaoMiddle").after(resultContainer);
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
      probability: probability,
    });
  }
  return resultObjects;
}

function createResultLabel(resultObject, index) {
  const resultProbability = Math.floor(resultObject.probability * 100);

  if (index > 2 && resultProbability < 2) return null;

  resultLabel = document.createElement("div");
  resultLabel.classList.add("resultLabel");
  resultLabel.innerHTML = `<img src='src/static/img/profile/${
    resultObject.name
  }.jpg'>
        <div class='resultName'>${resultObject.name}</div>
        <div class='probabilityContainer'>
            <div class='probabilityBox'></div>
            <div class='resultProbability probability${
              index + 1
            }' style='width:${
    resultProbability > 0
      ? resultProbability > 5
        ? resultProbability - 0.5
        : 5
      : 3
  }%'>${resultProbability}%</div>
        </div>`;

  return resultLabel;
}

function enlargeResultImage(resultObject, index) {
  const resultImage = document.querySelectorAll(".resultLabel img");
  resultImage[index].addEventListener("click", () => {
    createImageModal(resultObject.name);
  });
}

function createImageModal(rapperName) {
  const imageModal = document.createElement("div");
  imageModal.classList.add("imageModal");
  const enlargeImage = `<img src='src/static/img/profile/${rapperName}.jpg'>`;
  imageModal.innerHTML = enlargeImage;
  imageModal.addEventListener("click", () => {
    document.querySelector("body").removeChild(imageModal);
  });
  document.querySelector("body").appendChild(imageModal);
}

const footerEmail = document.querySelector(".footerEmail");
const email = footerEmail.innerText;
footerEmail.addEventListener("click", () =>
  copyText(email, "이메일이 복사 되었습니다.")
);

function copyText(copyText, alertText = "복사 되었습니다.") {
  const createInput = document.createElement("input");
  createInput.setAttribute("type", "text");
  document.body.appendChild(createInput);

  createInput.value = copyText;
  createInput.select();
  document.execCommand("copy");
  document.body.removeChild(createInput);

  alert(alertText);
}

function afterPredict(resultContainer) {
  const shareBtns = document.createElement("div");
  shareBtns.classList.add("shareBtns");
  resultContainer.appendChild(shareBtns);

  const linkShareBtn = document.createElement("button");
  linkShareBtn.innerHTML = `<i class="fas fa-link"></i>`;
  linkShareBtn.addEventListener("click", () =>
    copyText("https://resemble.ga/", "주소(URL) 복사 완료")
  );

  const addthisDiv = document.createElement("div");
  addthisDiv.classList.add("addthis_inline_share_toolbox");

  shareBtns.append(linkShareBtn, addthisDiv);

  const addthisScript = document.createElement("script");
  addthisScript.setAttribute(
    "src",
    "//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-5ff986321bc6dd4b"
  );
  addthisScript.setAttribute("type", "text/javascript");
  document.querySelector("body").appendChild(addthisScript);

  const retryBtn = document.createElement("button");
  retryBtn.classList.add("retryBtn");
  retryBtn.innerText = "다시 해보기";
  retryBtn.addEventListener("click", () => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      location.reload();
    }, 800);
  });

  const helpText = document.createElement("p");
  helpText.classList.add("imageHelp");
  helpText.innerHTML = `얼굴만 나올수록 정확도가 올라갑니다.`;
  const imageExample = document.createElement("p");
  imageExample.innerHTML = `<i class="fas fa-hand-point-right"></i>예시`;
  imageExample.addEventListener("click", () => {
    createImageModal("기리보이_example");
  });
  helpText.appendChild(imageExample);

  resultContainer.append(retryBtn, helpText);

  window.scrollTo(0, document.querySelector(".kakaoMiddle").offsetTop - 100);
}

function namuwikiExceptionHandling(name) {
  if (name === "G2") return "지투(래퍼)";
  else if (name === "길") return "길(가수)";
  else if (name === "노엘") return "NO:EL";
  else if (name === "루피") return "루피(래퍼)";
  else if (name === "바스코") return "BILL STAX";
  else if (name === "션") return "션(지누션)";
  else if (name === "아웃사이더") return "아웃사이더(래퍼)";
  else if (name === "이노베이터") return "이노베이터(래퍼)";
  else if (name === "행주") return "HANGZOO";
  else if (name === "개코") return "개코(래퍼)";
  else if (name === "규정") return "박규정";
  else if (name === "그레이") return "GRAY";
  else if (name === "도끼") return "dok2";
  else if (name === "디보") return "Dbo";
  else if (name === "디아크") return "D.ark";
  else if (name === "면도") return "myundo";
  else if (name === "비지") return "Bizzy";
  else if (name === "원") return "원(래퍼)";
  else if (name === "치타") return "치타(가수)";
  else if (name === "쿠시") return "KUSH";
  else return name;
}

function getRapperDescription(name) {
  if (name == "pH-1")
    return "쇼미더머니 시즌 7 참가자. 출생연도는 1989.07.23 이며, H1GHR MUSIC 소속이다.";
  else if (name == "개코")
    return "쇼미더머니 시즌 9 프로듀서. 출생연도는 1981.01.14 이며, 아메바컬쳐 소속이다.";
  else if (name == "규정")
    return "쇼미더머니 시즌 9 프로듀서. 출생연도는 1994.12.12 이며, H1GHR MUSIC 소속이다.";
  else if (name == "그레이")
    return "쇼미더머니 시즌 5 프로듀서. 출생연도는 1986.12.08 이며, AOMG 소속이다.";
  else if (name == "기리보이")
    return "쇼미더머니 시즌 3 참가자/시즌 7,8,9 프로듀서. 출생연도는 1991.01.24 이며, Just Music 소속이다.";
  else if (name == "더콰이엇")
    return "쇼미더머니 시즌 3,4,5 프로듀서. 출생연도는 1985.01.29 이며, Daytona 소속이다.";
  else if (name == "도끼")
    return "쇼미더머니 시즌 3,5,6 프로듀서. 출생연도는 1990.03.28 이며, Yellowmoney records 소속이다.";
  else if (name == "디보")
    return "쇼미더머니 시즌 3,7,8 참가자. 출생연도는 1992.07.18 이며, FPL 소속이다.";
  else if (name == "디아크")
    return "쇼미더머니 시즌 7,9 참가자. 출생연도는 2004.07.15 이며, P Nation 소속이다.";
  else if (name == "딘딘")
    return "쇼미더머니 시즌 2 참가자. 출생연도는 1991.11.20 이며, D&D 소속이다.";
  else if (name == "딥플로우")
    return "쇼미더머니 시즌 7 프로듀서. 출생연도는 1984.08.02 이며, VMC 소속이다.";
  else if (name == "마미손")
    return "쇼미더머니 시즌 7 참가자. 출생연도는 베일에 쌓여있으며, 뷰티풀 노이즈 소속이다.";
  else if (name == "마이크로닷")
    return "쇼미더머니 시즌 4,5,6 참가자. 출생연도는 1993.11.21 이며, 무소속이다.";
  else if (name == "매드클라운")
    return "쇼미더머니 시즌 5,8 프로듀서. 출생연도는 1985.03.25 이며, 뷰티풀 노이즈 소속이다.";
  else if (name == "맥대디")
    return "쇼미더머니 시즌 7,8,9 참가자. 출생연도는 1990.09.04 이며, 그랜드라인 소속이다.";
  else if (name == "머쉬베놈")
    return "쇼미더머니 시즌 9 준우승자. 출생연도는 1994.06.20 이며, 무소속이다.";
  else if (name == "면도")
    return "쇼미더머니 시즌 4,5,6 참가자. 출생연도는 1994.08.04 이며, B.A.D. 소속이다.";
  else if (name == "보이콜드")
    return "쇼미더머니 시즌 8 프로듀서. 출생연도는 1995.06.21 이며, 소니 뮤직 소속이다.";
  else if (name == "블랙나인")
    return "쇼미더머니 시즌 6,7 참가자. 출생연도는 1991.04.08 이며, B.A.D. 소속이다.";
  else if (name == "블랙넛")
    return "쇼미더머니 시즌 4 참가자. 출생연도는 1989.01.01 이며, Just Music 소속이다.";
  else if (name == "비와이")
    return "쇼미더머니 시즌 5 우승자 / 시즌 9 프로듀서. 출생연도는 1993.06.15 이며, Dejavu 소속이다.";
  else if (name == "비지")
    return "쇼미더머니 시즌 6 프로듀서. 출생연도는 1980.02.29 이며, 필굿뮤직 소속이다.";
  else if (name == "보이비")
    return "쇼미더머니 시즌 5,6 참가자. 출생연도는 1986.09.04 이며, 리듬파워 소속이다.";
  else if (name == "수퍼비")
    return "쇼미더머니 시즌 4,5,7 참가자. 출생연도는 1994.05.02 이며, Y&R 소속이다.";
  else if (name == "스내키챈")
    return "쇼미더머니 시즌 3,5,7 참가자. 출생연도는 공식적으로 나와있지 않으며, 다이너스티뮤직 소속이다.";
  else if (name == "스월비")
    return "쇼미더머니 시즌 7,8 참가자. 출생연도는 2001.12.25 이며, 하이라이트 레코즈 소속이다.";
  else if (name == "스윙스")
    return "쇼미더머니 시즌 2,9 참가자 / 시즌 7,8 프로듀서. 출생연도는 1986.10.14 이며, IMJMWDP 소속이다.";
  else if (name == "스카이민혁")
    return "쇼미더머니 시즌 9 참가자. 출생연도는 1998.12.05 이며, 그랜드라인 소속이다.";
  else if (name == "슬리피")
    return "쇼미더머니 시즌 6 참가자. 출생연도는 1984.02.21 이며, PVO 소속이다.";
  else if (name == "오왼오바도즈")
    return "쇼미더머니 시즌 3,4,7,8,9 참가자. 출생연도는 1991.10.13 이며, MKIT RAIN 소속이다.";
  else if (name == "올티")
    return "쇼미더머니 시즌 3,6,8 참가자. 출생연도는 1996.01.02 이며, ADV 소속이다.";
  else if (name == "우디고차일드")
    return "쇼미더머니 시즌 6,8 참가자. 출생연도는 1996.04.02 이며, H1GHR MUSIC 소속이다.";
  else if (name == "우원재")
    return "쇼미더머니 시즌 6 참가자. 출생연도는 1996.12.23 이며, AOMG 소속이다.";
  else if (name == "우태운")
    return "쇼미더머니 시즌 4,5 참가자. 출생연도는 1990.05.11 이며, 밀리언 마켓 소속이다.";
  else if (name == "원")
    return "쇼미더머니 시즌 4,5 참가자. 출생연도는 1994.03.29 이며, PRIVATE ONLY 소속이다.";
  else if (name == "자이언티")
    return "쇼미더머니 시즌 5,9 프로듀서. 출생연도는 1989.04.13 이며, 더블랙레이블 소속이다.";
  else if (name == "저스디스")
    return "쇼미더머니 시즌 9 프로듀서. 출생연도는 1991.05.07 이며, Indigo Music 소속이다.";
  else if (name == "제네더질라")
    return "쇼미더머니 시즌 7,8 참가자. 출생연도는 1994.07.07 이며, AMBITION MUSIK 소속이다.";
  else if (name == "제이켠")
    return "쇼미더머니 시즌 2,5,6,8,9 참가자. 출생연도는 1985.01.11 이며, GRVVONLY 소속이다.";
  else if (name == "조우찬")
    return "쇼미더머니 시즌 6 참가자. 출생연도는 2005.01.20 이며, 무소속이다.";
  else if (name == "졸리브이")
    return "쇼미더머니 시즌 3 참가자. 출생연도는 1989.04.16 이며, 무소속이다.";
  else if (name == "최자")
    return "쇼미더머니 시즌 9 프로듀서. 출생연도는 1980.03.17 이며, 아메바컬쳐 소속이다.";
  else if (name == "치타")
    return "쇼미더머니 시즌 1 참가자. 출생연도는 1990.05.25 이며, 크다엔터테인먼트 소속이다.";
  else if (name == "칠린호미")
    return "쇼미더머니 시즌 7,8,9 참가자. 출생연도는 1999.09.03 이며, NFL 소속이다.";
  else if (name == "코드쿤스트")
    return "쇼미더머니 시즌 7,9 프로듀서. 출생연도는 1989.12.18 이며, AOMG 소속이다.";
  else if (name == "쿠기")
    return "쇼미더머니 시즌 7 참가자. 출생연도는 1994.01.23 이며, 밀리언 마켓 소속이다.";
  else if (name == "쿠시")
    return "쇼미더머니 시즌 5 프로듀서. 출생연도는 1984.07.28 이며, 하트엔터테인먼트 소속이다.";
  else if (name == "타쿠와")
    return "쇼미더머니 시즌 8,9 참가자. 출생연도는 1995.08.11 이며, 무소속이다.";
  else if (name == "팔로알토")
    return "쇼미더머니 시즌 4,7,9 프로듀서. 출생연도는 1984.01.24 이며, 하이라이트 레코즈 소속이다.";
  else if (name == "플로우식")
    return "쇼미더머니 시즌 5 참가자. 출생연도는 1985.04.05 이며, 사우스 퍼 레코드 소속이다.";
  else if (name == "피타입")
    return "쇼미더머니 시즌 4,6 참가자. 출생연도는 1979.12.16 이며, 불한당 소속이다.";
  else if (name == "한해")
    return "쇼미더머니 시즌 4,6 참가자. 출생연도는 1990.04.07 이며, 브랜뉴 뮤직 소속이다.";
  else if (name == "해쉬스완")
    return "쇼미더머니 시즌 5,6 참가자. 출생연도는 1995.03.12 이며, AMBITION MUSIK 소속이다.";
  else if (name == "B.I")
    return "쇼미더머니 시즌 3 참가자. 출생연도는 1996.10.22 이며, 131 레이블 소속이다.";
  else if (name == "BOBBY")
    return "쇼미더머니 시즌 3 우승자. 출생연도는 1995.12.21 이며, YG엔터테인먼트 소속이다.";
  else if (name == "DEAN")
    return "쇼미더머니 시즌 6 프로듀서. 출생연도는 1992.11.10 이며, UMG 소속이다.";
  else if (name == "EK")
    return "쇼미더머니 시즌 7,8 참가자. 출생연도는 1992.09.05 이며, 무소속이다.";
  else if (name == "G2")
    return "쇼미더머니 시즌 5 참가자. 출생연도는 1992.05.01 이며, 무소속이다.";
  else if (name == "ODEE")
    return "쇼미더머니 시즌 3,6,7 참가자. 출생연도는 1992.08.25 이며, VMC 소속이다.";
  else if (name == "길")
    return "쇼미더머니 시즌 5 프로듀서. 출생연도는 1978.02.15 이며, 매직 맨션 소속이다.";
  else if (name == "김효은")
    return "쇼미더머니 시즌 3,5,6,7 참가자. 출생연도는 1993.07.29 이며, AMBITION MUSIK 소속이다.";
  else if (name == "나플라")
    return "쇼미더머니 시즌 7 우승자. 출생연도는 1992.02.28 이며, GROOVL1N 소속이다.";
  else if (name == "넉살")
    return "쇼미더머니 시즌 2 참가자 / 시즌 6 준우승자 / 시즌 7 프로듀서. 출생연도는 1987.03.24 이며, VMC 소속이다.";
  else if (name == "노엘")
    return "쇼미더머니 시즌 6,7 참가자. 출생연도는 2000.05.30 이며, 무소속이다.";
  else if (name == "뉴챔프")
    return "쇼미더머니 시즌 3,4,6,7,8 참가자. 출생연도는 1986.06.11 이며, 무소속이다.";
  else if (name == "래원")
    return "쇼미더머니 시즌 6,8,9 참가자. 출생연도는 2001.11.13 이며, OUTLIVE 소속이다.";
  else if (name == "레디")
    return "쇼미더머니 시즌 5,7 참가자. 출생연도는 1985.11.11 이며, 하이라이트 레코즈 소속이다.";
  else if (name == "로꼬")
    return "쇼미더머니 시즌 1 우승자 / 시즌 4 프로듀서. 출생연도는 1989.12.25 이며, AOMG 소속이다.";
  else if (name == "루피")
    return "쇼미더머니 시즌 7 준우승자. 출생연도는 1987.09.09 이며, MKIT RAIN 소속이다.";
  else if (name == "릴보이")
    return "쇼미더머니 시즌 4 참가자 / 시즌 9 우승자. 출생연도는 1991.06.07 이며, 하프타임 레코즈 소속이다.";
  else if (name == "릴타치")
    return "쇼미더머니 시즌 7,8 참가자. 출생연도는 2002.02.04 이며, WEDAPLUGG RECORDS 소속이다.";
  else if (name == "미란이")
    return "쇼미더머니 시즌 7,9 참가자. 출생연도는 1996.05.14 이며, 무소속이다.";
  else if (name == "밀릭")
    return "쇼미더머니 시즌 8 프로듀서. 출생연도는 1993.04.24 이며, FANXY CHILD 소속이다.";
  else if (name == "바스코")
    return "쇼미더머니 시즌 3,9 참가자. 출생연도는 1980.12.18 이며, 밀리언 마켓 소속이다.";
  else if (name == "박재범")
    return "쇼미더머니 시즌 4,6 프로듀서. 출생연도는 1987.04.25 이며, AOMG 수장이다.";
  else if (name == "버벌진트")
    return "쇼미더머니 시즌 1 참가자 / 시즌 4,8 프로듀서. 출생연도는 1980.12.19 이며, 아더사이드 소속이다.";
  else if (name == "베이식")
    return "쇼미더머니 시즌 4 우승자. 출생연도는 1986.08.12 이며, OUTLIVE 소속이다.";
  else if (name == "사이먼도미닉")
    return "쇼미더머니 시즌 5 프로듀서. 출생연도는 1984.03.09 이며, AOMG 소속이다.";
  else if (name == "산이")
    return "쇼미더머니 시즌 3,4 프로듀서. 출생연도는 1985.01.23 이며, 오버클래스 소속이다.";
  else if (name == "샵건")
    return "쇼미더머니 시즌 5 참가자. 출생연도는 1994.06.26 이며, 로엔 엔터테인먼트 소속이다.";
  else if (name == "서출구")
    return "쇼미더머니 시즌 4,5 참가자. 출생연도는 1992.12.02 이며, K타이거즈 E&C 소속이다.";
  else if (name == "션")
    return "쇼미더머니 시즌 4 프로듀서. 출생연도는 1972.10.10 이며, 지누션 소속이다.";
  else if (name == "송민호")
    return "쇼미더머니 시즌 4 준우승자. 출생연도는 1993.03.30 이며, YG엔터테인먼트 소속이다.";
  else if (name == "씨잼")
    return "쇼미더머니 시즌 5 준우승자 / 시즌 6 참가자. 출생연도는 1993.02.28 이며, Just Music 소속이다.";
  else if (name == "아웃사이더")
    return "쇼미더머니 시즌 2 프로듀서. 출생연도는 1983.03.21 이며, 이나키스트 엔터테인먼트 소속이다.";
  else if (name == "앤덥")
    return "쇼미더머니 시즌 4 참가자. 출생연도는 1993.03.28 이며, 벅와일즈 소속이다.";
  else if (name == "양동근")
    return "쇼미더머니 시즌 3 프로듀서. 출생연도는 1979.06.01 이며, 조엔터테인먼트 소속이다.";
  else if (name == "양홍원")
    return "쇼미더머니 시즌 4,5,6 참가자 / 시즌 8 준우승자. 출생연도는 1999.01.12 이며, Indigo Music 소속이다.";
  else if (name == "오르내림")
    return "쇼미더머니 시즌 4,7 참가자. 출생연도는 1996.09.18 이며, WEDAPLUGG RECORDS 소속이다.";
  else if (name == "원슈타인")
    return "쇼미더머니 시즌 4,7,8,9 참가자. 출생연도는 1995.05.06 이며, 뷰티풀 노이즈 소속이다.";
  else if (name == "육지담")
    return "쇼미더머니 시즌 3 참가자. 출생연도는 1997.03.13 이며, 무소속이다.";
  else if (name == "윤비")
    return "쇼미더머니 시즌 6,7,8 참가자. 출생연도는 1992.04.15 이며, 하이라이트 레코즈 소속이다.";
  else if (name == "윤훼이")
    return "쇼미더머니 시즌 8 참가자. 출생연도는 1995.04.06 이며, WEDAPLUGG RECORDS 소속이다.";
  else if (name == "이노베이터")
    return "쇼미더머니 시즌 4 참가자. 출생연도는 1988.10.10 이며, 더블트러블 소속이다.";
  else if (name == "자메즈")
    return "쇼미더머니 시즌 2,3,4,6 참가자. 출생연도는 1989.08.11 이며, 크로스하츠 소속이다.";
  else if (name == "주노플로")
    return "쇼미더머니 시즌 5,6 참가자. 출생연도는 1992.09.25 이며, 무소속이다.";
  else if (name == "주헌")
    return "쇼미더머니 시즌 4 참가자. 출생연도는 1994.10.06 이며, STARSHIP 소속이다.";
  else if (name == "지조")
    return "쇼미더머니 시즌 2 준우승자 / 시즌 8 참가자. 출생연도는 1986.01.01 이며, QUAN 엔터테인먼트 소속이다.";
  else if (name == "지코")
    return "쇼미더머니 시즌 4,6 프로듀서. 출생연도는 1992.09.14 이며, KOZ 엔터테인먼트 소속이다.";
  else if (name == "차붐")
    return "쇼미더머니 시즌 7 참가자. 출생연도는 1985.04.05 이며, LBNC 소속이다.";
  else if (name == "창모")
    return "쇼미더머니 시즌 3 참가자 / 시즌 7 프로듀서. 출생연도는 1994.05.31 이며, AMBITION MUSIK 소속이다.";
  else if (name == "쿤디판다")
    return "쇼미더머니 시즌 5,8 참가자. 출생연도는 1997.02.11 이며, Dejavu Group 소속이다.";
  else if (name == "키드밀리")
    return "쇼미더머니 시즌 7 참가자 / 시즌 8 프로듀서. 출생연도는 1993.10.26 이며, Indigo Music 소속이다.";
  else if (name == "키썸")
    return "쇼미더머니 시즌 3 참가자. 출생연도는 1994.01.20 이며, kakao M 소속이다.";
  else if (name == "킬라그램")
    return "쇼미더머니 시즌 6,9 참가자. 출생연도는 1992.06.23 이며, KIWI MEDIA GROUP 소속이다.";
  else if (name == "타블로")
    return "쇼미더머니 시즌 3,4 프로듀서. 출생연도는 1980.07.22 이며, 아워즈 소속이다.";
  else if (name == "타이거JK")
    return "쇼미더머니 시즌 6 프로듀서. 출생연도는 1974.06.11 이며, MFBTY 소속이다.";
  else if (name == "행주")
    return "쇼미더머니 시즌 4 참가자 / 시즌 6 우승자. 출생연도는 1986.12.10 이며, 팀플레이 뮤직 소속이다.";
  else if (name == "휘민")
    return "쇼미더머니 시즌 9 프로듀서. 출생연도는 1994.08.05 이며, H1GHR MUSIC 소속이다.";
}

function jocodingLink() {
  window.open(
    "https://www.youtube.com/c/%EC%A1%B0%EC%BD%94%EB%94%A9JoCoding/featured"
  );
}
