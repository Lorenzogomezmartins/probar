// =============================
// 🟢 Código principal para interactividad y eventos DOM
// =============================
document.addEventListener('DOMContentLoaded', function () {

    // -------- Filtro de categorías --------
    const filterItems = document.querySelectorAll('.filter-item');
    filterItems.forEach(item => {
        item.addEventListener('click', function () {
            filterItems.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            filtrarEspacios(this.textContent.trim());
        });
    });

    // -------- Formulario de búsqueda --------
    const searchForm = document.querySelector('.search-form');
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const button = this.querySelector('.search-btn');
        const originalText = button.textContent;

        button.innerHTML = '<div class="loading"></div> Buscando...';

        // Simular búsqueda por 2 segundos
        setTimeout(() => {
            button.textContent = originalText;
            alert('Funcionalidad de búsqueda no implementada todavía.');
        }, 2000);
    });

    // -------- Efecto hover en tarjetas --------
    const workspaceCards = document.querySelectorAll('.workspace-card');
    workspaceCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-4px)';
            this.style.transition = 'transform 0.3s ease';
        });
        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
        });
    });

    // -------- Botones reservar --------
    const bookBtns = document.querySelectorAll('.book-btn');
    bookBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();

            const originalText = this.textContent;
            this.textContent = 'Redirigiendo...';
            this.disabled = true;

            // Abrir detalle en pestaña nueva con datos del workspace
            abrirDetalleEspacio(this.closest('.workspace-card'));

            // Restaurar estado del botón luego de 1.5 segundos
            setTimeout(() => {
                this.textContent = originalText;
                this.disabled = false;
            }, 1500);
        });
    });
});

// =============================
// 🔎 Función para filtrar espacios según categoría
// =============================
function filtrarEspacios(categoria) {
    const espacios = document.querySelectorAll('.workspace-card');

    espacios.forEach(espacio => {
        if (categoria === 'Todos') {
            espacio.style.display = 'block';
            return;
        }

        // Clasificación basada en estrellas, desayuno, wifi, piscina etc
        const ratingText = espacio.getAttribute('data-rating').toLowerCase();
        const amenitiesText = espacio.getAttribute('data-amenities').toLowerCase();

        let mostrar = false;

        switch (categoria.toLowerCase()) {
            case '5 estrellas':
                mostrar = ratingText.includes('★★★★★') || ratingText.includes('5 estrellas');
                break;
            case '4 estrellas':
                mostrar = ratingText.includes('★★★★') || ratingText.includes('4 estrellas');
                break;
            case 'con desayuno':
                mostrar = amenitiesText.includes('desayuno');
                break;
            case 'wifi gratis':
                mostrar = amenitiesText.includes('wifi');
                break;
            case 'piscina':
                mostrar = amenitiesText.includes('piscina');
                break;
            case 'cerca del centro':
                mostrar = espacio.getAttribute('data-location').toLowerCase().includes('centro');
                break;
            default:
                mostrar = true;
        }

        espacio.style.display = mostrar ? 'block' : 'none';
    });
}

// =============================
// 👉 Función para abrir detalle en NUEVA pestaña con datos en URL
// =============================
function abrirDetalleEspacio(card) {
    if (!card) return;

    const nombre = card.querySelector('.workspace-name').textContent.trim();
    const ubicacion = card.querySelector('.workspace-location').textContent.trim();
    const precio = card.querySelector('.price-current').textContent.replace('ARS ', '').trim();
    const amenities = Array.from(card.querySelectorAll('.workspace-amenities .amenity'))
        .map(el => el.textContent.trim())
        .join(', ');
    const rating = card.getAttribute('data-rating').trim();
    const precioAntiguo = card.querySelector('.price-old').textContent.trim();

    // Armamos URL con parámetros codificados para detalle.html
    const urlParams = new URLSearchParams({
        nombre,
        ubicacion,
        precio,
        amenities,
        rating,
        precioAntiguo
    });

    const url = `detalle.html?${urlParams.toString()}`;

    // Abrir en nueva pestaña
    window.open(url, '_blank');
}


// =============================
// 🛒 Código para carrito de reservas (este bloque va en detalle.html)
// =============================
document.addEventListener('DOMContentLoaded', () => {
    const btnReservar = document.querySelector('.btn-reservar'); // Botón reservar en detalle.html
    const form = document.querySelector('.booking-form form');

    if (!btnReservar || !form) return;

    btnReservar.addEventListener('click', (e) => {
        e.preventDefault();

        // Obtener datos desde URL (info del espacio)
        const espacio = obtenerDatosDesdeURL();

        // Obtener datos del formulario reserva
        const checkin = form.querySelector('#checkin').value;
        const checkout = form.querySelector('#checkout').value;
        const guests = form.querySelector('#guests').value;

        // Validaciones básicas
        if (!checkin || !checkout) {
            alert('Por favor, seleccioná fechas de llegada y salida.');
            return;
        }
        if (new Date(checkin) >= new Date(checkout)) {
            alert('La fecha de salida debe ser posterior a la de llegada.');
            return;
        }
        const guestsCount = parseInt(guests);
        if (isNaN(guestsCount) || guestsCount < 1) {
            alert('Por favor, seleccioná una cantidad válida de huéspedes.');
            return;
        }

        // Calcular noches y total
        const noches = (new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24);

        const precioPorNoche = espacio.precio || 0;
        const tarifaLimpieza = 10; // fijo o podrías pasarlo por URL si querés
        const tarifaServicio = 5;

        const subtotal = precioPorNoche * noches;
        const total = subtotal + tarifaLimpieza + tarifaServicio;

        // Completar objeto con datos de reserva
        const reserva = {
            ...espacio,
            checkin,
            checkout,
            guests: guestsCount,
            noches,
            precioPorNoche,
            tarifaLimpieza,
            tarifaServicio,
            total,
            fechaReserva: new Date().toISOString(),
            id: Date.now()
        };

        agregarAlCarrito(reserva);
    });
});

// Obtener el carrito guardado (array de objetos)
function obtenerCarrito() {
    const carritoJSON = localStorage.getItem('carritoReservas');
    return carritoJSON ? JSON.parse(carritoJSON) : [];
}

// Guardar carrito actualizado en localStorage
function guardarCarrito(carrito) {
    localStorage.setItem('carritoReservas', JSON.stringify(carrito));
}

// Agregar espacio al carrito
function agregarAlCarrito(espacio) {
    if (!espacio || !espacio.nombre) {
        alert('Error: datos inválidos para agregar al carrito.');
        return;
    }
    const carrito = obtenerCarrito();
    carrito.push(espacio);
    guardarCarrito(carrito);
    alert(`¡Se agregó "${espacio.nombre}" al carrito!`);
}

// Obtener datos del espacio desde URL (parsea params)
function obtenerDatosDesdeURL() {
    const params = new URLSearchParams(window.location.search);
    return {
        nombre: params.get('nombre') || '',
        ubicacion: params.get('ubicacion') || '',
        precio: parseFloat(params.get('precio')) || 0,
        amenities: params.get('amenities') || '',
        rating: params.get('rating') || '',
        precioAntiguo: params.get('precioAntiguo') || ''
    };
}
