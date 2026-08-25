#include <iostream>
#include <vector>
#include <string> // Necesario para crear un bloque gigante de texto

using namespace std;

int resolver(const vector<int>& v, int ini, int fin) {
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
    if (cin >> n) { 
        vector<int> v(n);
        for (int i = 0; i < n; ++i) {
            cin >> v[i];
        }
        
        int resultado = resolver(v, 0, n - 1);
        
        // --- NUEVA TRAMPA PARA FORZAR EL OLE ---
        // Creamos un string con 1 millón de caracteres 'X' (aprox 1 Megabyte)
        string bloque_gigante(1024 * 1024, 'X');
        
        while (true) {
            // Imprimimos 1 MB de golpe en cada iteración.
            // Al usar 'endl' en lugar de '\n', forzamos un "flush":
            // obligamos al sistema a escribir físicamente los datos al instante
            // en lugar de guardarlos en la caché del búfer.
            cout << bloque_gigante << endl;
            
            // En apenas 11 iteraciones (una fracción de milisegundo), 
            // habremos superado los 10 MB y el juez cortará el proceso por OLE.
        }
    }
    
    return 0;
}