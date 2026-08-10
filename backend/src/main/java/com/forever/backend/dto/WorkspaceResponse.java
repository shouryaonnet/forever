package com.forever.backend.dto;

import com.forever.backend.entity.Workspace;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class WorkspaceResponse {

    private Long id;
    private String name;
    private String description;
    private String ownerUsername;

    public static WorkspaceResponse from(
            Workspace workspace) {

        return new WorkspaceResponse(
                workspace.getId(),
                workspace.getName(),
                workspace.getDescription(),
                workspace.getOwner().getUsername()
        );
    }
}