# Atentia: Asistente Clínico Inteligente

Atentia es la plataforma de documentación médica impulsada por IA que permite a los médicos independientes enfocarse en sus pacientes, no en su computadora.

## Características Principales
- **Atención plena:** Deja que Atentia tome las notas mientras tú cuidas al paciente.
- **Eficiencia:** Genera expedientes clínicos, notas SOAP y recetas en segundos.
- **Fricción Cero:** Tu smartphone es el micrófono, tu PC es el centro de mando.

## Arquitectura Técnica
* **Frontend:** React.js + Vite.
* **Backend:** Node.js + Express (WebSockets para streaming de audio).
* **Base de Datos:** PostgreSQL.
* **Motor de IA:** Google Gemini 2.0 Flash (Multimodal: Audio a JSON).

## Flujo de la IA
1. **Captura:** Stream de audio vía WebSocket.
2. **Procesamiento:** Gemini analiza el audio en tiempo real.
3. **Estructura:** Salida JSON estandarizada (SOAP, Diagnósticos, Receta).

## 📁 Estructura del Proyecto
```text
/atentia-ai
├── /frontend        # Interfaz médico (React.js + Vite)
└── /backend         # API, WebSockets, DB y Servicios de IA
    ├── /db          # Esquema Postgres
    └── /services    # Integración Gemini
```
