package com.livestock.trace.milk;

import com.livestock.trace.common.BaseEntity;
import com.livestock.trace.farm.Farm;
import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.user.User;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "milk_batches")
public class MilkBatch extends BaseEntity {

    @NotBlank
    @Indexed(unique = true)
    private String batchCode;

    @NotNull
    @DBRef
    private Farm farm;

    @DBRef
    private User collectedBy;

    @NotNull
    private LocalDate collectionDate;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal quantityLitres;

    @NotEmpty
    @DBRef
    @Builder.Default
    private Set<Livestock> livestock = new HashSet<>();
}
