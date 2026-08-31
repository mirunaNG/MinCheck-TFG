#include <iostream>

using namespace std;

// Función que resuelve cada caso de prueba de forma independiente
void resolverCaso() {
    long long uvas, personas;
    cin >> uvas >> personas;
    
    // Comprobamos si las uvas compradas son al menos 12 por cada persona
    if (uvas >= personas * 12) {
        cout << "SI\n";
    } else {
        cout << "NO\n";
    }
}

int main() {
    // Optimización estándar de entrada y salida
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int numCasos;
    
    // Leemos el número total de casos de prueba
    if (cin >> numCasos) {
        // Ejecutamos la función resolverCaso() tantas veces como indique la entrada
        while (numCasos--) {
            resolverCaso();
        }
    }
    
    return 0;
}