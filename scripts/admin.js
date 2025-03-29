document.addEventListener("DOMContentLoaded", function () {
    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    let claveIngresada = prompt("Ingrese su código de cita o la clave de administrador:");

    if (claveIngresada === "ADMIN123") {
        mostrarTodasLasCitas();
    } else {
        mostrarCitaUsuario(claveIngresada);
    }

    function mostrarTodasLasCitas() {
        document.getElementById("titulo-citas").textContent = "Todas las Citas Agendadas";
        document.getElementById("admin-actions").classList.remove("hidden");

        const citasContainer = document.getElementById("citas-lista");
        citasContainer.innerHTML = citas.length === 0 ? "<p>No hay citas agendadas.</p>" : "";

        citas.forEach(cita => {
            citasContainer.appendChild(crearTarjetaCita(cita, true));
        });

        document.getElementById("borrar-todas-citas").addEventListener("click", function () {
            if (confirm("¿Estás seguro de borrar todas las citas?")) {
                localStorage.removeItem("citas");
                alert("Todas las citas han sido eliminadas.");
                window.location.href = "index.html";
            }
        });
    }

    function mostrarCitaUsuario(claveIngresada) {
        const citaEncontrada = citas.find(cita => cita.clave === claveIngresada);

        if (!citaEncontrada) {
            alert("Clave incorrecta o cita no encontrada.");
            window.location.href = "index.html";
            return;
        }

        document.getElementById("titulo-citas").textContent = "Tu Cita";

        const citasContainer = document.getElementById("citas-lista");
        citasContainer.appendChild(crearTarjetaCita(citaEncontrada, false));
    }

    function crearTarjetaCita(cita, esAdmin) {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("cita-card");

        const fechaMinima = obtenerFechaMinima();

        tarjeta.innerHTML = `
            <p><strong>Nombre:</strong> ${cita.nombre} ${cita.apellido}</p>
            <p><strong>Correo:</strong> ${cita.correo}</p>
            <p><strong>Teléfono:</strong> ${cita.telefono}</p>
            <p><strong>Servicio:</strong> ${cita.servicio}</p>
            <p><strong>Fecha:</strong> <span>${cita.fecha}</span></p>
            <p><strong>Hora:</strong> <span>${cita.hora}</span></p>
            ${esAdmin ? `<p><strong>Clave de Modificación:</strong> ${cita.clave}</p>` : ""}
            <h3>Reagendar Cita</h3>
            <input type="date" id="nueva-fecha-${cita.clave}" value="${cita.fecha}" min="${fechaMinima}">
            <select id="nueva-hora-${cita.clave}"></select>
            <button onclick="guardarCambioCita('${cita.clave}')">Guardar Cambios</button>
            <button onclick="borrarCita('${cita.clave}')" class="btn-cancelar">Cancelar cita</button>
            <hr>
        `;

        setTimeout(() => cargarFechasYHorasDisponibles(cita.clave), 100);

        return tarjeta;
    }

    function obtenerFechaMinima() {
        let fechaHoy = new Date();
        fechaHoy.setDate(fechaHoy.getDate() + 1); // 📅 Agregar un día (mañana)

        let year = fechaHoy.getFullYear();
        let month = String(fechaHoy.getMonth() + 1).padStart(2, "0"); // Mes con dos dígitos
        let day = String(fechaHoy.getDate()).padStart(2, "0"); // Día con dos dígitos

        return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
    }

    function cargarFechasYHorasDisponibles(clave) {
        const nuevaFechaInput = document.getElementById(`nueva-fecha-${clave}`);
        if (!nuevaFechaInput) return;
        nuevaFechaInput.addEventListener("change", () => actualizarHorasDisponibles(clave));

        actualizarHorasDisponibles(clave);
    }

    function actualizarHorasDisponibles(clave) {
        const citasAlmacenadas = JSON.parse(localStorage.getItem("citas")) || [];
        const nuevaFechaInput = document.getElementById(`nueva-fecha-${clave}`);
        const selectHoras = document.getElementById(`nueva-hora-${clave}`);

        if (!nuevaFechaInput || !selectHoras) return;

        let nuevaFecha = nuevaFechaInput.value;
        selectHoras.innerHTML = "";

        const todasLasHoras = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
        const horasOcupadas = citasAlmacenadas
            .filter(c => c.fecha === nuevaFecha && c.clave !== clave)
            .map(c => c.hora);

        const horasDisponibles = todasLasHoras.filter(hora => !horasOcupadas.includes(hora));

        if (horasDisponibles.length === 0) {
            let option = document.createElement("option");
            option.value = "";
            option.textContent = "No hay horarios disponibles";
            option.disabled = true;
            selectHoras.appendChild(option);
        } else {
            horasDisponibles.forEach(hora => {
                let option = document.createElement("option");
                option.value = hora;
                option.textContent = hora;
                selectHoras.appendChild(option);
            });
        }
    }

    window.guardarCambioCita = function (clave) {
        let citas = JSON.parse(localStorage.getItem("citas")) || [];
        const cita = citas.find(c => c.clave === clave);
        if (!cita) return;

        const nuevaFecha = document.getElementById(`nueva-fecha-${clave}`).value;
        const nuevaHora = document.getElementById(`nueva-hora-${clave}`).value;

        if (!nuevaFecha || !nuevaHora) {
            alert("Selecciona una nueva fecha y hora.");
            return;
        }

        if (citas.some(c => c.fecha === nuevaFecha && c.hora === nuevaHora && c.clave !== clave)) {
            alert("Esa hora ya está ocupada. Por favor, elige otro horario.");
            return;
        }

        cita.fecha = nuevaFecha;
        cita.hora = nuevaHora;
        localStorage.setItem("citas", JSON.stringify(citas));

        alert(`Tu cita ha sido actualizada con éxito.  
Nueva fecha: ${nuevaFecha}  
Nueva hora: ${nuevaHora}
Si deseas revisar tu cita nuevamente o hacer otro cambio, ingresa al enlace del correo de confirmación y usa tu clave proporcionada anteriormente.`);

        window.location.href = "index.html";  // 🔥 Redirige después de actualizar
    };

    window.borrarCita = function (clave) {
        if (!confirm("¿Estás seguro de que quieres cancelar tu cita? Esta acción no se puede deshacer.")) {
            return;
        }

        let citas = JSON.parse(localStorage.getItem("citas")) || [];
        citas = citas.filter(c => c.clave !== clave);
        localStorage.setItem("citas", JSON.stringify(citas));

        alert("La cita ha sido cancelada con éxito.");
        window.location.href = "index.html";  // 🔥 Redirige después de cancelar
    };
});
