package com.forever.backend.repository;

import com.forever.backend.entity.User;
import com.forever.backend.entity.Workspace;
import com.forever.backend.entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceMemberRepository
        extends JpaRepository<WorkspaceMember,Long> {

    List<WorkspaceMember> findByWorkspace(Workspace workspace);
    List<WorkspaceMember> findByUser(User user);

    Optional<WorkspaceMember> findByWorkspaceAndUser(
            Workspace workspace,
            User user
    );

    boolean existsByWorkspaceAndUser(
            Workspace workspace,
            User user
    );
}