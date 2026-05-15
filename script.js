    // Contexto de áudio para gerar sons
    let audioCtx;

    function updateInstructions() {
        const dir = document.getElementById('direction').value;
        const type = document.getElementById('dataType').value;
        const inst = document.getElementById('instructionText');
        const input = document.getElementById('inputBox');

        if (dir === 'binToHum') {
            if (type === 'text') {
                inst.innerText = "Digite blocos de 8 bits (bytes) separados por espaço (ex: 01001111 01001011).";
                input.placeholder = "01001111 01001011";
            } else if (type === 'color') {
                inst.innerText = "Digite 24 bits (3 bytes) contínuos ou com espaços para representar Vermelho, Verde e Azul (ex: 11111111 00000000 00000000 para vermelho).";
                input.placeholder = "11111111 00000000 00000000";
            } else if (type === 'sound') {
                inst.innerText = "Digite um valor binário que represente a frequência em Hertz (ex: 0000000110111000 = 440Hz / Nota Lá).";
                input.placeholder = "0000000110111000";
            }
        } else {
            if (type === 'text') {
                inst.innerText = "Digite qualquer texto ou caractere humano.";
                input.placeholder = "Olá Mundo";
            } else if (type === 'color') {
                inst.innerText = "Digite uma cor em formato HEX (ex: #FF0000 para vermelho).";
                input.placeholder = "#FF0000";
            } else if (type === 'sound') {
                inst.innerText = "Digite a frequência do som em números decimais (ex: 440).";
                input.placeholder = "440";
            }
        }
    }

    function processData() {
        const dir = document.getElementById('direction').value;
        const type = document.getElementById('dataType').value;
        let input = document.getElementById('inputBox').value.trim();
        const output = document.getElementById('outputArea');

        if (!input) {
            output.innerHTML = "<em>Por favor, digite algum valor.</em>";
            return;
        }

        try {
            if (dir === 'binToHum') {
                // BINÁRIO PARA HUMANO
                if (type === 'text') {
                    // Divide por espaços, converte de base 2 para decimal, e depois para caractere
                    const chars = input.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2)));
                    output.innerHTML = `<strong>Texto:</strong> <br> ${chars.join('')}`;
                } 
                else if (type === 'color') {
                    // Remove espaços e pega os primeiros 24 bits
                    let cleanBin = input.replace(/\s/g, '').padEnd(24, '0').substring(0, 24);
                    let r = parseInt(cleanBin.substring(0, 8), 2) || 0;
                    let g = parseInt(cleanBin.substring(8, 16), 2) || 0;
                    let b = parseInt(cleanBin.substring(16, 24), 2) || 0;
                    output.innerHTML = `
                        <strong>Cor RGB(${r}, ${g}, ${b})</strong>
                        <div class="color-preview" style="background-color: rgb(${r}, ${g}, ${b});"></div>
                    `;
                } 
                else if (type === 'sound') {
                    let freq = parseInt(input.replace(/\s/g, ''), 2);
                    playSound(freq);
                    output.innerHTML = `<strong>Som:</strong> <br> Tocando onda senoidal a ${freq} Hz.`;
                }
            } else {
                // HUMANO PARA BINÁRIO
                if (type === 'text') {
                    // Pega o código do caractere e converte pra binário (8 bits)
                    const bins = input.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0'));
                    output.innerHTML = `<strong>Binário:</strong> <br> ${bins.join(' ')}`;
                } 
                else if (type === 'color') {
                    // Valida input hex
                    let hex = input.replace('#', '');
                    if (hex.length !== 6) throw "Formato inválido. Use #RRGGBB";
                    let r = parseInt(hex.substring(0, 2), 16).toString(2).padStart(8, '0');
                    let g = parseInt(hex.substring(2, 4), 16).toString(2).padStart(8, '0');
                    let b = parseInt(hex.substring(4, 6), 16).toString(2).padStart(8, '0');
                    output.innerHTML = `<strong>Binário (R G B):</strong> <br> ${r} ${g} ${b}`;
                } 
                else if (type === 'sound') {
                    let freq = parseInt(input, 10);
                    if (isNaN(freq)) throw "Digite um número válido.";
                    let bin = freq.toString(2).padStart(16, '0'); // 16 bits para garantir espaço
                    output.innerHTML = `<strong>Binário (16 bits):</strong> <br> ${bin}`;
                }
            }
        } catch (e) {
            output.innerHTML = `<span style="color: red;">Erro ao processar: ${e}</span>`;
        }
    }

    // Função para gerar som usando a Web Audio API do navegador
    function playSound(frequency) {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine'; // Tipo de onda (senoidal é mais suave)
        oscillator.frequency.value = frequency; // Frequência em Hertz
        
        // Conecta o oscilador ao controle de volume e depois aos alto-falantes
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Toca o som por meio segundo para não irritar
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
        oscillator.stop(audioCtx.currentTime + 0.5);
    }

    // Inicializa as instruções corretas no carregamento
    updateInstructions();