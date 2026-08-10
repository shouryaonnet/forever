package com.forever.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name="workspace_members",
        uniqueConstraints={
                @UniqueConstraint(
                        columnNames={"workspace_id","user_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
public class WorkspaceMember {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="workspace_id",nullable=false)
    private Workspace workspace;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="user_id",nullable=false)
    private User user;

    @Column(nullable=false)
    private String role;

    @Column(nullable=false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt=LocalDateTime.now();
    }
}