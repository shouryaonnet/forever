package com.forever.backend.service;

import com.forever.backend.dto.AddMemberRequest;
import com.forever.backend.dto.MemberResponse;
import com.forever.backend.dto.WorkspaceRequest;
import com.forever.backend.dto.WorkspaceResponse;
import com.forever.backend.entity.User;
import com.forever.backend.entity.Workspace;
import com.forever.backend.entity.WorkspaceMember;
import com.forever.backend.repository.UserRepository;
import com.forever.backend.repository.WorkspaceMemberRepository;
import com.forever.backend.repository.WorkspaceRepository;
import com.forever.backend.repository.WorkspaceTaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;
    private final WorkspaceTaskRepository workspaceTaskRepository;

    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository memberRepository,
            WorkspaceTaskRepository workspaceTaskRepository,
            UserRepository userRepository) {

        this.workspaceRepository=workspaceRepository;
        this.memberRepository=memberRepository;
        this.workspaceTaskRepository=workspaceTaskRepository;
        this.userRepository=userRepository;
    }

    public WorkspaceResponse createWorkspace(
            WorkspaceRequest request,
            String email) {

        User owner=userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Workspace workspace=new Workspace();

        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace.setOwner(owner);

        Workspace savedWorkspace=
                workspaceRepository.save(workspace);

        WorkspaceMember ownerMember=new WorkspaceMember();

        ownerMember.setWorkspace(savedWorkspace);
        ownerMember.setUser(owner);
        ownerMember.setRole("OWNER");

        memberRepository.save(ownerMember);

        return WorkspaceResponse.from(savedWorkspace);
    }

    public List<WorkspaceResponse> getMyWorkspaces(
            String email) {

        User user=userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return memberRepository
                .findByUser(user)
                .stream()
                .map(WorkspaceMember::getWorkspace)
                .map(WorkspaceResponse::from)
                .toList();
    }

    public WorkspaceResponse getWorkspace(
            Long workspaceId,
            String email) {

        User user=userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Workspace workspace=workspaceRepository
                .findById(workspaceId)
                .orElseThrow(() ->
                        new RuntimeException("Workspace not found"));

        checkMembership(workspace,user);

        return WorkspaceResponse.from(workspace);
    }

    public List<MemberResponse> getMembers(
            Long workspaceId,
            String email) {

        User user=userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Workspace workspace=workspaceRepository
                .findById(workspaceId)
                .orElseThrow(() ->
                        new RuntimeException("Workspace not found"));

        checkMembership(workspace,user);

        return memberRepository
                .findByWorkspace(workspace)
                .stream()
                .map(MemberResponse::from)
                .toList();
    }

    public MemberResponse addMember(
            Long workspaceId,
            AddMemberRequest request,
            String email) {

        User owner=userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Workspace workspace=workspaceRepository
                .findById(workspaceId)
                .orElseThrow(() ->
                        new RuntimeException("Workspace not found"));

        if (!workspace.getOwner().getId()
                .equals(owner.getId())) {

            throw new RuntimeException(
                    "Only the workspace owner can add members"
            );
        }

        User userToAdd=userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException(
                                "User with this email does not exist"
                        ));

        if (memberRepository
                .existsByWorkspaceAndUser(
                        workspace,
                        userToAdd
                )) {

            throw new RuntimeException(
                    "User is already a member"
            );
        }

        WorkspaceMember member=new WorkspaceMember();

        member.setWorkspace(workspace);
        member.setUser(userToAdd);
        member.setRole("MEMBER");

        return MemberResponse.from(
                memberRepository.save(member)
        );
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

    @Transactional
    public void deleteWorkspace(
            Long workspaceId,
            String email) {

        User user=userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Workspace workspace=workspaceRepository
                .findById(workspaceId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Workspace not found"
                        ));

        if (!workspace.getOwner().getId()
                .equals(user.getId())) {

            throw new RuntimeException(
                    "Only the workspace owner can delete the workspace"
            );
        }

        workspaceTaskRepository
                .deleteByWorkspace(workspace);

        memberRepository
                .deleteByWorkspace(workspace);

        workspaceRepository.delete(workspace);
    }
}