package com.forever.backend.dto;

import com.forever.backend.entity.WorkspaceMember;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberResponse {

    private Long userId;
    private String name;
    private String username;
    private String email;
    private String role;

    public static MemberResponse from(
            WorkspaceMember member) {

        return new MemberResponse(
                member.getUser().getId(),
                member.getUser().getName(),
                member.getUser().getUsername(),
                member.getUser().getEmail(),
                member.getRole()
        );
    }
}