#include <iostream>
#include <string>

using namespace std;

// 1. Calcular el número de dígitos (Solución recursiva)
int num_digitos(long long n) {
    // Caso base: si el número está entre -9 y 9, tiene 1 dígito
    if (n > -10 && n < 10) {
        return 1;
    }
    // Caso recursivo: 1 dígito actual + los dígitos del resto del número
    return 1 + num_digitos(n / 10);
}

// Función auxiliar recursiva para invertir un número
long long invertir_aux(long long n, long long acumulador) {
    // Caso base: cuando ya no quedan dígitos por procesar, devolvemos lo acumulado
    if (n == 0) {
        return acumulador;
    }
    // Caso recursivo: desplazamos el acumulador a la izquierda (*10) y le sumamos el último dígito
    return invertir_aux(n / 10, acumulador * 10 + (n % 10));
}

// 3. Invertir un número
long long invertir(long long n) {
    // Llamamos a la función auxiliar iniciando el acumulador en 0
    // Si el número es 0, lo devolvemos directamente
    if (n == 0) return 0;
    return invertir_aux(n, 0);
}

// 2. Comprobar si un número es capicúa
// Un número es capicúa si es igual a sí mismo leído de derecha a izquierda
bool es_capicua(long long n) {
    return n == invertir(n);
}

int main() {
    long long n;
    
    // Leer casos de prueba hasta el Fin de Archivo (EOF)
    while (cin >> n) {
        int digitos = num_digitos(n);
        long long invertido = invertir(n);
        string capicua = es_capicua(n) ? "SI" : "NO";
        
        // Imprimir la salida en el formato requerido
        cout << digitos << " " << capicua << " " << invertido << "\n";
    }
    
    return 0;
}