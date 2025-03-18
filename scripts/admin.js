document.addEventListener("DOMContentLoaded", function () {
    const citas = JSON.parse(localStorage.getItem("citas")) || [];
    const citasContainer = document.getElementById("citas-lista");
    
    citasContainer.innerHTML = ""; 

    if (citas.length === 0) {
        citasContainer.innerHTML = "<p>No hay citas agendadas.</p>";
    } else {
        citas.forEach((cita, index) => {
            const citaHTML = `
                <div>
                    <strong>Cita ${index + 1}:</strong>
                    <p>Nombre: ${cita.nombre} ${cita.apellido}</p>
                    <p>Correo: ${cita.correo}</p>
                    <p>Teléfono: ${cita.telefono}</p>
                    <p>Servicio: ${cita.servicio}</p>
                    <p>Comentarios: ${cita.comentarios}</p>
                    <p>Fecha: ${cita.fecha}</p>
                    <p>Hora: ${cita.hora}</p>
                    <hr>
                </div>
            `;
            citasContainer.innerHTML += citaHTML;
        });
    }

    document.getElementById("borrar-citas").addEventListener("click", function () {
        if (confirm("¿Estás seguro de borrar todas las citas?")) {
            localStorage.removeItem("citas");
            location.reload();
        }
    });
});

//para verlas en consola
//console.log("Citas almacenadas:", JSON.parse(localStorage.getItem("citas")));