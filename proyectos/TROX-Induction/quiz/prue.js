
const fileSelector = document.getElementById('files');
fileSelector.addEventListener('change', (event) => {
  const fileList = event.target.files;
  console.log(fileList);
});

const fileSelector2 = document.getElementById('nombre');
fileSelector2.addEventListener('change', (event) => {
  const fileList2 = event.target.files;
  console.log(fileList2);
});

function archivo(evt) {
    var files = evt.target.files;

    // Obtenemos la imagen del campo "file".
    for (var i = 0, f; f = files[i]; i++) {
      
        //Solo admitimos imágenes.
      if (!f.type.match('image.*')) {
          continue;
      }

      var reader = new FileReader();

      reader.onload = (function(theFile) {
          return function(e) {
            // Insertamos la imagen
           document.getElementById("list").innerHTML = ['<img class="thumb" src="', e.target.result,'" title="', escape(theFile.name), '"/>'].join('');
          };
      })(f);

      reader.readAsDataURL(f);
    }

};

document.getElementById('files').addEventListener('change', archivo, false);




function archivo2(evt) {
    var segunda = evt.target.files;

    // Obtenemos la imagen del campo "file".
    for (var i = 0, f; f = segunda[i]; i++) {
      
        //Solo admitimos imágenes.
      if (!f.type.match('image.*')) {
          continue;
      }
      
      var reader = new FileReader();
      reader.onload = (function(theFile) {
          return function(e) {
            // Insertamos la imagen
           document.getElementById("list2").innerHTML = ['<img class="thumb2" src="', e.target.result, '" title="', escape(theFile.name), '"/>'].join('');
          };
      })(f);

      reader.readAsDataURL(f);
    }

};

document.getElementById('nombre').addEventListener('change', archivo2, false);



