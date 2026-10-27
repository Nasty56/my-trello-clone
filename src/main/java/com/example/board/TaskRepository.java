package com.example.board;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, String> {
    List<Task> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}