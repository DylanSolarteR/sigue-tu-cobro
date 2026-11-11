export function convertirNumeroALetras(numero: number): string {
    const unidades = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
    const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
    const especiales = ['once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
    const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

    if (numero === 0) return 'cero pesos';
    if (numero === 1) return 'un peso';

    function procesarMiles(n: number): string {
        if (n === 0) return '';
        if (n === 1) return 'mil ';
        return `${convertirGrupo(n)}mil `;
    }

    function procesarMillones(n: number): string {
        if (n === 0) return '';
        if (n === 1) return 'un millón ';
        return `${convertirGrupo(n)}millones `;
    }

    function convertirGrupo(n: number): string {
        let resultado = '';

        const centena = Math.floor(n / 100);
        const decena = Math.floor((n % 100) / 10);
        const unidad = n % 10;

        if (centena > 0) {
            if (centena === 1 && decena === 0 && unidad === 0) {
                resultado += 'cien ';
            } else {
                resultado += centenas[centena] + ' ';
            }
        }

        if (decena === 1 && unidad > 0) {
            resultado += especiales[unidad - 1] + ' ';
        } else {
            if (decena > 0) {
                if (unidad === 0) {
                    resultado += decenas[decena] + ' ';
                } else {
                    resultado += (decena === 2 ? 'veinti' : decenas[decena] + ' y ');
                }
            }
            if (unidad > 0 || (decena !== 1 && unidad === 0)) {
                resultado += unidades[unidad] + ' ';
            }
        }

        return resultado;
    }

    const millones = Math.floor(numero / 1000000);
    const miles = Math.floor((numero % 1000000) / 1000);
    const resto = numero % 1000;

    let resultado = '';
    resultado += procesarMillones(millones);
    resultado += procesarMiles(miles);
    resultado += convertirGrupo(resto);

    // Eliminar espacios múltiples y trim
    resultado = resultado.replace(/\s+/g, ' ').trim();
    return resultado + ' pesos';
}

// Tests
// const tests = [
//     0,
//     1,
//     15,
//     20,
//     21,
//     100,
//     105,
//     500,
//     1000,
//     1500,
//     1800,
//     1900,
//     2001,
//     10000,
//     100000,
//     500000,
//     1000000,
//     1800000,
//     1850000,
//     2000000,
//     10000000,
//     100000000
// ];

// console.log('=== PRUEBAS DE CONVERSIÓN ===');
// tests.forEach(numero => {
//     console.log(`${numero.toLocaleString('es-CO')}: ${convertirNumeroALetras(numero)}`);
// });
