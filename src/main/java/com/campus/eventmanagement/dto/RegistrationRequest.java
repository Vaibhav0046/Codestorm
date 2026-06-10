package com.campus.eventmanagement.dto;

import lombok.Data;
import java.util.List;

@Data
public class RegistrationRequest {
    private Long eventId;
    private String teamName;
    private List<ParticipantDto> participants;
    private String paymentScreenshot;
    private String utrNumber;
	public Long getEventId() {
		return eventId;
	}
	public void setEventId(Long eventId) {
		this.eventId = eventId;
	}
	public String getTeamName() {
		return teamName;
	}
	public void setTeamName(String teamName) {
		this.teamName = teamName;
	}
	public List<ParticipantDto> getParticipants() {
		return participants;
	}
	public void setParticipants(List<ParticipantDto> participants) {
		this.participants = participants;
	}
	public String getPaymentScreenshot() {
		return paymentScreenshot;
	}
	public void setPaymentScreenshot(String paymentScreenshot) {
		this.paymentScreenshot = paymentScreenshot;
	}
	public String getUtrNumber() {
		return utrNumber;
	}
	public void setUtrNumber(String utrNumber) {
		this.utrNumber = utrNumber;
	}
}
