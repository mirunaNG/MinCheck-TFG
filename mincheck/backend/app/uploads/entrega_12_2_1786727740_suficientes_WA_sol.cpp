#include <iostream>

using namespace std;

void resolverCaso() {
    // Usamos long long para garantizar que el programa NO sufra un desbordamiento
    // y termine su ejecución correctamente (evitando el Runtime Error).
    long long uvas, personas;
    cin >> uvas >> personas;
    
    // ERROR LÓGICO INTENCIONADO:
    // Al usar '>' en lugar de '>=', el programa fallará devolviendo "NO" 
    // en los casos donde las uvas sean exactamente 12 por persona (como 24 y 2).
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