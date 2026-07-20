#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Función que procesa cada caso de prueba
bool resolver() {
    int n;
    // Leemos el tamaño del conjunto. Si no hay más entrada o leemos un 0, terminamos.
    if (!(cin >> n) || n == 0) {
        return false;
    }

    // Usamos un vector para almacenar los elementos
    vector<int> valores(n);
    for (int i = 0; i < n; ++i) {
        cin >> valores[i];
    }

    // 1. Ordenamos el vector. Esto agrupará los números iguales.
    sort(valores.begin(), valores.end());

    // 2. Buscamos la racha más larga de números repetidos
    int moda = valores[0];       // Guardará el número que más se repite
    int max_repeticiones = 1;    // Guardará cuántas veces se repitió la moda

    int valor_actual = valores[0];
    int repeticiones_actuales = 1;

    for (int i = 1; i < n; ++i) {
        if (valores[i] == valor_actual) {
            // Si el número es igual al anterior, la racha continúa
            repeticiones_actuales++;
        } else {
            // Si el número cambia, comprobamos si la racha anterior superó el récord
            if (repeticiones_actuales > max_repeticiones) {
                max_repeticiones = repeticiones_actuales;
                moda = valor_actual;
            }
            // Reiniciamos la racha para el nuevo número
            valor_actual = valores[i];
            repeticiones_actuales = 1;
        }
    }

    // Comprobación final por si la moda se encuentra en el último grupo de números
    if (repeticiones_actuales > max_repeticiones) {
        moda = valor_actual;
    }

    // Imprimimos el resultado
    cout << moda << "\n";

    return true;
}

int main() {
    // Optimizaciones para que la lectura/escritura en consola sea más rápida
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Bucle principal que se ejecuta mientras queden casos de prueba (hasta encontrar el 0)
    while (resolver()) {
    }

    return 0;
}