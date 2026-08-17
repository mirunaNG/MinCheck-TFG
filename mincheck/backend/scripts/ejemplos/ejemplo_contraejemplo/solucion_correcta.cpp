#include <iostream>
using namespace std;

int main() {
    int n;
    while (cin >> n) {
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
