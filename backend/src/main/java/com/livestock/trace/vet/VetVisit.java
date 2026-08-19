package com.livestock.trace.vet;

import com.livestock.trace.common.BaseEntity;
import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.user.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
@Document(collection = "vet_visits")
public class VetVisit extends BaseEntity {

    @NotNull
    @DBRef
    private Livestock livestock;

    @NotNull
    @DBRef
    private User requestedBy;

    @DBRef
    private User vet;

    @NotNull
    private LocalDate preferredDate;

    @NotBlank
    private String reason;

    private String notes;

    @NotNull
    @Builder.Default
    private VetVisitStatus status = VetVisitStatus.REQUESTED;

    private LocalDateTime completedAt;
}
