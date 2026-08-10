package com.forever.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name="workspace_tasks")
@Getter
@Setter
@NoArgsConstructor
public class WorkspaceTask {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String title;

    @Column(length=1000)
    private String description;

    @Column(nullable=false)
    private String status="TODO";

    @Column(nullable=false)
    private String priority="MEDIUM";

    private LocalDate dueDate;

    @Column(nullable=false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="workspace_id",nullable=false)
    private Workspace workspace;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="creator_id",nullable=false)
    private User creator;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="assigned_user_id")
    private User assignedUser;

    @PrePersist
    protected void onCreate() {
        createdAt=LocalDateTime.now();
    }
}