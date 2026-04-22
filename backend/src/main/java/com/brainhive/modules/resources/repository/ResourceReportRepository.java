package com.brainhive.modules.resources.repository;

import com.brainhive.modules.resources.model.ResourceReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceReportRepository extends JpaRepository<ResourceReport, Long> {

    List<ResourceReport> findByResourceId(Long resourceId);

    List<ResourceReport> findByStatus(String status);

    long countByResourceIdAndStatus(Long resourceId, String status);

    long countByStatus(String status);
}
