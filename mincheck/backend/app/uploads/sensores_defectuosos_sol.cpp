#include <iostream>
#include <vector>

using namespace std;

// Función que elimina el valor erróneo in-situ con complejidad O(N)
// Retorna el nuevo tamaño lógico del vector
int limpiar_sensor(vector<long long>& v, long long valor_erroneo) {
    int pos_escritura = 0; // Puntero donde escribiremos el próximo valor válido
    
    // Recorremos el vector una sola vez
    for (int i = 0; i < (int)v.size(); ++i) {
        if (v[i] != valor_erroneo) {
            // Si es válido, lo movemos a la posición de escritura y avanzamos
            v[pos_escritura] = v[i];
            pos_escritura++;
        }
    }
    
    // Opcional en el contexto del problema, pero buena práctica:
    // redimensionar el vector real a su nuevo tamaño útil.
    v.resize(pos_escritura);
    
    return pos_escritura;
}

void resolver_caso() {
    int n;
    long long valor_erroneo; // long long por el rango de valores
    cin >> n >> valor_erroneo;
    
    vector<long long> v(n);
    for (int i = 0; i < n; ++i) {
        cin >> v[i];
    }
    
    int num_correctos = limpiar_sensor(v, valor_erroneo);
    
    // El enunciado pide dos líneas de salida por cada caso de prueba.
    cout << num_correctos << "\n";
    
    // Imprimimos los valores correctos
    for (int i = 0; i < num_correctos; ++i) {
        cout << v[i];
        if (i < num_correctos - 1) {
            cout << " "; // Evitar espacios extra al final de la línea
        }
    }
    cout << "\n"; // Salto de línea siempre, incluso si hay 0 elementos
}

int main() {
    // Optimización de entrada/salida para jueces virtuales
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int num_casos;
    if (cin >> num_casos) {
        while (num_casos--) {
            resolver_caso();
        }
    }
    
    return 0;
}