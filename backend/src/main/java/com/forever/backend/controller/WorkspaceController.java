package com.forever.backend.controller;

import com.forever.backend.dto.AddMemberRequest;
import com.forever.backend.dto.MemberResponse;
import com.forever.backend.dto.WorkspaceRequest;
import com.forever.backend.dto.WorkspaceResponse;
import com.forever.backend.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(
            WorkspaceService workspaceService) {

        this.workspaceService=workspaceService;
    }

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(
            @Valid @RequestBody WorkspaceRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                workspaceService.createWorkspace(
                        request,
                        authentication.getName()
                )
        );
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getMyWorkspaces(
            Authentication authentication) {

        return ResponseEntity.ok(
                workspaceService.getMyWorkspaces(
                        authentication.getName()
                )
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> getWorkspace(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                workspaceService.getWorkspace(
                        id,
                        authentication.getName()
                )
        );
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<List<MemberResponse>> getMembers(
            @PathVariable Long id,
            Authentication authentication) {

        return ResponseEntity.ok(
                workspaceService.getMembers(
                        id,
                        authentication.getName()
                )
        );
    }

    @PostMapping("/{id}/members")
    public ResponseEntity<MemberResponse> addMember(
            @PathVariable Long id,
            @Valid @RequestBody AddMemberRequest request,
            Authentication authentication) {

        return ResponseEntity.ok(
                workspaceService.addMember(
                        id,
                        request,
                        authentication.getName()
                )
        );
    }
    @DeleteMapping("/{id}")
public ResponseEntity<Void> deleteWorkspace(
        @PathVariable Long id,
        Authentication authentication) {

    workspaceService.deleteWorkspace(
            id,
            authentication.getName()
    );

    return ResponseEntity.noContent().build();
}
}