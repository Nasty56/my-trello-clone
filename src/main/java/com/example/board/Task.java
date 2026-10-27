package com.example.board;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "tasks")
@Data
public class Task {
    @Id
    private String id;

    private String text;
    private String status;
    private Long userId;
}