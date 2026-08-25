#include <iostream>
#include <vector>

using namespace std;

// FUNCIÓN CON UN ERROR SUTIL DE BÚSQUEDA BINARIA
int resolver(const vector<int>& v, int ini, int fin) {
    // Caso base: si queda 1 elemento, es el mínimo
    if (ini == fin) return v[ini];
    
    int mid = ini + (fin - ini) / 2;
    
    // Si encontramos el "salto" (el valle), hemos dado con el mínimo
    if (v[mid] < v[mid + 1]) {
        return v[mid];
    }
    
    // AQUÍ ESTÁ LA TRAMPA:
    // El alumno compara v[mid] con v[0] para saber en qué segmento del vector está.
    // Usa un menor estricto ("<") en lugar de un menor o igual ("<=").
    if (v[mid] < v[0]) {
        // Si el elemento es menor que el primero, el mínimo está a la derecha
        return resolver(v, mid + 1, fin);
    } else {
        // Si es mayor, el mínimo está a la izquierda (o es el mismo)
        return resolver(v, ini, mid);
    }
}

int main() {
    // Optimización de entrada/salida
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    while (cin >> n) {
        vector<int> v(n);
        for (int i = 0; i < n; ++i) {
            cin >> v[i];
        }
        // Llamada a la función recursiva
        cout << resolver(v, 0, n - 1) << "\n";
    }
    
    return 0;
}