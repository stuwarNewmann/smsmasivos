document.addEventListener('DOMContentLoaded', () => {
    const productos = document.querySelectorAll('.agregar');
    const listaCarrito = document.getElementById('lista-carrito');
    const modalPago = document.getElementById('modal-pago');
    const confirmarPago = document.getElementById('confirmar-pago');
    const carritoContainer = document.querySelector('.card-carrito');
    const eligePaqueteBtn = document.querySelector('.cta-section button');

    let carrito = [];

    // Cargar el carrito desde el localStorage al cargar la página
    if (localStorage.getItem('carrito')) {
        carrito = JSON.parse(localStorage.getItem('carrito'));
        actualizarCarrito();
    }

    productos.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const card = e.target.closest('.card');
            const id = btn.getAttribute('data-id');
            const nombre = btn.getAttribute('data-nombre');
            const precioPorMensaje = parseFloat(btn.getAttribute('data-precio'));
            agregarAlCarrito({ id, nombre, precioPorMensaje });
        });
    });

    confirmarPago.addEventListener('click', () => {
        enviarAWhatsApp();
    });

    function agregarAlCarrito(producto) {
        const productoEnCarrito = carrito.find(p => p.id === producto.id);
        if (productoEnCarrito) {
            productoEnCarrito.cantidad++;
        } else {
            producto.cantidad = 1;
            carrito.push(producto);
        }
        actualizarCarrito();
    }

    function formatearPrecio(precio) {
        return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(precio);
    }

    function actualizarCarrito() {
        listaCarrito.innerHTML = '';
        carrito.forEach(producto => {
            const total = producto.precioPorMensaje * parseInt(producto.nombre) * producto.cantidad;
            const li = document.createElement('li');
            li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
            li.innerHTML = `
                ${producto.nombre} mensajes - ${formatearPrecio(total)} 
                <div>
                    <button class="btn-decrementar btn btn-outline-secondary btn-sm mr-2" data-id="${producto.id}">-</button>
                    <span>${producto.cantidad}</span>
                    <button class="btn-incrementar btn btn-outline-secondary btn-sm ml-2" data-id="${producto.id}">+</button>
                    <button class="btn-eliminar btn btn-outline-danger btn-sm ml-2" data-id="${producto.id}">Eliminar</button>
                </div>
            `;
            listaCarrito.appendChild(li);
        });

        if (carrito.length > 0) {
            carritoContainer.style.display = 'block';
            eligePaqueteBtn.style.display = 'block';
        } else {
            carritoContainer.style.display = 'none';
            eligePaqueteBtn.style.display = 'none';
        }

        // Guardar el carrito en el localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function enviarAWhatsApp() {
        const nombreCliente = document.getElementById('nombre-cliente').value.trim();
    
        if (!nombreCliente) {
            alert('Por favor, introduce tu nombre para una atención personalizada.');
            return;
        }
    
        // Mostrar la pantalla de carga
        document.querySelector('.loading-screen').style.display = 'flex';
    
        let mensaje = `Hola, quiero adquirir paquetes SMS:\n`;
        
        carrito.forEach(producto => {
            const total = producto.precioPorMensaje * parseInt(producto.nombre) * producto.cantidad;
            mensaje += `${producto.nombre} mensajes - ${formatearPrecio(total)} \n`;
        });
        
        const numeroWhatsApp = "3053053651";
    
        // Vaciar el carrito y el localStorage
        carrito = [];
        actualizarCarrito();
        localStorage.removeItem('carrito');
    
        // Redirigir a WhatsApp después de un breve retraso
        setTimeout(() => {
            const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensaje)}`;
            window.open(urlWhatsApp, '_blank');
            
            // Ocultar la pantalla de carga
            document.querySelector('.loading-screen').style.display = 'none';
        }, 2000);
    }
    

    listaCarrito.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-eliminar')) {
            const id = e.target.getAttribute('data-id');
            carrito = carrito.filter(p => p.id !== id);
            actualizarCarrito();
        } else if (e.target.classList.contains('btn-incrementar')) {
            const id = e.target.getAttribute('data-id');
            const producto = carrito.find(p => p.id === id);
            producto.cantidad++;
            actualizarCarrito();
        } else if (e.target.classList.contains('btn-decrementar')) {
            const id = e.target.getAttribute('data-id');
            const producto = carrito.find(p => p.id === id);
            producto.cantidad--;
            if (producto.cantidad <= 0) {
                carrito = carrito.filter(p => p.id !== id);
            }
            actualizarCarrito();
        }
    });

    eligePaqueteBtn.addEventListener('click', () => {
        $('#modal-pago').modal('show');
    });

    $('#modal-pago').on('show.bs.modal', function () {
        const resumenPedido = document.getElementById('resumen-pedido');
        resumenPedido.innerHTML = ''; // Limpiar la tabla

        carrito.forEach(producto => {
            const tr = document.createElement('tr');
            const total = producto.precioPorMensaje * parseInt(producto.nombre) * producto.cantidad;
            tr.innerHTML = `
                <td>${producto.nombre} mensajes</td>
                <td>${producto.cantidad}</td>
                <td>${formatearPrecio(producto.precioPorMensaje)}</td>
                <td>${formatearPrecio(total)}</td>
            `;
            resumenPedido.appendChild(tr);
        });
    });
});
