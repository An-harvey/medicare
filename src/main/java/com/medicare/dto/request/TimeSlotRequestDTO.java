package com.medicare.dto.request;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder @FieldDefaults(level=AccessLevel.PRIVATE)
public class TimeSlotRequestDTO {

    LocalTime startTime;

    Boolean status;

}
