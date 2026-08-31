#include <iostream>

using namespace std;

void resolverCaso() {
    // Usamos long long para garantizar que el programa NO sufra un desbordamiento
    // y termine su ejecución correctamente (evitando el Runtime Error).
    long long uvas, personas;
    cin >> uvas >> personas;
    
    // ERROR DE TIEMPO (TIME LIMIT) INTENCIONADO:
    // Este bucle no hace nada útil, pero forzará a la CPU a realizar miles 
    // de millones de operaciones. Consumirá el tiempo máximo permitido por 
    // el juez (normalmente 1-2 segundos) antes de que pueda imprimir el resultado.
    long long trabajo_inutil = 0;
    for (long long i = 0; i < 3000000000LL; ++i) {
        trabajo_inutil += i; 
    }
    
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