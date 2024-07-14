document.addEventListener('DOMContentLoaded', () => {
    let juego;
    let tiempoRestante = 30;
    let tiempoJuego = 0;
    let juegosJugados = 0;
    let juegosGanados = 0;
    let juegosPerdidos = 0;
    let timerInterval;
    let intervaloJuego;

    // Mostrar la pantalla de inicio al cargar la página
    document.getElementById('startButton').addEventListener('click', () => {
        document.getElementById('startScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        document.getElementById('backgroundMusic').play(); // Iniciar la música de fondo
    });

    function iniciarTemporizador() {
        tiempoRestante = 30;
        document.getElementById('timeRemaining').textContent = tiempoRestante;

        if (timerInterval) {
            clearInterval(timerInterval);
        }

        timerInterval = setInterval(() => {
            tiempoRestante--;
            document.getElementById('timeRemaining').textContent = tiempoRestante;

            if (tiempoRestante <= 0) {
                clearInterval(timerInterval);
                try {
                    juego.adivinarLetra('');
                } catch (error) {
                    document.getElementById('message').textContent = '¡Tiempo agotado! La palabra era ' + juego.palabraSeleccionada;
                    document.getElementById('guessInput').disabled = true;
                    document.getElementById('guessButton').disabled = true;
                    document.getElementById('restartButton').style.display = 'block';
                    juegosPerdidos++;
                    document.getElementById('gamesLost').textContent = juegosPerdidos;
                    document.getElementById('loseSound').play();
                }
            }
        }, 1000);
    }

    function iniciarTemporizadorJuego() {
        intervaloJuego = setInterval(() => {
            tiempoJuego++;
            document.getElementById('gameTime').textContent = tiempoJuego;
        }, 1000);
    }

    function detenerTemporizadorJuego() {
        clearInterval(intervaloJuego);
    }

    document.querySelectorAll('.difficultyButton').forEach(button => {
        button.addEventListener('click', (event) => {
            const dificultad = event.target.getAttribute('data-difficulty');

            if (juego) {
                juego.reiniciarJuego();
                juegosJugados++;
                document.getElementById('gamesPlayed').textContent = juegosJugados;
            } else {
                juego = new Ahorcado(dificultad);
                juegosJugados++;
                document.getElementById('gamesPlayed').textContent = juegosJugados;
            }

            juego.seleccionarNivel(dificultad);
            document.getElementById('guessHistory').textContent = '';
            document.getElementById
            document.getElementById('wordDisplay').textContent = juego.getPalabraOculta();
            document.getElementById('attemptCount').textContent = juego.intentosRestantes;
            document.getElementById('message').textContent = `¡Empieza a adivinar!`;
            document.getElementById('guessInput').disabled = false;
            document.getElementById('guessButton').disabled = false;
            document.getElementById('restartButton').style.display = 'none';

            iniciarTemporizador();
            iniciarTemporizadorJuego();
        });
    });

    document.getElementById('guessButton').addEventListener('click', () => {
        const letra = document.getElementById('guessInput').value.toUpperCase();
        document.getElementById('guessInput').value = '';
        if (letra) {
            try {
                const resultado = juego.adivinarLetra(letra);
                document.getElementById('wordDisplay').textContent = juego.getPalabraOculta();
                document.getElementById('attemptCount').textContent = juego.intentosRestantes;
                document.getElementById('guessHistory').textContent = [...juego.letrasAdivinadas].join(', ');

                if (resultado === 'ganar') {
                    document.getElementById('message').textContent = '¡Felicidades, ganaste!';
                    document.getElementById('restartButton').style.display = 'block';
                    detenerTemporizadorJuego();
                    document.getElementById('winSound').play();
                    juegosGanados++;
                    document.getElementById('gamesWon').textContent = juegosGanados;
                } else if (resultado === 'perder') {
                    document.getElementById('message').textContent = `Perdiste. La palabra era: ${juego.palabraSeleccionada}`;
                    document.getElementById('restartButton').style.display = 'block';
                    detenerTemporizadorJuego();
                    document.getElementById('loseSound').play();
                    juegosPerdidos++;
                    document.getElementById('gamesLost').textContent = juegosPerdidos;
                }
            } catch (error) {
                document.getElementById('message').textContent = 'Error: ' + error.message;
            }
        }
    });

    document.getElementById('guessInput').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            document.getElementById('guessButton').click();
        }
    });

    document.getElementById('restartButton').addEventListener('click', () => {
        juego.reiniciarJuego();
        document.getElementById('guessHistory').textContent = '';
        document.getElementById('wordDisplay').textContent = juego.getPalabraOculta();
        document.getElementById('attemptCount').textContent = juego.intentosRestantes;
        document.getElementById('message').textContent = `¡Empieza a adivinar!`;
        document.getElementById('guessInput').disabled = false;
        document.getElementById('guessButton').disabled = false;
        document.getElementById('restartButton').style.display = 'none';
        iniciarTemporizador();
        iniciarTemporizadorJuego();
    });

    class Ahorcado {
        constructor(dificultad) {
            this.nivel = dificultad;
            this.letrasAdivinadas = new Set();
            this.intentosRestantes = 6;
            this.palabraSeleccionada = '';
            this.palabras = {
                easy: ['PERRO', 'GATO', 'SOL', 'LUNA', 'CIELO','AGUA','FLOR','JAZMIN','LUZ','DAMA'],
                medium: ['ORDENADOR', 'LIBRO', 'ESCOLAR', 'ESCUELA', 'CASA','PRIMERO','PROGRAMA','NARANJA','OLIVO','ESTRELLA'],
                hard: ['DESAFORTUNADO', 'INCONSTITUCIONAL', 'PROGRAMACION', 'INTERNET', 'SOPORTE','TECNOLOGICO','ESQUELETO','DOCTORADO']
            };
            this.seleccionarNivel(dificultad);
        }

        seleccionarNivel(dificultad) {
            this.palabraSeleccionada = this.palabras[dificultad][Math.floor(Math.random() * this.palabras[dificultad].length)];
            this.letrasAdivinadas = new Set();
            this.intentosRestantes = 6;
            document.getElementById('attemptCount').textContent = this.intentosRestantes;
        }

        getPalabraOculta() {
            return this.palabraSeleccionada.split('').map(letra => (this.letrasAdivinadas.has(letra) ? letra : '_')).join(' ');
        }

        adivinarLetra(letra) {
            if (this.letrasAdivinadas.has(letra) || letra.length !== 1 || !/[A-Z]/.test(letra)) {
                throw new Error('Letra inválida o ya adivinada');
            }

            this.letrasAdivinadas.add(letra);

            if (this.palabraSeleccionada.includes(letra)) {
                if (this.getPalabraOculta().indexOf('_') === -1) {
                    return 'ganar';
                }
            } else {
                this.intentosRestantes--;
                if (this.intentosRestantes <= 0) {
                    return 'perder';
                }
            }
        }

        reiniciarJuego() {
            this.letrasAdivinadas = new Set();
            this.intentosRestantes = 6;
            document.getElementById('attemptCount').textContent = this.intentosRestantes;
            document.getElementById('wordDisplay').textContent = this.getPalabraOculta();
        }
    }
});
