import java.util.LinkedList;
import java.util.Queue;

/**
 * ============================================================
 *  CONCEITO: Swap Nodes Algorithm (Inversão Espelhada da Árvore)
 * ============================================================
 *
 *  DEFINIÇÃO:
 *    "Trocar" os nós de uma árvore binária significa inverter
 *    (espelhar) a árvore: o filho esquerdo e o filho direito de
 *    cada nó são trocados de posição, recursivamente.
 *    O resultado é chamado de "mirror" ou "invert" da árvore.
 *
 *  ESTRATÉGIA 1 — Recursão (DFS, bottom-up):
 *    1. Se o nó for null, retorne (caso base).
 *    2. Primeiro, inverta recursivamente a sub-árvore esquerda.
 *    3. Depois,  inverta recursivamente a sub-árvore direita.
 *    4. Troque os ponteiros: esquerdo ↔ direito deste nó.
 *
 *  ESTRATÉGIA 2 — Iterativo com Fila (BFS):
 *    1. Enfileire a raiz.
 *    2. Para cada nó retirado da fila:
 *       a. Troque seus filhos (esquerdo ↔ direito).
 *       b. Enfileire os filhos (agora já trocados) se não forem null.
 *
 *  COMPLEXIDADE (ambas as estratégias):
 *    - Tempo:  O(n) — cada nó é visitado uma vez
 *    - Espaço: O(n) — pilha de recursão ou fila
 *
 *  EXEMPLO VISUAL:
 *
 *    ANTES:              DEPOIS (espelhado):
 *
 *         4                    4
 *        / \                  / \
 *       2   7      →         7   2
 *      / \ / \              / \ / \
 *     1  3 6  9            9  6 3  1
 *
 *  PERCURSO IN-ORDER:
 *    Antes:  1  2  3  4  6  7  9
 *    Depois: 9  7  6  4  3  2  1   (invertido!)
 * ============================================================
 */
public class SwapNodes {

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
    //  ESTRATÉGIA 1: Recursiva (DFS)
    //  Inverte a árvore in-place e retorna a nova raiz.
    // ---------------------------------------------------------
    static Node invertRecursivo(Node root) {
        // CASO BASE: nó nulo não precisa ser invertido
        if (root == null) {
            return null;
        }

        // Inverte as sub-árvores filhas ANTES de trocar os ponteiros
        Node esqInvertido = invertRecursivo(root.left);
        Node dirInvertido = invertRecursivo(root.right);

        // Troca os filhos deste nó
        root.left  = dirInvertido;
        root.right = esqInvertido;

        return root; // retorna a raiz (não muda, só seus filhos mudam)
    }

    // ---------------------------------------------------------
    //  ESTRATÉGIA 2: Iterativa com Fila (BFS)
    //  Mesma lógica, sem recursão.
    // ---------------------------------------------------------
    static Node invertIterativo(Node root) {
        if (root == null) {
            return null;
        }

        Queue<Node> fila = new LinkedList<>();
        fila.offer(root);

        while (!fila.isEmpty()) {
            Node no = fila.poll();

            // Troca os filhos deste nó
            Node temp  = no.left;
            no.left    = no.right;
            no.right   = temp;

            // Enfileira os filhos (já trocados) para processar depois
            if (no.left  != null) fila.offer(no.left);
            if (no.right != null) fila.offer(no.right);
        }

        return root;
    }

    // ---------------------------------------------------------
    //  Utilitário: percurso in-order para visualizar o resultado
    //  In-order: esquerda → raiz → direita
    // ---------------------------------------------------------
    static void inOrder(Node root) {
        if (root == null) return;
        inOrder(root.left);
        System.out.print(root.val + " ");
        inOrder(root.right);
    }

    // ---------------------------------------------------------
    //  Utilitário: monta a árvore do exemplo principal
    //        4
    //       / \
    //      2   7
    //     / \ / \
    //    1  3 6  9
    // ---------------------------------------------------------
    static Node montarArvoreExemplo() {
        Node raiz = new Node(4);
        raiz.left          = new Node(2);
        raiz.right         = new Node(7);
        raiz.left.left     = new Node(1);
        raiz.left.right    = new Node(3);
        raiz.right.left    = new Node(6);
        raiz.right.right   = new Node(9);
        return raiz;
    }

    // ---------------------------------------------------------
    //  Casos de Teste
    // ---------------------------------------------------------
    public static void main(String[] args) {

        // --- Teste 1: Árvore vazia ---
        System.out.println("=== Teste 1: Árvore vazia ===");
        System.out.println("Resultado esperado: (nada)");
        System.out.print("Resultado obtido:   ");
        inOrder(invertRecursivo(null));
        System.out.println("(nada)");
        System.out.println();

        // --- Teste 2: Apenas a raiz ---
        System.out.println("=== Teste 2: Apenas a raiz ===");
        Node raiz2 = new Node(1);
        System.out.println("In-order antes:  1");
        System.out.print("In-order depois: ");
        inOrder(invertRecursivo(raiz2));
        System.out.println();
        System.out.println();

        // --- Teste 3: Estratégia RECURSIVA ---
        System.out.println("=== Teste 3: Inversão Recursiva ===");
        Node raiz3 = montarArvoreExemplo();
        System.out.print("In-order ANTES:  ");
        inOrder(raiz3);
        System.out.println();

        invertRecursivo(raiz3);

        System.out.print("In-order DEPOIS: ");
        inOrder(raiz3);
        System.out.println();
        System.out.println("Esperado antes:  1 2 3 4 6 7 9");
        System.out.println("Esperado depois: 9 7 6 4 3 2 1");
        System.out.println();

        // --- Teste 4: Estratégia ITERATIVA ---
        System.out.println("=== Teste 4: Inversão Iterativa (BFS) ===");
        Node raiz4 = montarArvoreExemplo();
        System.out.print("In-order ANTES:  ");
        inOrder(raiz4);
        System.out.println();

        invertIterativo(raiz4);

        System.out.print("In-order DEPOIS: ");
        inOrder(raiz4);
        System.out.println();
        System.out.println("Esperado antes:  1 2 3 4 6 7 9");
        System.out.println("Esperado depois: 9 7 6 4 3 2 1");
        System.out.println();

        // --- Teste 5: Árvore apenas com filho à esquerda ---
        //   1
        //  /
        // 2
        ///
        //3
        System.out.println("=== Teste 5: Árvore degenerada (só esquerda) → vira só direita ===");
        Node raiz5 = new Node(1);
        raiz5.left      = new Node(2);
        raiz5.left.left = new Node(3);
        System.out.print("In-order ANTES:  ");
        inOrder(raiz5);
        System.out.println();

        invertRecursivo(raiz5);

        System.out.print("In-order DEPOIS: ");
        inOrder(raiz5);
        System.out.println();
        System.out.println("Esperado antes:  3 2 1");
        System.out.println("Esperado depois: 1 2 3");
    }
}
