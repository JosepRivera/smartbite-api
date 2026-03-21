# Voz · docs/api/05-voice.md

> Transcripción de audio y extracción de entidades para registro por voz.

---

## Índice

- [Transcribir y extraer · POST /voice/transcribe](#transcribir-y-extraer--post-voicetranscribe)

---

### Transcribir y extraer · POST /voice/transcribe

> Recibe un archivo de audio, lo transcribe con Groq Whisper y extrae
> los campos del formulario activo con Claude API.
> Si Claude API falla, devuelve la transcripción cruda para que el usuario
> llene el formulario manualmente. La transcripción nunca se pierde.

**Autenticación:** Requiere Bearer token
**Roles permitidos:** Todos

---

#### Request body (multipart/form-data)

| Campo   | Tipo   | Requerido | Descripción                                                |
| ------- | ------ | --------- | ---------------------------------------------------------- |
| `audio` | file   | ✅         | Archivo de audio (wav, mp3, m4a, webm). Máximo 10 MB       |
| `form`  | string | ✅         | Tipo de formulario: `sale`, `expense`, `ingredient_update` |

---

#### Ejemplo de request

**Headers**
```
POST /api/v1/voice/transcribe
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

---

#### Respuesta exitosa · `200 OK`
```json
// pendiente — completar al implementar
```

> La respuesta incluye siempre el campo `transcription` con el texto crudo
> de Whisper, y el campo `fields` con las entidades extraídas por Claude.
> Si Claude falla, `fields` es `null` y `transcription` contiene el audio
> transcrito para que el usuario llene el formulario manualmente.

---

#### Casos de error

| Status | Error               | Causa                                  |
| ------ | ------------------- | -------------------------------------- |
| 400    | Bad Request         | Archivo ausente o formato no soportado |
| 401    | Unauthorized        | Token ausente o inválido               |
| 413    | Payload Too Large   | Archivo mayor a 10 MB                  |
| 503    | Service Unavailable | Groq Whisper no disponible             |