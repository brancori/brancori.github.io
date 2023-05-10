$(document).ready(function(){
    let altura = $('#navbar').offset().top;

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

$(document).ready(function(){
    let altura = $('#navbar').offset().top;

    $(window).on('scroll', function(){
        if ($(window).scrollTop() > altura + 380){
            $('#icon_container').removeClass('icon_container',"ico_contact_" )
            $('#icon_container').addClass('icon_container_', 'ico_contact')

                    

        }else {
            $('#icon_container').removeClass('.icon_container_')
            $('#icon_container').addClass('.icon_container')
            $('#icon_container').addClass('ico_contact_')
            
        }
    });
});


