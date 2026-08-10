package com.forever.backend.repository;

import com.forever.backend.entity.User;
import com.forever.backend.entity.Workspace;
import com.forever.backend.entity.WorkspaceTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceTaskRepository
extends JpaRepository<WorkspaceTask,Long> {

    List<WorkspaceTask> findByWorkspace(Workspace workspace);

    Optional<WorkspaceTask> findByIdAndWorkspace(
            Long id,
            Workspace workspace
    );

    List<WorkspaceTask> findByAssignedUser(User user);
    void deleteByWorkspace(Workspace workspace);}