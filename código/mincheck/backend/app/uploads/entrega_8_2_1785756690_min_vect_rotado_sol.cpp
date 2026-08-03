#include <iostream>
#include <vector>

using namespace std;

// Función recursiva solicitada para encontrar el mínimo en O(log N)
int resolver(const vector<int>& V, int ini, int fin) {
    // Caso base 1: Si el subvector tiene un solo elemento, ese es el mínimo.
    if (ini == fin) {
        return V[ini];
    }

    // Caso base 2: Si el primer elemento es mayor que el último, significa que 
    // en este subvector no hay rotación (está perfectamente decreciente).
    // Por lo tanto, el mínimo es el último elemento.
    if (V[ini] > V[fin]) {
        return V[fin];
    }

    // Calculamos el punto medio
    int mid = ini + (fin - ini) / 2;

    // Comprobamos si 'mid' es el punto de ruptura exacto.
    // En un vector rotado decreciente, el mínimo es el único elemento 
    // que es menor que su elemento adyacente derecho.
    if (V[mid] < V[mid + 1]) {
        return V[mid];
    }

    // Si la mitad izquierda es estrictamente decreciente (sin el salto),
    // el elemento mínimo (el salto) tiene que estar en la mitad derecha.
    if (V[ini] > V[mid]) {
        return resolver(V, mid + 1, fin);
    }
    // En caso contrario, el mínimo debe estar en la mitad izquierda.
    else {
        return resolver(V, ini, mid);
    }
}

int main() {
    // Optimizaciones de entrada/salida para C++
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    // Leer hasta el final del archivo o hasta que no haya más casos
    while (cin >> n) {
        vector<int> V(n);
        for (int i = 0; i < n; ++i) {
            cin >> V[i];
        }
        
        // Llamada a la función recursiva e impresión del resultado
        cout << resolver(V, 0, n - 1) << "\n";
    }

    return 0;
}