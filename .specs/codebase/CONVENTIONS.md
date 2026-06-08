# Code Conventions

## Naming Conventions

**Files:**
- Java classes: PascalCase (e.g., `UserController.java`, `UserService.java`)
- React components: PascalCase (e.g., `App.jsx`)
- Configuration files: kebab-case or camelCase (e.g., `vite.config.js`, `application.properties`)
Examples: `UserController.java`, `UserService.java`, `App.jsx`, `vite.config.js`

**Functions/Methods:**
- Java methods: camelCase (e.g., `findAll()`, `saveUser()`, `updateUser()`)
- React functions: camelCase (e.g., `fetchUsers()`)
Examples: `findAll()`, `saveUser()`, `fetchUsers()`

**Variables:**
- Java variables: camelCase (e.g., `userRepository`, `existingUser`)
- React state: camelCase (e.g., `users`, `loading`, `error`)
Examples: `userRepository`, `existingUser`, `users`, `loading`

**Constants:**
- Java constants: UPPER_SNAKE_CASE (not observed in codebase)
- React constants: camelCase (not observed in codebase)

## Code Organization

**Import/Dependency Declaration:**
- Java: Standard Java convention - java/jakarta imports first, then third-party, then project imports
- React: Imports at top, grouped by type (React, libraries, local components)
Example from <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\backend\src\main\java\ortolan\empresa\crud\services\UserService.java" lines="1-11" />:
```java
package ortolan.empresa.crud.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ortolan.empresa.crud.entities.User;
import ortolan.empresa.crud.exception.ResourceNotFoundException;
import ortolan.empresa.crud.repositories.UserRepository;
```

**File Structure:**
- Java classes: Package declaration → Imports → Class definition → Fields → Constructors → Methods
- React components: Imports → Component function → State hooks → Effect hooks → Helper functions → JSX return
Example from <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\frontend\src\App.jsx" lines="1-65" />:
```jsx
import React, { useState, useEffect } from 'react'

function App() {
  const [users, setUsers] = useState([])
  // ... state and effects
  const fetchUsers = async () => { /* ... */ }
  // ... helper functions
  return ( /* JSX */ )
}
```

## Type Safety/Documentation

**Approach:** 
- Java: Strong typing with explicit types, no type annotations observed
- React: No TypeScript, plain JavaScript with no type checking
Example from <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\backend\src\main\java\ortolan\empresa\crud\entities\User.java" lines="8-13" />:
```java
private Integer id;
private String name;
private String email;
```

## Error Handling

**Pattern:** Custom exceptions with global exception handler
- Backend: Custom runtime exceptions (@RestControllerAdvice)
- Frontend: try-catch blocks with error state
Example from <ref_file file="C:\Users\adort\OneDrive\Documentos\Curso FullStack\Java\crud\backend\src\main\java\ortolan\empresa\crud\services\UserService.java" lines="31-33" />:
```java
User existingUser = userRepository.findById(id)
    .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + id));
```

## Comments/Documentation

**Style:** Minimal comments, code is self-documenting
- Java: No Javadoc comments observed
- React: No comments observed
- Code structure and naming conventions provide clarity
