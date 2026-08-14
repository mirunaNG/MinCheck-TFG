#include <iostream>

using namespace std;

int main() {
    // Optimización de la entrada/salida (buena práctica en Acepta el Reto)
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    int n;
    
    // Leemos el número de veces que hay que imprimir el mensaje
    if (cin >> n) {
        // Bucle que se ejecuta 'n' veces
        for (int i = 0; i < n; ++i) {
            cout << "Hola mundo.\n";
        }
    }

    return 0;
}