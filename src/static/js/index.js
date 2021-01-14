document.addEventListener("mousemove", parallax);
function parallax(e) {
    this.querySelectorAll('.layer').forEach(layer => {
        const speed = layer.getAttribute('data-speed');

        const x = (window.innerWidth - e.pageX * speed) / 100;
        const y = (window.innerHeight - e.pageY * speed) / 100;
        
        layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });
}

document.addEventListener('touchmove', mobileParallax);
function mobileParallax(e) {
    this.querySelectorAll('.layer').forEach(layer => {
        const speed = layer.getAttribute('mobile-data-speed');

        const x = (window.innerWidth - e.changedTouches[0].pageX * speed) / 100;
        const y = (window.innerHeight - e.changedTouches[0].pageY * speed) / 100;
        
        layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
    });
}

const startBtn = document.querySelector('.startBtn');
startBtn.addEventListener('click', () =>{
    window.location.href="/main";
})