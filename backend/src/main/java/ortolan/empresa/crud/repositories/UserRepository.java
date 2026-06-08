package ortolan.empresa.crud.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ortolan.empresa.crud.entities.User;

public interface UserRepository extends JpaRepository<User, Integer> {
}
