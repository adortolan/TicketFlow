import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;

/**
 * ============================================================
 *  CONCEITO: Level Order Traversal (Percurso por Nível / BFS)
 * ============================================================
 *
 *  DEFINIÇÃO:
 *    Visitar todos os nós da árvore nível a nível, da esquerda
 *    para a direita — também chamado de BFS (Breadth-First Search).
 *
 *  ESTRATÉGIA — Fila (Queue):
 *    1. Enfileire a raiz.
 *    2. Enquanto a fila não estiver vazia:
 *       a. Registre o tamanho atual da fila (= quantidade de nós no nível).
 *       b. Retire e processe exatamente essa quantidade de nós.
 *       c. Para cada nó retirado, enfileire seus filhos (esquerdo e direito).
 *    3. Ao final de cada "rodada" (a), você processou um nível inteiro.
 *
 *  POR QUE FILA E NÃO PILHA?
 *    - Fila garante ordem FIFO: o primeiro a entrar é o primeiro a sair.
 *    - Isso preserva a ordem esquerda→direita dentro de cada nível.
 *    - Pilha (usada em DFS) processaria o caminho mais fundo primeiro.
 *
 *  COMPLEXIDADE:
 *    - Tempo:  O(n) — cada nó é enfileirado e desenfileirado uma vez
 *    - Espaço: O(w) — onde w é a largura máxima da árvore
 *
 *  EXEMPLO VISUAL:
 *
 *           1          ← nível 0: [1]
 *          / \
 *         2   3        ← nível 1: [2, 3]
 *        / \   \
 *       4   5   6      ← nível 2: [4, 5, 6]
 *
 *    Resultado: [[1], [2,3], [4,5,6]]
 * ============================================================
 */
public class LevelOrderTraversal {

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
    //  Método: levelOrder(Node root)
    //  Retorna uma lista de listas: cada lista interna representa
    //  os valores de um nível da árvore.
    // ---------------------------------------------------------
    static List<List<Integer>> levelOrder(Node root) {
        List<List<Integer>> resultado = new ArrayList<>();

        // Árvore vazia: retorna lista vazia
        if (root == null) {
            return resultado;
        }

        // Fila para controlar quais nós processar
        Queue<Node> fila = new LinkedList<>();
        fila.offer(root); // começa pela raiz

        while (!fila.isEmpty()) {

            // Quantos nós existem NESTE nível?
            int tamanhoDoNivel = fila.size();
            List<Integer> nivelAtual = new ArrayList<>();

            // Processar apenas os nós deste nível
            for (int i = 0; i < tamanhoDoNivel; i++) {
                Node no = fila.poll(); // retira o próximo da fila
                nivelAtual.add(no.val);

                // Enfileira os filhos para o PRÓXIMO nível
                if (no.left  != null) fila.offer(no.left);
                if (no.right != null) fila.offer(no.right);
            }

            resultado.add(nivelAtual); // salva o nível completo
        }

        return resultado;
    }

    // ---------------------------------------------------------
    //  Variação: imprime os nós em uma única linha separados por espaço
    // ---------------------------------------------------------
    static void imprimirEmLinha(Node root) {
        if (root == null) {
            System.out.println("(árvore vazia)");
            return;
        }

        Queue<Node> fila = new LinkedList<>();
        fila.offer(root);

        while (!fila.isEmpty()) {
            Node no = fila.poll();
            System.out.print(no.val + " ");

            if (no.left  != null) fila.offer(no.left);
            if (no.right != null) fila.offer(no.right);
        }
        System.out.println();
    }

    // ---------------------------------------------------------
    //  Casos de Teste
    // ---------------------------------------------------------
    public static void main(String[] args) {

        // --- Teste 1: Árvore vazia ---
        System.out.println("=== Teste 1: Árvore vazia ===");
        System.out.println("Resultado esperado: []");
        System.out.println("Resultado obtido:   " + levelOrder(null));
        System.out.println();

        // --- Teste 2: Apenas a raiz ---
        //   1
        Node raiz2 = new Node(1);
        System.out.println("=== Teste 2: Apenas a raiz ===");
        System.out.println("Resultado esperado: [[1]]");
        System.out.println("Resultado obtido:   " + levelOrder(raiz2));
        System.out.println();

        // --- Teste 3: Árvore com 3 níveis ---
        //        1
        //       / \
        //      2   3
        //     / \   \
        //    4   5   6
        Node raiz3 = new Node(1);
        raiz3.left           = new Node(2);
        raiz3.right          = new Node(3);
        raiz3.left.left      = new Node(4);
        raiz3.left.right     = new Node(5);
        raiz3.right.right    = new Node(6);
        System.out.println("=== Teste 3: Árvore com 3 níveis ===");
        System.out.println("Resultado esperado: [[1], [2, 3], [4, 5, 6]]");
        System.out.println("Resultado obtido:   " + levelOrder(raiz3));
        System.out.println();

        // --- Teste 4: Árvore degenerada (só filhos à esquerda) ---
        //   1
        //  /
        // 2
        ///
        //3
        Node raiz4 = new Node(1);
        raiz4.left       = new Node(2);
        raiz4.left.left  = new Node(3);
        System.out.println("=== Teste 4: Árvore degenerada (só filhos à esquerda) ===");
        System.out.println("Resultado esperado: [[1], [2], [3]]");
        System.out.println("Resultado obtido:   " + levelOrder(raiz4));
        System.out.println();

        // --- Teste 5: Impressão em linha única (variação) ---
        //        1
        //       / \
        //      2   3
        //     / \
        //    4   5
        Node raiz5 = new Node(1);
        raiz5.left          = new Node(2);
        raiz5.right         = new Node(3);
        raiz5.left.left     = new Node(4);
        raiz5.left.right    = new Node(5);
        System.out.println("=== Teste 5: Impressão em linha (BFS simples) ===");
        System.out.print("Resultado esperado: 1 2 3 4 5 \nResultado obtido:   ");
        imprimirEmLinha(raiz5);
    }
}
