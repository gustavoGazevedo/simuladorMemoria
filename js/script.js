/* Autor: Gustavo Azevedo */

let maxMemorySize = 8;
let myFile = '';
let memorySize = '';
let algorithm = '';
let fileData = '';
let tablePage = '';
let table = {};
let process = {};
let time = -1;
let forwardTime = false;

async function readFile() {
  myFile = $('#arquivo').prop('files')[0];
  let reader = new FileReader();
  reader.onload = function() {
    fileData = reader.result;
    let aux = fileData.split('\n');
    for (let index = 0; index < aux.length; index += 4) {
      process[aux[index]] = {
        id: aux[index],
        size: parseInt(aux[index + 1]),
        time: parseInt(aux[index + 2]),
        duration: parseInt(aux[index + 3])
      };
    }
  };
  reader.readAsText(myFile);
}

function createTable() {
  $('#forward').attr("disabled", false);
  $('#play').attr("disabled", false);
  tablePage = $('#tabela');
  memorySize = $('#tamanhoMemoria').val();
  maxMemorySize = $('#tamanhoCell').val();
  algorithm = document.querySelector('input[name="algoritmo"]:checked').value;
  for (let index = 0; index < memorySize; index++) {
    let aux = getRandomInt(5, maxMemorySize);
    let aws = `<div data-toggle="tooltip" data-placement="top" title="Tamanho:${aux}" class="col-1 tabela" name="" id="id${index}"></div>`;
    table[`id${index}`] = {
      tableId: `id${index}`,
      processId: '',
      size: aux
    };
    tablePage.append(aws);
  }
  $('[data-toggle="tooltip"]').tooltip();
  tablePage.attr('style', '');
  document.getElementById('ff').disabled = true;
  document.getElementById('wf').disabled = true;
  document.getElementById('bf').disabled = true;
  document.getElementById('tamanhoMemoria').disabled = true;
  document.getElementById('btnCreateTable').disabled = true;
}

function addProcess() {
  let id = $('#idProcess').val(),
    size = $('#sizeProcess').val(),
    time = $('#timeProcess').val(),
    duration = $('#durationProcess').val();

  process[id] = {
    id: id,
    size: parseInt(size),
    time: parseInt(time),
    duration: parseInt(duration)
  };
  $('#idProcess').val('');
  $('#sizeProcess').val('');
  $('#timeProcess').val('');
  $('#durationProcess').val('');
}

function oneTime() {
  timeCounter();
}

async function continuosTime() {
  $('#forward').attr('disabled', true);
  $('#pause').attr('disabled', false);
  forwardTime = true;
  while (forwardTime) {
    timeCounter();
    await sleep(1000);
  }
}

function timeCounter() {
  time += 1;
  for (const element in process) {
    let aux = process[element];
    if (aux.time == time) {
      fitAlg(aux);
    }
    if (parseInt(aux.time) + parseInt(aux.duration) == time) {
      eraseElem(aux);
    }
  }
  $('#timeNow').html(time);
}

function pauseTime() {
  forwardTime = false;
  $('#forward').attr("disabled", false);
  $('#pause').attr("disabled", true);
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

$(function () {
  $('[data-toggle="tooltip"]').tooltip();
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function fitAlg(element) {
  switch (algorithm) {
    case 'ff':
      firstFit(element);
      break;
    case 'wf':
      worstFit(element);
      break;
    case 'bf':
      bestFit(element);
      break;
    default:
      break;
  }
}

function eraseElem(element) {
  for (const cell in table) {
    let cells = table[cell];
    if (cells.processId == element.id) {
      let aws = `Tamanho: ${cells.size}`;
      $(`#${cells.tableId}`).attr('data-original-title', aws);
      $(`#${cells.tableId}`).css('background-color', 'white');
      cells.processId = '';
    }
  }
}

function firstFit(element) {
  let bytes = element.size;
  let color =
    '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
  for (const cell in table) {
    let cells = table[cell];
    if (bytes <= 0) {
      break;
    }
    if (cells.processId == '') {
      let aux = 0;
      if (bytes - cells.size < 0) {
        aux = bytes;
      } else {
        aux = cells.size;
      }
      bytes = updateCell(aux, cells, element, color, bytes);
    }
  }
}

function worstFit(element) {
  let sortable = [];
  for (let cell in table) {
    sortable.push([table[cell].tableId, table[cell].size]);
  }
  sortable.sort(function(b, a) {
    return a[1] - b[1];
  });
  console.log(sortable);
  let bytes = element.size;
  let color =
    '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
  for (const cell of sortable) {
    let cells = table[cell[0]];
    if (bytes <= 0) {
      break;
    }
    if (cells.processId == '') {
      let aux = 0;
      if (bytes - cells.size < 0) {
        aux = bytes;
      } else {
        aux = cells.size;
      }
      bytes = updateCell(aux, cells, element, color, bytes);
    }
  }
}

function bestFit(element) {
  let sortable = [];
  for (let cell in table) {
    sortable.push([table[cell].tableId, table[cell].size]);
  }
  sortable.sort(function(a, b) {
    return a[1] - b[1];
  });
  let bytes = element.size;
  let color =
    '#' + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
  sortable.forEach(cells => {
    if (bytes <= 0) {
      break;
    }
    if (cells.processId == '') {
      if (bytes <= maxMemorySize) {
        sortable.forEach(cells2 => {
          if (cells2.processId == '') {
            if (cells2.size - bytes < 0) {
              let aux = bytes;
              bytes = updateCell(aux,cells2, element, color, bytes);
              break;
            }
          }
        });
      } else {
        let largest = {size: 0};
        sortable.forEach(cells2 => {
          if (cells2.size > largest.size) {
            largest = cells2;
          }
        });
      let aux = cells.size;
      bytes = updateCell(aux, cells, element, color, bytes);
    }
  }
  });
}

function updateCell(aux, cells, element, color, bytes) {
  let aws = `Tamanho: ${cells.size}, Processo: {Id: ${
    element.id
  }, Bytes: ${aux}}`;
  $(`#${cells.tableId}`).attr('data-original-title', aws);
  $(`#${cells.tableId}`).css('background-color', color);
  cells.processId = element.id;
  return (bytes - cells.size);
}