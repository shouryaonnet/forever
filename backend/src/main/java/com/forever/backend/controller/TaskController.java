package com.forever.backend.controller;

import com.forever.backend.dto.TaskRequest;
import com.forever.backend.dto.TaskResponse;
import com.forever.backend.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService=taskService;
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody TaskRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                taskService.createTask(
                        request,
                        authentication.getName()
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getMyTasks(
            Authentication authentication) {

        return ResponseEntity.ok(
                taskService.getMyTasks(
                        authentication.getName()
                )
        );
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TaskResponse> toggleTask(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                taskService.toggleTask(
                        id,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long id,
            Authentication authentication) {

        taskService.deleteTask(
                id,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}