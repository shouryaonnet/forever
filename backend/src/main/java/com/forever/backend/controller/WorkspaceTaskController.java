package com.forever.backend.controller;

import com.forever.backend.dto.WorkspaceTaskRequest;
import com.forever.backend.dto.WorkspaceTaskResponse;
import com.forever.backend.service.WorkspaceTaskService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/tasks")
public class WorkspaceTaskController {

    private final WorkspaceTaskService taskService;

    public WorkspaceTaskController(
            WorkspaceTaskService taskService) {

        this.taskService=taskService;
    }

    @PostMapping
    public ResponseEntity<WorkspaceTaskResponse> createTask(
            @PathVariable Long workspaceId,
            @Valid @RequestBody WorkspaceTaskRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                taskService.createTask(
                        workspaceId,
                        request,
                        authentication.getName()
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceTaskResponse>> getTasks(
            @PathVariable Long workspaceId,
            Authentication authentication) {

        return ResponseEntity.ok(
                taskService.getTasks(
                        workspaceId,
                        authentication.getName()
                )
        );
    }

    @PatchMapping("/{taskId}/status")
    public ResponseEntity<WorkspaceTaskResponse> updateStatus(
            @PathVariable Long workspaceId,
            @PathVariable Long taskId,
            @RequestParam String status,
            Authentication authentication) {

        return ResponseEntity.ok(
                taskService.updateStatus(
                        workspaceId,
                        taskId,
                        status,
                        authentication.getName()
                )
        );
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(
            @PathVariable Long workspaceId,
            @PathVariable Long taskId,
            Authentication authentication) {

        taskService.deleteTask(
                workspaceId,
                taskId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }
}