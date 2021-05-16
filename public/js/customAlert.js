window.toast = window.toast || {};

toast = (function () {

    var toast = function (icon, msg, location) {
        var tst = SweetAlert.mixin({
            toast: true,
            position: location,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: false,
            onOpen: function (toast) {
                toast.addEventListener('mouseenter', SweetAlert.stopTimer)
                toast.addEventListener('mouseleave', SweetAlert.resumeTimer)
            }
        });
        // target: document.getElementById('roadview-div')
        //타겟없을시 : 기본
        tst.fire({
            // target: document.getElementById('canvas_crop'),
            icon: icon,
            title: msg,
        });
    };


    var radioAlert = async () => {
        const inputOptions = new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    'LANGUAGE_ENGLISH': 'English',
                    'LANGUAGE_KOREAN': 'Korean',
                    'LANGUAGE_CHINA': 'China'
                })
            }, 1000)
        })
        const { value: language } = await Swal.fire({
            title: '언어를 선택하세요.',
            input: 'radio',
            inputOptions: inputOptions,
            closeOnEsc: false,
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to choose something!'
                }
            }
        })
        if (language) {
            Swal.fire({ html: `You selected: ${language}` })
        }
    }
var notice = () => {
        var selectEle =`<select class="form-select form-select-sm mb-3 selecetLanNotice" aria-label=".form-select-sm example">
                        <option selected value="eng">English</option>
                        <option value="kor">Korean</option>
                        <option value="chi">Chinese</option>
                    </select>`
    Swal.fire({
        icon: 'info',
        title: selectEle,
        html: arker_lan.popMsg
        // footer: '<a href>Why do I have this issue?</a>'
    })

}

    var module = {
        toast: toast,
        notice: notice,
        radioAlert:radioAlert
    };

    return module;
})();
