package com.forever.backend.dto;

import com.forever.backend.entity.WorkspaceTask;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record WorkspaceTaskResponse(

        Long id,
        String title,
        String description,
        String status,
        String priority,
        LocalDate dueDate,
        LocalDateTime createdAt,
        LocalDateTime completedAt,
        Long creatorId,
        String creatorName,
        Long assignedUserId,
        String assignedUserName

) {

    public static WorkspaceTaskResponse from(
            WorkspaceTask task) {

        return new WorkspaceTaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getDueDate(),
                task.getCreatedAt(),
                task.getCompletedAt(),
                task.getCreator().getId(),
                task.getCreator().getName(),
                task.getAssignedUser() != null
                        ? task.getAssignedUser().getId()
                        : null,
                task.getAssignedUser() != null
                        ? task.getAssignedUser().getName()
                        : null
        );
    }
}