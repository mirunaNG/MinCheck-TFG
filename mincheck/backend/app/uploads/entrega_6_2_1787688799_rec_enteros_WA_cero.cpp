#include <iostream>
#include <cmath> // Para usar abs()

using namespace std;

// 1. ¡ARREGLADO! Ahora funciona para el 0.
// Si la división por 10 es 0 (es decir, el número está entre -9 y 9), tiene 1 dígito.
int contar_digitos(int n) {
    if (n / 10 == 0) return 1; 
    return 1 + contar_digitos(n / 10);
}

// 3. NUEVO FALLO PROVOCADO AQUÍ
// El alumno, para evitar que el módulo de un negativo dé negativo,
// usa abs(). Pero al hacerlo, convierte todo el número en positivo.
int invertir_numero(int n, int acumulado) {
    if (n == 0) return acumulado;
    // La trampa: sumar abs(n % 10) destruye el signo del número original
    return invertir_numero(n / 10, acumulado * 10 + abs(n % 10));
}

// 2. Esta función heredará el fallo de invertir_numero
bool es_capicua(int n) {
    return n == invertir_numero(n, 0);
}

int main() {
    int n;
    
    while (cin >> n) {
        int num_digitos = contar_digitos(n);
        int num_invertido = invertir_numero(n, 0);
        bool capicua = es_capicua(n);
        
        cout << num_digitos << (capicua ? " SI " : " NO ") << num_invertido << "\n";
    }

    return 0;
}