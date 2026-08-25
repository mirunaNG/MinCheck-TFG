#include <iostream>
#include <vector>

using namespace std;

// Función recursiva para obtener el mínimo
int resolver(const vector<int>& v, int ini, int fin) {
    
    // --- TRAMPA PARA FORZAR EL RUN TIME ERROR (RTE) ---
    // Creamos un puntero que apunta a la dirección de memoria 0 (nullptr).
    // El sistema operativo tiene esta dirección estrictamente protegida.
    volatile int* puntero_prohibido = nullptr;
    
    // Intentamos escribir el número 42 en esa dirección protegida.
    // El sistema operativo detectará el acceso ilegal y enviará la señal SIGSEGV,
    // matando el programa instantáneamente con un código de error (normalmente 139).
    *puntero_prohibido = 42; 
    // --------------------------------------------------

    if (ini == fin) return v[ini];
    if (v[ini] > v[fin]) return v[fin];
    
    int mitad = ini + (fin - ini) / 2;
    
    if (v[mitad] >= v[ini]) {
        return resolver(v, ini, mitad);
    } else {
        return resolver(v, mitad, fin);
    }
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    while (cin >> n) {
        vector<int> v(n);
        for (int i = 0; i < n; ++i) {
            cin >> v[i];
        }
        
        // Al llamar a la función, saltará la trampa
        cout << resolver(v, 0, n - 1) << "\n";
    }
    
    return 0;
}