#include <iostream>
#include <vector>
#include <string>

using namespace std;

int resolver(const vector<int>& v, int ini, int fin) {
    if (ini == fin) return v[ini];
    if (v[ini] > v[fin]) return v[fin];
    int mitad = ini + (fin - ini) / 2;
    if (v[mitad] >= v[ini]) return resolver(v, ini, mitad);
    return resolver(v, mitad, fin);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (cin >> n) { 
        vector<int> v(n);
        for (int i = 0; i < n; ++i) {
            cin >> v[i];
        }
        
        // --- TRAMPA PERFECTA PARA OUTPUT LIMIT EXCEEDED ---
        // Generamos un string de 11 MB (11 * 1024 * 1024 bytes)
        // Esto supera los 10MB de tu OUTPUT_LIMITE_BYTES
        string bloque_gigante(11 * 1024 * 1024, 'X');
        
        // Lo imprimimos
        cout << bloque_gigante << "\n";
        
        // ¡CRÍTICO! Salimos inmediatamente para evitar el Timeout 
        // y para evitar reventar la RAM del script de Python.
        return 0; 
    }
    
    return 0;
}