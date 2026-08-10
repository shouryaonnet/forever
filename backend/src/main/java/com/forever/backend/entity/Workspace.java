package com.forever.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name="workspaces")
@Getter
@Setter
@NoArgsConstructor
public class Workspace {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;

    @Column(length=1000)
    private String description;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="owner_id",nullable=false)
    private User owner;

    @Column(nullable=false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt=LocalDateTime.now();
    }
}