/* Autor: Gustavo Azevedo */

var myFile = ''
var memorySize = '';
var algorithm = '';
var fileData = '';
var tablePage = '';
var table = {};
var process = {};

function readFile() {
  myFile = $('#arquivo').prop('files')[0];
  var reader = new FileReader();
  reader.onload = function() {
    fileData = reader.result;
    // console.log(fileData);
  };
  reader.readAsText(myFile);
  var aux = fileData.split('\n');
  for (let index = 0; index < aux.length; index += 4) {
    process[id] = {
      'id': aux[index],
      'size': aux[index+1],
      'time': aux[index+2],
      'duration': aux[index+3]
    }
  }
}

function createTable() {
  tablePage = $('#tabela');
  memorySize = $('#tamanhoMemoria').val();
  algorithm = document.querySelector('input[name="algoritmo"]:checked').value;
  for (let index = 0; index < memorySize; index++) {
    aws = `<div class="col-1 tabela" name="" id="${index}"></div>`;
    table[index] = {
      processId: '',
      tableHtml: aws
    };
    tablePage.append(aws);
  }
  tablePage.attr('style', '');
  document.getElementById('ff').disabled = true;
  document.getElementById('wf').disabled = true;
  document.getElementById('bf').disabled = true;
  document.getElementById('tamanhoMemoria').disabled = true;
  document.getElementById('btnCreateTable').disabled = true;
}

function addProcess() {
  var id = $('#idProcess').val(),
    size = $('#sizeProcess').val(),
    time = $('#timeProcess').val(),
    duration = $('#durationProcess').val();

  process[id] = {
    'id': id,
    'size': size,
    'time': time,
    'duration': duration
  }
}