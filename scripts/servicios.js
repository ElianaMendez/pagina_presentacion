document.addEventListener('DOMContentLoaded', function () {
    const openCalendarBtn = document.getElementById('open-calendar');
    const calendarContainer = document.getElementById('calendar-container');
    const closeBtn = document.querySelector('.close-btn');
    const datePicker = document.getElementById('date-picker');
    const timeSlotsContainer = document.getElementById('time-slots');
    const continueToFormBtn = document.getElementById('continue-to-form');

    let availableHours = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
    let selectedTime = "";

    async function getBookedAppointmentsFromServer() {
        const res = await fetch("/citas?key=ADMIN123");
        return await res.json();
    }

    function obtenerFechaMinima() {
        let fechaHoy = new Date();
        fechaHoy.setDate(fechaHoy.getDate() + 1); // 📅 Agregar un día (mañana)

        let year = fechaHoy.getFullYear();
        let month = String(fechaHoy.getMonth() + 1).padStart(2, "0"); // Mes con dos dígitos
        let day = String(fechaHoy.getDate()).padStart(2, "0"); // Día con dos dígitos

        return `${year}-${month}-${day}`; // Formato YYYY-MM-DD
    }

    async function generateTimeSlots() {
        timeSlotsContainer.innerHTML = "";
        let selectedDate = datePicker.value;

        const allCitas = await getBookedAppointmentsFromServer();

        let bookedHours = allCitas
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
                timeSlot.style.pointerEvents = "none";
                timeSlot.title = "Horario ocupado";
            } else {
                timeSlot.addEventListener("click", function () {
                    document.querySelectorAll(".time-slot").forEach(slot => slot.classList.remove("selected"));
                    timeSlot.classList.add("selected");
                    selectedTime = hour;
                });
            }

            timeSlotsContainer.appendChild(timeSlot);
        });
    }

    // 📅 Establecer fecha mínima en el input de fecha
    datePicker.min = obtenerFechaMinima();

    // Mostrar el calendario
    openCalendarBtn.addEventListener('click', function () {
        calendarContainer.classList.remove('hidden');
    });

    // Cerrar el calendario
    closeBtn.addEventListener('click', function () {
        calendarContainer.classList.add('hidden');
    });

    // Generar horarios al cambiar de fecha
    datePicker.addEventListener('change', function () {
        generateTimeSlots();
    });

    // Redirigir al formulario con la fecha y hora seleccionada
    continueToFormBtn.addEventListener('click', function () {
        let selectedDate = datePicker.value;

        if (!selectedDate || !selectedTime) {
            alert("Por favor, selecciona una fecha y una hora.");
            return;
        }

        window.location.href = `contacto.html?fecha=${selectedDate}&hora=${selectedTime}`;
    });
});
