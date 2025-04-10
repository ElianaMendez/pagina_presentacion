document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    let claveIngresada = params.get("clave");

    const loginBox = document.getElementById("clave-login");
    const titulo = document.getElementById("titulo-citas");
    const contenedor = document.getElementById("citas-lista");

    if (claveIngresada) {
        loginBox.style.display = "none";
        procesarClave(claveIngresada);
    } else {
        loginBox.style.display = "block";
        document.getElementById("btn-ingresar").addEventListener("click", () => {
            const input = document.getElementById("clave-input").value.trim();
            if (input) {
                claveIngresada = input;
                loginBox.style.display = "none";
                procesarClave(claveIngresada);
            }
        });
    }

    function procesarClave(clave) {
        const esAdmin = clave === "ADMIN123";

        fetch(`/citas?key=${clave}`)
            .then(res => res.json())
            .then(citas => {
                if (citas.error || citas.length === 0) {
                    alert("Clave incorrecta o cita no encontrada.");
                    window.location.href = "index.html";
                    return;
                }

                titulo.style.display = "block";

                if (esAdmin) {
                    titulo.textContent = "Todas las Citas Agendadas";
                    document.getElementById("admin-actions").classList.remove("hidden");

                    citas.forEach(cita => {
                        contenedor.appendChild(crearTarjetaCita(cita, true));
                    });

                    document.getElementById("borrar-todas-citas").addEventListener("click", async () => {
                        if (confirm("¿Estás seguro de borrar todas las citas?")) {
                            const res = await fetch(`/borrar-todo?key=ADMIN123`);
                            const data = await res.json();
                            alert(data.mensaje || "Citas borradas.");
                            window.location.href = "index.html";
                        }
                    });
                } else {
                    titulo.textContent = "Tu Cita";
                    contenedor.appendChild(crearTarjetaCita(citas[0], false));
                }
            })
            .catch(err => {
                console.error("Error al consultar citas:", err);
                alert("Ocurrió un error al consultar las citas.");
                window.location.href = "index.html";
            });
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

        setTimeout(() => cargarFechasYHorasDisponibles(cita.clave, cita), 100);

        return tarjeta;
    }

    function obtenerFechaMinima() {
        let fechaHoy = new Date();
        fechaHoy.setDate(fechaHoy.getDate() + 1);
        return fechaHoy.toISOString().split("T")[0];
    }

    function cargarFechasYHorasDisponibles(clave, citaActual) {
        const nuevaFechaInput = document.getElementById(`nueva-fecha-${clave}`);
        const selectHoras = document.getElementById(`nueva-hora-${clave}`);
        if (!nuevaFechaInput || !selectHoras) return;

        nuevaFechaInput.addEventListener("change", () => actualizarHoras(clave, citaActual));
        actualizarHoras(clave, citaActual);
    }

    function actualizarHoras(clave, citaActual) {
        fetch(`/citas?key=ADMIN123`)
            .then(res => res.json())
            .then(todas => {
                const nuevaFecha = document.getElementById(`nueva-fecha-${clave}`).value;
                const selectHoras = document.getElementById(`nueva-hora-${clave}`);
                selectHoras.innerHTML = "";

                const todasLasHoras = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
                const ocupadas = todas.filter(c =>
                    c.fecha === nuevaFecha && c.clave !== clave
                ).map(c => c.hora);

                const disponibles = todasLasHoras.filter(h => !ocupadas.includes(h));

                if (disponibles.length === 0) {
                    const option = document.createElement("option");
                    option.textContent = "No hay horarios disponibles";
                    option.disabled = true;
                    selectHoras.appendChild(option);
                } else {
                    disponibles.forEach(hora => {
                        const option = document.createElement("option");
                        option.value = hora;
                        option.textContent = hora;
                        selectHoras.appendChild(option);
                    });
                }
            });
    }

    window.guardarCambioCita = async function (clave) {
        const nuevaFecha = document.getElementById(`nueva-fecha-${clave}`).value;
        const nuevaHora = document.getElementById(`nueva-hora-${clave}`).value;

        if (!nuevaFecha || !nuevaHora) {
            alert("Selecciona una nueva fecha y hora.");
            return;
        }

        const res = await fetch("/editar-cita", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clave, nuevaFecha, nuevaHora })
        });

        if (res.ok) {
            alert(`✅ Tu cita ha sido actualizada con éxito.  
Nueva fecha: ${nuevaFecha}  
Nueva hora: ${nuevaHora}
`);
            window.location.href = "index.html";
        } else {
            const error = await res.json();
            alert("❌ Error: " + (error.mensaje || "No se pudo actualizar la cita."));
        }
    };

    window.borrarCita = async function (clave) {
        if (!confirm("¿Seguro que deseas cancelar esta cita?")) return;

        const res = await fetch("/cancelar-cita", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clave })
        });

        if (res.ok) {
            alert("✅ La cita ha sido cancelada.");
            window.location.href = "index.html";
        } else {
            const error = await res.json();
            alert("❌ Error: " + (error.mensaje || "No se pudo cancelar la cita."));
        }
    };
});
