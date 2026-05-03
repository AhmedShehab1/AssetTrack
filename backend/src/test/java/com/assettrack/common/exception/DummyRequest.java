package com.assettrack.common.exception;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class DummyRequest {
    @Valid
    @NotNull
    private List<DummyItem> items;

    public List<DummyItem> getItems() {
        return items;
    }

    public void setItems(List<DummyItem> items) {
        this.items = items;
    }
}
