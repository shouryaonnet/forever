package com.forever.backend.dto;

import com.forever.backend.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private boolean completed;
    private LocalDate dueDate;

    public static TaskResponse from(Task task) {

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.isCompleted(),
                task.getDueDate()
        );
    }
}