package com.livestock.trace.qr;

import com.livestock.trace.common.BaseEntity;
import com.livestock.trace.milk.MilkBatch;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Document(collection = "qr_codes")
public class QrCode extends BaseEntity {

    @NotBlank
    @Indexed(unique = true)
    private String token;

    @NotNull
    @DBRef
    @Indexed(unique = true)
    private MilkBatch milkBatch;
}
