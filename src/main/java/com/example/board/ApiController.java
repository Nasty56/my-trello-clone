package com.example.board;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ApiController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Пользователь уже существует"));
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(password);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Успешно"));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        Optional<User> user = userRepository.findByEmail(email);

        if (user.isPresent() && user.get().getPassword().equals(password)) {
            return ResponseEntity.ok(Map.of(
                    "userId", user.get().getId(),
                    "email", email,
                    "avatar", user.get().getAvatar() != null ? user.get().getAvatar() : ""
            ));
        }

        return ResponseEntity.badRequest().body(Map.of("error", "Неверный email или пароль"));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUser(@PathVariable Long userId) {
        Optional<User> user = userRepository.findById(userId);
        if (user.isPresent()) {
            return ResponseEntity.ok(Map.of(
                    "email", user.get().getEmail(),
                    "avatar", user.get().getAvatar() != null ? user.get().getAvatar() : "",
                    "gender", user.get().getGender() != null ? user.get().getGender() : "",
                    "age", user.get().getAge() != null ? user.get().getAge() : "",
                    "goal", user.get().getGoal() != null ? user.get().getGoal() : ""
            ));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Пользователь не найден"));
    }

    @PostMapping("/users/{userId}/avatar")
    public ResponseEntity<?> saveAvatar(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setAvatar(body.get("avatar"));
            user.setGender(body.get("gender"));
            user.setAge(body.get("age"));
            user.setGoal(body.get("goal"));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Профиль обновлен"));
        }
        return ResponseEntity.badRequest().body(Map.of("error", "Пользователь не найден"));
    }

    @GetMapping("/tasks/{userId}")
    public List<Task> getTasks(@PathVariable Long userId) {
        return taskRepository.findByUserId(userId);
    }

    @PostMapping("/tasks/{userId}")
    public ResponseEntity<?> saveTask(@PathVariable Long userId, @RequestBody Task task) {
        task.setUserId(userId);
        taskRepository.save(task);
        return ResponseEntity.ok(Map.of("message", "Сохранено"));
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable String taskId) {
        taskRepository.deleteById(taskId);
        return ResponseEntity.ok(Map.of("message", "Удалено"));
    }
}