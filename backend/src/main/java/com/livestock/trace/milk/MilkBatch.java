package com.livestock.trace.milk;

import com.livestock.trace.common.BaseEntity;
import com.livestock.trace.farm.Farm;
import com.livestock.trace.livestock.Livestock;
import com.livestock.trace.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "milk_batches")
public class MilkBatch extends BaseEntity {

    @NotBlank
    @Column(name = "batch_code", nullable = false, length = 50, unique = true)
    private String batchCode;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "farm_id", nullable = false)
    private Farm farm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "collected_by")
    private User collectedBy;

    @NotNull
    @Column(name = "collection_date", nullable = false)
    private LocalDate collectionDate;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "quantity_litres", nullable = false, precision = 8, scale = 2)
    private BigDecimal quantityLitres;

    @NotEmpty
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "milk_batch_livestock",
            joinColumns = @JoinColumn(name = "milk_batch_id"),
            inverseJoinColumns = @JoinColumn(name = "livestock_id"))
    @Builder.Default
    private Set<Livestock> livestock = new HashSet<>();
}
