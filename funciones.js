document.addEventListener('DOMContentLoaded', function() {
    const openCalendarBtn = document.getElementById('open-calendar');
    const calendarContainer = document.getElementById('calendar-container');
    const closeBtn = document.querySelector('.close-btn');
    const datePicker = document.getElementById('date-picker');
    const timeSlotsContainer = document.getElementById('time-slots');
    const saveAppointmentBtn = document.getElementById('save-appointment');
    const appointmentsList = document.getElementById('appointments-list');

    let appointments = []; // Lista de citas
    let availableHours = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]; // Horas disponibles
    let selectedTime = ""; // Hora seleccionada

    // Mostrar el calendario
    openCalendarBtn.addEventListener('click', function() {
        calendarContainer.classList.remove('hidden');
    });

    // Cerrar el calendario
    closeBtn.addEventListener('click', function() {
        calendarContainer.classList.add('hidden');
    });

    // Función para generar horarios disponibles
    function generateTimeSlots() {
        timeSlotsContainer.innerHTML = ""; // Limpiar antes de generar
        let selectedDate = datePicker.value; // Obtener la fecha seleccionada

        // Filtrar horarios ocupados
        let bookedHours = appointments
            .filter(appt => appt.fecha === selectedDate)
            .map(appt => appt.hora);

        availableHours.forEach(hour => {
            let timeSlot = document.createElement("div");
            timeSlot.classList.add("time-slot");
            timeSlot.textContent = hour;

            // Verificar si la hora ya está ocupada
            if (bookedHours.includes(hour)) {
                timeSlot.classList.add("disabled");
                timeSlot.style.backgroundColor = "#ccc";
                timeSlot.style.cursor = "not-allowed";
            } else {
                // Si la hora está disponible, permitir selección
                timeSlot.addEventListener("click", function() {
                    document.querySelectorAll(".time-slot").forEach(slot => slot.classList.remove("selected"));
                    timeSlot.classList.add("selected");
                    selectedTime = hour;
                });
            }

            timeSlotsContainer.appendChild(timeSlot);
        });
    }

    // Detectar cuando se cambia la fecha y actualizar horarios
    datePicker.addEventListener('change', function() {
        generateTimeSlots();
    });

    // Guardar la cita
    saveAppointmentBtn.addEventListener('click', function() {
        let selectedDate = datePicker.value;

        if (!selectedDate || !selectedTime) {
            alert("Por favor, selecciona una fecha y una hora.");
            return;
        }

        // Guardar la cita
        let appointment = { fecha: selectedDate, hora: selectedTime };
        appointments.push(appointment);

        // Mostrar la cita en la lista
        let listItem = document.createElement("li");
        listItem.textContent = `📅 ${appointment.fecha} ⏰ ${appointment.hora}`;
        appointmentsList.appendChild(listItem);

        console.log("Citas guardadas:", appointments);

        // Actualizar los horarios disponibles en la fecha seleccionada
        generateTimeSlots();
    });
});