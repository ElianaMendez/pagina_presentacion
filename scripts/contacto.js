document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const fecha = params.get("fecha") || "No seleccionada";
    const hora = params.get("hora") || "No seleccionada";

    document.getElementById("selected-date").textContent = fecha;
    document.getElementById("selected-time").textContent = hora;

    const form = document.getElementById("appointment-form");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = {
            nombre: document.getElementById("nombre").value,
            apellido: document.getElementById("apellido").value,
            correo: document.getElementById("correo").value,
            telefono: document.getElementById("telefono").value,
            servicio: document.getElementById("servicio").value,
            comentarios: document.getElementById("comentarios").value,
            fecha: fecha,
            hora: hora
        };

        console.log("Cita Agendada:", formData);
        alert(`Tu cita ha sido agendada para el ${fecha} a las ${hora}.`);
        // Aquí podrías enviar los datos a un backend o almacenarlos localmente.
        window.location.href = "index.html"; // Redirigir después de agendar
    });
});
