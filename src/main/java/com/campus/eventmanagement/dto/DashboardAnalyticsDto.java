package com.campus.eventmanagement.dto;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardAnalyticsDto {

    private long totalRegistrations;
    private long totalEvents;
    private long vegCount;
    private long nonVegCount;
    private long pendingApprovals;
    private Map<String, Long> tshirtSizeCounts;
    private Map<String, Long> eventRegistrationCounts;
	public long getTotalRegistrations() {
		return totalRegistrations;
	}
	public void setTotalRegistrations(long totalRegistrations) {
		this.totalRegistrations = totalRegistrations;
	}
	public long getTotalEvents() {
		return totalEvents;
	}
	public void setTotalEvents(long totalEvents) {
		this.totalEvents = totalEvents;
	}
	public long getVegCount() {
		return vegCount;
	}
	public void setVegCount(long vegCount) {
		this.vegCount = vegCount;
	}
	public long getNonVegCount() {
		return nonVegCount;
	}
	public void setNonVegCount(long nonVegCount) {
		this.nonVegCount = nonVegCount;
	}
	public long getPendingApprovals() {
		return pendingApprovals;
	}
	public void setPendingApprovals(long pendingApprovals) {
		this.pendingApprovals = pendingApprovals;
	}
	public Map<String, Long> getTshirtSizeCounts() {
		return tshirtSizeCounts;
	}
	public void setTshirtSizeCounts(Map<String, Long> tshirtSizeCounts) {
		this.tshirtSizeCounts = tshirtSizeCounts;
	}
	public Map<String, Long> getEventRegistrationCounts() {
		return eventRegistrationCounts;
	}
	public void setEventRegistrationCounts(Map<String, Long> eventRegistrationCounts) {
		this.eventRegistrationCounts = eventRegistrationCounts;
	}
}