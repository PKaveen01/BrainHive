package com.brainhive.modules.resources.service;

import com.brainhive.modules.user.model.StudentProfile;
import com.brainhive.modules.user.model.Subject;
import com.brainhive.modules.user.repository.StudentProfileRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class DiscoveryService {

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    /** Load weak subjects and current subject names inside a transaction so
     *  lazy collections are available before the session closes. */
    @Transactional(readOnly = true)
    public PersonalizationData loadPersonalization(Long userId) {
        PersonalizationData data = new PersonalizationData();
        if (userId == null) return data;

        studentProfileRepository.findByUserId(userId).ifPresent(profile -> {
            // Force-initialize both lazy collections inside the transaction
            if (profile.getWeakSubjects() != null) {
                data.weakSubjects.addAll(profile.getWeakSubjects());
            }
            if (profile.getSubjects() != null) {
                for (Subject s : profile.getSubjects()) {
                    data.currentSubjects.add(s.getName());
                }
            }
        });

        return data;
    }

    public static class PersonalizationData {
        public Set<String> weakSubjects    = new HashSet<>();
        public Set<String> currentSubjects = new HashSet<>();
    }
}
