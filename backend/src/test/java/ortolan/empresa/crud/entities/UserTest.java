package ortolan.empresa.crud.entities;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {

    private User user;
    private User userWithParams;

    @BeforeEach
    void setUp() {
        user = new User();
        userWithParams = new User(1, "João Silva", "joao@email.com");
    }

    @Test
    void testDefaultConstructor() {
        assertNotNull(user);
        assertNull(user.getId());
        assertNull(user.getName());
        assertNull(user.getEmail());
    }

    @Test
    void testConstructorWithParameters() {
        assertNotNull(userWithParams);
        assertEquals(1, userWithParams.getId());
        assertEquals("João Silva", userWithParams.getName());
        assertEquals("joao@email.com", userWithParams.getEmail());
    }

    @Test
    void testConstructorWithParametersNullValues() {
        User userNull = new User(null, null, null);
        assertNotNull(userNull);
        assertNull(userNull.getId());
        assertNull(userNull.getName());
        assertNull(userNull.getEmail());
    }

    @Test
    void testSetAndGetId() {
        user.setId(10);
        assertEquals(10, user.getId());
    }

    @Test
    void testSetAndGetIdNull() {
        user.setId(null);
        assertNull(user.getId());
    }

    @Test
    void testSetAndGetName() {
        user.setName("Maria Santos");
        assertEquals("Maria Santos", user.getName());
    }

    @Test
    void testSetAndGetNameNull() {
        user.setName(null);
        assertNull(user.getName());
    }

    @Test
    void testSetAndGetNameEmpty() {
        user.setName("");
        assertEquals("", user.getName());
    }

    @Test
    void testSetAndGetEmail() {
        user.setEmail("maria@email.com");
        assertEquals("maria@email.com", user.getEmail());
    }

    @Test
    void testSetAndGetEmailNull() {
        user.setEmail(null);
        assertNull(user.getEmail());
    }

    @Test
    void testSetAndGetEmailEmpty() {
        user.setEmail("");
        assertEquals("", user.getEmail());
    }

    @Test
    void testMultipleSetters() {
        user.setId(5);
        user.setName("Pedro Oliveira");
        user.setEmail("pedro@email.com");

        assertEquals(5, user.getId());
        assertEquals("Pedro Oliveira", user.getName());
        assertEquals("pedro@email.com", user.getEmail());
    }

    @Test
    void testUpdateExistingUser() {
        userWithParams.setId(2);
        userWithParams.setName("João Silva Atualizado");
        userWithParams.setEmail("joao.atualizado@email.com");

        assertEquals(2, userWithParams.getId());
        assertEquals("João Silva Atualizado", userWithParams.getName());
        assertEquals("joao.atualizado@email.com", userWithParams.getEmail());
    }

    @Test
    void testConstructorWithZeroId() {
        User userZeroId = new User(0, "Test User", "test@email.com");
        assertEquals(0, userZeroId.getId());
        assertEquals("Test User", userZeroId.getName());
        assertEquals("test@email.com", userZeroId.getEmail());
    }

    @Test
    void testConstructorWithNegativeId() {
        User userNegativeId = new User(-1, "Test User", "test@email.com");
        assertEquals(-1, userNegativeId.getId());
        assertEquals("Test User", userNegativeId.getName());
        assertEquals("test@email.com", userNegativeId.getEmail());
    }

    @Test
    void testSetNameWithSpecialCharacters() {
        user.setName("José María Ñúñez");
        assertEquals("José María Ñúñez", user.getName());
    }

    @Test
    void testSetEmailWithSpecialCharacters() {
        user.setEmail("user+test@domain.co.uk");
        assertEquals("user+test@domain.co.uk", user.getEmail());
    }

    @Test
    void testSetIdMultipleTimes() {
        user.setId(1);
        assertEquals(1, user.getId());
        user.setId(2);
        assertEquals(2, user.getId());
        user.setId(3);
        assertEquals(3, user.getId());
    }

    @Test
    void testSetNameMultipleTimes() {
        user.setName("Name1");
        assertEquals("Name1", user.getName());
        user.setName("Name2");
        assertEquals("Name2", user.getName());
        user.setName("Name3");
        assertEquals("Name3", user.getName());
    }

    @Test
    void testSetEmailMultipleTimes() {
        user.setEmail("email1@test.com");
        assertEquals("email1@test.com", user.getEmail());
        user.setEmail("email2@test.com");
        assertEquals("email2@test.com", user.getEmail());
        user.setEmail("email3@test.com");
        assertEquals("email3@test.com", user.getEmail());
    }
}
