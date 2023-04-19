$(document).ready(function(){
    var altura = $('#navbar').offset().top;

    $(window).on('scroll', function(){
        if ($(window).scrollTop() > altura ){
            $('#navbar').addClass('navbar_scroll')
            $('#main_content_inicio').addClass('margin_top')

        }else{
            $('#navbar').removeClass('navbar_scroll')
            $('#main_content_inicio').removeClass('margin_top')
        }
    });
});