function imagePreview(e) {

    const imageContainer = document.querySelector('.imageContainer');
    const file = e.target.files[0];
    if(!file.type.match('image/.*')){
        alert('이미지만 업로드 가능합니다!');
        return;
    }

    var fileReader = new FileReader();
    fileReader.onload = function (e) {

        document.querySelector('.description').style.opacity = '0';
        var img = document.createElement('img');
        img.setAttribute('src', e.target.result);
        imageContainer.appendChild(img);

    };
    fileReader.readAsDataURL(file);
}