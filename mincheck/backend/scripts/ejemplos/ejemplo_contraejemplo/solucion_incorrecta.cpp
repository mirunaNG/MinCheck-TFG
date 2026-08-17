#include <iostream>
using namespace std;

int main() {
    int n;
    while (cin >> n) {
        if (n == 0) continue; // bug: se olvida de imprimir la suma cuando el vector esta vacio

        long long suma = 0;
        for (int i = 0; i < n; i++) {
            int x;
            cin >> x;
            suma += x;
        }
        cout << suma << "\n";
    }
    return 0;
}
