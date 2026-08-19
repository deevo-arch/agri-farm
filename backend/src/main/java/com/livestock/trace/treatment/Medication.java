package com.livestock.trace.treatment;

import com.livestock.trace.common.BaseEntity;
import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.user.User;
import com.livestock.trace.vet.VetVisit;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "medications")
public class Medication extends BaseEntity implements WithdrawalPeriod {

    @NotNull
    @DBRef
    private Livestock livestock;

    @DBRef
    private VetVisit vetVisit;

    @NotNull
    @DBRef
    private User administeredBy;

    @NotBlank
    private String medicationName;

    private String dosage;

    @NotNull
    private LocalDate administeredDate;

    @NotNull
    private LocalDate withdrawalEndDate;
}
