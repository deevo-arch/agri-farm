package com.livestock.trace.livestock;

import com.livestock.trace.common.BaseEntity;
import com.livestock.trace.farm.Farm;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "livestock")
@CompoundIndex(name = "farm_tag_idx", def = "{'farm.id': 1, 'tagNumber': 1}", unique = true)
public class Livestock extends BaseEntity {

    @NotBlank
    private String tagNumber;

    @NotNull
    private Species species;

    @PastOrPresent
    private LocalDate dateOfBirth;

    @NotNull
    @Builder.Default
    private LivestockStatus status = LivestockStatus.ACTIVE;

    @NotNull
    @DBRef
    private Farm farm;
}
