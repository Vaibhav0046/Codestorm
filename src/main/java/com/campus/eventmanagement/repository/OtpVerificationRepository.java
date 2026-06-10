package com.campus.eventmanagement.repository;

import com.campus.eventmanagement.entity.OtpVerification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OtpVerificationRepository extends MongoRepository<OtpVerification, String> {
}
