package com.livestock.trace.farm;

import com.livestock.trace.common.BaseEntity;
import com.livestock.trace.user.User;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
@Document(collection = "farms")
public class Farm extends BaseEntity {

    @NotBlank
    private String name;

    @NotBlank
    private String location;

    @NotNull
    @DBRef
    private User owner;
}
