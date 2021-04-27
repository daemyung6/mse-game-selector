let lifeTime = 3000;
function show(msg) {
    let div = document.createElement('div');
    div.innerText = msg;
    div.style.cssText = `
        opacity : 0;
        width: 370px;
        height: 100px;
        position: absolute;
        background: #000000cc;
        z-index: 99;
        display: flex;
        justify-content: center;
        color: white;
        align-items: center;
        font-family: 'GyeonggiTitleB';
        box-shadow: 10px 10px 10px rgb(0 0 0 / 37%);
        font-size: 24px;
        right: 20px;
        top: 20px;
        transition: all 500ms;
    `
    document.body.appendChild(div);
    setTimeout(function() {
        div.style.opacity = '1';
    }, 10)

    setTimeout(function() {
        div.style.opacity = '0';
    }, lifeTime)
    setTimeout(function() {
        div.remove();
    }, lifeTime + 500)
}
module.exports = {
    show : show,
}