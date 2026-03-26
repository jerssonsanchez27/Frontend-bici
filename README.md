# BikeStore Frontend — Angular 19

Frontend para el sistema de gestión de BikeStore, conectado al backend Spring Boot.

## ✅ Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Backend Spring Boot corriendo en `http://localhost:8080`

## 🚀 Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor de desarrollo
npm start
```

Abre el navegador en: **http://localhost:4200**

## ⚠️ CORS — Configuración obligatoria en el backend

Para que el frontend pueda comunicarse con Spring Boot, agrega esto en tu backend.

### Opción 1: Clase de configuración global (recomendada)

Crea el archivo `CorsConfig.java` en tu proyecto Spring Boot:

```java
package com.tuapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*");
            }
        };
    }
}
```

### Opción 2: Anotación en cada controller (más rápida)

```java
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/clientes")
public class ClienteController { ... }
```

## 📁 Estructura del proyecto

```
src/
└── app/
    ├── core/
    │   └── services/
    │       ├── api.service.ts       ← Todas las llamadas HTTP al backend
    │       └── toast.service.ts     ← Notificaciones
    ├── pages/
    │   ├── dashboard/               ← Resumen con estadísticas
    │   ├── clientes/                ← CRUD clientes
    │   ├── bicicletas/              ← CRUD bicicletas
    │   ├── inventario/              ← Vista de stock
    │   └── ventas/                  ← Registro e historial de ventas
    └── shared/
        └── models/
            └── models.ts            ← Interfaces TypeScript
```

## 🔌 API conectada

| Método | Endpoint              | Uso                        |
|--------|-----------------------|----------------------------|
| GET    | /api/clientes         | Listar clientes            |
| POST   | /api/clientes         | Registrar cliente          |
| GET    | /api/bicicletas       | Listar bicicletas          |
| POST   | /api/bicicletas       | Registrar bicicleta        |
| GET    | /api/inventario       | Ver stock                  |
| POST   | /api/ventas           | Registrar venta            |

## ⚙️ Cambiar la URL del backend

Edita el archivo `src/app/core/services/api.service.ts`:

```typescript
private readonly base = 'http://localhost:8080/api';
```
