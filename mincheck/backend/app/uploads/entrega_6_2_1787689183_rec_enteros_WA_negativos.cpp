#include <iostream>

using namespace std;

// FUNCIÓN CON EL FALLO PROVOCADO
// Si entra un 0, devolverá 0 dígitos en lugar de 1.
int contar_digitos(int n) {
    if (n == 0) return 0; // <-- Aquí está la trampa que rompe el caso mínimo
    return 1 + contar_digitos(n / 10);
}

int invertir_numero(int n, int acumulado) {
    if (n == 0) return acumulado;
    return invertir_numero(n / 10, acumulado * 10 + (n % 10));
}

bool es_capicua(int n) {
    return n == invertir_numero(n, 0);
}

int main() {
    int n;
    
    while (cin >> n) {
        // No manejamos el valor absoluto intencionadamente 
        // para que también falle en algunos casos negativos.
        
        int num_digitos = contar_digitos(n);
        int num_invertido = invertir_numero(n, 0);
        bool capicua = es_capicua(n);
        
        cout << num_digitos << (capicua ? " SI " : " NO ") << num_invertido << "\n";
    }

    return 0;
}