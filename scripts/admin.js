document.addEventListener("DOMContentLoaded", function () {
    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    let claveIngresada = prompt("Ingrese su código de cita:");

    // Buscar la cita con la clave ingresada
    const citaEncontrada = citas.find(cita => cita.clave === claveIngresada);

    if (!citaEncontrada) {
        alert("Clave incorrecta o cita no encontrada.");
        window.location.href = "index.html";
        return;
    }

    // Mostrar la cita encontrada
    const citasContainer = document.getElementById("citas-lista");
    citasContainer.innerHTML = `
        <div>
            <p><strong>Nombre:</strong> ${citaEncontrada.nombre} ${citaEncontrada.apellido}</p>
            <p><strong>Correo:</strong> ${citaEncontrada.correo}</p>
            <p><strong>Teléfono:</strong> ${citaEncontrada.telefono}</p>
            <p><strong>Servicio:</strong> ${citaEncontrada.servicio}</p>
            <p><strong>Fecha:</strong> <span id="fecha-actual">${citaEncontrada.fecha}</span></p>
            <p><strong>Hora:</strong> <span id="hora-actual">${citaEncontrada.hora}</span></p>
        </div>
    `;

    document.getElementById("nueva-fecha").value = citaEncontrada.fecha;
    cargarHorasDisponibles(citaEncontrada.fecha);

    document.getElementById("guardar-cambios").onclick = function () {
        actualizarCita(citaEncontrada);
    };

    document.getElementById("borrar-citas").onclick = function () {
        if (confirm("¿Estás seguro de cancelar tu cita?")) {
            let citasActualizadas = citas.filter(cita => cita.clave !== claveIngresada);
            localStorage.setItem("citas", JSON.stringify(citasActualizadas));
            alert("Tu cita ha sido cancelada.");
            window.location.href = "index.html"; // 🔄 Redirigir al Index después de cancelar
        }
    };

    function cargarHorasDisponibles(fechaSeleccionada) {
        const selectHoras = document.getElementById("nueva-hora");
        selectHoras.innerHTML = "";

        const horasDisponibles = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
        const horasOcupadas = citas.filter(cita => cita.fecha === fechaSeleccionada).map(cita => cita.hora);

        horasDisponibles.forEach(hora => {
            if (!horasOcupadas.includes(hora) || hora === citaEncontrada.hora) {
                let option = document.createElement("option");
                option.value = hora;
                option.textContent = hora;
                selectHoras.appendChild(option);
            }
        });
    }

    function actualizarCita(cita) {
        const nuevaFecha = document.getElementById("nueva-fecha").value;
        const nuevaHora = document.getElementById("nueva-hora").value;

        if (!nuevaFecha || !nuevaHora) {
            alert("Selecciona una nueva fecha y hora.");
            return;
        }

        if (citas.some(c => c.fecha === nuevaFecha && c.hora === nuevaHora && c.clave !== cita.clave)) {
            alert("Esa hora ya está ocupada.");
            return;
        }

        cita.fecha = nuevaFecha;
        cita.hora = nuevaHora;
        localStorage.setItem("citas", JSON.stringify(citas));

        alert(`Tu cita ha sido actualizada con éxito.  
Nueva fecha: ${nuevaFecha}  
Nueva hora: ${nuevaHora}  

Si deseas revisar tu cita nuevamente o hacer otro cambio, ingresa al enlace del correo de confirmación y usa tu clave proporcionada anteriormente.`);

        window.location.href = "index.html"; // 🔄 Redirigir al Index después de actualizar
    }
});
