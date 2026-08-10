package com.forever.backend.service;

import com.forever.backend.dto.WorkspaceTaskRequest;
import com.forever.backend.dto.WorkspaceTaskResponse;
import com.forever.backend.entity.User;
import com.forever.backend.entity.Workspace;
import com.forever.backend.entity.WorkspaceTask;
import com.forever.backend.repository.UserRepository;
import com.forever.backend.repository.WorkspaceMemberRepository;
import com.forever.backend.repository.WorkspaceRepository;
import com.forever.backend.repository.WorkspaceTaskRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkspaceTaskService {

    private final WorkspaceTaskRepository taskRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    public WorkspaceTaskService(
            WorkspaceTaskRepository taskRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository memberRepository,
            UserRepository userRepository) {

        this.taskRepository=taskRepository;
        this.workspaceRepository=workspaceRepository;
        this.memberRepository=memberRepository;
        this.userRepository=userRepository;
    }

    public WorkspaceTaskResponse createTask(
            Long workspaceId,
            WorkspaceTaskRequest request,
            String email) {

        User creator=findUser(email);

        Workspace workspace=findWorkspace(workspaceId);

        checkMembership(workspace,creator);

        WorkspaceTask task=new WorkspaceTask();

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(
                request.priority() != null
                        ? request.priority()
                        : "MEDIUM"
        );
        task.setDueDate(request.dueDate());
        task.setWorkspace(workspace);
        task.setCreator(creator);

        if (request.assignedUserId() != null) {

            User assignedUser=userRepository
                    .findById(request.assignedUserId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Assigned user not found"
                            ));

            if (!memberRepository
                    .existsByWorkspaceAndUser(
                            workspace,
                            assignedUser
                    )) {

                throw new RuntimeException(
                        "Assigned user is not a workspace member"
                );
            }

            task.setAssignedUser(assignedUser);
        }

        WorkspaceTask savedTask=
                taskRepository.save(task);

        return WorkspaceTaskResponse.from(savedTask);
    }

    public List<WorkspaceTaskResponse> getTasks(
            Long workspaceId,
            String email) {

        User user=findUser(email);

        Workspace workspace=findWorkspace(workspaceId);

        checkMembership(workspace,user);

        return taskRepository
                .findByWorkspace(workspace)
                .stream()
                .map(WorkspaceTaskResponse::from)
                .toList();
    }

    public WorkspaceTaskResponse updateStatus(
            Long workspaceId,
            Long taskId,
            String status,
            String email) {

        User user=findUser(email);

        Workspace workspace=findWorkspace(workspaceId);

        checkMembership(workspace,user);

        WorkspaceTask task=taskRepository
                .findByIdAndWorkspace(
                        taskId,
                        workspace
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Workspace task not found"
                        ));

        if (!status.equals("TODO")
                && !status.equals("IN_PROGRESS")
                && !status.equals("COMPLETED")) {

            throw new RuntimeException(
                    "Invalid task status"
            );
        }

        task.setStatus(status);

        if (status.equals("COMPLETED")) {
            task.setCompletedAt(
                    LocalDateTime.now()
            );
        } else {
            task.setCompletedAt(null);
        }

        WorkspaceTask updatedTask=
                taskRepository.save(task);

        return WorkspaceTaskResponse.from(
                updatedTask
        );
    }

    public void deleteTask(
            Long workspaceId,
            Long taskId,
            String email) {

        User user=findUser(email);

        Workspace workspace=findWorkspace(workspaceId);

        checkMembership(workspace,user);

        WorkspaceTask task=taskRepository
                .findByIdAndWorkspace(
                        taskId,
                        workspace
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Workspace task not found"
                        ));

        taskRepository.delete(task);
    }

    private User findUser(String email) {

        return userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found"
                        ));
    }

    private Workspace findWorkspace(
            Long workspaceId) {

        return workspaceRepository
                .findById(workspaceId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Workspace not found"
                        ));
    }

    private void checkMembership(
            Workspace workspace,
            User user) {

        if (!memberRepository
                .existsByWorkspaceAndUser(
                        workspace,
                        user
                )) {

            throw new RuntimeException(
                    "You are not a member of this workspace"
            );
        }
    }
}