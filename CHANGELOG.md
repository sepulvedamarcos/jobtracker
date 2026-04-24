# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.0.4](https://github.com/sepulvedamarcos/jobtracker/compare/v0.0.3...v0.0.4) (2026-04-24)


### Features

* **plugin:** mejorar scraper trabajando.cl con carga completa de resultados ([99b8282](https://github.com/sepulvedamarcos/jobtracker/commit/99b8282c75ceba4328ac683c29b944518ad5d8ca))

### [0.0.3](https://github.com/sepulvedamarcos/jobtracker/compare/v0.0.2...v0.0.3) (2026-04-24)


### Bug Fixes

* ajustes a versionamiento  automatico ([8c36d01](https://github.com/sepulvedamarcos/jobtracker/commit/8c36d01ed5232d521c83dcf9b8f6d46c7ecdc4e3))
* corregir scripts CLI y agregar nuevos comandos ([5a4117f](https://github.com/sepulvedamarcos/jobtracker/commit/5a4117f270bc4ddb8cd9037d6fbdff7353e79525))

### 0.0.2 (2026-04-24)


### Features

* actualizar versión base y dependencias ([e4f0b4e](https://github.com/sepulvedamarcos/jobtracker/commit/e4f0b4ee58f6ec458a06315370e63b3c439117bc))
* **cli:** agregar comandos addKey/delKey y banderas de inicio ([5fe6a9a](https://github.com/sepulvedamarcos/jobtracker/commit/5fe6a9a959b9308e735c4893e6d4f2fd87475c25))
* configurar herramientas de commit automático ([80e04e0](https://github.com/sepulvedamarcos/jobtracker/commit/80e04e0901c99606eb4f499359eee900a5790428))
* implementar CLI y TUI inicial ([8bdee90](https://github.com/sepulvedamarcos/jobtracker/commit/8bdee901ff35460e2963497cf8d8575c297321b4))
* instalar y gestionar plugins desde interfaz TUI ([bd066ed](https://github.com/sepulvedamarcos/jobtracker/commit/bd066edc46ef802e8fd4bb01cd1676cde68e16cf))
* modal de progreso con barra visual y logger de debug ([efacc00](https://github.com/sepulvedamarcos/jobtracker/commit/efacc00231fec8658ff0e3cbbc376f6b1665ce51))
* primer commit creando el entorno ([e562cf2](https://github.com/sepulvedamarcos/jobtracker/commit/e562cf21edad76c3e0a9ec18c0389d3095680ff6))
* separacion por arquitectura limpia y hexagonal ([51f9042](https://github.com/sepulvedamarcos/jobtracker/commit/51f90420820b34cd1772b8f393b5c7234bcd4afd))
* sistema de plugins con validación de Playwright ([bc47504](https://github.com/sepulvedamarcos/jobtracker/commit/bc4750454190fe6e305e5cdb024d844cf9baecd2))
* **tui:** agregar modal de detalle de postulación y eliminar con tecla D ([3cedc92](https://github.com/sepulvedamarcos/jobtracker/commit/3cedc92f0d4ae33554a2b711b77b1b7e8d8eb86c))
* **tui:** integrar flujo de datos local, paneles y modal de keywords ([b8e6ead](https://github.com/sepulvedamarcos/jobtracker/commit/b8e6ead350ec267cbd0bab7b469e63bc7c155936))


### Bug Fixes

* limpiar jobs.json antes de guardar nuevos resultados ([d4baedb](https://github.com/sepulvedamarcos/jobtracker/commit/d4baedb23740764edde6ef40f114c5539322116e))
* **tui:** cambiar tecla eliminar de D a Supr ([f95814a](https://github.com/sepulvedamarcos/jobtracker/commit/f95814abd3cfd77e788e7b6679d3e47a547795af))

## [0.0.1] - 2026-04-22

### Agregado
- Base del proyecto **JobTracker** en Node.js + TypeScript.
- TUI inicial con **React + Ink**.
- Arranque de aplicación con `commander`.
- Pantalla splash y layout principal de consola.
- Configuración de rutas de usuario con `env-paths`.
- Contrato de repositorio para jobs escaneados y postulados.
- Repositorio JSON inicial para persistencia local.
- Estructura preparada para keywords, plugins y seguimiento de postulaciones.

### Notas
- Esta versión representa la primera documentación base del port desde la referencia de TrabajandoScanner.
- Parte del flujo funcional todavía está en estado scaffold o pendiente de integración.
