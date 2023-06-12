const mainText = document.querySelector('.main_text');
const date = document.querySelector('.main_date');
const mainTitel = document.querySelector('.mainTitle');
const autor_ = document.querySelector('.autor');
const imagen_ = document.querySelector('#imagen_main');
highTowers = document.querySelector('#highTowers')



let blog = [
    {   
        titulo: '¿CÓMO INICIO PROTECCIÓN INTELIGENTE?',
        imagen: '../assets/img/us_img/3_.jpg',
       fecha: '25/05/2023', 
       texto: 'Nuestra historia empezó hace muchos años, al incursionar en la superintendencia administrativa de obras de gran impacto social, nos tocó participar en una infraestructura de agua potable para comunidades indígenas en la frontera de Mexico, Chiapas, mas de 30 pueblos indígenas se les doto de agua potable a treves de una linea de conducción de más de 60 kilómetros. Las experiencias de este tipo te dan golpes de realidad, y nuestra motivación es ser parte de proyectos que tengan el impacto en el ser humano, mediante los cuales  se mejore su entorno, generando  beneficios directos para el ser humano y su familia. Con el paso del tiempo nos fuimos especializando en áreas  que son obligatorias por el marco regulatorio local, municipal, estatal y federal, para la detonación de proyectos inmobiliarios comerciales e industriales, y en base a  esa especialización es lo que brinda la garantía de ejecución y comercialización  de proyectos sustentables, apegados a la ley. Nuestro impulso, nuestro motor es ser parte de proyectos que impactan directamente a  las familias, la  comunidad, la sociedad,  aportando nuestra experiencia en combinación con la dinámica y  energía de nuestros jóvenes colaboradores,  ya que entendemos, la importancia de las  inversiones de nuestros clientes.Estamos creciendo y estamos en la total disposición de aportar a tu proyecto.' ,
       autor: 'Joel Camarena CEO y Founder de Proyección Inteligente',
   },

   {   
    titulo: 'CONDOMINIO VERTICAL HIGH  TOWERS',
    imagen: '../assets/img/image_2.jpg',
   fecha: '25/01/2023', 
   texto: 'Primer Desarrollo de departamentos de lujo en la ciudad de Puebla, estructura que ofrece amenidades de alta gama para el beneficio de los residentes. La conformación legal del proyecto  de régimen de propiedad en condominio para ofrecer la correspondiente escrituración a costos justos fue un resultado satisfactorio. <br/>“GENERAMOS LA LLEGADA A PUEBLA DEL PRIMER DESARROLLO DE DEPARTAMENTOS DE LUJO”',
   autor: 'Joel Camarena CEO y Founder de Proyección Inteligente',
}
]


highTowers.addEventListener('click', click_);
let position = 0;




function contenido(titulo, imagen, fecha, texto, autor){
    mainTitel.innerHTML = blog[position].titulo;
    imagen_.setAttribute('src', blog[position].imagen);
    date.innerHTML = blog[position].fecha;
    mainText.innerHTML = blog[position].texto;
    autor_.innerHTML = blog[position].autor;
}

function click_(event){
    if(position === 0){
        position = 1
        contenido()
    }else{
        position = position - 1
        contenido()
    }    
}
click_()
    











