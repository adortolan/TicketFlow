/**
 * ============================================================
 *  CONCEITO: Height of a Binary Tree (Altura de uma Árvore Binária)
 * ============================================================
 *
 *  DEFINIÇÃO:
 *    A altura de uma árvore binária é o número de arestas no
 *    caminho mais longo desde a raiz até uma folha.
 *
 *    Convenção usada aqui:
 *      - Árvore vazia (null)  → altura = -1
 *      - Árvore com 1 nó      → altura =  0
 *
 *  ESTRATÉGIA — Recursão (DFS: Depth-First Search):
 *    1. Se o nó for null, retorne -1 (caso base).
 *    2. Calcule recursivamente a altura da sub-árvore esquerda.
 *    3. Calcule recursivamente a altura da sub-árvore direita.
 *    4. A altura do nó atual = 1 + max(alturaEsquerda, alturaDireita).
 *
 *  COMPLEXIDADE:
 *    - Tempo:  O(n) — visita cada nó uma vez
 *    - Espaço: O(h) — pilha de recursão, onde h é a própria altura
 *
 *  EXEMPLO VISUAL:
 *
 *           1          ← nível 0
 *          / \
 *         2   3        ← nível 1
 *        / \
 *       4   5          ← nível 2
 *
 *    Altura = 2  (caminho mais longo: 1 → 2 → 4 ou 1 → 2 → 5)
 * ============================================================
 */
public class BinaryTreeHeight {

    // ---------------------------------------------------------
    //  Estrutura do Nó
    // ---------------------------------------------------------
    static class Node {
        int val;
        Node left;
        Node right;

        Node(int val) {
            this.val = val;
        }
    }

    // ---------------------------------------------------------
    //  Método: height(Node root)
    //  Retorna a altura da árvore com raiz em 'root'.
    // ---------------------------------------------------------
    static int height(Node root) {
        // CASO BASE: árvore vazia não tem altura
        if (root == null) {
            return -1;
        }

        // PASSO RECURSIVO: desce até as folhas antes de calcular
        int alturaEsquerda = height(root.left);   // altura da sub-árvore esquerda
        int alturaDireita  = height(root.right);  // altura da sub-árvore direita

        // A altura deste nó é 1 aresta + o maior dos dois ramos
        return 1 + Math.max(alturaEsquerda, alturaDireita);
    }

    // ---------------------------------------------------------
    //  Casos de Teste
    // ---------------------------------------------------------
    public static void main(String[] args) {

        // --- Teste 1: Árvore vazia ---
        System.out.println("=== Teste 1: Árvore vazia ===");
        System.out.println("Altura esperada: -1");
        System.out.println("Altura obtida:   " + height(null));
        System.out.println();

        // --- Teste 2: Apenas a raiz ---
        //   1
        Node raiz2 = new Node(1);
        System.out.println("=== Teste 2: Apenas a raiz ===");
        System.out.println("Altura esperada: 0");
        System.out.println("Altura obtida:   " + height(raiz2));
        System.out.println();

        // --- Teste 3: Árvore balanceada ---
        //        1
        //       / \
        //      2   3
        //     / \
        //    4   5
        Node raiz3 = new Node(1);
        raiz3.left          = new Node(2);
        raiz3.right         = new Node(3);
        raiz3.left.left     = new Node(4);
        raiz3.left.right    = new Node(5);
        System.out.println("=== Teste 3: Árvore balanceada ===");
        System.out.println("Altura esperada: 2");
        System.out.println("Altura obtida:   " + height(raiz3));
        System.out.println();

        // --- Teste 4: Árvore degenerada (lista encadeada à direita) ---
        //   1
        //    \
        //     2
        //      \
        //       3
        //        \
        //         4
        Node raiz4 = new Node(1);
        raiz4.right             = new Node(2);
        raiz4.right.right       = new Node(3);
        raiz4.right.right.right = new Node(4);
        System.out.println("=== Teste 4: Árvore degenerada (só filhos direitos) ===");
        System.out.println("Altura esperada: 3");
        System.out.println("Altura obtida:   " + height(raiz4));
        System.out.println();

        // --- Teste 5: Árvore assimétrica ---
        //        1
        //       /
        //      2
        //     / \
        //    3   4
        //   /
        //  5
        Node raiz5 = new Node(1);
        raiz5.left              = new Node(2);
        raiz5.left.left         = new Node(3);
        raiz5.left.right        = new Node(4);
        raiz5.left.left.left    = new Node(5);
        System.out.println("=== Teste 5: Árvore assimétrica ===");
        System.out.println("Altura esperada: 3");
        System.out.println("Altura obtida:   " + height(raiz5));
    }
}
