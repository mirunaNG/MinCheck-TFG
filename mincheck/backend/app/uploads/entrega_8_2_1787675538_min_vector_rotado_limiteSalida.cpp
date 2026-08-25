#include <iostream>
#include <vector>
#include <string>

using namespace std;

// Función dummy, ni siquiera la llamamos para no gastar tiempo
int resolver(const vector<int>& v, int ini, int fin) {
    return 0; 
}

int main() {
    // Optimización crítica para que sea muy rápido y no salte el TimeLimit
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    if (cin >> n) { 
        // Leemos la entrada para que el juez no se queje de pipe roto
        vector<int> v(n);
        for (int i = 0; i < n; ++i) {
            cin >> v[i];
        }
        
        // --- TRAMPA PERFECTA PARA OUTPUT LIMIT EXCEEDED ---
        // Creamos un string pequeño de 1024 bytes (1 KB). 
        // Coste de memoria: casi 0.
        string bloque_pequeno(1024, 'X');
        
        // El límite es 10 * 1024 * 1024 = 10,485,760 bytes.
        // 1024 bytes * 10240 iteraciones = exactamente 10 MB.
        // Hacemos 10245 iteraciones para generar ~10.49 MB. 
        // Suficiente para superar el límite, pero sin saturar a tu script Python.
        for(int i = 0; i < 10245; ++i) {
            cout << bloque_pequeno;
        }
        
        // Terminamos de forma natural y limpia.
        return 0; 
    }
    
    return 0;
}