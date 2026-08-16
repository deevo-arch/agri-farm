package com.livestock.trace.treatment;

import com.livestock.trace.livestock.Livestock;
import java.time.LocalDate;

public interface WithdrawalPeriod {

    Livestock getLivestock();

    LocalDate getWithdrawalEndDate();
}
