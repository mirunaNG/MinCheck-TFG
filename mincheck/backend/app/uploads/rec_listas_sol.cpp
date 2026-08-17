#include <iostream>
#include <vector>
#include <string>

using namespace std;

// 1. Número de apariciones del número 0
// Utiliza un parámetro con valor por defecto (idx = 0) para iniciar la recursión.
int contar_ceros(const vector<int>& v, size_t idx = 0) {
    // Caso base: hemos llegado al final de la lista
    if (idx == v.size()) return 0;
    
    // Paso recursivo: sumar 1 si el actual es 0, más lo que devuelva el resto de la lista
    int es_cero = (v[idx] == 0) ? 1 : 0;
    return es_cero + contar_ceros(v, idx + 1);
}

// 2. Comprobar si la lista está ordenada (de menor a mayor)
bool esta_ordenada(const vector<int>& v, size_t idx = 0) {
    // Caso base 1: Listas vacías o con un solo elemento siempre están ordenadas
    if (v.size() <= 1) return true;
    
    // Caso base 2: Si hemos llegado al penúltimo elemento sin encontrar desorden
    if (idx == v.size() - 1) return true;
    
    // Paso recursivo: Si el actual es mayor que el siguiente, no está ordenada
    if (v[idx] > v[idx + 1]) return false;
    
    // Si están en orden, comprobamos el resto de la lista
    return esta_ordenada(v, idx + 1);
}

// 3. Calcular la posición del máximo
int pos_maximo(const vector<int>& v, size_t idx = 0) {
    // Caso base 1: Si la lista está vacía, la posición es -1
    if (v.empty()) return -1;
    
    // Caso base 2: Si estamos en el último elemento, su posición es la del máximo hasta ahora
    if (idx == v.size() - 1) return static_cast<int>(idx);
    
    // Paso recursivo: Obtenemos la posición del máximo del resto de la lista
    int pos_resto = pos_maximo(v, idx + 1);
    
    // Comparamos el elemento actual con el máximo del resto
    // Usamos >= para asegurarnos de que, si hay duplicados, nos quedamos con la primera aparición
    if (v[idx] >= v[pos_resto]) {
        return static_cast<int>(idx);
    } else {
        return pos_resto;
    }
}

// Función para procesar cada caso de prueba
bool resuelveCaso() {
    vector<int> lista;
    int num;
    
    // Leeremos enteros de la entrada estándar.
    // 'cin >> num' fallará en cuanto se encuentre con la palabra (ej: "fin")
    while (cin >> num) {
        lista.push_back(num);
    }
    
    // Si la lectura falló porque llegamos al final del archivo (EOF), terminamos el bucle del main
    if (cin.eof()) return false;
    
    // Como el cin ha fallado al intentar leer texto en una variable int, debemos:
    // 1. Limpiar el estado de error (failbit)
    cin.clear();
    
    // 2. Leer y descartar la palabra que cerraba la secuencia ("fin")
    string palabra;
    cin >> palabra; 
    
    // Procesamos y mostramos los resultados
    int ceros = contar_ceros(lista);
    bool ordenada = esta_ordenada(lista);
    int max_pos = pos_maximo(lista);
    
    cout << ceros << " " << (ordenada ? "SI" : "NO") << " " << max_pos << "\n";
    
    return true;
}

int main() {
    // Optimización para que la lectura por consola sea más rápida
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Procesar casos de prueba hasta que devuelve false (EOF)
    while (resuelveCaso()) {}
    
    return 0;
}