
const api = 'https://censopoblacion.azurewebsites.net/API/indicadores/2/';

const municipios = [
    { codigo: '999', nombre: 'El Progreso (Departamental)' },
    { codigo: '201', nombre: 'Guastatoya' },
    { codigo: '202', nombre: 'Morazán' },
    { codigo: '203', nombre: 'San Agustín Acasaguastlán' },
    { codigo: '204', nombre: 'San Cristóbal Acasaguastlán' },
    { codigo: '205', nombre: 'El Jícaro' },
    { codigo: '206', nombre: 'Sansare' },
    { codigo: '207', nombre: 'Sanarate' },
    { codigo: '208', nombre: 'San Antonio la Paz' }
];

const municipioSelector = document.getElementById('municipio');
const datosCensoDiv = document.getElementById('contenedor');

function cargarMunicipios() {
    municipios.forEach(municipio => {
        const option = document.createElement('option');
        option.value = municipio.codigo;
        option.textContent = municipio.nombre;
        municipioSelector.appendChild(option);
    });
}

async function obtenerDatosCenso(codigoMunicipio) {
    const url = `${api}${codigoMunicipio}`;
    datosCensoDiv.innerHTML = `
        <div class="col-12 text-center p-5">
            <p>Cargando datos...</p>
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
        </div>
    `;

    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('No se pudo obtener la información de la API');
        }
        
        let dataText = await response.text();
        dataText = dataText.substring(1, dataText.length - 1).replace(/\\"/g, '"');
        
        let data = JSON.parse(dataText);
        
        if (Array.isArray(data)) {
            data = data[0];
        }
        
        console.log("Datos a usar en la página:", data);

        mostrarDatos(data);
        
        history.pushState(null, '', `?municipio=${codigoMunicipio}`);

    } catch (error) {
        console.error("Error al obtener datos:", error);
        datosCensoDiv.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger" role="alert">
                    Ocurrió un error al cargar los datos. Intenta de nuevo.
                </div>
            </div>
        `;
    }
}

function mostrarDatos(data) {
    datosCensoDiv.innerHTML = ''; 

    if (!data) {
        datosCensoDiv.innerHTML = `
            <div class="col-12">
                <p class="text-center text-muted">No se encontraron datos para este municipio.</p>
            </div>
        `;
        return;
    }
    
    const ubicacion = data["nombre"]; 
    
    const grupoDeDatos = {
        "Población": {
            "Población total": data["pob_total"],
            "Población masculina": data["total_sexo_hombre"],
            "Población femenina": data["total_sexo_mujeres"],
            "Porcentaje de hombres": data["porc_sexo_hombre"],
            "Porcentaje de mujeres": data["porc_sexo_mujeres"]
        },
        "Demografía y Edad": {
            "Edad promedio": data["edad_promedio"],
            "Índice de dependencia": data["indice_dependencia"],
            "Población < 15 años": data["pob_edad_014"],
            "Población 15-64 años": data["pob_edad_1564"],
            "Población > 65 años": data["pob_edad_65"]
        },
        "Educación y Empleo": {
            "Años promedio de estudio": data["anios_prom_estudio"],
            "Alfabetismo (%)": data["alfabetismo"],
        },
        "Vivienda": {
            "Total de viviendas particulares": data["viviendas_part"],
            "Total de hogares": data["total_hogares"],
            "Promedio de personas por hogar": data["prom_personas_hogar"],
            "Hogares con jefatura femenina": data["total_jefas_hogar"]
        },
        "Etnia y Procedencia": {
             "Población Maya": data["pob_pueblo_maya"],
             "Población Garífuna": data["pob_pueblo_garifuna"],
             "Población Xinca": data["pob_pueblo_xinca"],
             "Población Afrodescendiente": data["pob_pueblo_afrodescendiente"],
             "Población Ladina": data["pob_pueblo_ladino"],
             "Población Extranjera": data["pob_pueblo_extranjero"]
        }
    };

    // 🎨 Colores por grupo
    const colores = {
        "Población": "primary",
        "Demografía y Edad": "success",
        "Educación y Empleo": "warning",
        "Vivienda": "info",
        "Etnia y Procedencia": "danger"
    };

    let htmlContent = `
        <div class="col-12 mb-4 text-center">
            <h2 class="fw-bold text-dark">${ubicacion}</h2>
            <hr>
        </div>
    `;

    for (const grupo in grupoDeDatos) {
        if (Object.keys(grupoDeDatos[grupo]).length > 0) {
            const color = colores[grupo] || "secondary"; 

            htmlContent += `
                <div class="col-12 mt-4">
                    <div class="card border-${color} shadow-sm">
                        <div class="card-header bg-${color} text-white fw-bold">
                            ${grupo}
                        </div>
                        <div class="card-body">
                            <div class="row">
            `;

            for (const [key, value] of Object.entries(grupoDeDatos[grupo])) {
                htmlContent += `
                    <div class="col-md-6 col-lg-4 mb-3">
                        <div class="card border-0 shadow-sm h-100">
                            <div class="card-body text-center">
                                <h6 class="text-muted">${key}</h6>
                                <p class="fs-4 fw-bold text-${color} mb-0">${value ?? "N/A"}</p>
                            </div>
                        </div>
                    </div>
                `;
            }

            htmlContent += `
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    datosCensoDiv.innerHTML = htmlContent;
}
municipioSelector.addEventListener('change', (event) => {
    const codigoSeleccionado = event.target.value;
    obtenerDatosCenso(codigoSeleccionado);
});

// Llama a la función al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarMunicipios();
    const urlParams = new URLSearchParams(window.location.search);
    const municipioURL = urlParams.get('municipio');
    if (municipioURL) {
        municipioSelector.value = municipioURL;
        obtenerDatosCenso(municipioURL);
    } else {
        obtenerDatosCenso(municipioSelector.value);
    }
});



cargarMunicipios();
