package com.livestock.trace.qr;

import com.livestock.trace.common.BaseEntity;
import com.livestock.trace.milk.MilkBatch;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Table(name = "qr_codes")
public class QrCode extends BaseEntity {

    @NotBlank
    @Column(nullable = false, length = 64, unique = true)
    private String token;

    @NotNull
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "milk_batch_id", nullable = false, unique = true)
    private MilkBatch milkBatch;
}
