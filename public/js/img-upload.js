$(function () {
    'use strict'

    // Hide URL/FileReader API requirement message in capable browsers:
    if (
        window.createObjectURL ||
        window.URL ||
        window.webkitURL ||
        window.FileReader
    ) {
        $('.browser').hide()
        $('.preview').children().show()
    }

    function isDataURL(s) {
        return !!s.match(isDataURL.regex);
    }
    isDataURL.regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;

    function readURL(input) {

        if (input.files && input.files[0]) {
            var reader = new FileReader();
            var preview = $(input).data('preview');
            var _invalid = $(input).parent().parent().find('.invalid-file')

            reader.onload = function(e) {

                if( isDataURL(e.target.result) )    {

                    _invalid.hide()
                    $('#' + preview).css('background-image', 'url('+e.target.result +')');
                    $('#' + preview).hide();
                    $('#' + preview).fadeIn(650);
                } else {

                    $('#' + preview).hide()

                    _invalid.html('<div class="alert alert-danger"><strong>Error!</strong> Invalid image file.</div>')
                    _invalid.show()
                }

            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    $('.imageUpload').bind('change', function(e) {
        e.preventDefault()

        readURL(this)
    });
})