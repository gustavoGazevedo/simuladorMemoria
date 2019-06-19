/* Autor: Gustavo Azevedo */

function main() {
  var myFile = $('#arquivo').prop('files')[0]
  var memorySize = $('#tamanhoMemoria').val();
  var algorithm = document.querySelector('input[name="algoritmo"]:checked').value;
  var fileData = '';

  var reader = new FileReader();
  reader.onload = function() {
    fileData = reader.result;
    console.log(fileData);
  };
  reader.readAsText(myFile);
}
