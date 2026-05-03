package com.assettrack.common.exception;

import jakarta.validation.constraints.Min;

public class DummyItem {
    @Min(0)
    private int quantity;

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
