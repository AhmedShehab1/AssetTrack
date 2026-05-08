package com.assettrack.dto.common;

import org.springframework.data.domain.Page;

public class PageUtils {

    public static <T> PagedResponse<T> toPagedResponse(Page<T> page) {
        PageMeta meta = PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();

        return PagedResponse.<T>builder()
                .content(page.getContent())
                .meta(meta)
                .build();
    }
}
