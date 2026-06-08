package ortolan.empresa.crud.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler globalExceptionHandler;

    @BeforeEach
    void setUp() {
        globalExceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void testHandleResourceNotFoundException() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Usuário não encontrado com id: 1");

        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleResourceNotFoundException(exception);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void testHandleResourceNotFoundExceptionBodyContent() {
        String errorMessage = "Recurso não encontrado";
        ResourceNotFoundException exception = new ResourceNotFoundException(errorMessage);

        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleResourceNotFoundException(exception);
        Map<String, Object> body = response.getBody();

        assertNotNull(body);
        assertTrue(body.containsKey("timestamp"));
        assertTrue(body.containsKey("status"));
        assertTrue(body.containsKey("error"));
        assertTrue(body.containsKey("message"));

        assertEquals(404, body.get("status"));
        assertEquals("Not Found", body.get("error"));
        assertEquals(errorMessage, body.get("message"));
    }

    @Test
    void testHandleResourceNotFoundExceptionWithNullMessage() {
        ResourceNotFoundException exception = new ResourceNotFoundException(null);

        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleResourceNotFoundException(exception);
        Map<String, Object> body = response.getBody();

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(body);
        assertNull(body.get("message"));
    }

    @Test
    void testHandleResourceNotFoundExceptionWithEmptyMessage() {
        ResourceNotFoundException exception = new ResourceNotFoundException("");

        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleResourceNotFoundException(exception);
        Map<String, Object> body = response.getBody();

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(body);
        assertEquals("", body.get("message"));
    }

    @Test
    void testHandleResourceNotFoundExceptionTimestamp() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Test message");

        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleResourceNotFoundException(exception);
        Map<String, Object> body = response.getBody();

        assertNotNull(body);
        assertNotNull(body.get("timestamp"));
        assertTrue(body.get("timestamp") instanceof java.time.LocalDateTime);
    }

    @Test
    void testHandleResourceNotFoundExceptionStatusCode() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Test message");

        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleResourceNotFoundException(exception);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testHandleResourceNotFoundExceptionErrorField() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Test message");

        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleResourceNotFoundException(exception);
        Map<String, Object> body = response.getBody();

        assertNotNull(body);
        assertEquals("Not Found", body.get("error"));
    }

    @Test
    void testHandleResourceNotFoundExceptionWithLongMessage() {
        String longMessage = "Este é um erro muito longo que descreve um recurso que não foi encontrado no sistema. O recurso pode ter sido excluído, movido ou nunca ter existido.";
        ResourceNotFoundException exception = new ResourceNotFoundException(longMessage);

        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleResourceNotFoundException(exception);
        Map<String, Object> body = response.getBody();

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals(longMessage, body.get("message"));
    }

    @Test
    void testHandleResourceNotFoundExceptionWithSpecialCharacters() {
        String message = "Erro: ñão encontrado ção ão";
        ResourceNotFoundException exception = new ResourceNotFoundException(message);

        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleResourceNotFoundException(exception);
        Map<String, Object> body = response.getBody();

        assertNotNull(response);
        assertEquals(message, body.get("message"));
    }

    @Test
    void testHandleResourceNotFoundExceptionResponseEntityStructure() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Test");

        ResponseEntity<Map<String, Object>> response = globalExceptionHandler.handleResourceNotFoundException(exception);

        assertNotNull(response);
        assertNotNull(response.getBody());
        assertEquals(4, response.getBody().size());
    }
}
