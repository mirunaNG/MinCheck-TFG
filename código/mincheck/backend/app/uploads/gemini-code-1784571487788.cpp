#include <iostream>
#include <unordered_map>

using namespace std;

int main() {
    // Optimización de la entrada/salida estándar para problemas de algoritmia
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    
    // Leemos el tamaño del conjunto hasta que sea 0
    while (cin >> n && n != 0) {
        unordered_map<int, int> frecuencias;
        int max_repeticiones = 0;
        int moda = 0;
        
        for (int i = 0; i < n; ++i) {
            int valor;
            cin >> valor;
            
            // Incrementamos la frecuencia del número leído
            frecuencias[valor]++;
            
            // Actualizamos la moda en tiempo real si este número supera el máximo actual
            if (frecuencias[valor] > max_repeticiones) {
                max_repeticiones = frecuencias[valor];
                moda = valor;
            }
        }
        
        // Imprimimos la moda del caso de prueba
        cout << moda << "\n";
    }

    return 0;
}