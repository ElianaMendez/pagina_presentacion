document.addEventListener('DOMContentLoaded', function() {
    const openCalendarBtn = document.getElementById('open-calendar');
    const calendarContainer = document.getElementById('calendar-container');
    const closeBtn = document.querySelector('.close-btn');
    const datePicker = document.getElementById('date-picker');
    const timeSlotsContainer = document.getElementById('time-slots');
    const continueToFormBtn = document.getElementById('continue-to-form');

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

    // Generar horarios disponibles
    function generateTimeSlots() {
        timeSlotsContainer.innerHTML = "";
        let selectedDate = datePicker.value;

        let bookedHours = appointments
            .filter(appt => appt.fecha === selectedDate)
            .map(appt => appt.hora);

        availableHours.forEach(hour => {
            let timeSlot = document.createElement("div");
            timeSlot.classList.add("time-slot");
            timeSlot.textContent = hour;

            if (bookedHours.includes(hour)) {
                timeSlot.classList.add("disabled");
                timeSlot.style.backgroundColor = "#ccc";
                timeSlot.style.cursor = "not-allowed";
            } else {
                timeSlot.addEventListener("click", function() {
                    document.querySelectorAll(".time-slot").forEach(slot => slot.classList.remove("selected"));
                    timeSlot.classList.add("selected");
                    selectedTime = hour;
                });
            }

            timeSlotsContainer.appendChild(timeSlot);
        });
    }

    // Actualizar horarios al cambiar la fecha
    datePicker.addEventListener('change', function() {
        generateTimeSlots();
    });

    // Redirigir al formulario con la fecha y hora seleccionadas
    continueToFormBtn.addEventListener('click', function() {
        let selectedDate = datePicker.value;

        if (!selectedDate || !selectedTime) {
            alert("Por favor, selecciona una fecha y una hora.");
            return;
        }

        // Redirigir a contacto.html pasando la fecha y hora como parámetros
        window.location.href = `contacto.html?fecha=${selectedDate}&hora=${selectedTime}`;
    });
});
