document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const fecha = params.get("fecha") || "No seleccionada";
    const hora = params.get("hora") || "No seleccionada";

    document.getElementById("selected-date").textContent = fecha;
    document.getElementById("selected-time").textContent = hora;

    const form = document.getElementById("appointment-form");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const servicio = document.getElementById("servicio").value.trim();
        const comentarios = document.getElementById("comentarios").value.trim();

        const regexTexto = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        const regexTelefono = /^[0-9]{7,10}$/;

        if (!nombre || !regexTexto.test(nombre)) {
            alert("Por favor, ingresa un nombre válido.");
            return;
        }
        if (!apellido || !regexTexto.test(apellido)) {
            alert("Por favor, ingresa un apellido válido.");
            return;
        }
        if (!correo.includes("@")) {
            alert("Por favor, ingresa un correo válido.");
            return;
        }
        if (!telefono || !regexTelefono.test(telefono)) {
            alert("Por favor, ingresa un número de teléfono válido.");
            return;
        }
        if (!servicio) {
            alert("Por favor, selecciona un servicio.");
            return;
        }

        function generarClave() {
            return Math.random().toString(36).slice(-6).toUpperCase();
        }

        const clave = generarClave();
        const formData = {
            nombre, apellido, correo, telefono,
            servicio, comentarios, fecha, hora, clave
        };

        // 💡 Mostrar feedback visual en el botón
        const btn = form.querySelector("button");
        btn.disabled = true;
        btn.textContent = "Enviando...";

        try {
            const response = await fetch("/enviar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(`Tu cita ha sido agendada para el ${fecha} a las ${hora}. Se ha enviado un correo de confirmación con tu clave: ${clave}`);
                window.location.href = "index.html";
            } else {
                const error = await response.json();
                alert("Error al guardar la cita: " + error.mensaje);
            }
        } catch (error) {
            console.error("Error al enviar datos:", error);
            alert("Ocurrió un error al enviar tu solicitud.");
        } finally {
            // ✅ Restaurar botón
            btn.disabled = false;
            btn.textContent = "Agendar una cita";
        }
    });
});