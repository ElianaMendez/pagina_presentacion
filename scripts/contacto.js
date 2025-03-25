document.addEventListener("DOMContentLoaded", function () {
    emailjs.init("De9vyTPv0M09Cuzo6"); // Se inicializa EmailJS con tu Public Key

    const params = new URLSearchParams(window.location.search);
    const fecha = params.get("fecha") || "No seleccionada";
    const hora = params.get("hora") || "No seleccionada";

    document.getElementById("selected-date").textContent = fecha;
    document.getElementById("selected-time").textContent = hora;

    const form = document.getElementById("appointment-form");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // Obtener valores del formulario
        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const correo = document.getElementById("correo").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const servicio = document.getElementById("servicio").value.trim();
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

        // Función para generar una clave aleatoria de 6 caracteres
        function generarClave() {
        return Math.random().toString(36).slice(-6).toUpperCase();
        }

        const clave = generarClave(); // Generar clave única para la cita
        const formData = { nombre, apellido, correo, telefono, servicio, comentarios, fecha, hora, clave };
        
        // 🛠️ Guardar en LocalStorage solo después de confirmar el envío del correo
        emailjs.send("service_lsjni3j", "template_rpyxsfl", {
            name: formData.nombre,
            email: formData.correo, // correo del destinatario
            clave: formData.clave            
        }, "De9vyTPv0M09Cuzo6") // Public Key
            .then(function (response) {
                console.log("Correo enviado con éxito:", response);

                // ✅ Guardar la cita en localStorage junto con la clave
                let citas = JSON.parse(localStorage.getItem("citas")) || [];
                citas.push(formData);
                localStorage.setItem("citas", JSON.stringify(citas));

                alert(`Tu cita ha sido agendada para el ${fecha} a las ${hora}.Se ha enviado un correo de confirmación con tu clave: ${clave}`);
                window.location.href = "index.html"; // Redirigir después del envío del correo
            })
            .catch(function (error) {
                console.error("Error al enviar el correo:", error);
                alert("Hubo un error al enviar la confirmación por correo.");
            });
    });
});
