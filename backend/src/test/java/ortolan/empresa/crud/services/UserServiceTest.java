package ortolan.empresa.crud.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ortolan.empresa.crud.entities.User;
import ortolan.empresa.crud.exception.ResourceNotFoundException;
import ortolan.empresa.crud.repositories.UserRepository;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user1;
    private User user2;

    @BeforeEach
    void setUp() {
        user1 = new User(1, "João Silva", "joao@email.com");
        user2 = new User(2, "Maria Santos", "maria@email.com");
    }

    @Test
    void testSaveUser() {
        when(userRepository.save(any(User.class))).thenReturn(user1);

        User savedUser = userService.saveUser(user1);

        assertNotNull(savedUser);
        assertEquals(user1.getName(), savedUser.getName());
        assertEquals(user1.getEmail(), savedUser.getEmail());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testFindAll() {
        List<User> users = Arrays.asList(user1, user2);
        when(userRepository.findAll()).thenReturn(users);

        List<User> foundUsers = userService.findAll();

        assertNotNull(foundUsers);
        assertEquals(2, foundUsers.size());
        assertEquals(user1.getName(), foundUsers.get(0).getName());
        assertEquals(user2.getName(), foundUsers.get(1).getName());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void testFindAllEmpty() {
        when(userRepository.findAll()).thenReturn(Arrays.asList());

        List<User> foundUsers = userService.findAll();

        assertNotNull(foundUsers);
        assertTrue(foundUsers.isEmpty());
        verify(userRepository, times(1)).findAll();
    }

    @Test
    void testDelete() {
        doNothing().when(userRepository).deleteById(1);

        userService.delete(1);

        verify(userRepository, times(1)).deleteById(1);
    }

    @Test
    void testUpdateUserSuccess() {
        User updatedUser = new User();
        updatedUser.setName("João Silva Atualizado");
        updatedUser.setEmail("joao.novo@email.com");

        when(userRepository.findById(1)).thenReturn(Optional.of(user1));
        when(userRepository.save(any(User.class))).thenReturn(user1);

        User result = userService.updateUser(1, updatedUser);

        assertNotNull(result);
        assertEquals("João Silva Atualizado", result.getName());
        assertEquals("joao.novo@email.com", result.getEmail());
        verify(userRepository, times(1)).findById(1);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void testUpdateUserNotFound() {
        User updatedUser = new User();
        updatedUser.setName("Nome Teste");
        updatedUser.setEmail("teste@email.com");

        when(userRepository.findById(999)).thenReturn(Optional.empty());

        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> userService.updateUser(999, updatedUser)
        );

        assertEquals("Usuário não encontrado com id: 999", exception.getMessage());
        verify(userRepository, times(1)).findById(999);
        verify(userRepository, never()).save(any(User.class));
    }
}
