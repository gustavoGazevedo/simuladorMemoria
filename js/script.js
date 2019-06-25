/* Autor: Gustavo Azevedo */

let maxMemorySize = 8;
let myFile = '';
let lastTime = 0;
let memorySize = '';
let algorithm = '';
let fileData = '';
let tablePage = '';
let table = {};
let process = {};
let time = -1;
let forwardTime = false;
let log = {
  log: '',
  noMemory: 0
};

//função para abrir e ler os procesos de um arquivo txt
async function readFile() {
  myFile = $('#arquivo').prop('files')[0];
  let reader = new FileReader();
  reader.onload = function() {
    fileData = reader.result;
    let aux = fileData.split('\r\n');
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

//função que é lançada quando se clica no botão "criar memoria", e cria a tabela da memoria
//pega o numero de lacunas, o algoritmo e o tamanho máximo de bits das lacunas
function createTable() {
  $('#forward').attr('disabled', false);
  $('#play').attr('disabled', false);
  $('#btnCreateLog').attr('hidden', false);
  $('#btnCreateTable').attr('hidden', true);
  tablePage = $('#tabela');
  memorySize = $('#tamanhoMemoria').val();
  maxMemorySize = $('#tamanhoCell').val();
  algorithm = document.querySelector('input[name="algoritmo"]:checked').value;
  let textLogTable = '';
  for (let index = 0; index < memorySize; index++) {
    let aux = getRandomInt(5, maxMemorySize);
    let aws = `<div data-toggle="tooltip" data-placement="top" title="Tamanho:${aux}" class="col-1 tabela" name="" id="id${index}"></div>`;
    table[`id${index}`] = {
      tableId: `id${index}`,
      processId: '',
      size: aux
    };
    textLogTable += 
    `Id: id${index}
    Tamanho: ${aux}
    `
    tablePage.append(aws);
  }
  log.log += 
    `Log:
    Tamanho da Memoria: ${memorySize} unidades
    Tamanho das Memorias: de 5 bytes a ${maxMemorySize} bytes
    Algoritmo: ${algorithm
      .replace(/ff/g, 'Fist-Fit')
      .replace(/bf/g, 'Best-Fit')
      .replace(/wf/g, 'Worse-Fit')}
    Memoria:

    ${textLogTable}
    ==================================\n\n`;
  $('[data-toggle="tooltip"]').tooltip();
  tablePage.attr('style', '');
  document.getElementById('ff').disabled = true;
  document.getElementById('wf').disabled = true;
  document.getElementById('bf').disabled = true;
  document.getElementById('tamanhoMemoria').disabled = true;
  document.getElementById('btnCreateTable').disabled = true;
}

//função para adicionar manualmente processos
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

//quando se clica para passar uma unidade de tempo manualmente
function oneTime() {
  timeCounter();
}

//função para rodar automaticamente o tempo
async function continuosTime() {
  $('#forward').attr('disabled', true);
  $('#pause').attr('disabled', false);
  forwardTime = true;
  while (forwardTime) {
    timeCounter();
    await sleep(1000);
  }
}

//função que é chamada para testar se existem processos que precisam entrar/sair da memoria
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

//função para parar o rolar automático
function pauseTime() {
  forwardTime = false;
  $('#forward').attr('disabled', false);
  $('#pause').attr('disabled', true);
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

$(function() {
  $('[data-toggle="tooltip"]').tooltip();
});

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

//função que chama o algoritmo escolhido
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

//função para tirar da memoria
function eraseElem(element) {
  lastTime = time;
  for (const cell in table) {
    let cells = table[cell];
    if (cells.processId == element.id) {
      let aws = `Tamanho: ${cells.size}`;
      $(`#${cells.tableId}`).attr('data-original-title', aws);
      $(`#${cells.tableId}`).css('background-color', 'white');
      cells.processId = '';
      log.log = 
      `${log.log}\nCiclo de tempo = ${time}:\nProcesso ${element.id} saiu da posição ${cells.tableId} da memoria (tamanho: ${cells.size} bytes)\ne permaneceu lá do ciclo ${time - element.duration} até o ciclo ${time}.\n\n`;
    }
  }
}

function firstFit(element) {
  //pega o tamanho do processo e uma cor para a tabela, pega o primeiro espaço livre que caiba o processo
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
  if (bytes > 0) {
    log.noMemory++;
    log.log = 
      `${log.log}\nCiclo de tempo = ${time}:\nProcesso ${element.id} não encontrou espaço na memoria para ${bytes} bytes de ${element.size} bytes.\n\n`;
  }
}

function worstFit(element) {
  //pega o tamanho do processo e uma cor para a tabela, pega o maior espaço livre
  let sortable = [];
  for (let cell in table) {
    sortable.push([table[cell].tableId, table[cell].size]);
  }
  sortable.sort(function(b, a) {
    return a[1] - b[1];
  });
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
  if (bytes > 0) {
    log.noMemory++;
    log.log = 
      `${log.log}\nCiclo de tempo = ${time}:\nProcesso ${element.id} não encontrou espaço na memoria para ${bytes} bytes de ${element.size} bytes.\n\n`;
  }
}

function bestFit(element) {
  //pega o tamanho do processo e uma cor para a tabela, pega o melhor espaço livre
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
  let a = 0;
  while (bytes > 0 && a <= sortable.length) {
    if (bytes <= maxMemorySize) {
      for (const cells2 of sortable) {
        let cell = table[cells2[0]];
        if (cell.processId == '') {
          if (cell.size - bytes >= 0) {
            let aux = bytes;
            bytes = updateCell(aux, cell, element, color, bytes);
            break;
          }
        }
      }
    } else {
      let largest = { size: 0 };
      for (const cells2 of sortable) {
        let cell = table[cells2[0]];
        if (cell.processId == '') {
          if (cell.size > largest.size) {
            largest = cell;
          }
        }
      }
      let aux = largest.size;
      bytes = updateCell(aux, largest, element, color, bytes);
    }
    a++;
  }
  if (bytes > 0) {
    log.noMemory++;
    log.log = 
      `${log.log}\nCiclo de tempo = ${time}:\nProcesso ${element.id} não encontrou espaço na memoria para ${bytes} bytes de ${element.size} bytes.\n\n`;
  }
}

//função que escreve na frontend o processo
function updateCell(aux, cells, element, color, bytes) {
  let aws = `Tamanho: ${cells.size}, Processo: {Id: ${
    element.id
  }, Bytes: ${aux}}`;
  $(`#${cells.tableId}`).attr('data-original-title', aws);
  $(`#${cells.tableId}`).css('background-color', color);
  cells.processId = element.id;
  log.log = 
    `${log.log}\nCiclo de tempo = ${time}:\nProcesso ${element.id} entrou na posição ${cells.tableId} da memoria (tamanho: ${cells.size} bytes)\nocupando ${aux} bytes e permanecerá lá por ${element.duration} ciclos de tempo.\n\n`;
  return bytes - cells.size;
}

//função para baixar o log
function downloadLog() {
  log.log =
  `${log.log}================================\n** Tempo necessário para executar todos os processos: ${lastTime} u.t.\n** Tempo final: ${time} u.t.\n** Número de vezes em que não foi encontrado espaço livre: ${log.noMemory} vezes`;
  var blob = new Blob([log.log], {type: "text/plain;charset=utf-8"});
  saveAs(blob, `Log-${new Date().getTime()}.txt`);
}