# 017 · Sistema visual e ítems

**Estado:** implementado y validado con pruebas; pendiente de revisión visual.

## Alcance

Unificar colores, tamaños de letra y espaciados mediante tokens basados en el commit manual `ed94af8`; aplicar la identidad a cuentas, resumen, notificaciones e ítems sin eliminar sus operaciones. Conservar el indicador de foco visible con cambios de borde o superficie, sin imponer outlines o rings decorativos.

## Criterios

- [x] Las vistas de cuentas, resumen e ítems usan valores compartidos en sus elementos comunes.
- [x] Los toasts tienen tratamiento visual coherente y estados legibles.
- [x] La gráfica muestra el valor al pasar el cursor, tocar o enfocar un punto; ofrece los datos a lectores de pantalla sin acordeón visual.
- [x] La vista de ítems facilita elegir cliente, crear y editar conceptos en móvil y escritorio; se preservan validación, acceso y errores.
- [x] Pasan pruebas, tipos y build; E2E, lint global y ensayos de datos continúan aplazados.

## Validación y límites

Pasaron 154 pruebas, el build y la comprobación de tipos. Después de los ajustes finales de clases, se repitieron las pruebas de ítems y gráfica. La revisión visual en navegador y en dispositivos reales está pendiente; la interacción táctil se verificó mediante eventos simulados.
