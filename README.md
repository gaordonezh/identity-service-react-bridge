# React + TypeScript + Vite

Este proyecto se usa como _Libreria de autenticación con Identity Service para React_

## Forma de uso

Colocar el nombre y la libreria apuntando al repositorio y al tag que se quiere consumir

```json
{
  "dependencies": {
    "identity-service-react-bridge": "github:gaordonezh/identity-service-react-bridge#v1.0.0"
  }
},
```

Expone:

- IdentityServiceAuthenticationProvider: Contexto global para inicializar la config.
- createIdentityServiceAxiosInstance: Función para crear una instancia de axios con la el token y refresh token incrustado.
- useIdentityServiceAuthentication: Donde se almacena la info del usuario, login y logout.
- Estilos globales del autorizador
