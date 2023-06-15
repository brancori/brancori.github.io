const mainCont = document.querySelector("#navbar");
        const ImgCont = document.createElement('div');
        const aTagLogo = document.createElement('a')
        const logoImg = document.createElement('img')

        function creando(){
            mainCont.appendChild(ImgCont);
            ImgCont.appendChild(aTagLogo);
            aTagLogo.appendChild(logoImg);
            logoImg.setAttribute('id', 'logo_proyeccion')
            mainCont.setAttribute('class', 'navbar_visible' )
            mainCont.setAttribute('id', 'navbar' )
        }

        creando()


        const navbar2 = document.createElement('div');
        const inicioA = document.createElement('a');
        const nosotrosA = document.createElement('a');
        const proyectosA = document.createElement('a');
        const servicisoA = document.createElement('a');
        const blogA = document.createElement('a');
        const contactoA = document.createElement('a');
        const CapacitacionA = document.createElement('a');

        function contenedorNAv(){
            
        inicioA.textContent = 'INICIO';
        nosotrosA.textContent = 'NOSOTROS';
        proyectosA.textContent = 'PROYECTOS';
        servicisoA.textContent = 'SERVICIOS';
        blogA.textContent = 'BLOG';
        contactoA.textContent = 'CONTACTO';
        CapacitacionA.textContent = 'CAPACITACIÓN';

        navbar2.setAttribute('class', 'navbar_2_menu')
        navbar2.setAttribute('id', 'navbar_2')
        inicioA.setAttribute('class', 'navmenu')
        nosotrosA.setAttribute('class', 'navmenu')
        proyectosA.setAttribute('class', 'navmenu')
        servicisoA.setAttribute('class', 'navmenu')
        blogA.setAttribute('class', 'navmenu')
        contactoA.setAttribute('class', 'navmenu')
        CapacitacionA.setAttribute('class', 'navmenu')

        mainCont.appendChild(navbar2)
        navbar2.appendChild(inicioA)
        navbar2.appendChild(nosotrosA)
        navbar2.appendChild(proyectosA)
        navbar2.appendChild(servicisoA)
        navbar2.appendChild(blogA)
        navbar2.appendChild(contactoA)
        navbar2.appendChild(CapacitacionA)
        }

        contenedorNAv()


        const darckMode_ = document.createElement('div');
        const imgDarckMode_ = document.createElement('img');
        darckMode_.setAttribute('id', 'DarkMode')
        imgDarckMode_.setAttribute('class', 'mode')
        navbar2.appendChild(darckMode_);
        darckMode_.appendChild(imgDarckMode_);

        const sectionCon = document.querySelector('.logo_icon_cont')
        const imgLogoSect = document.createElement('img');
        const listaSect = document.createElement('img');

        imgLogoSect.setAttribute('class', 'logo_icon')
        listaSect.setAttribute('class', 'menu_list')
        listaSect.setAttribute('id', 'menu_list_des')

        sectionCon.appendChild(imgLogoSect)
        sectionCon.appendChild(listaSect)



//Atributos para las imágenes// 


        imgLogoSect.setAttribute('src', './assets/img/proyecc_int.png')
        imgDarckMode_.setAttribute('serc', './assets/img/dar_mode.png')
        listaSect.setAttribute('src', '../assets/ico/lista.png')

        logoImg.setAttribute('src', '../assets/img/proyecc_int.png')

        inicioA.setAttribute('href', '#home')
        nosotrosA.setAttribute('href', '#us_')
        proyectosA.setAttribute('href', '#proyectos')
        servicisoA.setAttribute('href', '#piServices')
        blogA.setAttribute('href', './Sheets/proyectos.html')
        contactoA.setAttribute('href', '#contact_')
        CapacitacionA.setAttribute('href', 'Sheets/login.html')


