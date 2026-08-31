#include <iostream>

using namespace std;

void resolverCaso() {
    long long uvas, personas;
    cin >> uvas >> personas;
    
    // ERROR DE EJECUCIÓN (RUNTIME ERROR) INTENCIONADO:
    // Creamos un puntero que apunta a "nada" (nullptr o memoria nula).
    int* puntero_prohibido = nullptr;
    
    // Intentamos escribir el número 42 en esa dirección que no existe.
    // El sistema operativo detectará esta operación ilegal y matará 
    // el programa inmediatamente con un "Segmentation Fault".
    *puntero_prohibido = 42; 
    
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