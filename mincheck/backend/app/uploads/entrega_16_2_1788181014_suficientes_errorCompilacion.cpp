#include <iostream>

using namespace std;

void resolverCaso() {
    long long uvas, personas;
    
    // ERROR DE COMPILACIÓN 1: Falta el punto y coma al final de esta línea
    cin >> uvas >> personas
    
    // ERROR DE COMPILACIÓN 2: Texto sin comentar que no es C++ válido.
    // El compilador no sabrá qué hacer con esto y lanzará un error.
    ESTO_CAUSARA_UN_ERROR_DE_COMPILACION_DIRECTAMENTE
    
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