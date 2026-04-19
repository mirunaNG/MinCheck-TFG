// Nombre del alumno ..... Miruna Nerea Giurca
// Usuario del Juez ...... A24
#include <iostream>
#include <iomanip>
#include<vector>
#include <list>
#include <fstream>

using namespace std;

// función que resuelve el problema
void resolver(list<int> &l) {
    for (auto it = l.cbegin(); it != l.cend(); it++) {
        it = l.insert(it, *it);     //inserto delante de it, el valor del iterador
        it++;       //avanzo otra vez para no coger otra vez el mismo numero
    }
}

void mostrar(list<int> const& l) {
    for (auto it = l.rbegin(); it != l.rend(); it++) {
        cout << *it << " ";
    }
    cout << endl;
}

// Resuelve un caso de prueba, leyendo de la entrada la
// configuración, y escribiendo la respuesta
bool resuelveCaso() {
    // leer los datos de la entrada
    int n;
    cin >> n;
    if (!std::cin) return false;

    list<int> l;
    while (n != 0) {
        l.push_front(n);
        cin >> n;
    }

    resolver(l);

    // escribir sol
    mostrar(l);

    return true;
}

int main() {
    // Para la entrada por fichero.
    // Comentar para acepta el reto
#ifndef DOMJUDGE
    std::ifstream in("datos.txt");
    auto cinbuf = std::cin.rdbuf(in.rdbuf()); //save old buf and redirect std::cin to casos.txt
#endif 


    while (resuelveCaso())
        ;


    // Para restablecer entrada. Comentar para acepta el reto
#ifndef DOMJUDGE // para dejar todo como estaba al principio
    std::cin.rdbuf(cinbuf);
    cin.get();
#endif

    return 0;
}
