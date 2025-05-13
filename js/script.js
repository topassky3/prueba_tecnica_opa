document.addEventListener('DOMContentLoaded', () => {
    const minCaloriasInput = document.getElementById('minCalorias');
    const maxPesoInput = document.getElementById('maxPeso');
    const listaElementosDiv = document.getElementById('listaElementos');
    const btnAgregarElemento = document.getElementById('btnAgregarElemento');
    const btnCalcular = document.getElementById('btnCalcular');
    const resultadoOptimoDiv = document.getElementById('resultadoOptimo');
    const btnCargarEjemplo = document.getElementById('btnCargarEjemplo');

    document.getElementById('currentYear').textContent = new Date().getFullYear();

    let contadorElementos = 0;

    // Cargar datos guardados de localStorage si existen
    cargarDesdeLocalStorage();


    function agregarElementoFila(nombre = '', peso = '', calorias = '') {
        contadorElementos++;
        const idElemento = `elemento-${contadorElementos}`;

        const elementoDiv = document.createElement('div');
        elementoDiv.classList.add('elemento-row', 'mb-2');
        elementoDiv.setAttribute('id', idElemento);

        elementoDiv.innerHTML = `
            <input type="text" class="form-control form-control-sm" value="${nombre || `Elemento ${contadorElementos}`}" placeholder="Nombre (Ej: E${contadorElementos})" title="Nombre del elemento">
            <input type="number" class="form-control form-control-sm" value="${peso}" placeholder="Peso" min="0" step="any" title="Peso del elemento">
            <input type="number" class="form-control form-control-sm" value="${calorias}" placeholder="Calorías" min="0" step="any" title="Calorías del elemento">
            <button type="button" class="btn btn-danger btn-sm btn-eliminar" title="Eliminar elemento">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5"/>
                </svg>
            </button>
        `;
        listaElementosDiv.appendChild(elementoDiv);

        elementoDiv.querySelector('.btn-eliminar').addEventListener('click', () => {
            elementoDiv.remove();
            // No es necesario re-enumerar, los IDs son únicos
            guardarEnLocalStorage();
        });

        // Guardar al cambiar cualquier valor del input
        elementoDiv.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', guardarEnLocalStorage);
            input.addEventListener('keyup', guardarEnLocalStorage);
        });
    }

    btnAgregarElemento.addEventListener('click', () => {
        agregarElementoFila();
        guardarEnLocalStorage();
    });

    btnCargarEjemplo.addEventListener('click', () => {
        minCaloriasInput.value = "15";
        maxPesoInput.value = "10";
        listaElementosDiv.innerHTML = ''; // Limpiar elementos existentes
        contadorElementos = 0; // Resetear contador para que los nombres sean E1, E2...

        const ejemplos = [
            { nombre: "E1", peso: 5, calorias: 3 },
            { nombre: "E2", peso: 3, calorias: 5 },
            { nombre: "E3", peso: 5, calorias: 2 },
            { nombre: "E4", peso: 1, calorias: 8 },
            { nombre: "E5", peso: 2, calorias: 3 }
        ];
        ejemplos.forEach(e => agregarElementoFila(e.nombre, e.peso, e.calorias));
        guardarEnLocalStorage(); // Guardar el ejemplo cargado
    });
    
    minCaloriasInput.addEventListener('change', guardarEnLocalStorage);
    minCaloriasInput.addEventListener('keyup', guardarEnLocalStorage);
    maxPesoInput.addEventListener('change', guardarEnLocalStorage);
    maxPesoInput.addEventListener('keyup', guardarEnLocalStorage);

    function guardarEnLocalStorage() {
        const minCalorias = minCaloriasInput.value;
        const maxPeso = maxPesoInput.value;
        const elementosRows = listaElementosDiv.querySelectorAll('.elemento-row');
        const elementosData = [];
        elementosRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            elementosData.push({
                nombre: inputs[0].value,
                peso: inputs[1].value,
                calorias: inputs[2].value
            });
        });

        const dataToStore = {
            minCalorias,
            maxPeso,
            elementos: elementosData
        };
        localStorage.setItem('excursionistaData', JSON.stringify(dataToStore));
    }

    function cargarDesdeLocalStorage() {
        const storedData = localStorage.getItem('excursionistaData');
        if (storedData) {
            const data = JSON.parse(storedData);
            minCaloriasInput.value = data.minCalorias || '';
            maxPesoInput.value = data.maxPeso || '';
            
            listaElementosDiv.innerHTML = ''; // Limpiar por si acaso
            contadorElementos = 0;
            if (data.elementos && data.elementos.length > 0) {
                data.elementos.forEach(el => {
                    agregarElementoFila(el.nombre, el.peso, el.calorias);
                });
            } else {
                 // Si no hay elementos guardados, agregar uno vacío por defecto
                 agregarElementoFila();
            }
        } else {
            // Si no hay nada guardado, agregar un elemento vacío por defecto
            agregarElementoFila();
        }
    }


    btnCalcular.addEventListener('click', () => {
        const minCalorias = parseFloat(minCaloriasInput.value);
        const maxPeso = parseFloat(maxPesoInput.value);

        if (isNaN(minCalorias) || minCalorias < 0 || isNaN(maxPeso) || maxPeso < 0) {
            mostrarResultado("Por favor, ingrese valores válidos para calorías y peso.", "warning");
            return;
        }

        const elementosRows = listaElementosDiv.querySelectorAll('.elemento-row');
        const elementos = [];
        let hayErroresEnItems = false;

        elementosRows.forEach((row, index) => {
            const inputs = row.querySelectorAll('input');
            const nombre = inputs[0].value.trim() || `Elemento ${index + 1}`;
            const peso = parseFloat(inputs[1].value);
            const calorias = parseFloat(inputs[2].value);

            if (nombre === '' || isNaN(peso) || peso < 0 || isNaN(calorias) || calorias < 0) {
                // Marcar error en la fila, o simplemente no añadirlo y advertir
                inputs.forEach(input => input.classList.add('is-invalid'));
                hayErroresEnItems = true;
                return; // Saltar este elemento
            }
            inputs.forEach(input => input.classList.remove('is-invalid'));
            elementos.push({ nombre, peso, calorias, originalIndex: index });
        });

        if (hayErroresEnItems) {
            mostrarResultado("Algunos elementos tienen datos inválidos o incompletos. Por favor, corríjalos.", "warning");
            return;
        }
        
        if (elementos.length === 0) {
            mostrarResultado("No hay elementos para evaluar. Por favor, agregue al menos un elemento.", "info");
            return;
        }

        let mejorCombinacion = null;
        let menorPesoOptimo = Infinity;

        // Generar todos los subconjuntos de elementos
        // (2^n combinaciones, donde n es el número de elementos)
        const numElementos = elementos.length;
        for (let i = 0; i < (1 << numElementos); i++) { // 1 << n es 2^n
            let pesoActual = 0;
            let caloriasActuales = 0;
            const subconjuntoActual = [];

            for (let j = 0; j < numElementos; j++) {
                // Si el j-ésimo bit de i está encendido, incluir el j-ésimo elemento
                if ((i & (1 << j)) !== 0) {
                    subconjuntoActual.push(elementos[j]);
                    pesoActual += elementos[j].peso;
                    caloriasActuales += elementos[j].calorias;
                }
            }

            // Verificar si el subconjunto actual es viable
            if (caloriasActuales >= minCalorias && pesoActual <= maxPeso) {
                // Si es viable y tiene menor peso que el óptimo encontrado hasta ahora
                if (pesoActual < menorPesoOptimo) {
                    menorPesoOptimo = pesoActual;
                    mejorCombinacion = {
                        elementos: subconjuntoActual,
                        pesoTotal: pesoActual,
                        caloriasTotales: caloriasActuales
                    };
                } 
                // Opcional: si tienen el mismo peso, desempatar por más calorías (no requerido explícitamente)
                // else if (pesoActual === menorPesoOptimo) {
                //    if (mejorCombinacion && caloriasActuales > mejorCombinacion.caloriasTotales) {
                //        mejorCombinacion = {
                //            elementos: subconjuntoActual,
                //            pesoTotal: pesoActual,
                //            caloriasTotales: caloriasActuales
                //        };
                //    }
                // }
            }
        }

        if (mejorCombinacion) {
            const nombresElementos = mejorCombinacion.elementos.map(e => e.nombre).join(', ');
            mostrarResultado(`
                <h4>Conjunto Óptimo Encontrado:</h4>
                <p><strong>Elementos:</strong> ${nombresElementos || 'Ninguno'}</p>
                <p><strong>Peso Total:</strong> ${mejorCombinacion.pesoTotal.toFixed(2)}</p>
                <p><strong>Calorías Totales:</strong> ${mejorCombinacion.caloriasTotales.toFixed(2)}</p>
            `, "success");
        } else {
            mostrarResultado("No se encontró ninguna combinación de elementos que cumpla con los criterios.", "warning");
        }
    });

    function mostrarResultado(mensaje, tipo = "info") {
        resultadoOptimoDiv.innerHTML = `<div class="alert alert-${tipo}" role="alert">${mensaje}</div>`;
    }
    
    // Cargar datos de ejemplo al inicio si no hay nada en localStorage
    // O cargar datos guardados, lo que ocurra primero en cargarDesdeLocalStorage
    if (!localStorage.getItem('excursionistaData')) {
        //btnCargarEjemplo.click(); // Opcional: cargar ejemplo por defecto si no hay nada.
                                   // La función cargarDesdeLocalStorage ya añade una fila vacía.
    }

});