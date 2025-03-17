document.addEventListener("DOMContentLoaded", function() {
    // Obtener los parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    const selectedDate = params.get("fecha");
    const selectedTime = params.get("hora");

    // Mostrar la fecha y hora seleccionadas en el formulario
    if (selectedDate && selectedTime) {
        document.getElementById("selected-date-time").textContent = `📅 ${selectedDate} ⏰ ${selectedTime}`;
    }

    // Capturar los datos al enviar el formulario
    document.getElementById("appointment-form").addEventListener("submit", function(event) {
        event.preventDefault();

        let appointmentData = {
            nombres: document.getElementById("first-name").value,
            apellidos: document.getElementById("last-name").value,
            correo: document.getElementById("email").value,
            telefono: document.getElementById("phone").value,
            servicio: document.getElementById("service").value,
            comentarios: document.getElementById("comments").value,
            fecha: selectedDate,
            hora: selectedTime
        };

        console.log("Cita agendada:", appointmentData);
        alert("Cita agendada con éxito.");

        // Aquí podrías enviar los datos a un backend o base de datos
    });
});