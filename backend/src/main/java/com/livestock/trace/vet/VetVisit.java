package com.livestock.trace.vet;

import com.livestock.trace.common.BaseEntity;
import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
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

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vet_id", nullable = false)
    private User vet;

    @NotNull
    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @Column(columnDefinition = "TEXT")
    private String notes;
}
