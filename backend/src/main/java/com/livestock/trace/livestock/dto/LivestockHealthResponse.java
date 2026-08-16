package com.livestock.trace.livestock.dto;

import com.livestock.trace.treatment.dto.MedicationResponse;
import com.livestock.trace.treatment.dto.VaccinationResponse;
import com.livestock.trace.vet.dto.VetVisitResponse;
import java.util.List;

public record LivestockHealthResponse(
        LivestockResponse livestock,
        List<VetVisitResponse> vetVisits,
        List<VaccinationResponse> vaccinations,
        List<MedicationResponse> medications,
        boolean underActiveWithdrawal) {}
