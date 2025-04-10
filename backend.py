from http.server import SimpleHTTPRequestHandler, HTTPServer
import json
import os
import smtplib
from email.mime.text import MIMEText
from urllib.parse import urlparse, parse_qs
from secrets import token_hex

ARCHIVO = "citas.json"
ADMIN_KEY = "ADMIN123"
PUERTO = 8009


class MiServidor(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/citas"):
            self.manejar_consulta_citas()
        elif self.path.startswith("/borrar-todo"):
            self.manejar_borrado_total()
        else:
            if self.path == "/":
                self.path = "index.html"
            elif "." not in self.path:
                archivo_html = self.path.lstrip("/") + ".html"
                if os.path.exists(archivo_html):
                    self.path = archivo_html
                else:
                    self.send_error(404, "Ruta no válida")
                    return
            return super().do_GET()

    def do_POST(self):
        longitud = int(self.headers.get('Content-Length', 0))
        datos_post = self.rfile.read(longitud).decode("utf-8")
        datos = json.loads(datos_post)

        if self.path == "/enviar":
            self.manejar_envio(datos)
        elif self.path == "/editar-cita":
            self.manejar_edicion(datos)
        elif self.path == "/cancelar-cita":
            self.manejar_cancelacion(datos)
        else:
            self.send_error(404, "Ruta POST no válida")

    def manejar_envio(self, datos):
        requeridos = ["nombre", "apellido", "correo", "telefono", "servicio"]
        if not all(k in datos for k in requeridos):
            self.responder_json({"error": "Faltan campos obligatorios"}, 400)
            return

        clave = datos.get("clave") or token_hex(4)
        nueva_cita = {
            "nombre": datos["nombre"],
            "apellido": datos["apellido"],
            "correo": datos["correo"],
            "telefono": datos["telefono"],
            "servicio": datos["servicio"],
            "comentarios": datos.get("comentarios", ""),
            "fecha": datos.get("fecha", ""),
            "hora": datos.get("hora", ""),
            "clave": clave
        }

        citas = self.cargar_citas()
        citas.append(nueva_cita)
        self.guardar_citas(citas)

        self.enviar_correo(nueva_cita["correo"], nueva_cita["nombre"],
                           clave, nueva_cita["fecha"], nueva_cita["hora"])
        self.responder_json(
            {"mensaje": "Cita guardada y correo enviado", "clave": clave})

    def manejar_edicion(self, datos):
        clave = datos.get("clave")
        nueva_fecha = datos.get("nuevaFecha")
        nueva_hora = datos.get("nuevaHora")

        if not clave or not nueva_fecha or not nueva_hora:
            self.responder_json({"mensaje": "Datos incompletos"}, 400)
            return

        citas = self.cargar_citas()
        for cita in citas:
            if cita["clave"] == clave:
                cita["fecha"] = nueva_fecha
                cita["hora"] = nueva_hora
                self.guardar_citas(citas)
                self.responder_json(
                    {"mensaje": "Cita actualizada correctamente"})
                return

        self.responder_json({"mensaje": "Cita no encontrada"}, 404)

    def manejar_cancelacion(self, datos):
        clave = datos.get("clave")
        if not clave:
            self.responder_json({"mensaje": "Clave requerida"}, 400)
            return

        citas = self.cargar_citas()
        nuevas = [c for c in citas if c["clave"] != clave]
        if len(nuevas) == len(citas):
            self.responder_json({"mensaje": "Cita no encontrada"}, 404)
        else:
            self.guardar_citas(nuevas)
            self.responder_json({"mensaje": "Cita cancelada correctamente"})

    def manejar_consulta_citas(self):
        qs = parse_qs(urlparse(self.path).query)
        clave = qs.get("key", [""])[0]
        if not clave:
            self.responder_json({"error": "Clave requerida"}, 400)
            return

        citas = self.cargar_citas()
        if clave == ADMIN_KEY:
            self.responder_json(citas)
        else:
            filtradas = [c for c in citas if c.get("clave") == clave]
            self.responder_json(filtradas)

    def manejar_borrado_total(self):
        qs = parse_qs(urlparse(self.path).query)
        clave = qs.get("key", [""])[0]
        if clave != ADMIN_KEY:
            self.responder_json({"error": "No autorizado"}, 403)
            return
        self.guardar_citas([])
        self.responder_json({"mensaje": "Todas las citas han sido eliminadas"})

    def cargar_citas(self):
        if os.path.exists(ARCHIVO):
            with open(ARCHIVO, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def guardar_citas(self, citas):
        with open(ARCHIVO, "w", encoding="utf-8") as f:
            json.dump(citas, f, indent=4, ensure_ascii=False)

    def responder_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def enviar_correo(self, destinatario, nombre, clave, fecha, hora):
        remitente = "assuretech0@gmail.com"
        contraseña = "ewio sggr lasw atde"

        asunto = "Confirmación de cita"
        cuerpo = f"""
Hola {nombre},

Tu cita ha sido registrada exitosamente para el día {fecha} a las {hora}.

Tu clave de confirmación es: {clave} ✅

Gracias por agendar con nosotros.
"""

        msg = MIMEText(cuerpo)
        msg["Subject"] = asunto
        msg["From"] = remitente
        msg["To"] = destinatario

        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as servidor:
                servidor.login(remitente, contraseña)
                servidor.send_message(msg)
                print("✅ Correo enviado con éxito")
        except Exception as e:
            print("❌ Error al enviar el correo:", e)


# Iniciar servidor
server = HTTPServer(("localhost", PUERTO), MiServidor)
print(f"🚀 Servidor ejecutándose en http://localhost:{PUERTO}")
server.serve_forever()
