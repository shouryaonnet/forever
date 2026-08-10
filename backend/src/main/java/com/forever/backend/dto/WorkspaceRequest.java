package com.forever.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkspaceRequest {

    @NotBlank(message="Workspace name is required")
    private String name;

    private String description;
}