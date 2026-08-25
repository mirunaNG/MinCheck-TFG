#include <iostream>
#include <vector>

using namespace std;

// Función recursiva para obtener el mínimo
int resolver(const vector<int>& v, int ini, int fin) {
    
    // --- TRAMPA PARA FORZAR EL TIME LIMIT EXCEEDED (TLE) ---
    // Simulamos un bucle para buscar algo, pero olvidamos incrementar 'i'.
    int i = ini;
    while (i <= fin) {
        // La palabra clave 'volatile' obliga al compilador (aunque use flags 
        // de optimización como -O2 o -O3) a ejecutar esta instrucción 
        // en cada iteración, quemando la CPU del juez hasta que agote los 5s.
        volatile int quemar_cpu = v[i] * 2;
        
        // i++; <- ERROR LÓGICO INTENCIONADO: Falta el incremento.
        // Al no avanzar la 'i', nos quedamos atrapados aquí para siempre.
    }
    // -------------------------------------------------------

    // Lógica normal de O(log N) que nunca se llegará a ejecutar por culpa del TLE
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
    // Optimización estándar de entrada/salida 
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    while (cin >> n) {
        vector<int> v(n);
        for (int i = 0; i < n; ++i) {
            cin >> v[i];
        }
        
        cout << resolver(v, 0, n - 1) << "\n";
    }
    
    return 0;
}