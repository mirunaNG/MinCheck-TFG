#include <iostream>

using namespace std;

void resolverCaso() {
    long long uvas, personas;
    cin >> uvas >> personas;
    
    // ERROR DE TIEMPO (TLE) GARANTIZADO:
    // 'volatile' obliga al compilador a escribir y leer en memoria 
    // en cada iteración, impidiendo que borre el bucle.
    volatile int trampa = 0;
    while (true) {
        trampa++; // Bucle infinito del que el compilador no puede escapar
    }
    
    // El programa nunca llegará aquí, por lo que el juez lo matará por tiempo
    // ANTES de poder evaluar si la salida es correcta o incorrecta.
    if (uvas > personas * 12) {
        cout << "SI\n";
    } else {
        cout << "NO\n";
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int numCasos;
    
    if (cin >> numCasos) {
        while (numCasos--) {
            resolverCaso();
        }
    }
    
    return 0;
}