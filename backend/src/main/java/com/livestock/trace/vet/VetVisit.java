package com.livestock.trace.vet;

import com.livestock.trace.common.BaseEntity;
import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "vet_visits")
public class VetVisit extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "livestock_id", nullable = false)
    private Livestock livestock;

    // The farmer who requested the visit.
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    // Set only once a VET accepts the request; null while REQUESTED.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vet_id")
    private User vet;

    @NotNull
    @Column(name = "preferred_date", nullable = false)
    private LocalDate preferredDate;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false, length = 20)
    private VetVisitStatus status = VetVisitStatus.REQUESTED;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
