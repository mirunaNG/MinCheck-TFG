#include <iostream>
#include <vectorr> // ERROR DE COMPILACIÓN 1: El nombre correcto de la librería es <vector>

using namespace std;

// Función recursiva para obtener el mínimo en O(log n)
int resolver(const vector<int>& v, int ini, int fin) {
    // Caso base: un solo elemento
    if (ini == fin) return v[ini];
    
    // Si el extremo izquierdo es mayor que el derecho, el subvector 
    // está estrictamente decreciente (sin rotación en este tramo)
    if (v[ini] > v[fin]) {
        return v[fin];
    }
    
    int mitad = ini + (fin - ini) / 2 // ERROR DE COMPILACIÓN 2: Falta el punto y coma (;) al final
    
    // Si el elemento en la mitad es mayor o igual al de inicio, 
    // la rotura (el salto del mínimo al máximo) ocurrió en la mitad izquierda
    if (v[mitad] >= v[ini]) {
        return resolver(v, ini, mitad);
    } else {
        // La rotura está en la mitad derecha
        return resolver(v, mitad, fin);
    }
}

int main() {
    int n;
    // Leer hasta el fin de archivo (EOF)
    while (cin >> n) {
        vector<int> v(n);
        for (int i = 0; i < n; ++i) {
            cin >> v[i];
        }
        
        // Llamar a la función recursiva e imprimir el resultado
        cout << resolver(v, 0, n - 1) << endll; // ERROR DE COMPILACIÓN 3: "endll" no existe, es "endl"
        
        // ERROR DE COMPILACIÓN 4: Variable 'resultado' no declarada
        resultado = 0;
    }
    
    return 0;
}