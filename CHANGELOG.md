# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.6](https://github.com/sepulvedamarcos/jobtracker/compare/v0.4.5...v0.4.6) (2026-05-06)


### Bug Fixes

* show only update message when available in header ([dfa13d7](https://github.com/sepulvedamarcos/jobtracker/commit/dfa13d7a3e0a776b8980bd9fdc35f969531a1eb1))

### [0.4.5](https://github.com/sepulvedamarcos/jobtracker/compare/v0.4.4...v0.4.5) (2026-05-06)


### Bug Fixes

* swap version display order in header ([0860fd6](https://github.com/sepulvedamarcos/jobtracker/commit/0860fd67cfeb6932453d00cc208dd6e0857c7743))

### [0.4.4](https://github.com/sepulvedamarcos/jobtracker/compare/v0.4.3...v0.4.4) (2026-05-06)


### Features

* add non-blocking version check for updates ([1943a46](https://github.com/sepulvedamarcos/jobtracker/commit/1943a46545ab16ef79c43578b12f485ddee27823))

### [0.4.3](https://github.com/sepulvedamarcos/jobtracker/compare/v0.4.2...v0.4.3) (2026-05-06)

### [0.4.2](https://github.com/sepulvedamarcos/jobtracker/compare/v0.4.1...v0.4.2) (2026-05-06)


### Bug Fixes

* resolve version path for CLI in production ([8e048f6](https://github.com/sepulvedamarcos/jobtracker/commit/8e048f6f66a5cad852ab552c62020afc84d27912))

### [0.4.1](https://github.com/sepulvedamarcos/jobtracker/compare/v0.4.0...v0.4.1) (2026-05-06)


### Bug Fixes

* **plugins**: create symlink to playwright in plugin directory for production execution


### [0.4.0](https://github.com/sepulvedamarcos/jobtracker/compare/v0.3.29...v0.4.0) (2026-05-06)


### Features

* **plugins modal**: show installed and available plugins from repository with version indicators
* **plugins modal**: add Enter key to select plugin before download
* **plugins modal**: add visual indicator (▸) for selected plugin
* **plugins modal**: add D key to download from repository, S to sync installed
* **cli**: add --download-plugin command to download specific plugin
* **cli**: rename --delPlugin to --delete-plugin
* **logger**: add logging system for debugging TUI issues

### Bug Fixes

* **cli**: fix delete-plugin option parsing (add fallback for kebab-case)
* **tui**: fix plugin selection being reset when navigating available plugins
* **install**: move playwright to dependencies (was in devDependencies)

### [0.3.29](https://github.com/sepulvedamarcos/jobtracker/compare/v0.3.28...v0.3.29) (2026-05-06)


### Bug Fixes

* **cli**: fix --download-plugin option parsing


### [0.3.28](https://github.com/sepulvedamarcos/jobtracker/compare/v0.3.27...v0.3.28) (2026-05-06)


### Bug Fixes

* **logger**: add logging system for debugging TUI issues


### [0.3.27](https://github.com/sepulvedamarcos/jobtracker/compare/v0.3.26...v0.3.27) (2026-05-06)


### Features

* **cli**: rename --delPlugin to --delete-plugin


### [0.3.26](https://github.com/sepulvedamarcos/jobtracker/compare/v0.3.25...v0.3.26) (2026-05-06)


### Bug Fixes

* **cli**: fix --download-plugin option parsing


### [0.3.6](https://github.com/sepulvedamarcos/jobtracker/compare/v0.3.5...v0.3.6) (2026-05-05)


### Bug Fixes

* resolve scan summary modal behavior and implement ID-based job filtering ([29dee43](https://github.com/sepulvedamarcos/jobtracker/commit/29dee43109d63a7cd832df297eb05e7f8ec61bc0))
* resolve typescript errors blocking release ([8b3396f](https://github.com/sepulvedamarcos/jobtracker/commit/8b3396f75970212592351f5fd953a98af4609c8f))

### [0.3.5](https://github.com/sepulvedamarcos/jobtracker/compare/v0.3.4...v0.3.5) (2026-04-28)


### Features

* filtrar jobs ya aplicados ([#12](https://github.com/sepulvedamarcos/jobtracker/issues/12)) ([36c2d0e](https://github.com/sepulvedamarcos/jobtracker/commit/36c2d0e1a00b160b8838d323026df73594e08605))
* update navigation keys for job panel ([#13](https://github.com/sepulvedamarcos/jobtracker/issues/13)) ([bdae33e](https://github.com/sepulvedamarcos/jobtracker/commit/bdae33e46f3931bdc110580ab9b0afc48a3d7f34))


### Bug Fixes

* correct company extraction in scrapers ([d6ef79a](https://github.com/sepulvedamarcos/jobtracker/commit/d6ef79ab845ce1d8fb8d349020b73f5860dd4897))
* implement ID-based job matching to prevent duplicates on URL change ([4db78d5](https://github.com/sepulvedamarcos/jobtracker/commit/4db78d5e965d684b467405356e83a5837e96d203))

### [0.3.4](https://github.com/sepulvedamarcos/jobtracker/compare/v0.3.3...v0.3.4) (2026-04-28)


### Features

* update navigation keys for job panel ([b09af40](https://github.com/sepulvedamarcos/jobtracker/commit/b09af400df72624afb2485cdb602e1d50163dab2))

### [0.3.3](https://github.com/sepulvedamarcos/jobtracker/compare/v0.3.2...v0.3.3) (2026-04-28)


### Features

* execute plugins sequentially per keyword for better CLI logs ([f10e513](https://github.com/sepulvedamarcos/jobtracker/commit/f10e513b3874e996c794328d4724318bfc99be8c))
* filtrar jobs aplicados al guardar scan resultados ([66a100f](https://github.com/sepulvedamarcos/jobtracker/commit/66a100f424f45b45a56affa5f359430be783ee8f))
* filtrar jobs ya aplicados al cargar ([2e5bf76](https://github.com/sepulvedamarcos/jobtracker/commit/2e5bf7635dac21591ead9b8d8b604e1ed9442e53))
* limpiar jobs existentes ya aplicados al guardar scan ([62423fc](https://github.com/sepulvedamarcos/jobtracker/commit/62423fcade97467eaf33f857938162b617617f1b))
* refine scan result metrics and counting logic ([c39437c](https://github.com/sepulvedamarcos/jobtracker/commit/c39437c42e7655e041ae45e099e06fd8ee1d842b))


### Bug Fixes

* build errors and clean debug logs ([e3b4a7d](https://github.com/sepulvedamarcos/jobtracker/commit/e3b4a7df325c2a70ac71e7c4a2de7a8bf26f4af5))
* normalizar links para comparar bien ([9c5249f](https://github.com/sepulvedamarcos/jobtracker/commit/9c5249f271dd68ac781e26218c21819aa839ffdb))
* resolve TUI crash and plugin loading issues ([a2c1402](https://github.com/sepulvedamarcos/jobtracker/commit/a2c1402883829cc8453324d9f86ab53d23448d6d))

## [0.3.0](https://github.com/sepulvedamarcos/jobtracker/compare/v0.2.1...v0.3.0) (2026-04-24)


### Features

* **plugin:** crear plugin computrabajo-cl ([ef55797](https://github.com/sepulvedamarcos/jobtracker/commit/ef557979d29db41d4b640653c40a3f518185edd8))

### [0.2.1](https://github.com/sepulvedamarcos/jobtracker/compare/v0.2.0...v0.2.1) (2026-04-24)

## [0.2.0](https://github.com/sepulvedamarcos/jobtracker/compare/v0.1.1...v0.2.0) (2026-04-24)


### Features

* **sdk:** crear Plugin SDK para desarrollo de plugins ([2acd855](https://github.com/sepulvedamarcos/jobtracker/commit/2acd855949357500db92af341f750e96b07aa3c5))

### [0.1.1](https://github.com/sepulvedamarcos/jobtracker/compare/v0.1.0...v0.1.1) (2026-04-24)

## [0.1.0](https://github.com/sepulvedamarcos/jobtracker/compare/v0.0.4...v0.1.0) (2026-04-24)

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
