package com.forever.backend.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record WorkspaceTaskRequest(

        @NotBlank
        String title,

        String description,

        String priority,

        LocalDate dueDate,

        Long assignedUserId

) {
}