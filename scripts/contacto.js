document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const fecha = params.get("fecha") || "No seleccionada";
    const hora = params.get("hora") || "No seleccionada";

    document.getElementById("selected-date").textContent = fecha;
    document.getElementById("selected-time").textContent = hora;

    const form = document.getElementById("appointment-form");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const servicio = document.getElementById("servicio").value;
        const comentarios = document.getElementById("comentarios").value.trim();

        // Expresiones regulares para validaciones
        const regexTexto = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/; // Solo letras y espacios
        const regexTelefono = /^[0-9]{7,10}$/; // Solo números, mínimo 7 y máximo 10

        // Validación de campos
        if (!nombre || !regexTexto.test(nombre)) {
            alert("Por favor, ingresa un nombre válido (solo letras y tildes).");
            return;
        }
        if (!apellido || !regexTexto.test(apellido)) {
            alert("Por favor, ingresa un apellido válido (solo letras y tildes).");
            return;
        }
        if (!correo || !correo.includes("@")) {
            alert("Por favor, ingresa un correo válido.");
            return;
        }
        if (!telefono || !regexTelefono.test(telefono)) {
            alert("Por favor, ingresa un número de teléfono válido (7 a 10 dígitos numéricos).");
            return;
        }
        if (!servicio) {
            alert("Por favor, selecciona un servicio.");
            return;
        }

        const formData = {
            nombre,
            apellido,
            correo,
            telefono,
            servicio,
            comentarios,
            fecha,
            hora
        };

        console.log("Cita Agendada:", formData);

        // Guardar en LocalStorage (opcional)
        let citas = JSON.parse(localStorage.getItem("citas")) || [];
        citas.push(formData);
        localStorage.setItem("citas", JSON.stringify(citas));

        alert(`Tu cita ha sido agendada para el ${fecha} a las ${hora}.`);

        // Redirigir después de agendar
        window.location.href = "index.html";
    });
});
