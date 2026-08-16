package com.livestock.trace.treatment;

import com.livestock.trace.common.BaseEntity;
import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.user.User;
import com.livestock.trace.vet.VetVisit;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
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
@Table(name = "vaccinations")
public class Vaccination extends BaseEntity implements WithdrawalPeriod {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "livestock_id", nullable = false)
    private Livestock livestock;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vet_visit_id")
    private VetVisit vetVisit;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "administered_by", nullable = false)
    private User administeredBy;

    @NotBlank
    @Column(name = "vaccine_name", nullable = false, length = 150)
    private String vaccineName;

    @NotNull
    @Column(name = "administered_date", nullable = false)
    private LocalDate administeredDate;

    @NotNull
    @Column(name = "withdrawal_end_date", nullable = false)
    private LocalDate withdrawalEndDate;
}
